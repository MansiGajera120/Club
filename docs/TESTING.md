# Testing Guide

Each app has its own test suite. Fast, dependency-free tests run by default;
tests that need a database are **opt-in** so CI and local runs never require one.

| App          | Runner              | Command              |
| ------------ | ------------------- | -------------------- |
| `backend`    | Node test runner    | `npm test`           |
| `mobile_app` | Flutter test        | `flutter test`       |
| `admin_panel`| Vitest              | `npm test`           |

---

## Backend

```bash
cd backend
npm test          # node --test
```

What runs:

- **Unit tests** (`tests/unit/`) — pure utilities (duration, pagination, crypto,
  password hashing, JWT, upload URLs). No DB.
- **Model tests** (`tests/integration/models.test.js`) — schema fields, indexes
  (text index, unique favorite index) and DTO shaping. No DB.
- **App smoke test** (`tests/integration/app.smoke.test.js`) — boots the real
  Express app (no DB) and asserts routing, request validation (422 + field
  errors) and the auth/RBAC guards (401) across every route group.

### Database-backed tests (opt-in)

The auth flow and the full club→moderation→favorite→event lifecycle run against a
real MongoDB when `TEST_MONGO_URI` is set. These are skipped otherwise.

```bash
# Local MongoDB
TEST_MONGO_URI=mongodb://127.0.0.1:27017/club_test npm test

# MongoDB Atlas (uses a disposable test database — it is dropped on start)
TEST_MONGO_URI="mongodb+srv://<user>:<pass>@cluster0.../club_test" npm test
```

Covered end-to-end: signup/login/refresh-rotation/verify-email/reset-password
(`auth.test.js`) and owner-registers → pending-hidden → admin-approves →
parent-favorites → owner-creates-event → admin-stats (`api.flow.test.js`).

> On Windows PowerShell, set the variable first:
> `$env:TEST_MONGO_URI="mongodb://127.0.0.1:27017/club_test"; npm test`

---

## Mobile App

```bash
cd mobile_app
flutter test
```

Covers form validators, display formatters, `ClubFilter` query building, model
JSON parsing (Club/Event), and a widget test that boots the app and verifies it
resolves "no session" and routes to the login screen.

---

## Admin Panel

```bash
cd admin_panel
npm test          # vitest run
npm run test:watch
```

Covers API error-message extraction. Add component tests with
`@testing-library/react` + `jsdom` as UI logic grows.

---

## Full manual end-to-end check

To exercise the whole platform against a live database:

```bash
# 1. Backend
cd backend
cp .env.example .env            # set MONGO_URI (Atlas or local) + JWT secrets
npm install && npm run seed     # creates the initial admin
npm run dev

# 2. Admin panel (new terminal)
cd admin_panel
cp .env.example .env            # VITE_API_URL=http://localhost:5000/api/v1
npm install && npm run dev      # sign in with the seeded admin

# 3. Mobile app (new terminal)
cd mobile_app
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1
```
