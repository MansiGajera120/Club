/**
 * End-to-end lifecycle test across roles: club owner registers a club, admin
 * approves it, a parent browses + favorites it, and events are created/listed.
 *
 * OPT-IN: runs only when `TEST_MONGO_URI` points at a reachable MongoDB.
 *
 *   TEST_MONGO_URI=mongodb://127.0.0.1:27017/club_test node --test
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const TEST_MONGO_URI = process.env.TEST_MONGO_URI;
const opts = { skip: TEST_MONGO_URI ? false : 'TEST_MONGO_URI not set' };

let server;
let baseUrl;
let mongoose;

function api(method, path, { body, token } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      `${baseUrl}${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () =>
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null })
        );
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const tokens = {};
let clubId;

before(async () => {
  if (!TEST_MONGO_URI) return;

  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  process.env.MONGO_URI = TEST_MONGO_URI;
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefgh';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefgh';

  ({ default: mongoose } = await import('mongoose'));
  const { connectDatabase } = await import('../../src/config/database.js');
  await connectDatabase();
  await mongoose.connection.db.dropDatabase();

  const { User } = await import('../../src/models/user.model.js');
  await User.create([
    {
      name: 'Owner',
      email: 'owner@ex.com',
      password: 'Secret123',
      role: 'club_owner',
      isEmailVerified: true,
    },
    {
      name: 'Parent',
      email: 'parent@ex.com',
      password: 'Secret123',
      role: 'parent',
      isEmailVerified: true,
    },
    {
      name: 'Admin',
      email: 'admin@ex.com',
      password: 'Secret123',
      role: 'admin',
      isEmailVerified: true,
    },
  ]);

  const { createApp } = await import('../../src/app.js');
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;

  for (const [key, email] of [
    ['owner', 'owner@ex.com'],
    ['parent', 'parent@ex.com'],
    ['admin', 'admin@ex.com'],
  ]) {
    const res = await api('POST', '/auth/login', {
      body: { email, password: 'Secret123' },
    });
    tokens[key] = res.body.data.accessToken;
  }
});

after(async () => {
  if (server) await new Promise((r) => server.close(r));
  if (mongoose) await mongoose.disconnect();
});

test('owner registers a club (pending)', opts, async () => {
  const res = await api('POST', '/clubs', {
    token: tokens.owner,
    body: { name: 'Riverside FC', city: 'Austin', gender: 'mixed', price: 50 },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.club.status, 'pending');
  clubId = res.body.data.club.id;
});

test('pending club is hidden from public browse', opts, async () => {
  const res = await api('GET', '/clubs');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.clubs.length, 0);
});

test('a non-owner cannot edit the club (403)', opts, async () => {
  const res = await api('PATCH', `/clubs/${clubId}`, {
    token: tokens.parent,
    body: { name: 'Hacked' },
  });
  // Parent lacks the club_owner/admin role → 403.
  assert.equal(res.status, 403);
});

test('admin approves the club', opts, async () => {
  const res = await api('PATCH', `/admin/clubs/${clubId}/status`, {
    token: tokens.admin,
    body: { status: 'approved' },
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.club.status, 'approved');
});

test('approved club now appears in public browse', opts, async () => {
  const res = await api('GET', '/clubs?city=Austin');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.clubs.length, 1);
});

test('parent favorites the club and sees it in favorites', opts, async () => {
  const add = await api('POST', `/favorites/${clubId}`, { token: tokens.parent });
  assert.equal(add.status, 200);

  const list = await api('GET', '/favorites', { token: tokens.parent });
  assert.equal(list.body.data.clubs.length, 1);
  assert.equal(list.body.data.clubs[0].isFavorite, true);

  const detail = await api('GET', `/clubs/${clubId}`, { token: tokens.parent });
  assert.equal(detail.body.data.club.isFavorite, true);
  assert.equal(detail.body.data.club.favoritesCount, 1);
});

test('owner creates an event, listed for the club', opts, async () => {
  const create = await api('POST', '/events', {
    token: tokens.owner,
    body: {
      club: clubId,
      title: 'Open Trials',
      startDate: '2027-01-01T10:00:00.000Z',
    },
  });
  assert.equal(create.status, 201);

  const list = await api('GET', `/events?club=${clubId}`);
  assert.equal(list.status, 200);
  assert.equal(list.body.data.events.length, 1);
  assert.equal(list.body.data.events[0].title, 'Open Trials');
});

test('admin dashboard reflects the created data', opts, async () => {
  const res = await api('GET', '/admin/stats', { token: tokens.admin });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.stats.clubs.approved, 1);
  assert.equal(res.body.data.stats.events.total, 1);
  assert.equal(res.body.data.stats.users.total, 3);
});
