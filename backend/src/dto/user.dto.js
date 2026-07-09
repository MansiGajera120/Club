import { buildUploadUrl } from '../utils/url.js';

/**
 * Shape a User document into the public response object. Guarantees sensitive
 * fields (password, tokens) never leave the API, regardless of how the document
 * was queried. Locally-uploaded avatars (relative paths) are resolved to
 * absolute URLs; social avatars (already absolute) pass through.
 *
 * @param {import('mongoose').Document} user
 * @returns {object}
 */
export const toUserResponse = (user) => ({
  id: user.id ?? user._id?.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  provider: user.provider,
  avatarUrl: buildUploadUrl(user.avatarUrl),
  isEmailVerified: user.isEmailVerified,
  status: user.status,
  createdAt: user.createdAt,
});

export default toUserResponse;
