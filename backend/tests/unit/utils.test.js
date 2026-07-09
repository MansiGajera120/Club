/**
 * Unit tests for pure utilities. No database or network required — these always
 * run with `node --test`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

// Set env before importing modules that read config (jwt, url).
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/unused';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefgh';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefgh';
process.env.APP_URL = 'http://localhost:5000';

const { durationToMs } = await import('../../src/utils/duration.js');
const { getPagination, buildPaginationMeta } =
  await import('../../src/utils/pagination.js');
const { generateRawToken, hashToken } = await import('../../src/utils/crypto.js');
const { hashPassword, comparePassword } = await import('../../src/utils/password.js');
const { signAccessToken, verifyAccessToken } = await import('../../src/utils/jwt.js');
const { buildUploadUrl } = await import('../../src/utils/url.js');

test('durationToMs parses units', () => {
  assert.equal(durationToMs('15m'), 15 * 60 * 1000);
  assert.equal(durationToMs('30d'), 30 * 24 * 60 * 60 * 1000);
  assert.equal(durationToMs('2h'), 2 * 60 * 60 * 1000);
  assert.equal(durationToMs('45s'), 45 * 1000);
});

test('durationToMs rejects invalid input', () => {
  assert.throws(() => durationToMs('nonsense'));
  assert.throws(() => durationToMs('10x'));
});

test('getPagination applies defaults and bounds', () => {
  assert.deepEqual(getPagination({}), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(getPagination({ page: '3', limit: '10' }), {
    page: 3,
    limit: 10,
    skip: 20,
  });
  // clamps below/above range
  assert.equal(getPagination({ page: '0' }).page, 1);
  assert.equal(getPagination({ limit: '9999' }).limit, 100);
});

test('buildPaginationMeta computes totalPages', () => {
  assert.deepEqual(buildPaginationMeta({ total: 45, page: 2, limit: 20 }), {
    page: 2,
    limit: 20,
    total: 45,
    totalPages: 3,
  });
  assert.equal(buildPaginationMeta({ total: 0, page: 1, limit: 20 }).totalPages, 1);
});

test('hashToken is deterministic and collision-distinct', () => {
  assert.equal(hashToken('abc'), hashToken('abc'));
  assert.notEqual(hashToken('abc'), hashToken('abd'));
  assert.equal(generateRawToken(16).length, 32); // hex = 2 chars/byte
});

test('password hashing round-trips', async () => {
  const hash = await hashPassword('Secret123');
  assert.notEqual(hash, 'Secret123');
  assert.equal(await comparePassword('Secret123', hash), true);
  assert.equal(await comparePassword('wrong', hash), false);
});

test('jwt sign/verify round-trips the payload', () => {
  const token = signAccessToken({ sub: 'user1', role: 'parent' });
  const decoded = verifyAccessToken(token);
  assert.equal(decoded.sub, 'user1');
  assert.equal(decoded.role, 'parent');
});

test('buildUploadUrl resolves relative paths and passes through absolute', () => {
  assert.equal(
    buildUploadUrl('logos/a.webp'),
    'http://localhost:5000/uploads/logos/a.webp'
  );
  assert.equal(buildUploadUrl('https://cdn.x/y.png'), 'https://cdn.x/y.png');
  assert.equal(buildUploadUrl(null), null);
});
