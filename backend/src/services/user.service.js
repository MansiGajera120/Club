import { ApiError } from '../errors/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { userRepository } from '../repositories/user.repository.js';
import { toUserResponse } from '../dto/user.dto.js';
import { processImage, deleteUpload } from './image.service.js';
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
