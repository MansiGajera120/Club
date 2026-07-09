import * as authService from '../services/auth.service.js';
import { ApiResponse } from '../responses/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toUserResponse } from '../dto/user.dto.js';
import { MESSAGES } from '../constants/messages.js';
import { durationToMs } from '../utils/duration.js';
import config from '../config/index.js';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: durationToMs(config.jwt.refreshExpiresIn),
  path: `${config.server.apiPrefix}/auth`,
});

/** Pull request metadata used for refresh-token bookkeeping. */
const requestMeta = (req) => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

/** Read the refresh token from the httpOnly cookie or the request body. */
const readRefreshToken = (req) => req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;

/**
 * Set the refresh cookie (for web clients) and strip it from the JSON body's
 * top level is unnecessary — mobile clients read it from the body. We return it
 * in both places so every client type works.
 */
const withRefreshCookie = (res, result) => {
  res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
  return result;
};

export const signup = asyncHandler(async (req, res) => {
  const result = withRefreshCookie(
    res,
    await authService.register(req.body, requestMeta(req))
  );
  return ApiResponse.created(res, result, MESSAGES.AUTH.REGISTERED);
});

export const login = asyncHandler(async (req, res) => {
  const result = withRefreshCookie(
    res,
    await authService.login(req.body, requestMeta(req))
  );
  return ApiResponse.ok(res, result, MESSAGES.AUTH.LOGGED_IN);
});

export const refresh = asyncHandler(async (req, res) => {
  const result = withRefreshCookie(
    res,
    await authService.refresh(readRefreshToken(req), requestMeta(req))
  );
  return ApiResponse.ok(res, result, MESSAGES.AUTH.TOKEN_REFRESHED);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(readRefreshToken(req));
  res.clearCookie(REFRESH_COOKIE, { path: `${config.server.apiPrefix}/auth` });
  return ApiResponse.ok(res, null, MESSAGES.AUTH.LOGGED_OUT);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  return ApiResponse.ok(res, { user }, MESSAGES.AUTH.EMAIL_VERIFIED);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmailOtp(req.body);
  return ApiResponse.ok(res, { user }, MESSAGES.AUTH.EMAIL_VERIFIED);
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body.email);
  return ApiResponse.ok(res, null, MESSAGES.AUTH.VERIFICATION_SENT);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return ApiResponse.ok(res, null, MESSAGES.AUTH.PASSWORD_RESET_SENT);
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return ApiResponse.ok(res, null, MESSAGES.AUTH.PASSWORD_RESET);
});

export const googleLogin = asyncHandler(async (req, res) => {
  const result = withRefreshCookie(
    res,
    await authService.googleLogin(req.body.idToken, requestMeta(req))
  );
  return ApiResponse.ok(res, result, MESSAGES.AUTH.LOGGED_IN);
});

export const appleLogin = asyncHandler(async (req, res) => {
  const result = withRefreshCookie(
    res,
    await authService.appleLogin(req.body, requestMeta(req))
  );
  return ApiResponse.ok(res, result, MESSAGES.AUTH.LOGGED_IN);
});

/** Return the currently-authenticated user (requires `authenticate`). */
export const me = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, { user: toUserResponse(req.user) }, MESSAGES.AUTH.PROFILE);
});
