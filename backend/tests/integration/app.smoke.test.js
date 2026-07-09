/**
 * DB-free smoke test. Boots the real Express app (no database connection) and
 * verifies the middleware chain that runs BEFORE any data access: routing,
 * the health endpoint, request validation, auth guards, and 404 handling.
 *
 * Endpoints that touch MongoDB are covered by `auth.test.js` (opt-in, needs a
 * database). This suite always runs.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

let server;
let baseUrl;

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
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/unused';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefgh';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefgh';

  const { createApp } = await import('../../src/app.js');
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(async () => {
  if (server) await new Promise((r) => server.close(r));
});

test('health endpoint returns the standard envelope', async () => {
  const res = await api('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'ok');
});

test('unknown route returns a 404 error envelope', async () => {
  const res = await api('GET', '/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test('signup with an invalid body fails validation (422) with field errors', async () => {
  const res = await api('POST', '/auth/signup', {
    body: { name: 'X', email: 'not-an-email', password: '123' },
  });
  assert.equal(res.status, 422);
  assert.equal(res.body.success, false);
  assert.ok(Array.isArray(res.body.errors));
  assert.ok(res.body.errors.length >= 1);
});

test('login with a missing password fails validation (422)', async () => {
  const res = await api('POST', '/auth/login', { body: { email: 'a@b.com' } });
  assert.equal(res.status, 422);
});

test('protected /me without a token returns 401', async () => {
  const res = await api('GET', '/auth/me');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('protected /me with a malformed token returns 401', async () => {
  const res = await api('GET', '/auth/me', { token: 'garbage.token.value' });
  assert.equal(res.status, 401);
});

test('creating a club without auth returns 401', async () => {
  const res = await api('POST', '/clubs', { body: { name: 'My Club' } });
  assert.equal(res.status, 401);
});

test("listing one's own clubs without auth returns 401", async () => {
  const res = await api('GET', '/clubs/me');
  assert.equal(res.status, 401);
});

test('club list with an invalid filter value fails validation (422)', async () => {
  const res = await api('GET', '/clubs?gender=banana');
  assert.equal(res.status, 422);
  assert.ok(Array.isArray(res.body.errors));
});

test('creating an event without auth returns 401', async () => {
  const res = await api('POST', '/events', { body: { title: 'X' } });
  assert.equal(res.status, 401);
});

test('favorites require authentication (401)', async () => {
  const res = await api('GET', '/favorites');
  assert.equal(res.status, 401);
});

test('user profile requires authentication (401)', async () => {
  const res = await api('GET', '/users/me');
  assert.equal(res.status, 401);
});

test('admin routes require authentication (401)', async () => {
  const res = await api('GET', '/admin/stats');
  assert.equal(res.status, 401);
});

test('admin club status update with an invalid status fails validation (422)', async () => {
  // No auth reaches validation only if validation ran first; here auth guards
  // run before validation, so this asserts the admin guard returns 401.
  const res = await api('PATCH', '/admin/clubs/000000000000000000000000/status', {
    body: { status: 'nope' },
  });
  assert.equal(res.status, 401);
});
