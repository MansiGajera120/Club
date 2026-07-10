import crypto from 'node:crypto';

/**
 * Generate a cryptographically-random opaque token (hex). Used for refresh
 * tokens, email verification and password reset — values that are emailed or
 * stored client-side and must be unguessable.
 *
 * @param {number} [bytes=48]
 * @returns {string}
 */
export const generateRawToken = (bytes = 48) => crypto.randomBytes(bytes).toString('hex');

/**
 * One-way hash of a token for safe storage. We store only the hash so a DB leak
 * never exposes usable tokens; incoming tokens are hashed and compared.
 *
 * @param {string} raw
 * @returns {string}
 */
export const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

/**
 * Generate a random numeric one-time passcode (OTP), zero-padded to `length`.
 * Used for email verification codes that a human types in. Only the hash is
 * stored (via {@link hashToken}); the plaintext is emailed once.
 *
 * @param {number} [length=6]
 * @returns {string}
 */
export const generateNumericOtp = (length = 6) => {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, '0');
};

/**
 * Constant-time comparison of two hex-encoded hashes of equal length. Avoids
 * leaking match progress through timing when comparing tokens/OTP hashes.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export const safeEqualHex = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
};
