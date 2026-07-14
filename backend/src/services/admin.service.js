import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { Club } from '../models/club.model.js';

import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { CLUB_STATUS, USER_STATUS, ROLES, AUTH_PROVIDER } from '../enums/index.js';
import { clubRepository } from '../repositories/club.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { eventRepository } from '../repositories/event.repository.js';
import { toClubListItem, toClubResponse } from '../dto/club.dto.js';
import { toUserResponse } from '../dto/user.dto.js';
import { toEventResponse } from '../dto/event.dto.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { buildClubSearchClause } from '../utils/clubSearch.js';
import * as clubService from './club.service.js';
import * as eventService from './event.service.js';
import * as authService from './auth.service.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Aggregate dashboard counts across users, clubs and events. */
export const getDashboardStats = async () => {
  const [
    totalClubs,
    pendingClubs,
    approvedClubs,
    suspendedClubs,
    hiddenClubs,
    rejectedClubs,
    featuredClubs,
    totalUsers,
    parents,
    clubOwners,
    admins,
    disabledUsers,
    totalEvents,
  ] = await Promise.all([
    clubRepository.count(),
    clubRepository.countByStatus(CLUB_STATUS.PENDING),
    clubRepository.countByStatus(CLUB_STATUS.APPROVED),
    clubRepository.countByStatus(CLUB_STATUS.SUSPENDED),
    clubRepository.countByStatus(CLUB_STATUS.HIDDEN),
    clubRepository.countByStatus(CLUB_STATUS.REJECTED),
    clubRepository.count({ isFeatured: true }),
    userRepository.count(),
    userRepository.count({ role: ROLES.PARENT }),
    userRepository.count({ role: ROLES.CLUB_OWNER }),
    userRepository.count({ role: ROLES.ADMIN }),
    userRepository.count({ status: USER_STATUS.DISABLED }),
    eventRepository.count(),
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [parentGrowthRaw, ownerGrowthRaw, adminGrowthRaw] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, role: ROLES.PARENT } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, role: ROLES.CLUB_OWNER } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, role: ROLES.ADMIN } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
    ])
  ]);

  const growth = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const name = d.toLocaleDateString('en-US', { weekday: 'short' }); 
    growth.push({ 
      name, 
      Parents: parentGrowthRaw.find(g => g._id === dateStr)?.count || 0,
      ClubOwners: ownerGrowthRaw.find(g => g._id === dateStr)?.count || 0,
      Admins: adminGrowthRaw.find(g => g._id === dateStr)?.count || 0
    });
  }

  return {
    growth,
    clubs: {
      total: totalClubs,
      pending: pendingClubs,
      approved: approvedClubs,
      suspended: suspendedClubs,
      hidden: hiddenClubs,
      rejected: rejectedClubs,
      featured: featuredClubs,
    },
    users: {
      total: totalUsers,
      parents,
      clubOwners,
      admins,
      disabled: disabledUsers,
    },
    events: { total: totalEvents },
  };
};

export const listClubs = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  const searchClause = buildClubSearchClause(query.search);
  if (searchClause?.$and) {
    filter.$and = searchClause.$and;
  }

  const { items, total } = await clubRepository.paginate(filter, { skip, limit });
  return {
    data: items.map((club) => toClubListItem(club)),
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

/**
 * Admin creates an organization directly. Unlike owner registration there is no
 * one-club-per-owner limit, and the club goes live (APPROVED) immediately unless
 * the admin picks another status. When no `owner` is supplied the admin becomes
 * the owner so the required reference is always satisfied.
 */
export const createClub = async (adminUser, data) => {
  const { owner, status, ...fields } = data;
  const finalStatus = status || CLUB_STATUS.APPROVED;

  const payload = {
    ...fields,
    owner: owner || adminUser.id,
    status: finalStatus,
  };
  if (finalStatus === CLUB_STATUS.APPROVED) {
    payload.approvedAt = new Date();
    payload.approvedBy = adminUser.id;
  }

  const club = await clubRepository.create(payload);
  return toClubResponse(club);
};

/** Fetch a single club (any status) as the full detail DTO for the edit form. */
export const getClub = async (clubId) => {
  const club = await clubRepository.findById(clubId, { populateOwner: true });
  if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);
  return toClubResponse(club);
};

