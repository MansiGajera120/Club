import Joi from 'joi';

import {
  CLUB_STATUS,
  CLUB_STATUS_VALUES,
  ROLE_VALUES,
  USER_STATUS_VALUES,
} from '../enums/index.js';

const objectId = Joi.string().hex().length(24);

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
