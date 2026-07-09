import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import config from '../config/index.js';
import { httpLogStream } from '../logger/index.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { notFoundHandler } from '../middlewares/notFound.middleware.js';
import { errorHandler } from '../middlewares/error.middleware.js';
import { ApiResponse } from '../responses/ApiResponse.js';
import apiRoutes from '../routes/index.js';
import { uploadsRoot } from '../utils/paths.js';

/**
 * Configure an Express application with security, parsing, logging, routing and
 * error-handling middleware. Order matters and is enforced here.
 *
 * @param {import('express').Express} app
 * @returns {import('express').Express}
 */
export const configureExpress = (app) => {
  // Trust the first proxy (needed for correct client IPs behind Nginx/Load Balancers).
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ---------- Security ----------
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Build CORS matchers. Entries in CORS_ORIGINS may be exact origins
  // (`https://app.example.com`) or wildcard patterns (`https://*.vercel.app`)
  // so preview/branch deployments are allowed without redeploying the backend.
  const originMatchers = config.server.corsOrigins.map((pattern) => {
    if (pattern.includes('*')) {
      const escaped = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(`^${escaped}$`);
    }
    return pattern;
  });
  const isAllowedOrigin = (origin) =>
    originMatchers.some((m) => (m instanceof RegExp ? m.test(origin) : m === origin));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser clients (mobile apps, curl) that send no origin.
        if (!origin || isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );

  // ---------- Parsing ----------
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // ---------- Performance ----------
  app.use(compression());

  // ---------- Logging ----------
  app.use(morgan(config.isProduction ? 'combined' : 'dev', { stream: httpLogStream }));

  // ---------- Rate limiting ----------
  app.use(config.server.apiPrefix, apiRateLimiter);

  // ---------- Static uploads ----------
  app.use('/uploads', express.static(uploadsRoot));

  // ---------- Root ----------
  app.get('/', (_req, res) =>
    ApiResponse.ok(res, { name: 'Sports Club API', version: 'v1' }, 'Welcome')
  );

  // ---------- API routes ----------
  app.use(config.server.apiPrefix, apiRoutes);

  // ---------- 404 + global error handler (must be last) ----------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default configureExpress;
