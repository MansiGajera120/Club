import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Build a rate limiter that responds with the standard error envelope.
 *
 * @param {object} [overrides] Optional overrides for windowMs / max.
 */
const buildLimiter = (overrides = {}) =>
  rateLimit({
    windowMs: overrides.windowMs ?? config.rateLimit.windowMs,
    max: overrides.max ?? config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: MESSAGES.COMMON.TOO_MANY_REQUESTS,
      });
    },
  });

/**
 * Global limiter applied to the whole API surface.
 */
export const apiRateLimiter = buildLimiter();

/**
 * Stricter limiter intended for sensitive auth endpoints (login, signup, etc.).
 * Wired up in Phase 6.
 */
export const authRateLimiter = buildLimiter({ max: 20 });

export default apiRateLimiter;
