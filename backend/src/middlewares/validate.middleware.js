import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Build a validation middleware from a Joi schema. Validates the given request
 * property, strips unknown keys, collects ALL errors, and replaces the request
 * property with the sanitized value so controllers receive clean input.
 *
 * @param {import('joi').ObjectSchema} schema
 * @param {'body'|'query'|'params'} [property='body']
 */
export const validate =
  (schema, property = 'body') =>
  (req, _res, next) => {
    const { value, error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return next(ApiError.unprocessable(MESSAGES.COMMON.VALIDATION_ERROR, errors));
    }

    req[property] = value;
    return next();
  };

export default validate;
