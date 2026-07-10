# Security Notes & Operator Action Items

This document records security work applied to the platform and the items that
require **manual / external action** by an operator (they cannot be fixed in
code alone).

---

## 🔴 REQUIRED before production: rotate all live credentials

The development `backend/.env` contained **real, working credentials**. `.env`
is correctly git-ignored (not in history), but these secrets have existed in
plaintext in the delivered working tree and must be treated as compromised.

Rotate each of the following in its respective console and update the
deployment secret store (Render env vars / Vercel env vars — never a committed
file):

| Secret | Where to rotate |
| ------ | --------------- |
| `MONGO_URI` (Atlas DB user + password) | MongoDB Atlas → Database Access → edit user / reset password |
| `SMTP_PASS` (Gmail app password) | Google Account → Security → App passwords → revoke & regenerate |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Generate new: `openssl rand -hex 32` (rotating these invalidates all existing sessions — expected) |
| `GOOGLE_CLIENT_SECRET` (if used server-side) | Google Cloud Console → Credentials |

After rotating, confirm `git ls-files | grep -i env` returns **only**
`*.env.example` files.

---

## ✅ Applied in code

- **Email-verification enforcement** — unverified local accounts can sign in but
  cannot create clubs/events, favorite, or edit their profile until they verify
  their OTP. Toggle with `REQUIRE_EMAIL_VERIFICATION` (default `true`).
- **Refresh-token reuse detection** — replaying an already-rotated refresh token
  revokes the entire token family and forces re-authentication.
- **Refresh-time status check** — a disabled account can no longer mint fresh
  access tokens via refresh.
- **OTP brute-force lockout** — email-verification OTPs are invalidated after 5
  wrong attempts and compared in constant time.
- **Social-login hardening** — an OAuth identity is only auto-linked to an
  existing account when the provider asserts the email is verified.
- **CORS wildcard tightening** — `*` in `CORS_ORIGINS` now matches a single DNS
  label (no dot/scheme traversal); a startup warning fires if a wildcard is used
  with credentials in production.
- **NoSQL-injection guard** — a global sanitizer strips `$`-prefixed and dotted
  keys from all request input (defence in depth on top of Joi `stripUnknown`).
- **Password strength** — signup/reset now require ≥8 chars incl. a letter and a
  number (enforced in the API and mirrored in the Flutter validator).
- **APK / binaries** — `*.apk`, `*.aab`, `*.ipa`, `*.app` are git-ignored; the
  stray 58 MB `app-release.apk` was removed from the tree.

### Production CORS

Prefer **exact** origins in `CORS_ORIGINS` for production. Only use wildcard
patterns (`https://*.vercel.app`) for preview deployments, and be aware that —
because credentials are enabled — a wildcard trusts every direct subdomain of
that host.

---

## 🟡 Recommended enhancements (not yet implemented)

- **Password-reset UX** — the reset screen is now reachable in-app and accepts a
  manual code, but the backend still emails a long link-style token. For a fully
  mobile-friendly flow, either configure deep linking (`app_links` +
  Android intent filters + iOS associated domains) **or** convert the reset flow
  to a 6-digit OTP (mirroring the existing email-verification flow).
- **Transactional cascade delete** — `clubService.deleteClub` removes a club plus
  its events/favorites/images without a transaction. On a replica set (Atlas),
  wrap these in a Mongo session so a mid-way failure cannot orphan data.
- **Test coverage in CI** — the DB-backed integration tests
  (`tests/integration/auth.test.js`, `api.flow.test.js`) are skipped unless
  `TEST_MONGO_URI` is set. Provision a Mongo instance in CI so signup/login/
  approval/favorite behaviour is actually exercised on every run.
