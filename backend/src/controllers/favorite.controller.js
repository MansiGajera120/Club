import * as favoriteService from '../services/favorite.service.js';
import { ApiResponse } from '../responses/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

/** GET /favorites — the parent's favorite clubs (paginated). */
export const listFavorites = asyncHandler(async (req, res) => {
  const { data, meta } = await favoriteService.listFavorites(req.user.id, req.query);
  return ApiResponse.send(res, {
    message: MESSAGES.FAVORITE.LIST,
    data: { clubs: data },
    meta,
  });
});

/** POST /favorites/:clubId — favorite a club. */
export const addFavorite = asyncHandler(async (req, res) => {
  await favoriteService.addFavorite(req.user.id, req.params.clubId);
  return ApiResponse.ok(res, null, MESSAGES.FAVORITE.ADDED);
});

/** DELETE /favorites/:clubId — remove a favorite. */
export const removeFavorite = asyncHandler(async (req, res) => {
  await favoriteService.removeFavorite(req.user.id, req.params.clubId);
  return ApiResponse.ok(res, null, MESSAGES.FAVORITE.REMOVED);
});
