import config from '../config/index.js';
import logger from '../logger/index.js';

/**
 * Keep-alive self-ping.
 *
 * Free hosting tiers (e.g. Render's free web services) spin the instance down
 * after a period of inactivity, so the next request pays a slow cold start.
 * Pinging our own public health endpoint on an interval produces inbound
 * traffic that resets that idle timer and keeps the service warm.
 *
 * Only runs in production, only when enabled, and only when a real (non-local)
 * public URL is configured — so it never fires in dev/test or against
 * localhost. The interval is `.unref()`'d so it can't keep the process alive
 * during shutdown.
 *
 * @returns {NodeJS.Timeout | null} the interval handle (or null if not started)
 */
export const startKeepAlive = () => {
  const { enabled, intervalMs } = config.keepAlive;
  const baseUrl = config.server.appUrl;
  const url = `${baseUrl}${config.server.apiPrefix}/health`;

  if (!enabled) return null;
  if (!config.isProduction) {
    logger.debug('Keep-alive disabled outside production');
    return null;
  }
  if (/localhost|127\.0\.0\.1/.test(baseUrl)) {
    logger.warn(
      'Keep-alive skipped: APP_URL points at localhost. Set APP_URL to the public URL to enable it.'
    );
    return null;
  }

  const ping = async () => {
    try {
      const res = await fetch(url, { method: 'GET' });
      logger.debug(`Keep-alive ping ${url} → ${res.status}`);
    } catch (err) {
      logger.warn(`Keep-alive ping failed: ${err.message}`);
    }
  };

  const handle = setInterval(ping, intervalMs);
  handle.unref?.();
  logger.info(
    `⏰ Keep-alive enabled — pinging ${url} every ${Math.round(intervalMs / 60000)} min`
  );
  return handle;
};

export default startKeepAlive;
