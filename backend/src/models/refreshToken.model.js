import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Persisted refresh tokens. We store only the SHA-256 hash of the opaque token,
 * enabling rotation (each use issues a new token and revokes the old) and
 * server-side revocation (logout, password reset). Expired documents are
 * auto-removed by the TTL index.
 */
const refreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByTokenHash: { type: String },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

// Auto-purge expired tokens.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/** Whether the token is currently usable. */
refreshTokenSchema.methods.isActive = function isActive() {
  return !this.revokedAt && this.expiresAt.getTime() > Date.now();
};

export const RefreshToken = model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
