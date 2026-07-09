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
   - `APP_URL` — your Render URL, e.g. `https://club-api.onrender.com`
   - `CLIENT_URL` — admin panel URL (or placeholder until admin is deployed)
   - `CORS_ORIGINS` — comma-separated allowed origins (admin panel + any web clients)
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
   | `APP_URL` | `https://<service-name>.onrender.com` |
   | `CLIENT_URL` | admin panel public URL |
   | `CORS_ORIGINS` | same as `CLIENT_URL` (comma-separated if multiple) |
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
- **Point clients** at the API:
  - Admin panel: `VITE_API_URL=https://<service-name>.onrender.com`
  - Mobile app: update API base URL in app config / `--dart-define`
- **Google OAuth**: add the Render `APP_URL` / mobile bundle IDs to Google Cloud Console.

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

## Other apps (planned)

| App           | Target                          |
| ------------- | ------------------------------- |
| `admin_panel` | Render Static Site / Vercel     |
| `mobile_app`  | Google Play & Apple App Store   |
