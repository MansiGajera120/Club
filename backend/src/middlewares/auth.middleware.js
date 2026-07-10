import { ApiError } from '../errors/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { USER_STATUS, ROLES } from '../enums/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import config from '../config/index.js';

/**
 * Authenticate the request via a Bearer access token. On success attaches the
 * live user document to `req.user`. Enforces that the account still exists and
 * is active — so a disabled user's existing token stops working immediately.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  // verify throws JsonWebTokenError / TokenExpiredError → mapped by handler.
  const payload = verifyAccessToken(token);

  const user = await userRepository.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }
  if (user.status === USER_STATUS.DISABLED) {
    throw ApiError.forbidden('This account has been disabled');
  }

  req.user = user;
  return next();
});

/**
 * Attach the user when a valid token is present, but never reject. Used on
 * public routes that behave differently for signed-in users (e.g. annotating
 * clubs with the current parent's favorites).
 */
export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyAccessToken(token);
      const user = await userRepository.findById(payload.sub);
      if (user && user.status !== USER_STATUS.DISABLED) {
        req.user = user;
      }
    } catch {
      // ignore — anonymous request
    }
  }

  return next();
});

/**
 * Guard that blocks unverified accounts from state-changing actions. Must run
 * AFTER `authenticate`. Admins and social/verified accounts pass; unverified
 * local accounts get a clear 403 telling them to verify their email. Toggle via
 * `REQUIRE_EMAIL_VERIFICATION`.
 */
export const requireVerifiedEmail = (req, _res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (
    config.auth.requireEmailVerification &&
    req.user.role !== ROLES.ADMIN &&
    !req.user.isEmailVerified
  ) {
    return next(
      ApiError.forbidden('Please verify your email address to perform this action')
    );
  }
  return next();
};

export default authenticate;
