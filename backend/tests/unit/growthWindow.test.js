/**
 * Unit tests for the growth chart's date maths. Pure — no database or network.
 *
 * `today` is injected throughout, so these pin the boundaries that are
 * otherwise only reachable on the one day of the year they'd break.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { resolveGrowthWindow, addUtcDays, utcDateKey } =
  await import('../../src/utils/growthWindow.js');
const { GROWTH_RANGE } = await import('../../src/enums/index.js');

const utc = (iso) => new Date(`${iso}T00:00:00.000Z`);

/** The days a window covers, as YYYY-MM-DD keys. */
const daysOf = (range, today) => {
  const { start, days } = resolveGrowthWindow(range, today);
  return Array.from({ length: days }, (_, i) => utcDateKey(addUtcDays(start, i)));
};

/** The labels a window renders on the x axis. */
const labelsOf = (range, today) => {
  const { start, days, label } = resolveGrowthWindow(range, today);
  return Array.from({ length: days }, (_, i) => label(addUtcDays(start, i)));
};

// 2026-07-17 is a Friday.
const FRIDAY = utc('2026-07-17');

test('this-week runs Sunday to Saturday of the current week', () => {
  assert.deepEqual(daysOf(GROWTH_RANGE.THIS_WEEK, FRIDAY), [
    '2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15',
    '2026-07-16', '2026-07-17', '2026-07-18',
  ]);
  assert.deepEqual(labelsOf(GROWTH_RANGE.THIS_WEEK, FRIDAY), [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  ]);
});

test('last-week is the seven days immediately before this week', () => {
  assert.deepEqual(daysOf(GROWTH_RANGE.LAST_WEEK, FRIDAY), [
    '2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08',
    '2026-07-09', '2026-07-10', '2026-07-11',
  ]);
});

test('this-week and last-week neither overlap nor leave a gap', () => {
  const thisWeek = daysOf(GROWTH_RANGE.THIS_WEEK, FRIDAY);
  const lastWeek = daysOf(GROWTH_RANGE.LAST_WEEK, FRIDAY);
  assert.equal(new Set([...thisWeek, ...lastWeek]).size, 14);
  assert.equal(
    utcDateKey(addUtcDays(utc(lastWeek.at(-1)), 1)),
    thisWeek[0],
    'last week should end the day before this week starts',
  );
});

test('on a Sunday, this-week starts that same day', () => {
  const sunday = utc('2026-07-12');
  assert.equal(daysOf(GROWTH_RANGE.THIS_WEEK, sunday)[0], '2026-07-12');
});

test('on a Saturday, this-week still ends that day', () => {
  const saturday = utc('2026-07-18');
  assert.equal(daysOf(GROWTH_RANGE.THIS_WEEK, saturday).at(-1), '2026-07-18');
});

test('a week spanning a month boundary rolls the month over', () => {
  // Wed 2026-04-01: the week began in March.
  assert.deepEqual(daysOf(GROWTH_RANGE.THIS_WEEK, utc('2026-04-01')), [
    '2026-03-29', '2026-03-30', '2026-03-31',
    '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04',
  ]);
});

test('a week spanning a year boundary rolls the year over', () => {
  // Fri 2027-01-01: the week began in 2026.
  assert.equal(daysOf(GROWTH_RANGE.THIS_WEEK, utc('2027-01-01'))[0], '2026-12-27');
});

test('this-month covers the whole calendar month, labelled by day number', () => {
  const days = daysOf(GROWTH_RANGE.THIS_MONTH, FRIDAY);
  assert.equal(days.length, 31, 'July has 31 days');
  assert.equal(days[0], '2026-07-01');
  assert.equal(days.at(-1), '2026-07-31');

  const labels = labelsOf(GROWTH_RANGE.THIS_MONTH, FRIDAY);
  assert.equal(labels[0], '1');
  assert.equal(labels.at(-1), '31');
});

test('this-month handles short months and leap years', () => {
  assert.equal(daysOf(GROWTH_RANGE.THIS_MONTH, utc('2026-02-10')).length, 28);
  assert.equal(daysOf(GROWTH_RANGE.THIS_MONTH, utc('2024-02-10')).length, 29, '2024 is a leap year');
  assert.equal(daysOf(GROWTH_RANGE.THIS_MONTH, utc('2026-06-10')).length, 30);
  assert.equal(daysOf(GROWTH_RANGE.THIS_MONTH, utc('2026-12-10')).at(-1), '2026-12-31');
});

test('an unknown range falls back to this-week rather than throwing', () => {
  assert.deepEqual(daysOf('nonsense', FRIDAY), daysOf(GROWTH_RANGE.THIS_WEEK, FRIDAY));
});
