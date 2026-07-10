# API Documentation

This document describes every REST endpoint, its request validation, required
role, and response shape.

> Notes: Clubs carry a `services` string array. Events carry `price` /
> `priceCurrency`. When `REQUIRE_EMAIL_VERIFICATION=true` (default), unverified
> local accounts receive `403` on state-changing actions until they verify their
> email OTP.

## Conventions

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <accessToken>`
- All responses follow the standard envelope:

```json
{ "success": true, "message": "…", "data": {} }
```

## Resource Groups (planned)

| Prefix              | Purpose                              |
| ------------------- | ------------------------------------ |
| `/api/v1/auth`      | Signup, login, verify, reset, OAuth  |
| `/api/v1/users`     | Profile & user management            |
| `/api/v1/clubs`     | Browse, search, filter, manage clubs |
| `/api/v1/events`    | Club events                          |
| `/api/v1/favorites` | Parent favorites                     |
| `/api/v1/admin`     | Admin moderation & statistics        |

## Auth endpoints (Phase 6)

| Method | Path                          | Auth   | Body                                  |
| ------ | ----------------------------- | ------ | ------------------------------------- |
| POST   | `/auth/signup`                | Public | `{ name, email, password, role? }`    |
| POST   | `/auth/login`                 | Public | `{ email, password }`                 |
| POST   | `/auth/refresh`               | Public | `{ refreshToken }` (or cookie)        |
| POST   | `/auth/logout`                | Public | `{ refreshToken }` (or cookie)        |
| POST   | `/auth/verify-email`          | Public | `{ token }`                           |
| POST   | `/auth/resend-verification`   | Public | `{ email }`                           |
| POST   | `/auth/forgot-password`       | Public | `{ email }`                           |
| POST   | `/auth/reset-password`        | Public | `{ token, password }`                 |
| POST   | `/auth/google`                | Public | `{ idToken }`                         |
| POST   | `/auth/apple`                 | Public | `{ identityToken, name? }`            |
| GET    | `/auth/me`                    | Bearer | —                                     |

Auth responses return `{ user, accessToken, refreshToken }` in `data`. The
refresh token is also set as an httpOnly cookie for web clients. Access tokens
are short-lived JWTs; refresh tokens are opaque, stored hashed, and rotated on
every use. `role` on signup is limited to `parent` or `club_owner` (admins are
seeded via `npm run seed`).

## Users (Phase 8)

| Method | Path                | Auth   | Notes                       |
| ------ | ------------------- | ------ | --------------------------- |
| GET    | `/users/me`         | Bearer | Current profile             |
| PATCH  | `/users/me`         | Bearer | Update `{ name }`           |
| POST   | `/users/me/avatar`  | Bearer | Multipart `avatar` (image)  |

## Clubs (Phase 8)

| Method | Path                   | Auth            | Notes                                             |
| ------ | ---------------------- | --------------- | ------------------------------------------------- |
| GET    | `/clubs`               | Optional        | Browse/search/filter: `search,city,sport,gender,age,minPrice,maxPrice,featured,sort,page,limit` |
| GET    | `/clubs/me`            | club_owner/admin| Caller's own clubs (any status)                   |
| GET    | `/clubs/:id`           | Optional        | Public detail (owner/admin see non-approved)      |
| POST   | `/clubs`               | club_owner      | Register a club (status → pending)                |
| PATCH  | `/clubs/:id`           | owner/admin     | Edit own club                                     |
| DELETE | `/clubs/:id`           | owner/admin     | Delete club + events/favorites/images             |
| POST   | `/clubs/:id/logo`      | owner/admin     | Multipart `logo`                                  |
| POST   | `/clubs/:id/gallery`   | owner/admin     | Multipart `images[]` (≤10)                        |
| DELETE | `/clubs/:id/gallery`   | owner/admin     | Body `{ image }`                                  |

Images are optimized with Sharp (WebP), stored under `/uploads`, and returned as
absolute URLs. List responses include a `meta` pagination object; when a parent
is authenticated, clubs carry an `isFavorite` flag.

## Events (Phase 8)

| Method | Path                | Auth        | Notes                                       |
| ------ | ------------------- | ----------- | ------------------------------------------- |
| GET    | `/events`           | Optional    | `?club=<id>` for a club's events, else the upcoming feed (approved clubs) |
| GET    | `/events/:id`       | Public      | Event detail                                |
| POST   | `/events`           | owner/admin | Create for an owned club                     |
| PATCH  | `/events/:id`       | owner/admin | Edit                                        |
| DELETE | `/events/:id`       | owner/admin | Delete                                      |
| POST   | `/events/:id/cover` | owner/admin | Multipart `cover`                            |

## Favorites (Phase 8, parent only)

| Method | Path                  | Auth   | Notes                     |
| ------ | --------------------- | ------ | ------------------------- |
| GET    | `/favorites`          | parent | Paginated favorite clubs  |
| POST   | `/favorites/:clubId`  | parent | Add                       |
| DELETE | `/favorites/:clubId`  | parent | Remove                    |

## Admin (Phase 8, admin only)

| Method | Path                          | Notes                                              |
| ------ | ----------------------------- | -------------------------------------------------- |
| GET    | `/admin/stats`                | Dashboard counts (clubs/users/events)              |
| GET    | `/admin/clubs`                | All clubs (`?status`, `?search`)                   |
| PATCH  | `/admin/clubs/:id/status`     | `{ status, reason? }` — approve/reject/suspend/hide |
| PATCH  | `/admin/clubs/:id/featured`   | `{ isFeatured }`                                   |
| DELETE | `/admin/clubs/:id`            | Delete a club                                      |
| GET    | `/admin/users`                | All users (`?role`, `?status`, `?search`)          |
| PATCH  | `/admin/users/:id/status`     | `{ status }` — enable/disable (not self/admins)    |
| GET    | `/admin/events`               | All events (`?club`)                               |
| DELETE | `/admin/events/:id`           | Delete an event                                    |
