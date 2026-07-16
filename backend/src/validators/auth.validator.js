import Joi from 'joi';

import { ROLES } from '../enums/index.js';

const email = Joi.string().email().lowercase().trim().max(160).required();
const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must include at least one letter and one number',
  });

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email,
  password,
  // Public signup is limited to parents and club owners; admins are seeded.
  role: Joi.string().valid(ROLES.PARENT, ROLES.CLUB_OWNER).default(ROLES.PARENT),
});

export const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({ email });

export const resetPasswordSchema = Joi.object({
  email,
  code: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({ 'string.pattern.base': 'Enter the 6-digit code from your email' }),
  password,
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

export const verifyOtpSchema = Joi.object({
  email,
  code: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({ 'string.pattern.base': 'Enter the 6-digit code from your email' }),
});

export const resendVerificationSchema = Joi.object({ email });

export const refreshSchema = Joi.object({
  // Optional in body — may also arrive via httpOnly cookie.
  refreshToken: Joi.string().optional(),
});

export const googleSchema = Joi.object({
  idToken: Joi.string().required(),
});

export const appleSchema = Joi.object({
  identityToken: Joi.string().required(),
  name: Joi.string().trim().max(80).optional(),
});
