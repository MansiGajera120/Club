import * as clubService from '../services/club.service.js';
import { ApiResponse } from '../responses/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

/** POST /clubs — register a club (club owner). */
export const createClub = asyncHandler(async (req, res) => {
  const club = await clubService.createClub(req.user.id, req.body);
  return ApiResponse.created(res, { club }, MESSAGES.CLUB.CREATED);
});

/** GET /clubs — public browse/search/filter with pagination. */
export const listClubs = asyncHandler(async (req, res) => {
  const { data, meta } = await clubService.listPublicClubs(req.query, req.user);
  return ApiResponse.send(res, {
    message: MESSAGES.CLUB.LIST,
    data: { clubs: data },
    meta,
  });
});

/** GET /clubs/me — clubs owned by the current user (any status). */
export const getMyClubs = asyncHandler(async (req, res) => {
  const clubs = await clubService.getMyClubs(req.user.id);
  return ApiResponse.ok(res, { clubs }, MESSAGES.CLUB.LIST);
});

/** GET /clubs/:id — public detail (owner/admin can view non-approved). */
export const getClub = asyncHandler(async (req, res) => {
  const club = await clubService.getPublicClub(req.params.id, req.user);
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.DETAIL);
});

/** PATCH /clubs/:id — edit own club. */
export const updateClub = asyncHandler(async (req, res) => {
  const club = await clubService.updateClub(req.params.id, req.user, req.body);
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.UPDATED);
});

/** DELETE /clubs/:id — delete own club (owner or admin). */
export const deleteClub = asyncHandler(async (req, res) => {
  await clubService.deleteClub(req.params.id, req.user);
  return ApiResponse.ok(res, null, MESSAGES.CLUB.DELETED);
});

/** POST /clubs/:id/logo — upload/replace the logo. */
export const uploadLogo = asyncHandler(async (req, res) => {
  const club = await clubService.updateLogo(req.params.id, req.user, req.file);
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.LOGO_UPDATED);
});

/** POST /clubs/:id/gallery — add gallery images. */
export const addGallery = asyncHandler(async (req, res) => {
  const club = await clubService.addGalleryImages(req.params.id, req.user, req.files);
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.GALLERY_UPDATED);
});

/** DELETE /clubs/:id/gallery — remove a gallery image. */
export const removeGallery = asyncHandler(async (req, res) => {
  const club = await clubService.removeGalleryImage(
    req.params.id,
    req.user,
    req.body.image
  );
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.GALLERY_UPDATED);
});
