# Sports Club Platform — Admin Panel

React + Vite admin dashboard (JavaScript) for platform administrators. Built with
Material UI, React Router, React Query, Axios, React Hook Form and React Toastify.

## Requirements

- Node.js **>= 18**

## Getting Started

```bash
cd admin_panel
npm install
npm run dev               # http://localhost:5173 — uses local backend
```

The API URL is picked automatically:

| Mode | Command / host | Backend API |
| ---- | -------------- | ----------- |
| Development | `npm run dev` | `http://localhost:5000/api/v1` |
| Production | `npm run build`, Vercel | `https://club-1r4i.onrender.com/api/v1` |

Override with `VITE_API_URL` in `.env.local` if needed.

## Deploy to Vercel

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Settings:

   | Field | Value |
   | ----- | ----- |
   | **Root Directory** | `admin_panel` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. Deploy — no env vars required (production API URL is in `.env.production`).
5. On **Render**, update the backend `CORS_ORIGINS` and `CLIENT_URL` to your Vercel URL, e.g. `https://your-app.vercel.app`.

`vercel.json` includes SPA rewrites so client-side routing works.

## Scripts

| Script             | Description                     |
| ------------------ | ------------------------------- |
| `npm run dev`      | Start the Vite dev server       |
| `npm run build`    | Production build to `dist/`     |
| `npm run preview`  | Preview the production build    |
| `npm run lint`     | Run ESLint                      |
| `npm run lint:fix` | Fix lint issues                 |
| `npm run format`   | Format with Prettier            |

## Environment Variables

| Variable        | Development default               | Production default (Vercel)              | Purpose               |
| --------------- | --------------------------------- | ---------------------------------------- | --------------------- |
| `VITE_API_URL`  | `http://localhost:5000/api/v1`    | `https://club-1r4i.onrender.com/api/v1`  | Backend API base URL  |
| `VITE_APP_NAME` | `Sports Club Admin`               | `Sports Club Admin`                      | App display name      |

Set in `.env.development` / `.env.production`, or override with `.env.local`.

## Architecture

```
src/
├── assets/         Static assets
├── components/
│   ├── common/     Shared components (FullPageLoader, …)
│   └── ui/         Presentational UI building blocks
├── config/         Env access (env.js)
├── constants/      Storage keys, query keys, route paths
├── context/        React context (AuthContext)
├── hooks/          Custom hooks (useAuth)
├── layouts/        AuthLayout, DashboardLayout (sidebar shell)
├── pages/          Route-level pages (Login, Dashboard, NotFound)
├── routes/         AppRoutes + ProtectedRoute guard
├── services/       apiClient (Axios), tokenStorage, queryClient
├── theme/          MUI theme mirroring the shared design system
├── utils/          Helpers
├── App.jsx         Providers (theme, query, auth, router)
└── main.jsx        Entry point
```

The `@` alias maps to `src/` (configured in `vite.config.js` and `jsconfig.json`).

### Data flow

```
Page → hook (React Query) → service → apiClient (Axios) → Backend API
```

- **Axios interceptors** attach the bearer token and handle 401s (token refresh
  arrives in Phase 6).
- **AuthContext** holds the session; **ProtectedRoute** guards private routes.
- **React Query** owns server state (caching, retries, invalidation).

## State of the app

Phase 4 delivers the runnable shell: theming, Axios client, React Query, auth
context + route guard, the sidebar dashboard layout, and placeholder Login /
Dashboard / 404 pages. Authentication lands in **Phase 6** and the full admin
screens (statistics, moderation, users, events, featured clubs) in **Phase 10**.
