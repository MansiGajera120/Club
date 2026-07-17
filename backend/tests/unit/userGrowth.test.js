/**
 * Unit tests for how getUserGrowth assembles a series from aggregation output.
 *
 * The Mongo round-trip is stubbed — this covers the assembly, which is where
 * the fiddly parts are: zero-filling days nobody signed up, leaving future days
 * null, and matching buckets to the right day.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/unused';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefgh';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefgh';
process.env.APP_URL = 'http://localhost:5000';

const { User } = await import('../../src/models/user.model.js');
const { getUserGrowth } = await import('../../src/services/admin.service.js');
const { resolveGrowthWindow, utcDateKey, addUtcDays, startOfUtcToday } =
  await import('../../src/utils/growthWindow.js');
const { GROWTH_RANGE, ROLES } = await import('../../src/enums/index.js');

const realAggregate = User.aggregate;

/** Serve canned day-buckets per role, the shape $group returns. */
const stubAggregate = (bucketsByRole) => {
  User.aggregate = async (pipeline) => {
    const { role } = pipeline[0].$match;
    return bucketsByRole[role] ?? [];
  };
};

test.afterEach(() => {
  User.aggregate = realAggregate;
});

test('fills every day of the window, zeroing days with no signups', async () => {
  const { start } = resolveGrowthWindow(GROWTH_RANGE.LAST_WEEK);
  // Last week is wholly in the past, so nothing is nulled for being future.
  stubAggregate({
    [ROLES.PARENT]: [{ _id: utcDateKey(addUtcDays(start, 2)), count: 4 }],
  });

  const growth = await getUserGrowth({ range: GROWTH_RANGE.LAST_WEEK });

  assert.equal(growth.points.length, 7);
  assert.deepEqual(
    growth.points.map((p) => p.name),
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  );
  assert.equal(growth.points[2].Parents, 4, 'the day with a bucket carries its count');
  assert.equal(growth.points[0].Parents, 0, 'a day with no bucket is zero, not undefined');
  assert.equal(growth.points[2].Admins, 0, 'a role with no buckets at all is zero');
});

test('keeps the three roles separate', async () => {
  const { start } = resolveGrowthWindow(GROWTH_RANGE.LAST_WEEK);
  const day = utcDateKey(addUtcDays(start, 1));
  stubAggregate({
    [ROLES.PARENT]: [{ _id: day, count: 1 }],
    [ROLES.CLUB_OWNER]: [{ _id: day, count: 2 }],
    [ROLES.ADMIN]: [{ _id: day, count: 3 }],
  });

  const { points } = await getUserGrowth({ range: GROWTH_RANGE.LAST_WEEK });

  assert.equal(points[1].Parents, 1);
  assert.equal(points[1].ClubOwners, 2);
  assert.equal(points[1].Admins, 3);
});

test('days after today are null, not zero', async () => {
  stubAggregate({});
  const today = startOfUtcToday();

  const { points } = await getUserGrowth({ range: GROWTH_RANGE.THIS_WEEK });
  const { start } = resolveGrowthWindow(GROWTH_RANGE.THIS_WEEK);

  points.forEach((point, i) => {
    const isFuture = addUtcDays(start, i) > today;
    if (isFuture) {
      assert.equal(point.Parents, null, `${point.date} is in the future — should be a gap`);
    } else {
      assert.equal(point.Parents, 0, `${point.date} has happened — should be a real zero`);
    }
  });
});

test('reports the window it actually resolved, for the UI to label', async () => {
  stubAggregate({});

  const growth = await getUserGrowth({ range: GROWTH_RANGE.THIS_MONTH });

  assert.equal(growth.range, GROWTH_RANGE.THIS_MONTH);
  assert.equal(growth.start, growth.points[0].date);
  assert.equal(growth.end, growth.points.at(-1).date);
});

test('defaults to this-week when no range is given', async () => {
  stubAggregate({});

  const growth = await getUserGrowth();

  assert.equal(growth.range, GROWTH_RANGE.THIS_WEEK);
  assert.equal(growth.points.length, 7);
});

test('queries only within the window', async () => {
  const seen = [];
  User.aggregate = async (pipeline) => {
    seen.push(pipeline[0].$match.createdAt);
    return [];
  };

  await getUserGrowth({ range: GROWTH_RANGE.LAST_WEEK });
  const { start, days } = resolveGrowthWindow(GROWTH_RANGE.LAST_WEEK);

  assert.equal(seen.length, 3, 'one aggregation per role');
  for (const range of seen) {
    assert.equal(range.$gte.getTime(), start.getTime());
    assert.equal(range.$lt.getTime(), addUtcDays(start, days).getTime());
  }
});