/**
 * Admin edits any club's content and admin-only fields (status, isFeatured)
 * in one call, without the owner resubmit side effects.
 */
export const updateClub = async (clubId, data, adminId) => {
  const club = await clubRepository.findById(clubId);
  if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);

  const patch = { ...data };
  if (patch.status === CLUB_STATUS.APPROVED && club.status !== CLUB_STATUS.APPROVED) {
    patch.approvedAt = new Date();
    patch.approvedBy = adminId;
    patch.rejectionReason = null;
  }

  const updated = await clubRepository.updateById(clubId, patch);
  return toClubResponse(updated);
};

export const updateClubStatus = async (clubId, { status, reason }, adminId) => {
  const club = await clubRepository.findById(clubId);
  if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);

  const update = { status };
  if (status === CLUB_STATUS.APPROVED) {
    update.approvedAt = new Date();
    update.approvedBy = adminId;
    update.rejectionReason = null;
  }
  if (status === CLUB_STATUS.REJECTED) {
    update.rejectionReason = reason;
  }

  const updated = await clubRepository.updateById(clubId, update);
  return toClubListItem(updated);
};

export const setClubFeatured = async (clubId, isFeatured) => {
  const club = await clubRepository.findById(clubId);
  if (!club) throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);
  const updated = await clubRepository.updateById(clubId, { isFeatured });
  return toClubListItem(updated);
};

export const deleteClub = (clubId, adminUser) =>
  clubService.deleteClub(clubId, adminUser);

// Image management reuses the club service (its manageable-club check passes
// admins through), so admins upload/remove logos and gallery photos on any club.
export const updateClubLogo = (clubId, adminUser, file) =>
  clubService.updateLogo(clubId, adminUser, file);

export const addClubGallery = (clubId, adminUser, files) =>
  clubService.addGalleryImages(clubId, adminUser, files);

export const removeClubGallery = (clubId, adminUser, image) =>
  clubService.removeGalleryImage(clubId, adminUser, image);

export const listUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const rx = { $regex: escapeRegex(query.search), $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const { items, total } = await userRepository.paginate(filter, { skip, limit });
  return {
    data: items.map((user) => toUserResponse(user)),
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

/** Turn an email's local part into a readable placeholder display name. */
const deriveAdminName = (email) => {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  if (local.length < 2) return 'New Admin';
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Invite a new admin by email. Creates a verified admin account with an
 * unguessable random password, then emails them a set-password link (the same
 * token used by "forgot password"). They finish onboarding by choosing their
 * own password and signing in.
 */
export const createAdmin = async (email) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  await userRepository.create({
    name: deriveAdminName(email),
    email,
    // Random secret the invitee never sees — they must reset to a known value.
    password: crypto.randomBytes(32).toString('hex'),
    role: ROLES.ADMIN,
    provider: AUTH_PROVIDER.LOCAL,
    isEmailVerified: true,
  });

  // Fire the reset-password email so they can create their own credentials.
  await authService.forgotPassword(email);
};

export const setUserStatus = async (targetId, status, adminUser) => {
  const target = await userRepository.findById(targetId);
  if (!target) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
  if (target.id === adminUser.id) {
    throw ApiError.badRequest(MESSAGES.ADMIN.CANNOT_MODIFY_SELF);
  }
  if (target.role === ROLES.ADMIN) {
    throw ApiError.forbidden(MESSAGES.ADMIN.CANNOT_MODIFY_ADMIN);
  }

  const updated = await userRepository.updateById(targetId, { status });
  return toUserResponse(updated);
};

export const listEvents = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.club) filter.club = query.club;

  const { items, total } = await eventRepository.paginate(filter, { skip, limit });
  return {
    data: items.map(toEventResponse),
    meta: buildPaginationMeta({ total, page, limit }),
  };
};

export const deleteEvent = (eventId, adminUser) =>
  eventService.deleteEvent(eventId, adminUser);
