import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * A parent's favorite club. The unique compound index guarantees a parent can
 * favorite a club at most once and makes "is favorited" / toggle O(1).
 */
const favoriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, club: 1 }, { unique: true });

export const Favorite = model('Favorite', favoriteSchema);

export default Favorite;
