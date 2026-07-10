import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { CLUB_STATUS, ROLES } from '../enums/index.js';
import { clubRepository } from '../repositories/club.repository.js';
import { favoriteRepository } from '../repositories/favorite.repository.js';
import { eventRepository } from '../repositories/event.repository.js';
import { toClubResponse, toClubListItem } from '../dto/club.dto.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { processImage, deleteUpload } from './image.service.js';
import { UPLOAD_FOLDERS } from '../utils/paths.js';
import { buildClubSearchClause } from '../utils/clubSearch.js';

const MAX_GALLERY = 15;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { favoritesCount: -1 },
};

/** Strip an absolute upload URL down to its stored relative path. */
const toRelativePath = (value) => {
  if (!value) return value;
  const marker = '/uploads/';
  const idx = value.indexOf(marker);
  return idx >= 0 ? value.slice(idx + marker.length) : value;
};

/** Load a club and assert the current user may manage it (owner or admin). */
const loadManageableClub = async (clubId, user) => {
  const club = await clubRepository.findById(clubId);
  if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);
  const isOwner = club.owner.toString() === user.id;
  if (!isOwner && user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(MESSAGES.CLUB.FORBIDDEN);
  }
  return club;
};

/** Build a Set of the current parent's favorited club ids (or null). */
const favoriteSetFor = async (user) => {
  if (!user || user.role !== ROLES.PARENT) return null;
  const ids = await favoriteRepository.clubIdsForUser(user.id);
  return new Set(ids);
};

/** Build the Mongo filter for the public browse/search/filter query. */
const buildPublicFilter = (query) => {
  const filter = { status: CLUB_STATUS.APPROVED };

  if (query.search) {
    const searchClause = buildClubSearchClause(query.search);
    if (searchClause?.$and) {
      filter.$and = searchClause.$and;
    }
  }
  if (query.city) filter.city = { $regex: escapeRegex(query.city), $options: 'i' };
  if (query.sport) filter.sport = { $regex: escapeRegex(query.sport), $options: 'i' };
  if (query.gender) filter.gender = query.gender;
  if (query.age !== undefined) {
    filter.ageMin = { $lte: query.age };
    filter.ageMax = { $gte: query.age };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  if (query.featured === true) filter.isFeatured = true;

  return filter;
};

export const createClub = async (ownerId, data) => {
  const club = await clubRepository.create({ ...data, owner: ownerId });
  return toClubResponse(club);
};

export const listPublicClubs = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildPublicFilter(query);
  const sort = SORT_MAP[query.sort] ?? SORT_MAP.newest;

  const { items, total } = await clubRepository.paginate(filter, {
    skip,
    limit,
    sort,
  });

  const favSet = await favoriteSetFor(currentUser);
  const data = items.map((club) =>
    toClubListItem(club, {
      isFavorite: favSet ? favSet.has(club._id.toString()) : undefined,
    })
  );

  return { data, meta: buildPaginationMeta({ total, page, limit }) };
};

export const getPublicClub = async (id, currentUser) => {
  const club = await clubRepository.findById(id, { populateOwner: true });
  if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);

  const ownerId = club.owner?._id?.toString() ?? club.owner?.toString();
  const isManager =
    currentUser && (ownerId === currentUser.id || currentUser.role === ROLES.ADMIN);

  // Non-approved clubs are hidden from the public.
  if (club.status !== CLUB_STATUS.APPROVED && !isManager) {
    throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);
  }

  let isFavorite;
  if (currentUser && currentUser.role === ROLES.PARENT) {
    isFavorite = Boolean(await favoriteRepository.exists(currentUser.id, club.id));
  }

  return toClubResponse(club, { isFavorite });
};

export const getMyClubs = async (ownerId) => {
  const clubs = await clubRepository.findByOwner(ownerId);
  return clubs.map((club) => toClubResponse(club));
};

export const updateClub = async (id, user, data) => {
  const club = await loadManageableClub(id, user);

  const patch = { ...data };
  // Resubmit flow: when an owner edits a REJECTED club, it re-enters moderation
  // as PENDING and its rejection reason is cleared. Admins are unaffected (they
  // manage status via the admin endpoints). This is the only path back into the
  // moderation queue for a rejected club.
  if (user.role !== ROLES.ADMIN && club.status === CLUB_STATUS.REJECTED) {
    patch.status = CLUB_STATUS.PENDING;
    patch.rejectionReason = null;
  }

  const updated = await clubRepository.updateById(id, patch);
  return toClubResponse(updated);
};

export const updateLogo = async (id, user, file) => {
  if (!file) throw ApiError.badRequest(MESSAGES.CLUB.NO_FILE);
  const club = await loadManageableClub(id, user);

  const relativePath = await processImage(file.buffer, {
    folder: UPLOAD_FOLDERS.logos,
    width: 512,
    height: 512,
  });

  const previous = club.logo;
  const updated = await clubRepository.updateById(id, { logo: relativePath });
  await deleteUpload(previous);

  return toClubResponse(updated);
};

export const addGalleryImages = async (id, user, files) => {
  if (!files || files.length === 0) throw ApiError.badRequest(MESSAGES.CLUB.NO_FILE);
  const club = await loadManageableClub(id, user);

  if (club.gallery.length + files.length > MAX_GALLERY) {
    throw ApiError.badRequest(`A club can have at most ${MAX_GALLERY} gallery images`);
  }

  const newPaths = await Promise.all(
    files.map((file) =>
      processImage(file.buffer, { folder: UPLOAD_FOLDERS.gallery, width: 1280 })
    )
  );

  const updated = await clubRepository.updateById(id, {
    gallery: [...club.gallery, ...newPaths],
  });
  return toClubResponse(updated);
};

export const removeGalleryImage = async (id, user, image) => {
  const club = await loadManageableClub(id, user);
  const relative = toRelativePath(image);

  if (!club.gallery.includes(relative)) {
    throw ApiError.notFound('Gallery image not found');
  }

  const updated = await clubRepository.updateById(id, {
    gallery: club.gallery.filter((path) => path !== relative),
  });
  await deleteUpload(relative);
  return toClubResponse(updated);
};

/**
 * Delete a club and its dependent data (events, favorites) plus its images.
 * Used by owners (own club) and admins. Kept here so cleanup lives in one place.
 */
export const deleteClub = async (id, user) => {
  const club = await loadManageableClub(id, user);

  await Promise.all([
    eventRepository.deleteByClub(id),
    favoriteRepository.deleteByClub(id),
  ]);

  await Promise.all([
    deleteUpload(club.logo),
    ...club.gallery.map((path) => deleteUpload(path)),
  ]);

  await clubRepository.deleteById(id);
};
