/**
 * Unit tests for the auto-unsuspend sweep. The Mongo write is stubbed — this
 * covers what the job asks the database to do, and what it reports back.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/unused';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefgh';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefgh';
process.env.APP_URL = 'http://localhost:5000';

const { Club: ClubModel } = await import('../../src/models/club.model.js');
const { runAutoUnsuspend } = await import('../../src/jobs/autoUnsuspend.js');
const { CLUB_STATUS } = await import('../../src/enums/index.js');

const realUpdateMany = ClubModel.updateMany;
test.afterEach(() => {
  ClubModel.updateMany = realUpdateMany;
});

test('sweeps only suspended clubs whose end date has passed, restoring to approved', async () => {
  const now = new Date('2026-07-20T12:00:00.000Z');
  let seenFilter;
  let seenUpdate;
  ClubModel.updateMany = async (filter, update) => {
    seenFilter = filter;
    seenUpdate = update;
    return { modifiedCount: 2 };
  };

  const count = await runAutoUnsuspend(now);

  assert.equal(count, 2);
  assert.equal(seenFilter.status, CLUB_STATUS.SUSPENDED);
  assert.deepEqual(seenFilter.suspendedUntil, { $ne: null, $lte: now });
  assert.equal(seenUpdate.$set.status, CLUB_STATUS.APPROVED);
  assert.equal(seenUpdate.$set.suspendedUntil, null, 'timer is cleared on lift');
});

test('returns 0 when nothing is due', async () => {
  ClubModel.updateMany = async () => ({ modifiedCount: 0 });
  assert.equal(await runAutoUnsuspend(new Date()), 0);
});

test('treats a missing modifiedCount as 0 rather than NaN', async () => {
  ClubModel.updateMany = async () => ({});
  assert.equal(await runAutoUnsuspend(new Date()), 0);
});
