import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

import config from '../config/index.js';
import { uploadsRoot } from '../utils/paths.js';
import logger from '../logger/index.js';

// Configure the Cloudinary SDK once, if credentials are present.
if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

/** Root folder for all of this app's Cloudinary assets. */
const CLOUD_ROOT = 'sportsclub';

/** Upload an optimized buffer to Cloudinary; resolves to the asset result. */
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUD_ROOT}/${folder}`,
        resource_type: 'image',
        format: 'webp',
        public_id: crypto.randomUUID(),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

/**
 * Derive a Cloudinary public_id (incl. folder, without extension) from a
 * secure URL, e.g.
 *   https://res.cloudinary.com/<c>/image/upload/v123/sportsclub/logos/uuid.webp
 *   → sportsclub/logos/uuid
 */
const cloudinaryPublicId = (url) => {
  const match = String(url).match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
};

const isCloudinaryUrl = (value) =>
  typeof value === 'string' && value.includes('res.cloudinary.com');

/**
 * Optimize an uploaded image buffer with Sharp (WebP) and persist it.
 *
 * - When Cloudinary is configured (production / any host with an ephemeral
 *   disk), the image is uploaded there and its absolute `secure_url` is
 *   returned and stored in the DB.
 * - Otherwise it is written to the local uploads dir and a relative path
 *   (e.g. `logos/uuid.webp`) is returned — the DTO layer builds an absolute URL.
 *
 * The URL builder passes absolute URLs through unchanged, so both storage
 * modes work everywhere downstream without any special-casing.
 *
 * @param {Buffer} buffer Raw image bytes (from multer memory storage)
 * @param {{ folder: string, width?: number, height?: number, quality?: number }} options
 * @returns {Promise<string>} Cloudinary URL or relative upload path
 */
export const processImage = async (
  buffer,
  { folder, width = 1280, height, quality = 80 }
) => {
  const optimized = await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  if (config.cloudinary.enabled) {
    const result = await uploadToCloudinary(optimized, folder);
    return result.secure_url;
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const dir = path.join(uploadsRoot, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), optimized);
  return `${folder}/${filename}`;
};

/**
 * Delete a previously stored image. Best-effort — never throws.
 * Handles both Cloudinary assets (by public_id) and local files (by path).
 * External non-Cloudinary URLs (e.g. social avatars) are left untouched.
 *
 * @param {string|null|undefined} value Cloudinary URL or relative upload path
 */
export const deleteUpload = async (value) => {
  if (!value) return;

  if (/^https?:\/\//i.test(value)) {
    if (isCloudinaryUrl(value)) {
      const publicId = cloudinaryPublicId(value);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch (err) {
          logger.warn(`Failed to delete Cloudinary asset ${publicId}: ${err.message}`);
        }
      }
    }
    return; // other external URLs: nothing to delete
  }

  const abs = path.join(uploadsRoot, value);
  try {
    await fs.rm(abs, { force: true });
  } catch (err) {
    logger.warn(`Failed to delete upload ${value}: ${err.message}`);
  }
};
