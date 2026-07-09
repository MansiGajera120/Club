# Design System

One design language, two clients. The **mobile app** (Flutter) and the **admin
panel** (React/MUI) implement the exact same tokens so the product feels like a
single, premium system across surfaces.

Aesthetic target: minimal, professional, lots of white space, rounded corners,
soft shadows — in the spirit of Apple / Notion / Airbnb / Stripe / Linear.

> This document is the **source of truth**. The Flutter theme
> (`mobile_app/lib/theme/`) and the MUI theme (`admin_panel/src/theme/`) must
> mirror these values exactly.

---

## 1. Color

### Brand — "Premium Indigo"

| Token            | Hex       | Usage                          |
| ---------------- | --------- | ------------------------------ |
| `primary`        | `#4F46E5` | Primary actions, links, focus  |
| `primaryDark`    | `#4338CA` | Pressed / hover primary        |
| `primaryLight`   | `#6366F1` | Subtle primary accents         |
| `secondary`      | `#7C3AED` | Secondary emphasis             |
| `accent`         | `#06B6D4` | Highlights, info accents       |

**Brand gradient:** `linear-gradient(135deg, #4F46E5 → #7C3AED)` — used on primary
buttons, hero surfaces, badges and email headers.

### Status

| Token       | Hex       |
| ----------- | --------- |
| `success`   | `#10B981` |
| `warning`   | `#F59E0B` |
| `danger`    | `#EF4444` |
| `info`      | `#06B6D4` |

### Neutrals — Light

| Token            | Hex       | Usage                     |
| ---------------- | --------- | ------------------------- |
| `background`     | `#F7F8FC` | App background            |
| `surface` / card | `#FFFFFF` | Cards, sheets             |
| `surfaceMuted`   | `#EEF1F8` | Filled inputs, subtle fills |
| `textPrimary`    | `#0F172A` | Headings, body            |
| `textSecondary`  | `#64748B` | Secondary/muted text      |
| `border`         | `#E5E8F2` | Dividers, input borders   |

### Neutrals — Dark

| Token            | Hex       |
| ---------------- | --------- |
| `background`     | `#0B1020` |
| `surface` / card | `#151B2E` |
| `surfaceMuted`   | `#1C2438` |
| `textPrimary`    | `#F1F5F9` |
| `textSecondary`  | `#94A3B8` |
| `border`         | `#26304A` |

Both themes share the same brand + status colors; only neutrals differ.

---

## 2. Typography

Font: **Inter** where available, falling back to the platform system font
(SF Pro / Roboto). Type scale:

| Token       | Size (px/sp) | Weight | Line height |
| ----------- | ------------ | ------ | ----------- |
| `displayLg` | 32           | 700    | 1.2         |
| `h1`        | 28           | 700    | 1.25        |
| `h2`        | 24           | 700    | 1.3         |
| `h3`        | 20           | 600    | 1.3         |
| `title`     | 18           | 600    | 1.4         |
| `body`      | 16           | 400    | 1.5         |
| `bodySm`    | 14           | 400    | 1.45        |
| `caption`   | 12           | 500    | 1.4         |
| `button`    | 16           | 600    | 1.2         |

Weights: Regular 400 · Medium 500 · Semibold 600 · Bold 700.

---

## 3. Spacing

4-pt base scale. Use tokens, never raw numbers.

| Token  | Value |
| ------ | ----- |
| `xs`   | 4     |
| `sm`   | 8     |
| `md`   | 12    |
| `lg`   | 16    |
| `xl`   | 24    |
| `xxl`  | 32    |
| `xxxl` | 48    |

---

## 4. Radius

| Token  | Value | Usage                    |
| ------ | ----- | ------------------------ |
| `sm`   | 8     | Chips, small controls    |
| `md`   | 12    | Buttons, inputs          |
| `lg`   | 16    | Cards                    |
| `xl`   | 24    | Sheets, large surfaces   |
| `pill` | 999   | Pills, avatars           |

---

## 5. Elevation (soft shadows)

Low-opacity, blue-tinted shadows on a near-black (`#0F172A`) base.

| Token | Y offset | Blur | Color                    |
| ----- | -------- | ---- | ------------------------ |
| `sm`  | 2        | 8    | `rgba(15,23,42,0.06)`    |
| `md`  | 4        | 16   | `rgba(15,23,42,0.08)`    |
| `lg`  | 12       | 32   | `rgba(15,23,42,0.10)`    |

Cards prefer a hairline border (`border`) + `sm` shadow over heavy elevation.

---

## 6. Motion

- Standard duration: **200ms**; emphasized: **300ms**.
- Standard easing: `easeInOut` (Flutter) / `cubic-bezier(0.4, 0, 0.2, 1)` (web).
- Use for: page transitions, skeleton→content fades, button press feedback.

---

## 7. Shared component contracts

Both clients ship these primitives with matching behavior:

| Primitive       | Flutter                          | Admin (MUI)                    |
| --------------- | -------------------------------- | ------------------------------ |
| Button          | `AppButton` (filled/tonal/outline, loading) | themed `Button` + `PageHeader` actions |
| Card            | `AppCard`                        | themed `Card`                  |
| Text field      | `AppTextField`                   | themed `TextField`             |
| Empty state     | `EmptyState`                     | `EmptyState`                   |
| Loading skeleton| `AppSkeleton`                    | MUI `Skeleton` / `SkeletonCard`|
| Stat tile       | (Phase 9)                        | `StatCard`                     |

Dark mode is supported by both themes from day one.
