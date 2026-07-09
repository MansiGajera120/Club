import { ApiError } from '../errors/ApiError.js';
import { userRepository } from '../repositories/user.repository.js';
import { toUserResponse } from '../dto/user.dto.js';
import { generateRawToken, generateNumericOtp, hashToken } from '../utils/crypto.js';
import {
  EMAIL_OTP_LENGTH,
  EMAIL_OTP_TTL_MS,
  PASSWORD_RESET_TTL_MS,
} from '../constants/auth.js';
import { AUTH_PROVIDER, USER_STATUS, ROLES } from '../enums/index.js';
import {
  issueAuthTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from './token.service.js';
import { sendOtpEmail, sendPasswordResetEmail } from './email.service.js';
import { verifyGoogleIdToken } from './oauth/google.service.js';
import { verifyAppleIdToken } from './oauth/apple.service.js';
import logger from '../logger/index.js';

/**
 * Attach a fresh email-verification OTP to a user doc (does not save). Only the
 * hash is stored; the returned plaintext code is emailed once.
 */
const setVerificationOtp = (user) => {
  const code = generateNumericOtp(EMAIL_OTP_LENGTH);
  user.emailVerificationToken = hashToken(code);
  user.emailVerificationExpires = new Date(Date.now() + EMAIL_OTP_TTL_MS);
  return code;
};

/**
 * Register a new local account (parent or club owner), email a verification
 * OTP, and return the user + auth tokens. The client should require the user to
 * confirm the OTP (via {@link verifyEmailOtp}) before treating them as signed in.
 */
export const register = async ({ name, email, password, role }, meta) => {
  if (await userRepository.existsByEmail(email)) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await userRepository.create({
    name,
    email,
    password,
    role,
    provider: AUTH_PROVIDER.LOCAL,
  });

  const code = setVerificationOtp(user);
  await user.save();

  // Best-effort: a mail failure must not block signup.
  try {
    await sendOtpEmail(user, code);
  } catch (err) {
    logger.error(`Failed to send verification OTP email: ${err.message}`);
  }

  const tokens = await issueAuthTokens(user, meta);
  return { user: toUserResponse(user), ...tokens };
};

/** Authenticate a local account with email + password. */
export const login = async ({ email, password }, meta) => {
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user || !user.password) {
    // No account, or a social-only account (no password set).
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.status === USER_STATUS.DISABLED) {
    throw ApiError.forbidden('This account has been disabled');
  }

  const matches = await user.comparePassword(password);
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user, meta);
  return { user: toUserResponse(user), ...tokens };
};

/** Exchange a valid refresh token for a new access/refresh pair (rotation). */
export const refresh = async (rawRefresh, meta) => {
  if (!rawRefresh) {
    throw ApiError.unauthorized('Refresh token is required');
  }
  const { user, accessToken, refreshToken } = await rotateRefreshToken(rawRefresh, meta);
  return { user: toUserResponse(user), accessToken, refreshToken };
};

/** Revoke the presented refresh token. */
export const logout = async (rawRefresh) => {
  await revokeRefreshToken(rawRefresh);
};

/** Verify an email address from a token (link-based flow, kept for web clients). */
export const verifyEmail = async (rawToken) => {
  const user = await userRepository.findByActiveToken(
    'emailVerification',
    hashToken(rawToken)
  );
  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return toUserResponse(user);
};

/**
 * Verify an email address from an OTP code the user typed in the app.
 * @param {{ email: string, code: string }} params
 */
export const verifyEmailOtp = async ({ email, code }) => {
  const user = await userRepository.findByEmailWithVerification(email);
  if (!user || !user.emailVerificationToken || !user.emailVerificationExpires) {
    throw ApiError.badRequest('Invalid or expired verification code');
  }
  if (user.emailVerificationExpires.getTime() < Date.now()) {
    throw ApiError.badRequest('Verification code has expired. Please request a new one.');
  }
  if (hashToken(code) !== user.emailVerificationToken) {
    throw ApiError.badRequest('Invalid verification code');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return toUserResponse(user);
};

/**
 * Re-send a verification OTP. Always resolves the same way regardless of
 * whether the account exists, to avoid leaking which emails are registered.
 */
export const resendVerification = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (user && !user.isEmailVerified && user.provider === AUTH_PROVIDER.LOCAL) {
    const code = setVerificationOtp(user);
    await user.save();
    try {
      await sendOtpEmail(user, code);
    } catch (err) {
      logger.error(`Failed to resend verification OTP email: ${err.message}`);
    }
  }
};

/**
 * Begin the password-reset flow. Always resolves the same way (anti-enumeration).
 */
export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (user && user.provider === AUTH_PROVIDER.LOCAL) {
    const raw = generateRawToken();
    user.passwordResetToken = hashToken(raw);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await user.save();
    try {
      await sendPasswordResetEmail(user, raw);
    } catch (err) {
      logger.error(`Failed to send password reset email: ${err.message}`);
    }
  }
};

/** Complete a password reset and revoke all existing sessions. */
export const resetPassword = async ({ token, password }) => {
  const user = await userRepository.findByActiveToken('passwordReset', hashToken(token));
  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = password; // hashed by the pre-save hook
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Force re-authentication everywhere after a password change.
  await revokeAllUserTokens(user.id);
};

/**
 * Find or create a user from a verified social profile, then issue tokens.
 * @param {'google'|'apple'} provider
 */
const socialLogin = async (provider, profile, meta) => {
  let user = await userRepository.findByProviderId(provider, profile.providerId);

  if (!user) {
    user = await userRepository.findByEmail(profile.email);
    if (user) {
      // Link the social identity to the existing account.
      user.provider = user.provider === AUTH_PROVIDER.LOCAL ? user.provider : provider;
      if (!user.providerId) {
        user.providerId = profile.providerId;
      }
      if (profile.emailVerified) user.isEmailVerified = true;
      await user.save();
    } else {
      user = await userRepository.create({
        name: profile.name,
        email: profile.email,
        role: ROLES.PARENT,
        provider,
        providerId: profile.providerId,
        avatarUrl: profile.avatarUrl,
        isEmailVerified: profile.emailVerified,
      });
    }
  }

  if (user.status === USER_STATUS.DISABLED) {
    throw ApiError.forbidden('This account has been disabled');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user, meta);
  return { user: toUserResponse(user), ...tokens };
};

/** Sign in with a Google ID token. */
export const googleLogin = async (idToken, meta) => {
  const profile = await verifyGoogleIdToken(idToken);
  return socialLogin(AUTH_PROVIDER.GOOGLE, profile, meta);
};

/** Sign in with an Apple identity token. */
export const appleLogin = async ({ identityToken, name }, meta) => {
  const profile = await verifyAppleIdToken(identityToken, name);
  return socialLogin(AUTH_PROVIDER.APPLE, profile, meta);
};
