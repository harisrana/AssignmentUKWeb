# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

**AssignmentUKWeb** — the Angular frontend for **Assignment Writings UK**, an
academic writing services platform. Angular 21 (standalone, zoneless,
strict TypeScript), NgRx, Angular Material + TailwindCSS.

It talks to a backend in a **separate sibling repo**,
`../API` (`AssignmentUK.Api`, ASP.NET Core / .NET 10) — that repo has its own
`CLAUDE.md`/`PROGRESS.md`. The two are developed together: a frontend
feature that needs new data almost always needs a matching backend
controller/CQRS slice, and vice versa. When working on a full-stack change,
check both repos' `PROGRESS.md` for context, and update both when the change
touches both sides.

Local dev: Angular dev server on `http://localhost:4200`, API on
`http://localhost:5074` (`environment.development.ts`).

Two audiences, one app:
- **Public marketing site** (`PublicLayoutComponent`, no login): landing
  page, About, Services, **Pricing** (service tabs — Writing/Editing/
  Proofreading, matches a provided design screenshot), **Order** (package
  tiers + live price calculator + order/contact form), a floating **live
  chat** widget, and a WhatsApp link. All public "Order Now"/"Get a
  quote"/"Get Started" CTAs route to `/order`, not `/pricing` — those are
  two different pages now (see "Pricing vs Order split" below).
- **Admin area** (`MainLayoutComponent`, under `/app/...`, JWT-protected):
  dashboard, Users/Roles/Permissions, Products, a **live chat inbox** for
  support agents (`/app/chat`), settings, profile.

## Setup

**Prerequisites:** Node.js ≥ 20.19 / 22.12 / 24, npm ≥ 10.

```bash
npm install
npm start                # dev server, http://localhost:4200
npm run build             # production build → dist/AssignmentUKWeb/browser
```

The API base URL is `environment.apiUrl` (see `src/environments/`) — point
it at a running `AssignmentUK.Api` instance. Public marketing pages render
without a backend; anything that fetches data (users list, chat, order
submission, dashboard) needs the API up and reachable.

**If `ng build` fails with `Cannot find module 'tailwindcss'`**: `tailwindcss`
is used (see `tailwind.config.js`, `.postcssrc.json`) but was historically
installed without being declared in `package.json` — a plain `npm install`
can silently prune it as an "extraneous" package. It's now a proper
`devDependency` (with `autoprefixer`/`postcss`), but if this ever recurs:
`npm install -D tailwindcss@^3 autoprefixer@^10 postcss@^8`.

## Folder Structure

```
src/
├── app/
│   ├── core/                     # Singletons, cross-cutting concerns
│   │   ├── interceptors/         # auth, error(+refresh), loading, logging
│   │   ├── guards/                # auth, role, permission, unsaved-changes
│   │   ├── services/              # auth, token, storage, chat, price-estimate, menu …
│   │   ├── models/                # shared DTO / domain interfaces
│   │   ├── constants/             # API endpoints, roles, permissions
│   │   └── configurations/        # APP_CONFIG injection token
│   ├── shared/                    # Reusable, presentational building blocks
│   │   ├── components/            # data-table, search-box, confirm-dialog,
│   │   │                          # file-upload, loader, live-chat, page-header …
│   │   ├── directives/            # *appHasPermission, *appHasRole
│   │   ├── pipes/                 # mask (PII), safeHtml
│   │   ├── validators/            # strongPassword, match, ukPhone …
│   │   └── utilities/             # jwt helpers
│   ├── layouts/
│   │   ├── public-layout/         # navbar + footer + live-chat + WhatsApp for marketing pages
│   │   └── main-layout/           # sidebar + toolbar app shell for /app
│   ├── features/                  # Lazy-loaded feature areas
│   │   ├── landing/               # public marketing homepage
│   │   ├── marketing/             # about, services, pricing (tabs), order pages
│   │   ├── chat/                  # agent chat inbox (/app/chat)
│   │   ├── auth/                  # login, forgot-password + NgRx auth state
│   │   ├── dashboard/              # KPIs + recent orders
│   │   ├── users/                  # full NgRx Entity CRUD (reference feature)
│   │   ├── roles/                  # RBAC roles
│   │   ├── permissions/            # permission catalogue
│   │   ├── settings/                # theme / language / notifications
│   │   ├── profile/                 # reactive form + unsaved-changes guard
│   │   └── errors/                  # 403 / 404 / 500 pages
│   ├── app.config.ts               # Application providers (the composition root)
│   └── app.routes.ts                # Root lazy routing table
├── environments/                    # environment.ts / .development / .production
└── styles.scss                      # Tailwind + Material theme + brand tokens
```

Each **feature** owns its `routes`, `pages`, `components`, `services`,
`models`, and (where used) `state`, lazy-loaded via `loadChildren` /
`loadComponent`. `users` is the reference NgRx-Entity CRUD feature — copy
its shape when adding a similar admin list/form feature; simpler
signal-driven pages (pricing, order, chat inbox) don't use NgRx at all and
that's fine — match the complexity of what you're building, not the most
elaborate existing feature.

