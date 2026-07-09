# Sports Club Platform — Backend API

Node.js + Express + MongoDB REST API for the Sports Club Discovery Platform,
written in modern JavaScript (ES Modules) following Clean Architecture.

## Requirements

- Node.js **>= 18**
- MongoDB **>= 6** (local or Atlas)

## Getting Started

```bash
cd backend
cp .env.example .env      # then edit values (at minimum MONGO_URI + JWT secrets)
npm install
npm run dev               # start with hot reload (nodemon)
```

The server boots on `http://localhost:5000` by default. Verify it:

```bash
curl http://localhost:5000/api/v1/health
```

```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok",
    "environment": "development",
    "uptime": 3,
    "timestamp": "2026-07-09T00:00:00.000Z",
    "database": "connected"
  }
}
```

## Scripts

| Script                 | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start with nodemon (hot reload)         |
| `npm start`            | Start the server (production)           |
| `npm run lint`         | Run ESLint                              |
| `npm run lint:fix`     | Fix lint issues                         |
| `npm run format`       | Format with Prettier                    |
| `npm run seed`         | Seed the database (added later)         |
| `npm test`             | Run tests (added in Phase 11)           |

## Architecture

Requests flow strictly downward and never skip a layer:

```
Route → Middleware (auth / validate / rate-limit) → Controller → Service → Repository → Model
```

| Layer          | Folder                | Responsibility                                   |
| -------------- | --------------------- | ------------------------------------------------ |
| Config         | `src/config`          | Env validation (Joi), DB connection              |
| Constants/Enums| `src/constants` `src/enums` | Status codes, messages, roles, statuses    |
| Logger         | `src/logger`          | Winston logger + morgan stream                   |
| Responses      | `src/responses`       | Standard `{ success, message, data }` builder    |
| Errors         | `src/errors`          | `ApiError` class + factory helpers               |
| Middlewares    | `src/middlewares`     | Error handler, 404, rate limiter (auth/RBAC later)|
| Routes         | `src/routes`          | Versioned Express routers (`/api/v1`)            |
| Controllers    | `src/controllers`     | HTTP layer: parse request, call service, respond |
| Services       | `src/services`        | Business logic (added per feature)               |
| Repositories   | `src/repositories`    | Data access — only layer that imports models     |
| Models         | `src/models`          | Mongoose schemas (Phase 7)                        |
| Loaders        | `src/loaders`         | App bootstrap (express middleware assembly)       |
| Utils          | `src/utils`           | `asyncHandler`, jwt, hashing, mailer (added later)|

### Standard response envelope

Every endpoint returns:

```json
{ "success": true, "message": "…", "data": {} }
```

Errors are formatted by the global error handler:

```json
{ "success": false, "message": "…", "errors": [{ "field": "email", "message": "…" }] }
```

## Security

Helmet, CORS allow-list, compression, rate limiting, env validation, and (from
Phase 6) JWT auth, password hashing, refresh-token rotation and RBAC.

## Environment Variables

See [`.env.example`](.env.example) and [`../docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md).
