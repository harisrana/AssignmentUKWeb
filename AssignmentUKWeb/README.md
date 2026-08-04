# Assignment Writings UK — Enterprise Web App (`AssignmentUKWeb`)

A production-grade **Angular 21** application (standalone, zoneless, strict) for
the Assignment Writings UK platform. It ships an enterprise, feature-based
architecture with JWT authentication, NgRx state management, Angular Material +
TailwindCSS UI, role/permission-based access control, i18n, theming, and a
full DevOps setup.

The public **landing page** and **login page** reproduce the provided Stitch
"Academic Excellence" design (brand navy `#1E2A3A`, brand orange `#E79A4E`,
Manrope + Inter typography).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Folder Structure](#folder-structure)
5. [Architecture](#architecture)
6. [Authentication & Security](#authentication--security)
7. [State Management](#state-management)
8. [Environment Configuration](#environment-configuration)
9. [Internationalisation](#internationalisation)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Notes & Deviations](#notes--deviations)

---

## Tech Stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | Angular 21 (standalone components, **zoneless**)   |
| Language           | TypeScript 5.9 (strict mode)                       |
| State              | NgRx Store, Effects, Entity                        |
| UI                 | Angular Material 21 + TailwindCSS 3                |
| i18n               | `@ngx-translate/core` v16                          |
| HTTP               | `HttpClient` + functional interceptors             |
| Testing            | Vitest (Angular 21 default) — see [deviations](#notes--deviations) |
| Container / CI     | Docker (multi-stage + nginx) + GitHub Actions      |

## Getting Started

**Prerequisites:** Node.js ≥ 20.19 / 22.12 / 24, npm ≥ 10.

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:4200)
npm start

# Production build
npm run build            # outputs to dist/AssignmentUKWeb/browser
```

> The app talks to a REST API defined in `src/environments/*`. Point
> `apiUrl` at your backend. Without a backend, public pages (landing, login UI,
> dashboard demo) render fully; API-backed lists show a friendly empty state.

## Available Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm start`       | Dev server                               |
| `npm run build`   | Production build                         |
| `npm run watch`   | Rebuild on change (development config)    |
| `npm test`        | Run unit tests (Vitest)                   |

## Folder Structure

```
src/
├── app/
│   ├── core/                     # Singletons, cross-cutting concerns
│   │   ├── interceptors/         # auth, error(+refresh), loading, logging
│   │   ├── guards/               # auth, role, permission, unsaved-changes
│   │   ├── services/             # auth, token, storage, logger, theme, menu …
│   │   ├── models/               # shared DTO / domain interfaces
│   │   ├── constants/            # API endpoints, roles, permissions
│   │   └── configurations/       # APP_CONFIG injection token
│   ├── shared/                   # Reusable, presentational building blocks
│   │   ├── components/           # data-table, search-box, confirm-dialog,
│   │   │                         # file-upload, loader, validation-summary …
│   │   ├── directives/           # *appHasPermission, *appHasRole
│   │   ├── pipes/                # mask (PII), safeHtml
│   │   ├── validators/           # strongPassword, match, ukPhone …
│   │   └── utilities/            # jwt helpers
│   ├── layouts/
│   │   ├── auth-layout/          # shell for unauthenticated pages
│   │   └── main-layout/          # sidebar + toolbar app shell
│   ├── features/                 # Lazy-loaded feature areas
│   │   ├── landing/              # public marketing page (Stitch design)
│   │   ├── auth/                 # login, forgot-password + NgRx auth state
│   │   ├── dashboard/            # KPIs + recent orders
│   │   ├── users/                # full NgRx Entity CRUD (reference feature)
│   │   ├── roles/                # RBAC roles
│   │   ├── permissions/          # permission catalogue
│   │   ├── settings/             # theme / language / notifications
│   │   ├── profile/              # reactive form + unsaved-changes guard
│   │   └── errors/               # 403 / 404 / 500 pages
│   ├── app.config.ts             # Application providers (the composition root)
│   └── app.routes.ts             # Root lazy routing table
├── environments/                 # environment.ts / .development / .production
└── styles.scss                   # Tailwind + Material theme + brand tokens
```

Each **feature** owns its `routes`, `pages`, `components`, `services`,
`models`, and `state`, and is lazy-loaded via `loadChildren` / `loadComponent`.

## Architecture

- **Standalone components** everywhere — no NgModules.
- **Feature-based** organisation with strict lazy loading; feature NgRx state is
  registered lazily inside the feature's route `providers` (see
  `features/users/users.routes.ts`).
- **SOLID / DI**: services depend on abstractions (`BaseApiService`,
  `APP_CONFIG` token), keeping them testable and swappable.
- **`users` is the reference feature** — copy its shape (service + NgRx Entity
  actions/reducer/effects/selectors + list/form/detail pages + resolver) when
  building new CRUD features.

## Authentication & Security

- **JWT** login/logout/refresh via `AuthService` + NgRx `auth` effects.
- **`authInterceptor`** attaches `Authorization: Bearer <token>` to every request.
- **`errorInterceptor`** transparently refreshes an expired token on `401`,
  **queues concurrent requests behind a single refresh** (single-flight), retries
  the original request, and redirects to `/auth/login` if refresh fails.
- **Auto-logout** on token expiry and on **idle timeout** (`SessionTimeoutService`,
  idle-user detection with a warning before logout).
- **RBAC**: `roleGuard`, `permissionGuard` protect routes; `*appHasRole` /
  `*appHasPermission` structural directives hide UI; the sidebar menu is filtered
  by the current user's roles/permissions.
- **XSS**: Angular's built-in sanitisation + the `safeHtml` pipe for dynamic HTML.
- **CSRF**: `X-Requested-With` header + guidance to pair short-lived access
  tokens with httpOnly refresh cookies on the backend.
- **PII masking**: the `mask` pipe redacts emails / phone numbers / card numbers.

## State Management

- **Root state**: `auth` feature (user, loading, error) — registered globally.
- **Feature state**: `users` uses **NgRx Entity** (adapter, paginated list,
  optimistic counts) registered lazily.
- **Local signal stores** (e.g. `DashboardStore`) are used for simple read-only
  views — a pragmatic complement to NgRx, not a replacement.
- Redux DevTools enabled in development only.

## Environment Configuration

Environment files live in `src/environments/`:

| File                        | Used for                     | `apiUrl` (default)                        |
| --------------------------- | ---------------------------- | ----------------------------------------- |
| `environment.ts`            | Base / fallback              | `https://api.assignmentwritings.uk/api`   |
| `environment.development.ts`| `ng build/serve` (dev)       | `http://localhost:5000/api`               |
| `environment.production.ts` | `ng build` (prod)            | `https://api.assignmentwritings.uk/api`   |

File replacement is configured in `angular.json`. Prefer injecting `APP_CONFIG`
over importing `environment` directly so code stays testable.

## Internationalisation

- Translation JSON in `public/i18n/{en,ur}.json`, loaded over HTTP by
  `@ngx-translate/core`. Add a language by dropping a new file in and extending
  `supportedLanguages` in the environment.
- Language switcher in the top toolbar and in **Settings**.

## Testing

Angular 21 scaffolds **Vitest** as the default unit-test runner (`npm test`).
Write specs alongside sources (`*.spec.ts`). Suggested coverage — mirroring the
original brief's intent — includes services with mocked HTTP, guards,
interceptors, and component behaviour.

## Deployment

### Docker

```bash
docker build -t assignment-uk-web .
docker run -p 8080:80 assignment-uk-web      # → http://localhost:8080
```

Multi-stage build: Node builds the bundle, **nginx** serves it with SPA
fallback, gzip, long-lived asset caching, and security headers (`nginx.conf`).

### CI/CD

`.github/workflows/ci.yml` runs on push/PR to `main`/`develop`:
install → lint → test → production build → upload artifact, and builds the
Docker image on `main`.

## Notes & Deviations

- **Testing framework**: the brief lists Jasmine/Karma, but **Karma is
  deprecated and removed from Angular 21's `ng new`**. To honour "latest
  standards & best practices," the project uses Angular 21's default **Vitest**
  runner. Swapping back to Karma/Jasmine is possible but not recommended.
- **Zoneless**: the app runs without `zone.js` (`provideZonelessChangeDetection`),
  the modern Angular default. UI state uses **signals** throughout.
- **Backend**: no server is included. API contracts are defined in
  `core/constants/api-endpoints.ts` and typed models under `core/models/`.
- **Tailwind + Material** coexist by design: Tailwind reproduces the marketing
  pages precisely; Material powers admin widgets (table, dialog, menu, etc.).
