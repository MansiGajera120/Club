/**
 * End-to-end auth flow test. Boots the real Express app against a MongoDB
 * instance and exercises the HTTP endpoints exactly as a client would.
 *
 * This test is OPT-IN: it runs only when `TEST_MONGO_URI` points at a reachable
 * MongoDB (local or a disposable test database), and is skipped otherwise so the
 * default `node --test` run never depends on a database being present.
 *
 *   TEST_MONGO_URI=mongodb://127.0.0.1:27017/club_test node --test
 *
 * Env is set BEFORE dynamically importing app modules so config validation
 * passes with the test database URI.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const TEST_MONGO_URI = process.env.TEST_MONGO_URI;
const dbConfigured = Boolean(TEST_MONGO_URI);

let server;
let baseUrl;
let mongoose;
let User;
let hashToken;

/** Minimal JSON HTTP helper. */
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

before(async () => {
  if (!dbConfigured) return;

  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  process.env.MONGO_URI = TEST_MONGO_URI;
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefgh';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefgh';

  ({ default: mongoose } = await import('mongoose'));
  const { connectDatabase } = await import('../../src/config/database.js');
  await connectDatabase();

  ({ User } = await import('../../src/models/user.model.js'));
  ({ hashToken } = await import('../../src/utils/crypto.js'));

  // Start from a clean slate.
  await mongoose.connection.db.dropDatabase();

  const { createApp } = await import('../../src/app.js');
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(async () => {
  if (server) await new Promise((r) => server.close(r));
  if (mongoose) await mongoose.disconnect();
});

const parent = {
  name: 'Test Parent',
  email: 'parent@example.com',
  password: 'Secret123',
};

const opts = { skip: dbConfigured ? false : 'TEST_MONGO_URI not set' };

test('signup creates an unverified account and returns tokens', opts, async () => {
  const res = await api('POST', '/auth/signup', { body: parent });
  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, parent.email);
  assert.equal(res.body.data.user.role, 'parent');
  assert.equal(res.body.data.user.isEmailVerified, false);
  assert.ok(res.body.data.accessToken);
  assert.ok(res.body.data.refreshToken);
});

test('duplicate signup is rejected with 409', opts, async () => {
  const res = await api('POST', '/auth/signup', { body: parent });
  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
});

test('login with wrong password returns 401', opts, async () => {
  const res = await api('POST', '/auth/login', {
    body: { email: parent.email, password: 'WrongPass1' },
  });
  assert.equal(res.status, 401);
});

test('login succeeds and /me returns the user', opts, async () => {
  const login = await api('POST', '/auth/login', {
    body: { email: parent.email, password: parent.password },
  });
  assert.equal(login.status, 200);
  const { accessToken } = login.body.data;

  const me = await api('GET', '/auth/me', { token: accessToken });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, parent.email);
});

test('refresh rotates tokens and invalidates the old one', opts, async () => {
  const login = await api('POST', '/auth/login', {
    body: { email: parent.email, password: parent.password },
  });
  const { refreshToken } = login.body.data;

  const refreshed = await api('POST', '/auth/refresh', { body: { refreshToken } });
  assert.equal(refreshed.status, 200);
  assert.notEqual(refreshed.body.data.refreshToken, refreshToken);

  const reuse = await api('POST', '/auth/refresh', { body: { refreshToken } });
  assert.equal(reuse.status, 401);
});

test('email verification via a valid token flips the flag', opts, async () => {
  const raw = 'verify-token-123';
  await User.updateOne(
    { email: parent.email },
    {
      emailVerificationToken: hashToken(raw),
      emailVerificationExpires: new Date(Date.now() + 60_000),
    }
  );

  const res = await api('POST', '/auth/verify-email', { body: { token: raw } });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.isEmailVerified, true);
});

test('reset-password sets a new password and lets the user log in', opts, async () => {
  const raw = 'reset-token-123';
  await User.updateOne(
    { email: parent.email },
    {
      passwordResetToken: hashToken(raw),
      passwordResetExpires: new Date(Date.now() + 60_000),
    }
  );

  const reset = await api('POST', '/auth/reset-password', {
    body: { token: raw, password: 'BrandNew123' },
  });
  assert.equal(reset.status, 200);

  const login = await api('POST', '/auth/login', {
    body: { email: parent.email, password: 'BrandNew123' },
  });
  assert.equal(login.status, 200);
});
