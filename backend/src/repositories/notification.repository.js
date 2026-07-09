import { Notification } from '../models/notification.model.js';

/**
 * Data-access layer for notifications (structure prepared for future delivery).
 */
export const notificationRepository = {
  create(data) {
    return Notification.create(data);
  },

  async paginateForUser(userId, { skip, limit }) {
    const filter = { user: userId };
    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);
    return { items, total };
  },

  countUnread(userId) {
    return Notification.countDocuments({ user: userId, isRead: false });
  },

  markRead(userId, id) {
    return Notification.updateOne(
      { _id: id, user: userId },
      { isRead: true, readAt: new Date() }
    );
  },

  markAllRead(userId) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  },
};

export default notificationRepository;
