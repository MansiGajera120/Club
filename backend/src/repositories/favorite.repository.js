import { Favorite } from '../models/favorite.model.js';

/**
 * Data-access layer for favorites (parent ↔ club).
 */
export const favoriteRepository = {
  /**
   * Idempotent add — relies on the unique {user, club} index.
   * Returns `true` only when a new favorite row was actually inserted, so the
   * caller can increment the club's counter exactly once (no drift under
   * concurrent double-taps).
   */
  async add(userId, clubId) {
    const res = await Favorite.updateOne(
      { user: userId, club: clubId },
      { $setOnInsert: { user: userId, club: clubId } },
      { upsert: true }
    );
    return res.upsertedCount > 0;
  },

  remove(userId, clubId) {
    return Favorite.deleteOne({ user: userId, club: clubId });
  },

  exists(userId, clubId) {
    return Favorite.exists({ user: userId, club: clubId });
  },

  /** All club ids a user has favorited (for annotating club lists). */
  async clubIdsForUser(userId) {
    const docs = await Favorite.find({ user: userId }).select('club').lean();
    return docs.map((d) => d.club.toString());
  },

  async paginateForUser(userId, { skip, limit }) {
    const filter = { user: userId };
    const [items, total] = await Promise.all([
      Favorite.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('club')
        .lean(),
      Favorite.countDocuments(filter),
    ]);
    return { items, total };
  },

  deleteByClub(clubId) {
    return Favorite.deleteMany({ club: clubId });
  },
};

export default favoriteRepository;
