import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES, CLUB_STATUS } from '../enums/index.js';
import { eventRepository } from '../repositories/event.repository.js';
import { clubRepository } from '../repositories/club.repository.js';
import { toEventResponse } from '../dto/event.dto.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { processImage, deleteUpload } from './image.service.js';
import { UPLOAD_FOLDERS } from '../utils/paths.js';

/** Assert the user owns (or admins) the given club. Returns the club. */
const assertClubManager = async (clubId, user) => {
  const club = await clubRepository.findById(clubId);
  if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);
  const isOwner = club.owner.toString() === user.id;
  if (!isOwner && user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(MESSAGES.EVENT.FORBIDDEN);
  }
  return club;
};

/** Load an event and assert the user may manage its club. Returns the event. */
const loadManageableEvent = async (eventId, user) => {
  const event = await eventRepository.findById(eventId);
  if (!event) throw ApiError.notFound(MESSAGES.EVENT.NOT_FOUND);
  await assertClubManager(event.club, user);
  return event;
};

/** Ensure registration window ends before the event starts. */
const assertRegistrationBeforeEvent = ({
  startDate,
  registrationStartDate,
  registrationEndDate,
}) => {
  const eventStart = new Date(startDate);
  if (registrationStartDate) {
    const regStart = new Date(registrationStartDate);
    if (regStart.getTime() >= eventStart.getTime()) {
      throw ApiError.badRequest(
        'Registration must open before the event starts'
      );
    }
  }
  if (registrationEndDate) {
    const regEnd = new Date(registrationEndDate);
    if (regEnd.getTime() >= eventStart.getTime()) {
      throw ApiError.badRequest(
        'Registration must close before the event starts'
      );
    }
  }
  if (registrationStartDate && registrationEndDate) {
    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);
    if (regEnd.getTime() < regStart.getTime()) {
      throw ApiError.badRequest(
        'Registration close must be on or after registration open'
      );
    }
  }
};

export const createEvent = async (user, data) => {
  await assertClubManager(data.club, user);
  assertRegistrationBeforeEvent(data);
  const event = await eventRepository.create(data);
  return toEventResponse(event);
};

export const updateEvent = async (id, user, data) => {
  const event = await loadManageableEvent(id, user);

  // Guard the case where only one of the dates is being changed: compare the
  // incoming value against the stored one so end can never precede start.
  const nextStart = data.startDate ? new Date(data.startDate) : event.startDate;
  const nextEnd =
    data.endDate !== undefined ? data.endDate && new Date(data.endDate) : event.endDate;
  if (nextEnd && nextStart && nextEnd.getTime() < nextStart.getTime()) {
    throw ApiError.badRequest('End date must be on or after the start date');
  }

  const nextRegStart =
    data.registrationStartDate !== undefined
      ? data.registrationStartDate && new Date(data.registrationStartDate)
      : event.registrationStartDate;
  const nextRegEnd =
    data.registrationEndDate !== undefined
      ? data.registrationEndDate && new Date(data.registrationEndDate)
      : event.registrationEndDate;

  assertRegistrationBeforeEvent({
    startDate: nextStart,
    registrationStartDate: nextRegStart,
    registrationEndDate: nextRegEnd,
  });

  const updated = await eventRepository.updateById(id, data);
  return toEventResponse(updated);
};

export const deleteEvent = async (id, user) => {
  const event = await loadManageableEvent(id, user);
  await deleteUpload(event.coverImage);
  await eventRepository.deleteById(id);
};

export const updateCover = async (id, user, file) => {
  if (!file) throw ApiError.badRequest(MESSAGES.CLUB.NO_FILE);
  const event = await loadManageableEvent(id, user);

  const relativePath = await processImage(file.buffer, {
    folder: UPLOAD_FOLDERS.events,
    width: 1280,
  });
  const previous = event.coverImage;
  const updated = await eventRepository.updateById(id, {
    coverImage: relativePath,
  });
  await deleteUpload(previous);
  return toEventResponse(updated);
};

export const getEvent = async (id, currentUser) => {
  const event = await eventRepository.findById(id);
  if (!event) throw ApiError.notFound(MESSAGES.EVENT.NOT_FOUND);

  // Only expose events belonging to an approved, publicly-visible club unless
  // the caller owns that club (or is an admin). Otherwise events of pending /
  // rejected / hidden / suspended clubs would be readable directly by id.
  const club = await clubRepository.findById(event.club);
  const isManager =
    currentUser &&
    club &&
    (club.owner.toString() === currentUser.id || currentUser.role === ROLES.ADMIN);
  if (!club || (club.status !== CLUB_STATUS.APPROVED && !isManager)) {
    throw ApiError.notFound(MESSAGES.EVENT.NOT_FOUND);
  }
  if (!isManager && !event.isActive) {
    throw ApiError.notFound(MESSAGES.EVENT.NOT_FOUND);
  }

  return toEventResponse(event);
};

/**
 * All events for clubs owned by the current user (any status).
 */
export const listMyEvents = async (user, query) => {
  const { page, limit, skip } = getPagination(query);

  let filter = {};
  if (user.role !== ROLES.ADMIN) {
    const clubs = await clubRepository.findByOwner(user.id);
    if (!clubs.length) {
      return {
        data: [],
        meta: buildPaginationMeta({ total: 0, page, limit }),
      };
    }
    filter = { club: { $in: clubs.map((c) => c._id) } };
  }

  const { items, total } = await eventRepository.paginate(filter, { skip, limit });
  return {
    data: items.map(toEventResponse),
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

/**
 * List events. With `club`, returns that club's events (visible clubs only for
 * the public; managers see all). Without `club`, returns the upcoming feed
 * across approved clubs.
 */
export const listEvents = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);

  if (query.club) {
    const club = await clubRepository.findById(query.club);
    if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);

    const isManager =
      currentUser &&
      (club.owner.toString() === currentUser.id || currentUser.role === ROLES.ADMIN);
    if (club.status !== CLUB_STATUS.APPROVED && !isManager) {
      throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);
    }

    const filter = { club: query.club };
    if (!isManager) filter.isActive = true; // public sees active events only

    const { items, total } = await eventRepository.paginate(filter, {
      skip,
      limit,
    });
    return {
      data: items.map(toEventResponse),
      meta: buildPaginationMeta({ total, page, limit }),
    };
  }

  const { items, total } = await eventRepository.paginateUpcomingApproved({
    skip,
    limit,
  });
  return {
    data: items.map(toEventResponse),
    meta: buildPaginationMeta({ total, page, limit }),
  };
};
