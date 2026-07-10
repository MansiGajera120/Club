import dotenv from 'dotenv';
import Joi from 'joi';

// Load variables from `.env` into process.env before anything else reads them.
dotenv.config();

/**
 * Schema describing every environment variable the application depends on.
 * Validating on boot means the process fails fast with a clear message instead
 * of crashing later with an undefined value deep inside a request.
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(5000),
  API_PREFIX: Joi.string().default('/api/v1'),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  APP_URL: Joi.string().uri().default('http://localhost:5000'),
  CLIENT_URL: Joi.string().uri().default('http://localhost:5173'),

  MONGO_URI: Joi.string().required().messages({
    'any.required': 'MONGO_URI is required to connect to MongoDB',
  }),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // When true, unverified local accounts may authenticate but cannot perform
  // state-changing actions (create club/event, favorite, edit profile).
  REQUIRE_EMAIL_VERIFICATION: Joi.boolean().default(true),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().default(100),

  // Self-ping keep-alive to stop free hosts (e.g. Render) idling to sleep.
  // Enabled by default in production; pings APP_URL health every interval.
  KEEP_ALIVE_ENABLED: Joi.boolean().default(true),
  KEEP_ALIVE_INTERVAL_MS: Joi.number()
    .min(60000)
    .default(10 * 60 * 1000),

  MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024),
  // Optional absolute/relative path override. When empty, the app auto-picks
  // monorepo `uploads/` locally or `backend/uploads/` on standalone hosts (Render).
  UPLOADS_DIR: Joi.string().allow('').default(''),

  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  EMAIL_FROM_NAME: Joi.string().default('Sports Club Platform'),
  EMAIL_FROM_ADDRESS: Joi.string().default('no-reply@sportsclub.app'),

  // Accept one or more accepted audiences (comma-separated). `GOOGLE_CLIENT_IDS`
  // is preferred; `GOOGLE_CLIENT_ID` (singular) is kept for backward compat.
  GOOGLE_CLIENT_IDS: Joi.string().allow('').default(''),
  GOOGLE_CLIENT_ID: Joi.string().allow('').default(''),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').default(''),
  APPLE_CLIENT_ID: Joi.string().allow('').default(''),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
})
  .unknown(true)
  .prefs({ abortEarly: false });

const { value: env, error } = envSchema.validate(process.env);

if (error) {
  const details = error.details.map((d) => `  - ${d.message}`).join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n❌ Invalid environment configuration:\n${details}\n`);
  process.exit(1);
}

/**
 * Strongly-shaped, immutable configuration object consumed throughout the app.
 * Nothing else should read from process.env directly.
 */
const config = Object.freeze({
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',

  server: {
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
    appUrl: env.APP_URL,
    clientUrl: env.CLIENT_URL,
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  db: {
    uri: env.MONGO_URI,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  auth: {
    requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },

  keepAlive: {
    enabled: env.KEEP_ALIVE_ENABLED,
    intervalMs: env.KEEP_ALIVE_INTERVAL_MS,
  },

  uploads: {
    maxFileSize: env.MAX_FILE_SIZE,
    dir: env.UPLOADS_DIR.trim(),
  },

  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    fromName: env.EMAIL_FROM_NAME,
    fromAddress: env.EMAIL_FROM_ADDRESS,
  },

  google: {
    // All OAuth client IDs accepted as valid ID-token audiences (Android, iOS,
    // Web/server). A Google ID token minted for any of these will verify.
    clientIds: [env.GOOGLE_CLIENT_IDS, env.GOOGLE_CLIENT_ID]
      .join(',')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },

  apple: {
    clientId: env.APPLE_CLIENT_ID,
  },

  logLevel: env.LOG_LEVEL,
});

export default config;
