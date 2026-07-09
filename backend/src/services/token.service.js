import { signAccessToken } from '../utils/jwt.js';
import { generateRawToken, hashToken } from '../utils/crypto.js';
import { durationToMs } from '../utils/duration.js';
import config from '../config/index.js';
import { ApiError } from '../errors/ApiError.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';

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

  if (!existing || !existing.isActive()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await existing.populate('user');
  if (!user.user) {
    throw ApiError.unauthorized('Account no longer exists');
  }

  const tokens = await issueAuthTokens(user.user, meta);
  await refreshTokenRepository.revoke(tokenHash, hashToken(tokens.refreshToken));

  return { ...tokens, user: user.user };
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
