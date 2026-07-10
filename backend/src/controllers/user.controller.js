import * as userService from '../services/user.service.js';
import { ApiResponse } from '../responses/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

/** GET /users/me — current user's profile. */
export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.ok(
    res,
    { user: userService.getProfile(req.user) },
    MESSAGES.USER.PROFILE
  );
});

/** PATCH /users/me — update the current user's profile. */
export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body);
  return ApiResponse.ok(res, { user }, MESSAGES.USER.UPDATED);
});

/** POST /users/me/avatar — upload the current user's avatar. */
export const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user, req.file);
  return ApiResponse.ok(res, { user }, MESSAGES.USER.AVATAR_UPDATED);
});

/** PATCH /users/me/password — change password for local accounts. */
export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user, req.body);
  return ApiResponse.ok(res, null, MESSAGES.USER.PASSWORD_CHANGED);
});

/** POST /users/me/password/verify — check the current password before updating. */
export const verifyPassword = asyncHandler(async (req, res) => {
  await userService.verifyPassword(req.user, req.body);
  return ApiResponse.ok(res, null, MESSAGES.USER.PASSWORD_VERIFIED);
});
