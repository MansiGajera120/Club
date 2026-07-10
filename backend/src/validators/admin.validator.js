import Joi from 'joi';

import {
  CLUB_STATUS,
  CLUB_STATUS_VALUES,
  GENDER,
  GENDER_VALUES,
  ROLE_VALUES,
  USER_STATUS_VALUES,
} from '../enums/index.js';

const objectId = Joi.string().hex().length(24);

const contactSchema = Joi.object({
  phone: Joi.string()
    .trim()
    .allow('')
    .pattern(/^[0-9]{10}$/)
    .messages({ 'string.pattern.base': 'Phone must be a 10-digit number' }),
  email: Joi.string().email().allow('').max(160),
  website: Joi.string().uri().allow('').max(300),
  instagram: Joi.string().trim().allow('').max(300),
  tiktok: Joi.string().trim().allow('').max(300),
});

// Admin create: an admin registers an organization directly. All club content
// fields are accepted, plus admin-only controls (status, isFeatured). `owner`
// is optional — when omitted the service assigns the club to the admin.
export const adminCreateClubSchema = Joi.object({
  owner: objectId,
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().allow('').max(4000),
  sport: Joi.string().trim().allow('').max(80),
  services: Joi.array().items(Joi.string().trim().max(80)).max(30).default([]),
  city: Joi.string().trim().allow('').max(120),
  address: Joi.string().trim().allow('').max(300),
  gender: Joi.string()
    .valid(...GENDER_VALUES)
    .default(GENDER.MIXED),
  ageMin: Joi.number().integer().min(0).max(100).default(0),
  ageMax: Joi.number().integer().min(0).max(100).default(100),
  price: Joi.number().min(0).default(0),
  priceCurrency: Joi.string().trim().max(8).default('USD'),
  contact: contactSchema.default({}),
  registrationLink: Joi.string().uri().allow('').max(300),
  status: Joi.string().valid(...CLUB_STATUS_VALUES),
  isFeatured: Joi.boolean().default(false),
}).custom((value, helpers) => {
  if (value.ageMax < value.ageMin) {
    return helpers.message('ageMax must be greater than or equal to ageMin');
  }
  return value;
});

// Admin update: every field optional; at least one required.
export const adminUpdateClubSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().allow('').max(4000),
  sport: Joi.string().trim().allow('').max(80),
  services: Joi.array().items(Joi.string().trim().max(80)).max(30),
  city: Joi.string().trim().allow('').max(120),
  address: Joi.string().trim().allow('').max(300),
  gender: Joi.string().valid(...GENDER_VALUES),
  ageMin: Joi.number().integer().min(0).max(100),
  ageMax: Joi.number().integer().min(0).max(100),
  price: Joi.number().min(0),
  priceCurrency: Joi.string().trim().max(8),
  contact: contactSchema,
  registrationLink: Joi.string().uri().allow('').max(300),
  status: Joi.string().valid(...CLUB_STATUS_VALUES),
  isFeatured: Joi.boolean(),
}).min(1);

export const updateClubStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...CLUB_STATUS_VALUES)
    .required(),
  // Reason is required when rejecting, optional otherwise.
  reason: Joi.when('status', {
    is: CLUB_STATUS.REJECTED,
    then: Joi.string().trim().min(3).max(500).required(),
    otherwise: Joi.string().trim().allow('').max(500),
  }),
});

export const setFeaturedSchema = Joi.object({
  isFeatured: Joi.boolean().required(),
});

// Invite a new admin by email — they set their own password via the reset flow.
export const createAdminSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().max(160).required(),
});

export const listClubsQuerySchema = Joi.object({
  status: Joi.string().valid(...CLUB_STATUS_VALUES),
  search: Joi.string().trim().allow('').max(120),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const listUsersQuerySchema = Joi.object({
  role: Joi.string().valid(...ROLE_VALUES),
  status: Joi.string().valid(...USER_STATUS_VALUES),
  search: Joi.string().trim().allow('').max(120),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const setUserStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...USER_STATUS_VALUES)
    .required(),
});

export const listEventsQuerySchema = Joi.object({
  club: objectId,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
