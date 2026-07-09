import config from '../config/index.js';

/**
 * Build a public, absolute URL for an uploaded file. Files are stored in the DB
 * as paths relative to the uploads root (e.g. `logos/abc.webp`) and served by
 * the static `/uploads` route. Absolute URLs (external images) pass through.
 *
 * @param {string|null|undefined} relativePath
 * @returns {string|null}
 */
export const buildUploadUrl = (relativePath) => {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const clean = String(relativePath).replace(/^\/+/, '');
  return `${config.server.appUrl}/uploads/${clean}`;
};
