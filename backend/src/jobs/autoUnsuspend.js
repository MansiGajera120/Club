import { Club } from '../models/club.model.js';
import { CLUB_STATUS } from '../enums/index.js';
import { expiredSuspensionFilter } from '../utils/suspension.js';
import config from '../config/index.js';
import logger from '../logger/index.js';

/**
 * Lift suspensions whose end date has passed.
 *
 * One sweep: finds every club still suspended past its `suspendedUntil` and
 * flips it back to approved, clearing the timer. Returns how many it changed,
 * so it's directly testable. `now` is injectable for the same reason.
 *
 * @param {Date} [now]
 * @returns {Promise<number>} clubs reactivated
 */
export const runAutoUnsuspend = async (now = new Date()) => {
  const result = await Club.updateMany(expiredSuspensionFilter(now), {
    $set: { status: CLUB_STATUS.APPROVED, suspendedUntil: null },
  });
  const count = result.modifiedCount ?? 0;
  if (count > 0) {
    logger.info(`Auto-unsuspend: reactivated ${count} club(s) past their suspension date`);
  }
  return count;
};

/**
 * Start the recurring auto-unsuspend sweep.
 *
 * Runs once immediately, then on an interval. The immediate run is the important
 * one on free hosts that sleep: an instance that was down when a suspension
 * lapsed catches up the moment it boots, rather than waiting a full interval.
 * The interval is `.unref()`'d so it can't hold the process open during
 * shutdown.
 *
 * @returns {NodeJS.Timeout} the interval handle
 */
export const startAutoUnsuspend = () => {
  const { intervalMs } = config.autoUnsuspend;

  const sweep = () =>
    runAutoUnsuspend().catch((err) =>
      logger.error(`Auto-unsuspend sweep failed: ${err.stack || err.message}`)
    );

  sweep();
  const handle = setInterval(sweep, intervalMs);
  handle.unref?.();
  logger.info(
    `⏰ Auto-unsuspend sweep every ${Math.round(intervalMs / 60000)} min`
  );
  return handle;
};

export default startAutoUnsuspend;
