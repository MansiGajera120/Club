import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const createEventSchema = Joi.object({
  club: objectId.required(),
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().allow('').max(4000),
  location: Joi.string().trim().allow('').max(300),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  registrationLink: Joi.string().uri().allow('').max(300),
  isActive: Joi.boolean().default(true),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160),
  description: Joi.string().trim().allow('').max(4000),
  location: Joi.string().trim().allow('').max(300),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  registrationLink: Joi.string().uri().allow('').max(300),
  isActive: Joi.boolean(),
}).min(1);

export const listEventsQuerySchema = Joi.object({
  club: objectId,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
