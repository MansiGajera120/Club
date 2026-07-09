import { OAuth2Client } from 'google-auth-library';

import config from '../../config/index.js';
import { ApiError } from '../../errors/ApiError.js';

let client;
const getClient = () => {
  if (!client) client = new OAuth2Client();
  return client;
};

/**
 * Verify a Google ID token and return the normalized profile.
 *
 * @param {string} idToken
 * @returns {Promise<{ providerId: string, email: string, name: string, avatarUrl: string|null, emailVerified: boolean }>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  if (!config.google.clientIds.length) {
    throw ApiError.internal('Google sign-in is not configured');
  }

  let payload;
  try {
    const ticket = await getClient().verifyIdToken({
      idToken,
      // Accept a token minted for any of our configured clients (Android/iOS/Web).
      audience: config.google.clientIds,
    });
    payload = ticket.getPayload();
  } catch {
    throw ApiError.unauthorized('Invalid Google token');
  }

  if (!payload?.email) {
    throw ApiError.unauthorized('Google account has no email');
  }

  return {
    providerId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatarUrl: payload.picture || null,
    emailVerified: Boolean(payload.email_verified),
  };
};

export default verifyGoogleIdToken;