## Pricing vs. Order split

These were one long page originally, then split into two routes on request:

- **`/pricing`**: the Writing/Editing/Proofreading service tabs + FAQ only.
  Nav "Pricing" links point here.
- **`/order`**: the Standard/Premium/Platinum package tier cards + the
  "Estimate Your Price" calculator + the contact/order form (submits to
  `PriceEstimateService` → `POST /api/v1/price-estimates`, anonymous, no
  login required). **Every** "Order Now"/"Get a quote"/"Get Started" CTA
  across the site points here, not to `/pricing`.

If asked to change "the pricing page," clarify which of the two is meant —
they look similar in name but hold very different content now.

## Live chat

- **Public widget** (`shared/components/live-chat`): floating button,
  bottom-right, above the WhatsApp button (`bottom-6` vs `bottom-24` —
  don't let them overlap when touching either). Backed by a real
  connection, not a mock: `ChatService` (`core/services/chat.service.ts`)
  wraps both REST (create session / send / fetch history) and a SignalR
  hub connection (`@microsoft/signalr`) for live push. The visitor's
  session id is persisted in `localStorage` so a reload/navigation doesn't
  lose the conversation.
- **Agent inbox** (`features/chat`, route `/app/chat`, permission
  `chat.manage`): lists open sessions live, lets a logged-in agent open a
  transcript and reply. Uses the same `ChatService`, connecting with a JWT
  (`accessTokenFactory`) instead of anonymously.
- **SignalR client must connect with `withCredentials: false`** — the
  default (`true`) requires the server to send
  `Access-Control-Allow-Credentials: true`, which our CORS policy
  intentionally doesn't set (no cookie-based auth in this app). Leaving the
  default breaks the negotiate handshake with a CORS error that looks
  unrelated to credentials at first glance.
- Both "sent" and "received" messages render only when the hub pushes them
  back (`messageReceived$`), never optimistically from the REST response —
  this is deliberate, so the sender and any other open tab/agent see the
  exact same event stream and there's no risk of a duplicated bubble.

## Authentication & Security

- **JWT** login/logout/refresh via `AuthService` + NgRx `auth` effects.
- `authInterceptor` attaches `Authorization: Bearer <token>`;
  `errorInterceptor` transparently refreshes on 401 (single-flight, queues
  concurrent requests) and redirects to `/auth/login` on refresh failure.
- Auto-logout on token expiry and idle timeout (`SessionTimeoutService`).
- **RBAC is client-side only today**: `roleGuard`/`permissionGuard` protect
  routes, `*appHasRole`/`*appHasPermission` hide UI, the sidebar menu is
  filtered by the user's roles/permissions (`MenuService`). The backend
  currently only enforces coarse `[Authorize]`/`AdminOnly` — see the API
  repo's `CLAUDE.md` "Known Gaps" before assuming a permission is actually
  enforced server-side.
- **Permission/role constants must stay in sync** with the backend's fixed
  catalog: `core/constants/app.constants.ts` (`PERMISSIONS`, `ROLES`) vs.
  `AssignmentUK.Domain.Common.Permissions`/`Roles` in the API repo. As of
  this writing, `ROLES` here lists `Admin`/`Manager`/`Writer`/`Customer`,
  but only `Admin`/`User` are actually seeded on the backend — a known,
  unresolved mismatch (see API `CLAUDE.md`).

## Conventions

- **Standalone components** everywhere, no NgModules.
- **Signals** for local component state; **NgRx** for shared/cross-page
  state (currently just `auth` globally + `users` as the Entity reference).
  Don't reach for NgRx for a page-local list/form — match `pricing`/`order`/
  `chat-inbox`'s plain-signals approach instead.
- **`BaseApiService`** (`core/services/base-api.service.ts`) is the base for
  every REST-calling service — it unwraps the `ApiResponse<T>` envelope.
  Extend it rather than injecting `HttpClient` directly.
- **Never hard-code a URL** — add it to `API_ENDPOINTS`
  (`core/constants/api-endpoints.ts`) first.
- **Design tokens**: brand colors (`brand-navy` `#1E2A3A`, `brand-orange`
  `#E79A4E`), spacing (`stack-sm/md/lg`, `margin-mobile/desktop`), and
  typography scale are all defined once in `tailwind.config.js` — reuse
  them, don't invent new ad-hoc values for marketing-page work.
- **No comments explaining what code does** — only for non-obvious *why*.
- **Build after every feature**: `npx ng build --configuration development`
  from this directory. A clean build with no `RouterLink is not used`-style
  warnings is the bar — those warnings usually mean a dead
  button/import left behind mid-refactor, not just noise.

## Known Gaps / Follow-ups

- Role picker (Users feature) offers roles the backend hasn't seeded yet —
  see above.
- The Users admin screen was fully built here well before the matching
  backend existed; if a similar "frontend built ahead of backend" situation
  shows up elsewhere, check the API repo before assuming an endpoint exists.
- Live chat is real (SignalR + persisted sessions), not a demo — but it has
  no read receipts, typing indicators, or multi-agent handoff. Keep that in
  mind before promising those to a user without checking first.
