import mongoose from 'mongoose';

import {
  CLUB_STATUS_VALUES,
  CLUB_STATUS,
  GENDER_VALUES,
  GENDER,
} from '../enums/index.js';

const { Schema, model } = mongoose;

/**
 * Embedded contact / social links for a club. Parents act on these (call,
 * email, open website / Instagram / TikTok).
 */
const contactSchema = new Schema(
  {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    instagram: { type: String, trim: true },
    tiktok: { type: String, trim: true },
  },
  { _id: false }
);

const clubSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 4000 },
    sport: { type: String, trim: true, index: true },
    // Services / programmes the club offers (e.g. "Coaching", "Camps").
    services: { type: [String], default: [] },

    // Location
    city: { type: String, trim: true, index: true },
    address: { type: String, trim: true },

    // Filterable attributes
    gender: { type: String, enum: GENDER_VALUES, default: GENDER.MIXED, index: true },
    ageMin: { type: Number, min: 0, max: 100, default: 0 },
    ageMax: { type: Number, min: 0, max: 100, default: 100 },
    price: { type: Number, min: 0, default: 0, index: true },
    priceCurrency: { type: String, trim: true, default: 'USD' },

    // Media (relative upload paths; absolute URLs built in the DTO)
    logo: { type: String },
    gallery: { type: [String], default: [] },

    // Contact & registration
    contact: { type: contactSchema, default: () => ({}) },
    registrationLink: { type: String, trim: true },

    // Moderation
    status: {
      type: String,
      enum: CLUB_STATUS_VALUES,
      default: CLUB_STATUS.PENDING,
      index: true,
    },
    rejectionReason: { type: String, trim: true },
    // When set, an admin suspended this club until this moment; the auto-unsuspend
    // sweep flips it back to approved once it passes. Null means "not suspended"
    // or "suspended indefinitely" — the sweep ignores both.
    suspendedUntil: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false, index: true },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    favoritesCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keyword search is intentionally regex-based (see utils/clubSearch.js) to
// support partial / typeahead matching on name, city and sport — behaviour a
// Mongo `$text` index cannot provide (it only matches whole/stemmed words).
// The individual `name`, `city` and `sport` fields carry their own indexes for
// the equality filters; for large-scale full-text ranking, migrate keyword
// search to a dedicated engine (e.g. Atlas Search) rather than reintroducing a
// `$text` index that this query pattern would never use.
clubSchema.index({ name: 1 });

// Common browse query: approved + featured, newest first.
clubSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

// Supports the `popular` sort (favoritesCount desc) without an in-memory sort.
clubSchema.index({ status: 1, favoritesCount: -1 });

// The auto-unsuspend sweep queries suspended clubs with an elapsed end date.
clubSchema.index({ status: 1, suspendedUntil: 1 });

export const Club = model('Club', clubSchema);

export default Club;
