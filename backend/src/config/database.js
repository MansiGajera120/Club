import mongoose from 'mongoose';
import config from './index.js';
import logger from '../logger/index.js';

/**
 * Establish the MongoDB connection. Mongoose buffers queries until connected,
 * but we connect explicitly on boot so the process fails fast if the DB is
 * unreachable rather than silently queueing operations.
 *
 * @returns {Promise<typeof mongoose>}
 */
export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(config.db.uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !config.isProduction,
  });

  return mongoose;
};

/**
 * Gracefully close the MongoDB connection (used during shutdown).
 * @returns {Promise<void>}
 */
export const disconnectDatabase = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
