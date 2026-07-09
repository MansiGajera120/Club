import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the workspace `uploads/` directory (served statically). */
export const uploadsRoot = path.resolve(__dirname, '../../../uploads');

/** Upload sub-folders by media kind. */
export const UPLOAD_FOLDERS = Object.freeze({
  logos: 'logos',
  gallery: 'gallery',
  events: 'events',
  avatars: 'avatars',
});
