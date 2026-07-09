# Deployment Guide

## Backend on Render

The backend is ready to deploy as a **Node Web Service** on [Render](https://render.com).
A blueprint file lives at [`backend/render.yaml`](../backend/render.yaml).

### Prerequisites

1. **GitHub repo** — push this monorepo to GitHub.
2. **MongoDB Atlas** — free cluster is fine.
   - Create a database user and copy the connection string.
   - Include the database name: `...mongodb.net/sunny_club?retryWrites=true&w=majority`
   - Under **Network Access**, allow `0.0.0.0/0` (or Render's egress IPs) so Render can connect.
3. **JWT secrets** — generate two random strings (min 16 chars), e.g.:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Option A — Deploy with Blueprint (recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect your GitHub repo.
3. Render detects `backend/render.yaml` and creates the `club-api` web service.
4. In the service **Environment** tab, set the variables marked `sync: false`:
   - `MONGO_URI`
   - `APP_URL` — `https://club-1r4i.onrender.com`
   - `CLIENT_URL` — your Vercel admin URL, e.g. `https://your-app.vercel.app`
   - `CORS_ORIGINS` — same Vercel URL (comma-separated if multiple)
   - SMTP vars if you need email
   - `GOOGLE_CLIENT_IDS` if using Google Sign-In
5. Click **Manual Deploy** → **Deploy latest commit**.

### Option B — Manual Web Service

1. **New** → **Web Service** → connect GitHub repo.
2. Settings:

   | Field            | Value              |
   | ---------------- | ------------------ |
   | **Root Directory** | `backend`        |
   | **Runtime**      | Node               |
   | **Build Command**| `npm install`      |
   | **Start Command**| `npm start`        |
   | **Health Check Path** | `/api/v1/health` |

3. Add environment variables (see [`backend/.env.example`](../backend/.env.example)):

   | Variable | Example / notes |
   | -------- | --------------- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Atlas connection string with `/sunny_club` |
   | `JWT_ACCESS_SECRET` | random 32+ char secret |
   | `JWT_REFRESH_SECRET` | different random secret |
   | `APP_URL` | `https://club-1r4i.onrender.com` |
   | `CLIENT_URL` | Vercel admin URL |
   | `CORS_ORIGINS` | Vercel admin URL |
   | `LOG_LEVEL` | `info` |
   | `SMTP_*` | optional — leave `SMTP_HOST` empty to skip real email |

   Do **not** set `PORT` — Render injects it automatically.

4. Deploy and verify:
   ```bash
   curl https://<service-name>.onrender.com/api/v1/health
   ```

### After deploy

- **Seed data** (optional): run locally against Atlas:
  ```bash
  cd backend
  MONGO_URI="mongodb+srv://..." npm run seed
  ```
- **Point clients** at the API (already configured in code):
  - Admin panel (Vercel): `https://club-1r4i.onrender.com/api/v1` via `.env.production`
  - Mobile app (release builds): same URL via `AppConfig`
- **Google OAuth**: add the Render `APP_URL` / mobile bundle IDs to Google Cloud Console.

---

## Admin panel on Vercel

The admin panel auto-selects the API URL:

| Mode | Backend |
| ---- | ------- |
| `npm run dev` | `http://localhost:5000/api/v1` |
| Vercel production build | `https://club-1r4i.onrender.com/api/v1` |

### Steps

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repository.
3. Set **Root Directory** to `admin_panel`.
4. Framework: **Vite** (auto-detected). Build: `npm run build`, output: `dist`.
5. Deploy — no environment variables required unless you want to override `VITE_API_URL`.
6. Copy your Vercel URL (e.g. `https://club-admin.vercel.app`).
7. On **Render** → backend service → **Environment**, set:
   - `CLIENT_URL=https://<your-vercel-app>.vercel.app`
   - `CORS_ORIGINS=https://<your-vercel-app>.vercel.app`
8. Redeploy the backend on Render so CORS picks up the new origin.

`admin_panel/vercel.json` includes SPA rewrites for React Router.

---

## Mobile app (release builds)

Debug runs use `localhost`; release builds (`flutter build apk` / `flutter build ios`)
automatically use `https://club-1r4i.onrender.com/api/v1`.

See [`mobile_app/README.md`](../mobile_app/README.md) for emulator and device overrides.

### File uploads on Render

Uploaded images are stored under `backend/uploads/` on the service disk.
On Render's **free** tier the filesystem is **ephemeral** — uploads are lost on redeploy.
For production image persistence, use one of:

- [Render Disk](https://render.com/docs/disks) mounted at `/opt/render/project/src/backend/uploads`
- Object storage (S3, Cloudinary, etc.) — future enhancement

### Free tier notes

- Services spin down after ~15 minutes of inactivity; first request may take 30–60s.
- Upgrade to a paid plan for always-on instances.

---

## Other apps

| App           | Target                          | Status |
| ------------- | ------------------------------- | ------ |
| `admin_panel` | Vercel                          | Ready  |
| `mobile_app`  | Google Play & Apple App Store   | Config ready |
