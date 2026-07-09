import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Standard success-response envelope used by every endpoint:
 *   { success: true, message, data, meta? }
 *
 * Keeping this in one place guarantees a consistent contract for the mobile app
 * and admin panel.
 */
export class ApiResponse {
  /**
   * Send a success response.
   *
   * @param {import('express').Response} res
   * @param {object} [options]
   * @param {number} [options.statusCode=200]
   * @param {string} [options.message]
   * @param {*} [options.data=null]
   * @param {object} [options.meta] Optional pagination / extra metadata.
   */
  static send(
    res,
    {
      statusCode = HTTP_STATUS.OK,
      message = MESSAGES.COMMON.SUCCESS,
      data = null,
      meta,
    } = {}
  ) {
    const body = { success: true, message, data };
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static ok(res, data, message) {
    return ApiResponse.send(res, { statusCode: HTTP_STATUS.OK, data, message });
  }

  static created(res, data, message = MESSAGES.COMMON.CREATED) {
    return ApiResponse.send(res, {
      statusCode: HTTP_STATUS.CREATED,
      data,
      message,
    });
  }

  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}

export default ApiResponse;
