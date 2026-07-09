# Folder Structure

This document is the authoritative map of the monorepo. Every folder has a single,
well-defined responsibility (Clean Architecture). New files must be placed according to
this map — do not create ad-hoc top-level folders.

```
club/
├── backend/                       Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/                Env parsing, DB connection, 3rd-party client config
│   │   ├── constants/             App-wide constant values (no magic strings)
│   │   ├── controllers/           HTTP layer — parse request, call service, send response
│   │   ├── dto/                   Data Transfer Objects (request/response shapes)
│   │   ├── enums/                 Shared enumerations (roles, statuses, etc.)
│   │   ├── errors/                Custom error classes + global error handler
│   │   ├── helpers/               Small pure helper functions
│   │   ├── interfaces/            TypeScript interfaces (domain contracts)
│   │   ├── jobs/                  Background/scheduled jobs (cron, queues)
│   │   ├── loaders/               App bootstrap steps (express, mongoose, routes)
│   │   ├── logger/                Winston logger configuration
│   │   ├── middlewares/           Auth, RBAC, validation, rate-limit, upload, errors
│   │   ├── models/                Mongoose schemas & models
│   │   ├── repositories/          Data-access layer — the ONLY place that talks to models
│   │   ├── responses/             Standard success/response builders
│   │   ├── routes/                Express routers, versioned under /api/v1
│   │   ├── services/              Business logic — orchestrates repositories
│   │   ├── templates/emails/      Reusable HTML email templates
│   │   ├── types/                 Global TS type augmentations & shared types
│   │   ├── utils/                 Framework-agnostic utilities (jwt, hash, sharp, mailer)
│   │   └── validators/            Request validation schemas (Joi / express-validator)
│   └── tests/
│       ├── unit/
│       └── integration/
│
├── mobile_app/                    Flutter app (Parents + Club Owners)
│   ├── lib/
│   │   ├── core/                  Cross-cutting: error/, network/, constants/, extensions/
│   │   ├── config/                Environment & app configuration
│   │   ├── services/              API clients & platform services (auth, storage, share)
│   │   ├── models/                Freezed + json_serializable data models
│   │   ├── repositories/          Data layer bridging services and providers
│   │   ├── screens/               Feature screens (auth, home, search, club, events…)
│   │   ├── widgets/               Reusable UI widgets & design-system components
│   │   ├── providers/             Riverpod providers (state management)
│   │   ├── utils/                 Helpers, formatters, validators
│   │   ├── theme/                 Shared design system (colors, typography, spacing)
│   │   └── routes/                Go Router configuration
│   └── assets/                    images/, icons/, fonts/
│
├── admin_panel/                   React + TypeScript + Vite admin dashboard
│   ├── public/
│   └── src/
│       ├── assets/                Static assets
│       ├── components/            Reusable components (common/, ui/)
│       ├── constants/             App-wide constants
│       ├── context/               React context providers (auth, theme)
│       ├── hooks/                 Custom hooks (React Query wrappers, utilities)
│       ├── layouts/               Page shells (dashboard layout, auth layout)
│       ├── pages/                 Route-level pages
│       ├── routes/                Router config & protected routes
│       ├── services/              Axios API clients
│       ├── theme/                 MUI theme mirroring the shared design system
│       ├── types/                 Shared TypeScript types
│       └── utils/                 Helpers & formatters
│
├── docs/                          Platform-wide documentation
├── scripts/                       Dev/ops scripts (seed, backup, deploy)
├── uploads/                       Runtime image storage
│   ├── logos/
│   ├── gallery/
│   └── events/
└── README.md
```

## Backend layering rules

Requests flow **downward** and never skip a layer:

```
Route → Middleware (auth/validate) → Controller → Service → Repository → Model (MongoDB)
```

- **Controllers** never touch Mongoose models directly — they call **services**.
- **Services** never build HTTP responses — they return data/throw domain errors.
- **Repositories** are the only layer allowed to import **models**.
- **Validators** run as middleware before the controller; no controller trusts raw input.
- Errors bubble to the **global error handler**, which formats the standard response.

## Standard API response shape

Every endpoint returns:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { }
}
```
