import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import config from '../../config/index.js';
import { ApiError } from '../../errors/ApiError.js';

const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';

// Cache Apple's public keys (they rotate infrequently).
let cachedKeys = null;
let cachedAt = 0;
const KEY_TTL_MS = 60 * 60 * 1000; // 1 hour

const fetchAppleKeys = async () => {
  const now = Date.now();
  if (cachedKeys && now - cachedAt < KEY_TTL_MS) return cachedKeys;

  const res = await fetch(APPLE_KEYS_URL);
  if (!res.ok) {
    throw ApiError.internal('Unable to fetch Apple public keys');
  }
  const { keys } = await res.json();
  cachedKeys = keys;
  cachedAt = now;
  return keys;
};

/**
 * Verify an Apple identity token against Apple's published JWKS and return the
 * normalized profile. Apple only sends the user's name on first authorization,
 * so callers may pass a fallback name.
 *
 * @param {string} identityToken
 * @param {string} [fallbackName]
 * @returns {Promise<{ providerId: string, email: string, name: string, avatarUrl: null, emailVerified: boolean }>}
 */
export const verifyAppleIdToken = async (identityToken, fallbackName) => {
  if (!config.apple.clientId) {
    throw ApiError.internal('Apple sign-in is not configured');
  }

  const decoded = jwt.decode(identityToken, { complete: true });
  if (!decoded?.header?.kid) {
    throw ApiError.unauthorized('Invalid Apple token');
  }

  const keys = await fetchAppleKeys();
  const jwk = keys.find((k) => k.kid === decoded.header.kid);
  if (!jwk) {
    throw ApiError.unauthorized('Apple signing key not found');
  }

  // Node can build a public key directly from a JWK — no extra dependency.
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });

  let payload;
  try {
    payload = jwt.verify(identityToken, publicKey, {
      algorithms: ['RS256'],
      issuer: APPLE_ISSUER,
      audience: config.apple.clientId,
    });
  } catch {
    throw ApiError.unauthorized('Invalid Apple token');
  }

  if (!payload.email) {
    throw ApiError.unauthorized('Apple account has no email');
  }

  return {
    providerId: payload.sub,
    email: payload.email,
    name: fallbackName || payload.email.split('@')[0],
    avatarUrl: null,
    emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
  };
};

export default verifyAppleIdToken;
