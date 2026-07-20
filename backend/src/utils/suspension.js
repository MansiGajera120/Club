import { CLUB_STATUS } from '../enums/index.js';

/**
 * The suspension-field patch for a status change.
 *
 * Suspending records the auto-lift date (or null for an indefinite suspension);
 * moving to any other status clears it, so a re-approved or hidden club never
 * carries a stale timer that a later sweep could act on.
 *
 * @param {string} status              the status being moved to
 * @param {string|Date|null} [until]   the reactivation date, when suspending
 * @returns {{ suspendedUntil: Date|null }}
 */
export const suspensionPatch = (status, until) => {
  if (status === CLUB_STATUS.SUSPENDED) {
    return { suspendedUntil: until ? new Date(until) : null };
  }
  return { suspendedUntil: null };
};

/**
 * Mongo filter matching suspensions whose end date has passed.
 *
 * Indefinite suspensions (`suspendedUntil: null`) are excluded — they only lift
 * when an admin does it by hand.
 *
 * @param {Date} [now]
 */
export const expiredSuspensionFilter = (now = new Date()) => ({
  status: CLUB_STATUS.SUSPENDED,
  suspendedUntil: { $ne: null, $lte: now },
});
