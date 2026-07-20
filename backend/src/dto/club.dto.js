import { buildUploadUrl } from '../utils/url.js';

const idOf = (v) => (v && v._id ? v._id.toString() : (v?.toString?.() ?? v));

/**
 * Full club representation for detail views. Builds absolute image URLs and can
 * fold in a per-request `isFavorite` flag for the current parent.
 *
 * @param {object} club Club document or lean object
 * @param {{ isFavorite?: boolean }} [opts]
 */
export const toClubResponse = (club, { isFavorite } = {}) => {
  const owner = club.owner && club.owner.name ? club.owner : null;

  return {
    id: idOf(club._id ?? club.id),
    name: club.name,
    description: club.description ?? null,
    sport: club.sport ?? null,
    services: club.services ?? [],
    city: club.city ?? null,
    address: club.address ?? null,
    gender: club.gender,
    ageMin: club.ageMin,
    ageMax: club.ageMax,
    price: club.price,
    priceCurrency: club.priceCurrency,
    logo: buildUploadUrl(club.logo),
    gallery: (club.gallery ?? []).map(buildUploadUrl),
    contact: {
      phone: club.contact?.phone ?? null,
      email: club.contact?.email ?? null,
      website: club.contact?.website ?? null,
      instagram: club.contact?.instagram ?? null,
      tiktok: club.contact?.tiktok ?? null,
    },
    registrationLink: club.registrationLink ?? null,
    status: club.status,
    rejectionReason: club.rejectionReason ?? null,
    suspendedUntil: club.suspendedUntil ?? null,
    isFeatured: Boolean(club.isFeatured),
    favoritesCount: club.favoritesCount ?? 0,
    owner: owner
      ? { id: idOf(owner._id ?? owner.id), name: owner.name, email: owner.email }
      : idOf(club.owner),
    createdAt: club.createdAt,
    updatedAt: club.updatedAt,
    ...(isFavorite === undefined ? {} : { isFavorite }),
  };
};

/**
 * Lightweight club representation for list/search results.
 * @param {object} club
 * @param {{ isFavorite?: boolean }} [opts]
 */
export const toClubListItem = (club, { isFavorite } = {}) => ({
  id: idOf(club._id ?? club.id),
  name: club.name,
  sport: club.sport ?? null,
  city: club.city ?? null,
  gender: club.gender,
  ageMin: club.ageMin,
  ageMax: club.ageMax,
  priceCurrency: club.priceCurrency,
  address: club.address ?? null,
  contact: {
    email: club.contact?.email ?? null,
    phone: club.contact?.phone ?? null,
  },
  logo: buildUploadUrl(club.logo),
  isFeatured: Boolean(club.isFeatured),
  status: club.status,
  suspendedUntil: club.suspendedUntil ?? null,
  favoritesCount: club.favoritesCount ?? 0,
  ...(isFavorite === undefined ? {} : { isFavorite }),
});
