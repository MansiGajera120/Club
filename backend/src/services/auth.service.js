import { ApiError } from '../errors/ApiError.js';
import { userRepository } from '../repositories/user.repository.js';
import { toUserResponse } from '../dto/user.dto.js';
import {
  generateRawToken,
  generateNumericOtp,
  hashToken,
  safeEqualHex,
} from '../utils/crypto.js';
import {
  EMAIL_OTP_LENGTH,
  EMAIL_OTP_TTL_MS,
  EMAIL_OTP_MAX_ATTEMPTS,
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
 * Send a transactional email in the background. Never awaited by request
 * handlers and never rejects the caller — so slow/blocked SMTP (common on cloud
 * hosts) can't stall or fail the HTTP response. Delivery failures are logged;
 * the client can trigger a resend.
 */
const dispatchEmail = (promise, context) =>
  promise.catch((err) => logger.error(`${context}: ${err.message}`));

/**
 * Attach a fresh email-verification OTP to a user doc (does not save). Only the
 * hash is stored; the returned plaintext code is emailed once.
 */
const setVerificationOtp = (user) => {
  const code = generateNumericOtp(EMAIL_OTP_LENGTH);
  user.emailVerificationToken = hashToken(code);
  user.emailVerificationExpires = new Date(Date.now() + EMAIL_OTP_TTL_MS);
  user.emailVerificationAttempts = 0;
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

  // Fire-and-forget: the signup response must not wait on SMTP delivery.
  dispatchEmail(sendOtpEmail(user, code), 'Failed to send verification OTP email');

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

  // Constant-time compare; throttle brute-force by invalidating the code after
  // too many wrong guesses (an attacker would otherwise have the whole TTL to
  // walk the 10^6 space, and IP rate limits can be rotated around).
  if (!safeEqualHex(hashToken(code), user.emailVerificationToken)) {
    user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
    if (user.emailVerificationAttempts >= EMAIL_OTP_MAX_ATTEMPTS) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      user.emailVerificationAttempts = 0;
      await user.save();
      throw ApiError.badRequest(
        'Too many incorrect attempts. Please request a new verification code.'
      );
    }
    await user.save();
    throw ApiError.badRequest('Invalid verification code');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationAttempts = 0;
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
    dispatchEmail(sendOtpEmail(user, code), 'Failed to resend verification OTP email');
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
    dispatchEmail(
      sendPasswordResetEmail(user, raw),
      'Failed to send password reset email'
    );
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
      // Only auto-link the social identity to a pre-existing account when the
      // provider asserts the email is verified. Otherwise a provider token
      // carrying an unverified email could hijack an existing local account.
      if (!profile.emailVerified) {
        throw ApiError.conflict(
          'An account with this email already exists. Please sign in with your password.'
        );
      }
      user.provider = user.provider === AUTH_PROVIDER.LOCAL ? user.provider : provider;
      if (!user.providerId) {
        user.providerId = profile.providerId;
      }
      user.isEmailVerified = true;
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
