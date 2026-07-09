import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Terminal middleware for unmatched routes. Creating an ApiError here funnels
 * 404s through the same global error handler as every other failure.
 */
export const notFoundHandler = (req, _res, next) => {
  next(
    ApiError.notFound(
      `${MESSAGES.COMMON.ROUTE_NOT_FOUND}: ${req.method} ${req.originalUrl}`
    )
  );
};

export default notFoundHandler;
