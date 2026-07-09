import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');
const monorepoUploads = path.resolve(backendRoot, '../uploads');

/**
 * Absolute path to the uploads directory (served statically).
 * - `UPLOADS_DIR` env var wins when set.
 * - Monorepo dev uses workspace `uploads/` when it exists.
 * - Standalone deploys (e.g. Render with rootDir `backend`) use `backend/uploads/`.
 */
export const uploadsRoot = config.uploads.dir
  ? path.resolve(config.uploads.dir)
  : fs.existsSync(monorepoUploads)
    ? monorepoUploads
    : path.join(backendRoot, 'uploads');

/** Upload sub-folders by media kind. */
export const UPLOAD_FOLDERS = Object.freeze({
  logos: 'logos',
  gallery: 'gallery',
  events: 'events',
  avatars: 'avatars',
});

/**
 * Create the uploads root and media sub-folders on boot (idempotent).
 * @returns {Promise<void>}
 */
export const ensureUploadDirs = async () => {
  const fsPromises = fs.promises;
  await fsPromises.mkdir(uploadsRoot, { recursive: true });
  await Promise.all(
    Object.values(UPLOAD_FOLDERS).map((folder) =>
      fsPromises.mkdir(path.join(uploadsRoot, folder), { recursive: true })
    )
  );
};
