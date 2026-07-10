import { signAccessToken } from '../utils/jwt.js';
import { generateRawToken, hashToken } from '../utils/crypto.js';
import { durationToMs } from '../utils/duration.js';
import config from '../config/index.js';
import { ApiError } from '../errors/ApiError.js';
import { USER_STATUS } from '../enums/index.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import logger from '../logger/index.js';

const refreshTtlMs = durationToMs(config.jwt.refreshExpiresIn);

/**
 * Issue a fresh access token + a new persisted refresh token for a user.
 *
 * @param {import('mongoose').Document} user
 * @param {{ userAgent?: string, ip?: string }} [meta]
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
export const issueAuthTokens = async (user, meta = {}) => {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });

  const rawRefresh = generateRawToken();
  await refreshTokenRepository.create({
    user: user.id,
    tokenHash: hashToken(rawRefresh),
    expiresAt: new Date(Date.now() + refreshTtlMs),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { accessToken, refreshToken: rawRefresh };
};

/**
 * Rotate a refresh token: validate the presented token, revoke it, and issue a
 * new access/refresh pair. Reuse of a revoked/expired token is rejected.
 *
 * @param {string} rawRefresh
 * @param {{ userAgent?: string, ip?: string }} [meta]
 */
export const rotateRefreshToken = async (rawRefresh, meta = {}) => {
  const tokenHash = hashToken(rawRefresh);
  const existing = await refreshTokenRepository.findByHash(tokenHash);

  if (!existing) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Reuse detection: a token that was already revoked *and rotated* is being
  // replayed. This means the token was leaked (the legitimate client already
  // rotated it). Revoke the entire token family so a thief cannot ride the
  // valid chain, and force the real user to re-authenticate.
  if (existing.revokedAt) {
    if (existing.replacedByTokenHash) {
      logger.warn(
        `Refresh token reuse detected for user ${existing.user}; revoking all sessions`
      );
      await refreshTokenRepository.revokeAllForUser(existing.user);
    }
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  if (!existing.isActive()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const populated = await existing.populate('user');
  const user = populated.user;
  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }
  // A disabled account must not be able to mint fresh access tokens.
  if (user.status === USER_STATUS.DISABLED) {
    await refreshTokenRepository.revokeAllForUser(user.id);
    throw ApiError.forbidden('This account has been disabled');
  }

  const tokens = await issueAuthTokens(user, meta);
  await refreshTokenRepository.revoke(tokenHash, hashToken(tokens.refreshToken));

  return { ...tokens, user };
};

/**
 * Revoke a refresh token (logout). Silently succeeds if already gone.
 * @param {string} rawRefresh
 */
export const revokeRefreshToken = async (rawRefresh) => {
  if (!rawRefresh) return;
  await refreshTokenRepository.revoke(hashToken(rawRefresh));
};

/** Revoke every active refresh token for a user. */
export const revokeAllUserTokens = (userId) =>
  refreshTokenRepository.revokeAllForUser(userId);
