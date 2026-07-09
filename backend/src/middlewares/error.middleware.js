import mongoose from 'mongoose';
import { MulterError } from 'multer';
import { ApiError } from '../errors/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';
import config from '../config/index.js';
import logger from '../logger/index.js';

/**
 * Normalize known non-ApiError failures (Mongoose, JWT, JSON parse, etc.) into
 * an ApiError so the response shape stays consistent.
 *
 * @param {Error} err
 * @returns {ApiError}
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  // Invalid ObjectId / cast failures.
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for field "${err.path}"`);
  }

  // Mongoose schema validation.
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.unprocessable(MESSAGES.COMMON.VALIDATION_ERROR, errors);
  }

  // Duplicate key (unique index) violation.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`A record with this ${field} already exists`);
  }

  // JWT failures.
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Authentication token has expired');
  }

  // Malformed JSON body.
  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON in request body');
  }

  // File upload errors (Multer).
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? `Unexpected file field "${err.field}"`
          : 'File upload failed';
    return ApiError.badRequest(message);
  }

  // Unknown / unexpected — treat as a non-operational 500.
  return ApiError.internal();
};

/**
 * Global error-handling middleware. Must be registered LAST, after all routes.
 * Express recognizes it as an error handler by its four-argument signature.
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const error = normalizeError(err);

  // Log server errors with the full stack; log expected 4xx at a lower level.
  if (error.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(`${req.method} ${req.originalUrl} — ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${error.message}`);
  }

  const body = {
    success: false,
    message: error.message,
  };

  if (error.errors && error.errors.length > 0) {
    body.errors = error.errors;
  }

  // Expose stack traces only outside production to aid debugging.
  if (!config.isProduction && err.stack) {
    body.stack = err.stack;
  }

  res.status(error.statusCode).json(body);
};

export default errorHandler;
