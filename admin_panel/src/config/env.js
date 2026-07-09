/**
 * Centralized access to environment variables. Nothing else should read from
 * `import.meta.env` directly, so misconfiguration surfaces in one place.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'Sports Club Admin',
  isProduction: import.meta.env.PROD,
};
