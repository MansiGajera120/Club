import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * A club event. Owned by a club; parents view events and open the registration
 * link. Managed (create/edit/delete) by the club owner.
 */
const eventSchema = new Schema(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 4000 },

    // Relative upload path; absolute URL built in the DTO.
    coverImage: { type: String },

    location: { type: String, trim: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },

    registrationLink: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Common query: a club's upcoming/active events by date.
eventSchema.index({ club: 1, startDate: -1 });

export const Event = model('Event', eventSchema);

export default Event;
