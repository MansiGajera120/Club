import { ApiError } from '../errors/ApiError.js';

/**
 * Role-based access guard. Must run AFTER `authenticate`. Allows the request
 * only if the authenticated user's role is in the allowed list.
 *
 * @param {...string} allowedRoles
 */
export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to access this resource')
      );
    }
    return next();
  };

export default authorize;
