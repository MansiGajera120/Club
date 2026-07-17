import { GROWTH_RANGE } from '../enums/index.js';

/**
 * Date maths for the admin dashboard's user-growth chart.
 *
 * Everything here is UTC — day boundaries, bucket keys and labels alike — to
 * stay in step with Mongo's `$dateToString`, which is UTC unless told otherwise.
 * On a UTC server (the usual deployment) this is simply local time.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

// Fixed labels rather than toLocaleDateString, which would follow the server's
// locale and timezone and drift out of step with the UTC buckets.
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const startOfUtcToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const addUtcDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

export const utcDateKey = (date) => date.toISOString().slice(0, 10);

/**
 * Resolve a range key into the exact run of days the chart should plot.
 *
 * Weeks are calendar weeks (Sunday-to-Saturday), not rolling seven-day windows:
 * two rolling windows would carry the same weekday labels, so switching between
 * them would look like the filter had done nothing.
 *
 * `today` is injectable so the boundaries can be tested without the clock.
 */
export const resolveGrowthWindow = (range, today = startOfUtcToday()) => {
  if (range === GROWTH_RANGE.THIS_MONTH) {
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    // Day 0 of next month is the last day of this one.
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return {
      start: new Date(Date.UTC(year, month, 1)),
      days: daysInMonth,
      label: (date) => String(date.getUTCDate()),
    };
  }

  const thisSunday = addUtcDays(today, -today.getUTCDay());
  return {
    start: range === GROWTH_RANGE.LAST_WEEK ? addUtcDays(thisSunday, -7) : thisSunday,
    days: 7,
    label: (date) => WEEKDAY_LABELS[date.getUTCDay()],
  };
};
