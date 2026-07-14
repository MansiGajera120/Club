import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const createEventSchema = Joi.object({
  club: objectId.required(),
  title: Joi.string().trim().min(2).max(160).required(),
  type: Joi.string().valid('Camps', 'Clinics', 'Events').default('Events'),
  description: Joi.string().trim().allow('').max(4000),
  location: Joi.string().trim().allow('').max(300),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date()
    .iso()
    .allow(null)
    .when('startDate', {
      is: Joi.exist().not(null),
      then: Joi.date().min(Joi.ref('startDate')),
    }),
  price: Joi.number().min(0).max(1000000).default(0),
  priceCurrency: Joi.string().trim().uppercase().length(3).default('USD'),
  registrationLink: Joi.string().uri().allow('').max(300),
  registrationStartDate: Joi.date().iso().allow(null),
  // Registration must close on or after it opens.
  registrationEndDate: Joi.date()
    .iso()
    .allow(null)
    .when('registrationStartDate', {
      is: Joi.exist().not(null),
      then: Joi.date().min(Joi.ref('registrationStartDate')),
    }),
  isActive: Joi.boolean().default(true),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160),
  type: Joi.string().valid('Camps', 'Clinics', 'Events'),
  description: Joi.string().trim().allow('').max(4000),
  location: Joi.string().trim().allow('').max(300),
  startDate: Joi.date().iso(),
  endDate: Joi.date()
    .iso()
    .allow(null)
    .when('startDate', {
      is: Joi.exist().not(null),
      then: Joi.date().min(Joi.ref('startDate')),
    }),
  price: Joi.number().min(0).max(1000000),
  priceCurrency: Joi.string().trim().uppercase().length(3),
  registrationLink: Joi.string().uri().allow('').max(300),
  registrationStartDate: Joi.date().iso().allow(null),
  registrationEndDate: Joi.date()
    .iso()
    .allow(null)
    .when('registrationStartDate', {
      is: Joi.exist().not(null),
      then: Joi.date().min(Joi.ref('registrationStartDate')),
    }),
  isActive: Joi.boolean(),
}).min(1);

export const listEventsQuerySchema = Joi.object({
  club: objectId,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
