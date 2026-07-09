import { createApp } from './app.js';
import config from './config/index.js';
import logger from './logger/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

/**
 * Application entry point. Connects to MongoDB, starts the HTTP server, and
 * wires up graceful shutdown + last-resort crash handlers.
 */
const start = async () => {
  try {
    await connectDatabase();

    const app = createApp();
    const server = app.listen(config.server.port, () => {
      logger.info(
        `🚀 Server running in ${config.env} mode on port ${config.server.port}`
      );
      logger.info(`   Health: ${config.server.appUrl}${config.server.apiPrefix}/health`);
    });

    /**
     * Close the HTTP server and DB connection, then exit.
     * @param {string} signal
     */
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Shutdown complete');
        process.exit(0);
      });

      // Force-exit if graceful shutdown hangs.
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    };

    ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));

    // Crash on truly unexpected errors so the process manager can restart us.
    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      throw reason instanceof Error ? reason : new Error(String(reason));
    });
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.stack || err.message}`);
      process.exit(1);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.stack || err.message}`);
    process.exit(1);
  }
};

start();
