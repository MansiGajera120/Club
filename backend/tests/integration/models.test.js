/**
 * Schema/DTO validation. Loads the Mongoose models (no DB connection required —
 * model definitions are evaluated at import) and asserts the fields, indexes,
 * and DTO shaping that the rest of the app depends on.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/unused';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-abcdefgh';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-abcdefgh';
process.env.APP_URL = 'http://localhost:5000';

const { default: mongoose } = await import('mongoose');
await import('../../src/models/index.js');
const { Club } = await import('../../src/models/club.model.js');
const { Favorite } = await import('../../src/models/favorite.model.js');

test('all collections are registered as models', () => {
  for (const name of [
    'User',
    'RefreshToken',
    'Club',
    'Event',
    'Favorite',
    'Notification',
  ]) {
    assert.ok(mongoose.models[name], `${name} should be registered`);
  }
});

test('club schema exposes search + filter fields', () => {
  const paths = Club.schema.paths;
  for (const field of [
    'name',
    'city',
    'gender',
    'price',
    'ageMin',
    'ageMax',
    'status',
    'isFeatured',
    'owner',
  ]) {
    assert.ok(paths[field], `club.${field} should exist`);
  }
});

test('club has a full-text search index', () => {
  const hasText = Club.schema
    .indexes()
    .some(([def]) => Object.values(def).includes('text'));
  assert.ok(hasText, 'club should define a text index');
});

test('favorite enforces a unique {user, club} index', () => {
  const unique = Favorite.schema
    .indexes()
    .find(([def, opts]) => def.user === 1 && def.club === 1 && opts?.unique);
  assert.ok(unique, 'favorite should have a unique compound index');
});

test('club DTO builds absolute upload URLs', async () => {
  const { toClubResponse } = await import('../../src/dto/club.dto.js');
  const dto = toClubResponse({
    _id: 'abc123',
    name: 'Test Club',
    gender: 'mixed',
    logo: 'logos/a.webp',
    gallery: ['gallery/b.webp'],
    contact: {},
    status: 'approved',
  });
  assert.ok(dto.logo.endsWith('/uploads/logos/a.webp'));
  assert.ok(dto.gallery[0].endsWith('/uploads/gallery/b.webp'));
  assert.equal(dto.isFeatured, false);
});
