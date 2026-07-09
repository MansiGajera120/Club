import mongoose from 'mongoose';

import { NOTIFICATION_TYPE_VALUES, NOTIFICATION_TYPE } from '../enums/index.js';

const { Schema, model } = mongoose;

/**
 * User notification. Structure is prepared per requirements; delivery (push via
 * Firebase, in-app feed) is wired up later. `data` carries a small,
 * type-specific payload (e.g. clubId, eventId) for deep-linking.
 */
const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      default: NOTIFICATION_TYPE.SYSTEM,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Feed query: a user's notifications, newest first.
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model('Notification', notificationSchema);

export default Notification;
