# Environment Variables

> Populated across Phases 2–6 as integrations are added. Each app ships an
> `.env.example` that is the source of truth; this document explains each variable.

## Backend (`backend/.env`)

| Variable            | Description                                   |
| ------------------- | --------------------------------------------- |
| `NODE_ENV`          | `development` \| `production` \| `test`       |
| `PORT`              | HTTP port the API listens on                  |
| `MONGO_URI`         | MongoDB connection string                     |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens              |
| `JWT_REFRESH_SECRET`| Secret for signing refresh tokens             |
| `SMTP_*`            | SMTP host/port/user/pass for email            |
| `GOOGLE_CLIENT_ID`  | Google OAuth client id                        |
| `CLIENT_URL`        | Admin panel URL (for CORS & email links)      |

_(Full table finalized in Phase 2 alongside `.env.example`.)_

## Admin Panel (`admin_panel/.env`)

| Variable        | Description               |
| --------------- | ------------------------- |
| `VITE_API_URL`  | Base URL of the backend   |

## Mobile App (`mobile_app`)

Configuration is provided via `--dart-define` / `lib/config` (finalized in Phase 3).
