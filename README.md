# Sports Club Discovery Platform

A production-grade platform that helps parents discover, browse, and connect with local
sports clubs, while giving club owners a self-service portal and administrators full
moderation control.

The project is a **monorepo** containing three independent applications that share one
design system and one REST API contract.

```
club/
├── backend/        Node.js + Express + TypeScript + MongoDB REST API
├── mobile_app/     Flutter (Riverpod) parent + club-owner mobile app
├── admin_panel/    React + TypeScript + Vite admin dashboard
├── docs/           Architecture, API, environment & deployment documentation
├── scripts/        Dev/ops helper scripts (seeding, backups, deploys)
├── uploads/        Runtime image storage (logos, gallery, events)
└── README.md
```

---

## Applications

| App          | Stack                                          | Consumers            |
| ------------ | ---------------------------------------------- | -------------------- |
| `backend`    | Node.js, Express, JavaScript (ESM), MongoDB, JWT | mobile_app, admin_panel |
| `mobile_app` | Flutter, Riverpod, Go Router, Dio, Freezed     | Parents, Club Owners |
| `admin_panel`| React, JavaScript, Vite, MUI, React Query      | Administrators       |

## User Roles

- **Parent** — browses, searches, favorites, shares clubs and views events.
- **Club Owner** — registers a club, manages its profile, gallery and events.
- **Admin** — approves/rejects/suspends clubs, manages users, events and featured clubs.

Role-Based Access Control (RBAC) is enforced on every protected endpoint.

---

## Getting Started

Each application is self-contained and has its own `README.md` with setup instructions:

- [`backend/README.md`](backend/README.md)
- [`mobile_app/README.md`](mobile_app/README.md)
- [`admin_panel/README.md`](admin_panel/README.md)

Documentation for the platform as a whole lives in [`docs/`](docs/):

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- [`docs/API.md`](docs/API.md)
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)
- [`docs/TESTING.md`](docs/TESTING.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## Build Roadmap

The platform is built in sequential phases:

| Phase | Deliverable                        | Status         |
| ----- | ---------------------------------- | -------------- |
| 1     | Workspace & folder structure       | ✅ Complete     |
| 2     | Backend initialization             | ✅ Complete     |
| 3     | Flutter app initialization         | ✅ Complete     |
| 4     | React admin initialization         | ✅ Complete     |
| 5     | Shared design system / theme       | ✅ Complete     |
| 6     | Authentication (all roles)         | ✅ Complete     |
| 7     | Database models                    | ✅ Complete     |
| 8     | Backend APIs                       | ✅ Complete     |
| 9     | Flutter screens                    | ✅ Complete     |
| 10    | Admin screens                      | ✅ Complete     |
| 11    | Testing                            | ✅ Complete     |
| 12    | Deployment                         | ⏳ Pending      |

## License

Proprietary — All rights reserved.