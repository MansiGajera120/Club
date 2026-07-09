import multer from 'multer';

import config from '../config/index.js';
import { ApiError } from '../errors/ApiError.js';

// Buffer files in memory; Sharp processes them before anything hits disk.
const storage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  if (/^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only image files (jpg, png, webp, gif) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: config.uploads.maxFileSize },
});

/** Single image on the given field. */
export const uploadSingle = (field) => upload.single(field);

/** Multiple images on the given field. */
export const uploadMany = (field, maxCount = 10) => upload.array(field, maxCount);

/** Club media: one logo + up to 10 gallery images in a single request. */
export const uploadClubMedia = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);
