import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Sign a short-lived access token.
 * @param {{ sub: string, role: string }} payload
 * @returns {string}
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

/**
 * Verify an access token and return its decoded payload.
 * Throws JsonWebTokenError / TokenExpiredError on failure (handled globally).
 * @param {string} token
 * @returns {{ sub: string, role: string, iat: number, exp: number }}
 */
export const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);
