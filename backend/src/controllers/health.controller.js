import mongoose from 'mongoose';
import { ApiResponse } from '../responses/ApiResponse.js';
import { MESSAGES } from '../constants/messages.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import config from '../config/index.js';

const MONGO_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/**
 * Liveness/readiness probe. Reports uptime and MongoDB connectivity.
 */
export const getHealth = asyncHandler(async (_req, res) => {
  const dbState = MONGO_STATES[mongoose.connection.readyState] || 'unknown';

  return ApiResponse.ok(
    res,
    {
      status: 'ok',
      environment: config.env,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: dbState,
    },
    MESSAGES.HEALTH.OK
  );
});

export default getHealth;
