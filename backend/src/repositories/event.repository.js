import { Event } from '../models/event.model.js';
import { CLUB_STATUS } from '../enums/index.js';

/**
 * Data-access layer for events.
 */
export const eventRepository = {
  create(data) {
    return Event.create(data);
  },

  findById(id) {
    return Event.findById(id);
  },

  findByClub(clubId, { activeOnly = false } = {}) {
    const filter = { club: clubId };
    if (activeOnly) filter.isActive = true;
    return Event.find(filter).sort({ startDate: -1 });
  },

  async paginate(filter, { skip, limit, sort = { startDate: -1 } }) {
    const [items, total] = await Promise.all([
      Event.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter),
    ]);
    return { items, total };
  },

  updateById(id, update) {
    return Event.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  deleteById(id) {
    return Event.findByIdAndDelete(id);
  },

  deleteByClub(clubId) {
    return Event.deleteMany({ club: clubId });
  },

  /**
   * Upcoming, active events belonging to approved clubs — the global events
   * feed. Joins clubs to exclude events from non-approved clubs.
   */
  async paginateUpcomingApproved({ skip, limit }) {
    const base = [
      { $match: { isActive: true, startDate: { $gte: new Date() } } },
      {
        $lookup: {
          from: 'clubs',
          localField: 'club',
          foreignField: '_id',
          as: 'clubDoc',
        },
      },
      { $unwind: '$clubDoc' },
      { $match: { 'clubDoc.status': CLUB_STATUS.APPROVED } },
    ];

    const [items, countResult] = await Promise.all([
      Event.aggregate([
        ...base,
        { $sort: { startDate: 1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { clubDoc: 0 } },
      ]),
      Event.aggregate([...base, { $count: 'total' }]),
    ]);

    return { items, total: countResult[0]?.total ?? 0 };
  },

  count(filter = {}) {
    return Event.countDocuments(filter);
  },
};

export default eventRepository;
