import { RefreshToken } from '../models/refreshToken.model.js';

/**
 * Data-access layer for refresh tokens.
 */
export const refreshTokenRepository = {
  create(data) {
    return RefreshToken.create(data);
  },

  findByHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash });
  },

  /** Revoke a single token, optionally recording its replacement. */
  revoke(tokenHash, replacedByTokenHash) {
    return RefreshToken.updateOne(
      { tokenHash },
      { revokedAt: new Date(), replacedByTokenHash }
    );
  },

  /** Revoke all active tokens for a user (logout-all / password reset). */
  revokeAllForUser(userId) {
    return RefreshToken.updateMany(
      { user: userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    );
  },
};

export default refreshTokenRepository;
