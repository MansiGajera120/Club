# Architecture

> Populated incrementally across build phases. This document describes the high-level
> system design; per-app internals live in each app's README and in
> [`FOLDER_STRUCTURE.md`](FOLDER_STRUCTURE.md).

## System Overview

```
┌────────────────┐        ┌────────────────┐
│  Flutter App   │        │  React Admin   │
│ (Parents /     │        │  (Admins)      │
│  Club Owners)  │        │                │
└───────┬────────┘        └───────┬────────┘
        │  HTTPS / REST (JWT)     │
        └───────────┬─────────────┘
                    ▼
        ┌───────────────────────┐
        │   Express REST API    │
        │   /api/v1/*           │
        │  (Clean Architecture) │
        └───────────┬───────────┘
                    ▼
        ┌───────────────────────┐        ┌──────────────┐
        │      MongoDB          │        │  SMTP / OAuth │
        │   (Mongoose ODM)      │        │  File storage │
        └───────────────────────┘        └──────────────┘
```

## Principles

- **Clean Architecture** — clear separation of routing, business logic, and data access.
- **RBAC everywhere** — Parent / Club Owner / Admin roles enforced at the middleware layer.
- **Stateless auth** — short-lived JWT access tokens + rotating refresh tokens.
- **Config-driven** — no hardcoded strings; everything flows from env + constants.
- **Shared design system** — mobile and admin mirror the same tokens (see Phase 5).

## Data model (Phase 7)

| Collection      | Purpose                              | Key relations / indexes                          |
| --------------- | ------------------------------------ | ------------------------------------------------ |
| `User`          | Parents, club owners, admins         | unique `email`; `role`, `status`, `providerId`   |
| `RefreshToken`  | Rotating refresh sessions            | `user`; unique `tokenHash`; TTL on `expiresAt`   |
| `Club`          | Club profiles + moderation           | `owner`; text(`name`,`description`,`city`); `status`,`gender`,`price`,`isFeatured` |
| `Event`         | Club events                          | `club`, `startDate`; `{club, startDate}`         |
| `Favorite`      | Parent ↔ club favorites              | **unique** `{user, club}`                         |
| `Notification`  | User notifications (prepared)        | `{user, createdAt}`, `isRead`                     |

Images are stored as **relative upload paths** (e.g. `logos/x.webp`) and turned
into absolute URLs in the DTO layer via `buildUploadUrl`. Repositories are the
only layer that imports models; DTOs shape every document before it leaves the
API.

_Details for API contracts are expanded in Phase 8._
