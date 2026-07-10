/**
 * Defence-in-depth against NoSQL operator injection. Recursively removes any
 * object keys that start with `$` (Mongo operators) or contain `.` (dotted
 * path traversal) from the request body, query and params — in place, so it
 * works on Express 4's mutable `req.query`.
 *
 * Joi validation with `stripUnknown` already protects validated routes; this
 * closes the gap for any current or future handler that reads raw input.
 */
const sanitizeInPlace = (value) => {
  if (Array.isArray(value)) {
    value.forEach(sanitizeInPlace);
    return;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        // eslint-disable-next-line no-param-reassign
        delete value[key];
      } else {
        sanitizeInPlace(value[key]);
      }
    }
  }
};

export const sanitizeRequest = (req, _res, next) => {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.query);
  sanitizeInPlace(req.params);
  return next();
};

export default sanitizeRequest;
