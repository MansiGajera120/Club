import { API_BASE_URLS } from './apiUrls.js';

/**
 * Centralized access to environment variables. Nothing else should read from
 * `import.meta.env` directly, so misconfiguration surfaces in one place.
 *
 * - `npm run dev` → local backend (`localhost:5000`)
 * - `npm run build` / Vercel → Render backend (`club-1r4i.onrender.com`)
 *
 * Override any time with `VITE_API_URL` in `.env` or `.env.local`.
 */
function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.PROD
    ? API_BASE_URLS.production
    : API_BASE_URLS.local;
}

export const env = {
  apiUrl: resolveApiUrl(),
  appName: import.meta.env.VITE_APP_NAME ?? 'Sports Club Admin',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
