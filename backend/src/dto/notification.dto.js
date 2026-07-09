const idOf = (v) => (v && v._id ? v._id.toString() : (v?.toString?.() ?? v));

/**
 * Notification representation for API responses.
 * @param {object} n
 */
export const toNotificationResponse = (n) => ({
  id: idOf(n._id ?? n.id),
  type: n.type,
  title: n.title,
  body: n.body ?? null,
  data: n.data ?? {},
  isRead: Boolean(n.isRead),
  readAt: n.readAt ?? null,
  createdAt: n.createdAt,
});

export default toNotificationResponse;
