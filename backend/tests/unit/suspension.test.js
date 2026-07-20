/**
 * Unit tests for suspension logic — the status patch and the sweep filter.
 * Pure, no database.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { suspensionPatch, expiredSuspensionFilter } =
  await import('../../src/utils/suspension.js');
const { CLUB_STATUS } = await import('../../src/enums/index.js');

test('suspending with a date records it as the auto-lift time', () => {
  const patch = suspensionPatch(CLUB_STATUS.SUSPENDED, '2026-08-01T00:00:00.000Z');
  assert.ok(patch.suspendedUntil instanceof Date);
  assert.equal(patch.suspendedUntil.toISOString(), '2026-08-01T00:00:00.000Z');
});

test('suspending without a date is indefinite (null)', () => {
  assert.deepEqual(suspensionPatch(CLUB_STATUS.SUSPENDED, undefined), { suspendedUntil: null });
  assert.deepEqual(suspensionPatch(CLUB_STATUS.SUSPENDED, null), { suspendedUntil: null });
});

test('every non-suspended status clears the timer', () => {
  for (const status of [
    CLUB_STATUS.APPROVED,
    CLUB_STATUS.REJECTED,
    CLUB_STATUS.HIDDEN,
    CLUB_STATUS.PENDING,
  ]) {
    // Even if a date is somehow passed, a non-suspended status must not keep it.
    assert.deepEqual(
      suspensionPatch(status, '2026-08-01T00:00:00.000Z'),
      { suspendedUntil: null },
      `${status} should clear suspendedUntil`,
    );
  }
});

test('expired filter matches only suspended clubs with an elapsed date', () => {
  const now = new Date('2026-07-20T12:00:00.000Z');
  const filter = expiredSuspensionFilter(now);

  assert.equal(filter.status, CLUB_STATUS.SUSPENDED);
  // Excludes indefinite suspensions (null) and only takes dates at or before now.
  assert.deepEqual(filter.suspendedUntil, { $ne: null, $lte: now });
});

test('a future suspension end date does not satisfy the filter bound', () => {
  const now = new Date('2026-07-20T12:00:00.000Z');
  const { suspendedUntil } = expiredSuspensionFilter(now);
  const future = new Date('2026-07-25T00:00:00.000Z');
  const past = new Date('2026-07-19T00:00:00.000Z');

  // Mirror what Mongo's $lte/$ne would decide, so the intent is pinned in JS.
  const matches = (value) =>
    value !== null && value <= suspendedUntil.$lte;

  assert.equal(matches(future), false, 'not yet due');
  assert.equal(matches(past), true, 'overdue');
  assert.equal(matches(null), false, 'indefinite is never swept');
});
