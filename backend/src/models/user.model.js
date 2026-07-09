import mongoose from 'mongoose';

import {
  ROLE_VALUES,
  ROLES,
  AUTH_PROVIDER_VALUES,
  AUTH_PROVIDER,
  USER_STATUS_VALUES,
  USER_STATUS,
} from '../enums/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Not required for social accounts; never returned by default.
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.PARENT,
      index: true,
    },
    provider: {
      type: String,
      enum: AUTH_PROVIDER_VALUES,
      default: AUTH_PROVIDER.LOCAL,
    },
    // OAuth subject id (Google/Apple `sub`).
    providerId: {
      type: String,
      index: true,
      sparse: true,
    },
    avatarUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: USER_STATUS_VALUES,
      default: USER_STATUS.ACTIVE,
      index: true,
    },

    // Email verification / password reset (hashed tokens, never selected).
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/** Hash the password whenever it is set/changed. */
userSchema.pre('save', async function hashOnSave(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await hashPassword(this.password);
  return next();
});

/** Compare a candidate password against this user's hash. */
userSchema.methods.comparePassword = function compare(candidate) {
  if (!this.password) return Promise.resolve(false);
  return comparePassword(candidate, this.password);
};

export const User = model('User', userSchema);

export default User;
