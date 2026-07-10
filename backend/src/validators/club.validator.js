import Joi from 'joi';

import { GENDER, GENDER_VALUES } from '../enums/index.js';

const contactSchema = Joi.object({
  phone: Joi.string().trim().allow('').max(40),
  email: Joi.string().email().allow('').max(160),
  website: Joi.string().uri().allow('').max(300),
  instagram: Joi.string().trim().allow('').max(300),
  tiktok: Joi.string().trim().allow('').max(300),
});

export const createClubSchema = Joi.object({
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
}).custom((value, helpers) => {
  if (value.ageMax < value.ageMin) {
    return helpers.message('ageMax must be greater than or equal to ageMin');
  }
  return value;
});

// Every field optional on update; at least one must be present.
export const updateClubSchema = Joi.object({
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
}).min(1);

export const listClubsQuerySchema = Joi.object({
  search: Joi.string().trim().allow('').max(120),
  city: Joi.string().trim().allow('').max(120),
  sport: Joi.string().trim().allow('').max(80),
  gender: Joi.string().valid(...GENDER_VALUES),
  age: Joi.number().integer().min(0).max(100),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  featured: Joi.boolean(),
  sort: Joi.string()
    .valid('newest', 'oldest', 'price_asc', 'price_desc', 'popular')
    .default('newest'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const removeGallerySchema = Joi.object({
  image: Joi.string().required(),
});
