import { Club } from '../models/club.model.js';

/**
 * Data-access layer for clubs. Services build the Mongo `filter`, `sort` and
 * pagination; this repository just executes queries.
 */
export const clubRepository = {
  create(data) {
    return Club.create(data);
  },

  findById(id, { populateOwner = false } = {}) {
    const query = Club.findById(id);
    if (populateOwner) query.populate('owner', 'name email');
    return query;
  },

  findByOwner(ownerId) {
    return Club.find({ owner: ownerId }).sort({ createdAt: -1 });
  },

  findOne(filter) {
    return Club.findOne(filter);
  },

  /**
   * Paginated list with an arbitrary filter and sort.
   * @returns {Promise<{ items: object[], total: number }>}
   */
  async paginate(filter, { skip, limit, sort = { createdAt: -1 } }) {
    const [items, total] = await Promise.all([
      Club.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Club.countDocuments(filter),
    ]);
    return { items, total };
  },

  updateById(id, update) {
    return Club.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  deleteById(id) {
    return Club.findByIdAndDelete(id);
  },

  incrementFavorites(id, delta) {
    return Club.updateOne({ _id: id }, { $inc: { favoritesCount: delta } });
  },

  countByStatus(status) {
    return Club.countDocuments({ status });
  },

  count(filter = {}) {
    return Club.countDocuments(filter);
  },
};

export default clubRepository;
