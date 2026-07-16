import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
});

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must include at least one letter and one number',
  });

export const changePasswordSchema = Joi.object({
  // Optional so passwordless (social) accounts can set a password for the first
  // time. The service still requires it when the account already has a password.
  currentPassword: Joi.string().allow('').optional(),
  newPassword: password,
});

export const verifyPasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
});
