import * as adminService from '../services/admin.service.js';
import { ApiResponse } from '../responses/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

/** GET /admin/stats — dashboard statistics. */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return ApiResponse.ok(res, { stats }, MESSAGES.ADMIN.STATS);
});

/** GET /admin/clubs — all clubs with optional status filter/search. */
export const listClubs = asyncHandler(async (req, res) => {
  const { data, meta } = await adminService.listClubs(req.query);
  return ApiResponse.send(res, {
    message: MESSAGES.CLUB.LIST,
    data: { clubs: data },
    meta,
  });
});

/** POST /admin/clubs — admin registers an organization directly. */
export const createClub = asyncHandler(async (req, res) => {
  const club = await adminService.createClub(req.user, req.body);
  return ApiResponse.created(res, { club }, MESSAGES.ADMIN.CLUB_CREATED);
});

/** GET /admin/clubs/:id — full club detail (any status) for the edit form. */
export const getClub = asyncHandler(async (req, res) => {
  const club = await adminService.getClub(req.params.id);
  return ApiResponse.ok(res, { club }, MESSAGES.ADMIN.CLUB_FETCHED);
});

/** PATCH /admin/clubs/:id — admin edits club content + admin-only fields. */
export const updateClub = asyncHandler(async (req, res) => {
  const club = await adminService.updateClub(req.params.id, req.body, req.user.id);
  return ApiResponse.ok(res, { club }, MESSAGES.ADMIN.CLUB_UPDATED);
});

/** PATCH /admin/clubs/:id/status — approve/reject/suspend/hide. */
export const updateClubStatus = asyncHandler(async (req, res) => {
  const club = await adminService.updateClubStatus(req.params.id, req.body, req.user.id);
  return ApiResponse.ok(res, { club }, MESSAGES.ADMIN.CLUB_STATUS_UPDATED);
});

/** PATCH /admin/clubs/:id/featured — feature/unfeature a club. */
export const setClubFeatured = asyncHandler(async (req, res) => {
  const club = await adminService.setClubFeatured(req.params.id, req.body.isFeatured);
  return ApiResponse.ok(res, { club }, MESSAGES.ADMIN.CLUB_FEATURED_UPDATED);
});

/** DELETE /admin/clubs/:id — delete a club (with its events/favorites/images). */
export const deleteClub = asyncHandler(async (req, res) => {
  await adminService.deleteClub(req.params.id, req.user);
  return ApiResponse.ok(res, null, MESSAGES.CLUB.DELETED);
});

/** POST /admin/clubs/:id/logo — upload/replace an organization's logo. */
export const uploadLogo = asyncHandler(async (req, res) => {
  const club = await adminService.updateClubLogo(req.params.id, req.user, req.file);
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.LOGO_UPDATED);
});

/** POST /admin/clubs/:id/gallery — add photos to an organization's gallery. */
export const addGallery = asyncHandler(async (req, res) => {
  const club = await adminService.addClubGallery(req.params.id, req.user, req.files);
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.GALLERY_UPDATED);
});

/** DELETE /admin/clubs/:id/gallery — remove one gallery photo. */
export const removeGallery = asyncHandler(async (req, res) => {
  const club = await adminService.removeClubGallery(
    req.params.id,
    req.user,
    req.body.image
  );
  return ApiResponse.ok(res, { club }, MESSAGES.CLUB.GALLERY_UPDATED);
});

/** POST /admin/admins — invite a new admin by email. */
export const createAdmin = asyncHandler(async (req, res) => {
  await adminService.createAdmin(req.body.email);
  return ApiResponse.created(res, null, MESSAGES.ADMIN.ADMIN_INVITED);
});

/** GET /admin/users — all users with filters. */
export const listUsers = asyncHandler(async (req, res) => {
  const { data, meta } = await adminService.listUsers(req.query);
  return ApiResponse.send(res, {
    message: MESSAGES.ADMIN.USERS_LIST,
    data: { users: data },
    meta,
  });
});

/** PATCH /admin/users/:id/status — enable/disable a user. */
export const setUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.setUserStatus(req.params.id, req.body.status, req.user);
  return ApiResponse.ok(res, { user }, MESSAGES.ADMIN.USER_STATUS_UPDATED);
});

/** GET /admin/events — all events. */
export const listEvents = asyncHandler(async (req, res) => {
  const { data, meta } = await adminService.listEvents(req.query);
  return ApiResponse.send(res, {
    message: MESSAGES.EVENT.LIST,
    data: { events: data },
    meta,
  });
});

/** DELETE /admin/events/:id — delete any event. */
export const deleteEvent = asyncHandler(async (req, res) => {
  await adminService.deleteEvent(req.params.id, req.user);
  return ApiResponse.ok(res, null, MESSAGES.EVENT.DELETED);
});
