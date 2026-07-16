import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { userRepository } from '../repositories/user.repository.js';
import { toUserResponse } from '../dto/user.dto.js';
import { processImage, deleteUpload } from './image.service.js';
import { revokeAllUserTokens } from './token.service.js';
import { UPLOAD_FOLDERS } from '../utils/paths.js';

export const getProfile = (user) => toUserResponse(user);

export const updateProfile = async (user, data) => {
  const updated = await userRepository.updateById(user.id, data);
  return toUserResponse(updated);
};

export const updateAvatar = async (user, file) => {
  if (!file) throw ApiError.badRequest(MESSAGES.CLUB.NO_FILE);

  const relativePath = await processImage(file.buffer, {
    folder: UPLOAD_FOLDERS.avatars,
    width: 256,
    height: 256,
  });

  const previous = user.avatarUrl;
  const updated = await userRepository.updateById(user.id, {
    avatarUrl: relativePath,
  });
  await deleteUpload(previous); // no-op for external (social) avatar URLs
  return toUserResponse(updated);
};

export const changePassword = async (user, { currentPassword, newPassword }) => {
  const account = await userRepository.findByEmailWithPassword(user.email);
  if (!account) throw ApiError.unauthorized();

  // Accounts that already have a password must confirm the current one. Social
  // / passwordless accounts are allowed to set a password for the first time.
  if (account.password) {
    const matches = await account.comparePassword(currentPassword);
    if (!matches) {
      throw ApiError.unauthorized('Current password is incorrect');
    }
  }

  account.password = newPassword;
  await account.save();
  await revokeAllUserTokens(account.id);
};

export const verifyPassword = async (user, { currentPassword }) => {
  const account = await userRepository.findByEmailWithPassword(user.email);
  if (!account?.password) {
    throw ApiError.badRequest(
      'Password change is not available for social sign-in accounts'
    );
  }

  const matches = await account.comparePassword(currentPassword);
  if (!matches) {
    throw ApiError.unauthorized('Current password is incorrect');
  }
};
