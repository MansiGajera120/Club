import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { CLUB_STATUS } from '../enums/index.js';
import { favoriteRepository } from '../repositories/favorite.repository.js';
import { clubRepository } from '../repositories/club.repository.js';
import { toClubListItem } from '../dto/club.dto.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';

export const addFavorite = async (userId, clubId) => {
  const club = await clubRepository.findById(clubId);
  if (!club || club.status !== CLUB_STATUS.APPROVED) {
    throw ApiError.notFound(MESSAGES.CLUB.NOT_FOUND);
  }

  const already = await favoriteRepository.exists(userId, clubId);
  if (!already) {
    await favoriteRepository.add(userId, clubId);
    await clubRepository.incrementFavorites(clubId, 1);
  }
};

export const removeFavorite = async (userId, clubId) => {
  const result = await favoriteRepository.remove(userId, clubId);
  if (result.deletedCount > 0) {
    await clubRepository.incrementFavorites(clubId, -1);
  }
};

export const listFavorites = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const { items, total } = await favoriteRepository.paginateForUser(userId, {
    skip,
    limit,
  });

  const data = items
    .filter((fav) => fav.club) // drop favorites whose club was deleted
    .map((fav) => toClubListItem(fav.club, { isFavorite: true }));

  return { data, meta: buildPaginationMeta({ total, page, limit }) };
};
