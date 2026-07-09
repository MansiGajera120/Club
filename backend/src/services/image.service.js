import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

import { uploadsRoot } from '../utils/paths.js';
import logger from '../logger/index.js';

/**
 * Optimize an uploaded image buffer with Sharp and write it to disk as WebP.
 * Returns the path relative to the uploads root (e.g. `logos/uuid.webp`) — the
 * value stored in the DB. Absolute URLs are built later by the DTO layer.
 *
 * @param {Buffer} buffer Raw image bytes (from multer memory storage)
 * @param {{ folder: string, width?: number, height?: number, quality?: number }} options
 * @returns {Promise<string>} relative upload path
 */
export const processImage = async (
  buffer,
  { folder, width = 1280, height, quality = 80 }
) => {
  const filename = `${crypto.randomUUID()}.webp`;
  const dir = path.join(uploadsRoot, folder);
  await fs.mkdir(dir, { recursive: true });

  await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toFile(path.join(dir, filename));

  return `${folder}/${filename}`;
};

/**
 * Delete an uploaded file by its relative path. Best-effort — never throws.
 * @param {string|null|undefined} relativePath
 */
export const deleteUpload = async (relativePath) => {
  if (!relativePath || /^https?:\/\//i.test(relativePath)) return;
  const abs = path.join(uploadsRoot, relativePath);
  try {
    await fs.rm(abs, { force: true });
  } catch (err) {
    logger.warn(`Failed to delete upload ${relativePath}: ${err.message}`);
  }
};
