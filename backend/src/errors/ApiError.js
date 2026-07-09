import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Application-level operational error. Anything thrown as an ApiError is
 * considered "expected" (a known failure mode) and is safe to surface to the
 * client. The global error handler formats it into the standard envelope.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code to respond with.
   * @param {string} message Human-readable message.
   * @param {object} [options]
   * @param {Array<{field?: string, message: string}>} [options.errors] Field-level errors.
   * @param {boolean} [options.isOperational=true]
   */
  constructor(statusCode, message, { errors = [], isOperational = true } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = MESSAGES.COMMON.VALIDATION_ERROR, errors = []) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, { errors });
  }

  static unauthorized(message = MESSAGES.COMMON.UNAUTHORIZED) {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = MESSAGES.COMMON.FORBIDDEN) {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = MESSAGES.COMMON.NOT_FOUND) {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message) {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static unprocessable(message = MESSAGES.COMMON.VALIDATION_ERROR, errors = []) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, { errors });
  }

  static internal(message = MESSAGES.COMMON.INTERNAL_ERROR) {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, {
      isOperational: false,
    });
  }
}

export default ApiError;
