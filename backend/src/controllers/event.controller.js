import * as eventService from '../services/event.service.js';
import { ApiResponse } from '../responses/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

/** GET /events/mine — authenticated list for a club owner's clubs. */
export const listMyEvents = asyncHandler(async (req, res) => {
  const { data, meta } = await eventService.listMyEvents(req.user, req.query);
  return ApiResponse.send(res, {
    message: MESSAGES.EVENT.LIST,
    data: { events: data },
    meta,
  });
});

/** GET /events — public list (by club, or the upcoming feed). */
export const listEvents = asyncHandler(async (req, res) => {
  const { data, meta } = await eventService.listEvents(req.query, req.user);
  return ApiResponse.send(res, {
    message: MESSAGES.EVENT.LIST,
    data: { events: data },
    meta,
  });
});

/** GET /events/:id — public detail. */
export const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.params.id);
  return ApiResponse.ok(res, { event }, MESSAGES.EVENT.DETAIL);
});

/** POST /events — create an event for an owned club. */
export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user, req.body);
  return ApiResponse.created(res, { event }, MESSAGES.EVENT.CREATED);
});

/** PATCH /events/:id — edit an event. */
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.user, req.body);
  return ApiResponse.ok(res, { event }, MESSAGES.EVENT.UPDATED);
});

/** DELETE /events/:id — delete an event. */
export const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.id, req.user);
  return ApiResponse.ok(res, null, MESSAGES.EVENT.DELETED);
});

/** POST /events/:id/cover — upload the cover image. */
export const uploadCover = asyncHandler(async (req, res) => {
  const event = await eventService.updateCover(req.params.id, req.user, req.file);
  return ApiResponse.ok(res, { event }, MESSAGES.EVENT.COVER_UPDATED);
});
