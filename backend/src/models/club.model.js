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

// Full-text search across name, description and city (keyword search).
clubSchema.index(
  { name: 'text', description: 'text', city: 'text' },
  { weights: { name: 5, city: 3, description: 1 }, name: 'club_text' }
);

// Common browse query: approved + featured, newest first.
clubSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

export const Club = model('Club', clubSchema);

export default Club;
