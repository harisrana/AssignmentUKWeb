# Progress

Backend-side work for the same features is logged in the sibling API repo's
`progress.md` (`../API/progress.md`) — most sessions here touched both.

## 2026-08-08

- **About Us**: removed the "Ready to work with the best?" CTA section
  (orange banner + "View Pricing" button) per request.

- **Pricing page "Order Now" login requirement removed**: the tier
  "Choose X" buttons and the calculator's "Order Now" button used to
  `routerLink` to `/auth/login`. Changed to plain non-navigating buttons
  (temporary, ahead of the order-form work below).

- **Order enquiry form added to the price calculator** ("Details" textarea +
  "Contact Information": Full Name, Email, Mobile No., Country) — matches
  the requested screenshot layout. Built the full save path: new
  `PriceEstimateService`/`price-estimate.model.ts`/`API_ENDPOINTS.priceEstimates`
  on the frontend, calling the new (also built this session)
  `POST /api/v1/price-estimates` on the backend — anonymous, no login
  required, matching the "no login for Order Now" request above.
  - Added visible validation (red ring + inline error text) after
    discovering the form silently did nothing on invalid/empty submit —
    the user reported "no validation, no data save call," which turned out
    to be two separate issues: missing validation UI, *and* the API not
    running locally at the time (the backend endpoint didn't exist yet in
    the already-running process).
  - Mobile No. restricted to digits only, client-side (blocked keypress +
    stripped on paste) and server-side (regex validator) after a report
    that it accepted non-numeric input.
  - Pages slider max raised from 50 to 2000.

- **"Choose Standard/Premium/Platinum" wired to the calculator**: clicking a
  tier button sets the Package dropdown to that tier and smooth-scrolls to
  the calculator. Selected tier gets a visible "Selected" badge/ring — it
  used to just be Premium always looking highlighted (a permanent "Most
  Popular" style unrelated to actual selection), which the user flagged as
  confusing.

- **Pricing page redesign** (compact, SaaS-dashboard style, requested with a
  detailed brief): tightened spacing throughout, tier cards `p-8`→`p-6`,
  merged the calculator + order form into a 2-column grid with a **sticky
  order-summary sidebar** (estimated total + Order Now button stay visible
  while scrolling/filling the form) instead of one long stacked column,
  FAQ moved to a 2-column grid with smaller accordion items. Removed and
  later **re-added** the "Simple, Transparent Pricing" hero section (user
  asked to cut it for compactness, then asked for it back — it's back,
  above the tier cards).

- **WhatsApp floating button** added, site-wide (`public-layout`), linking
  to `wa.me/442033320848` (the existing support number).

- **Writing / Editing / Proofreading tabbed pricing section** added,
  matching a provided screenshot: three tabs, each showing a feature list +
  "from £X.99" price + Order Now button.

- **Pricing page split into two routes** (`/pricing` and `/order`) — see
  `CLAUDE.md` "Pricing vs. Order split" for the current shape. Updated
  every "Order Now"/"Get a quote"/"Get Started" CTA across About, Services,
  the header, and the pricing tabs to point at `/order`. Along the way,
  found and fixed a **dead "Order Now" button on the landing page hero**
  that was a plain `<button>` with no `routerLink` at all — now wired to
  `/order` too.

- **Live chat — built twice, deliberately**:
  1. First pass: a self-contained **UI-only mock** widget (floating button,
     canned welcome message, canned reply after a `setTimeout`) — explicitly
     scoped as a placeholder, explained as such to the user.
  2. User asked for it to actually work → chose "real backend chat" over a
     third-party widget (Tawk.to/Crisp/etc.) when asked to pick. Rebuilt on
     top of the new backend Chat feature (see API `progress.md`): new
     `ChatService` (REST + `@microsoft/signalr`), `LiveChatComponent`
     rewritten to create/resume a real session (id persisted in
     `localStorage`) and exchange real messages, plus a new **agent inbox**
     page (`features/chat`, `/app/chat`, gated behind a new `chat.manage`
     permission entry in `menu.service.ts`/`app.constants.ts`).
  - Hit a CORS error on first real test (`Access-Control-Allow-Credentials`
    missing) — fixed client-side by setting `withCredentials: false` on the
    SignalR connection (see `CLAUDE.md`), not a server change.
  - Hit a second error testing the agent side ("Failed to invoke
    'JoinAgentGroup' because user is unauthorized") — root-caused to a
    backend JWT claim-type bug (role claims not recognized by
    `RequireRole`), fixed in the API repo; documented there.
  - **Live-tested with a throwaway Playwright script** (not committed —
    installed only in the session scratch dir): navigated the real site,
    opened the widget, confirmed the SignalR connection negotiated, the
    welcome message appeared, a sent message round-tripped through the
    actual API and rendered back via the hub push, and the browser console
    stayed clean (zero errors). Screenshots taken for visual confirmation.
  - Provided the seeded admin login (`admin@assignmentuk.local` /
    `Admin@12345`) and walked through testing the agent-reply flow with two
    browser profiles (one visitor, one incognito-logged-in-agent) since the
    JWT + chat-session-id both live in browser storage and would collide
    in the same profile.

- **`npm install` incident**: installing `@microsoft/signalr` triggered npm
  pruning `tailwindcss`/`postcss`/`autoprefixer` as "extraneous" — they were
  present in `node_modules` and actively used (`.postcssrc.json`,
  `tailwind.config.js`, `@tailwind` directives in `styles.scss`) but had
  never been declared in `package.json`. Build broke
  (`Cannot find module 'tailwindcss'`). Fixed by reinstalling all three as
  proper `devDependencies`. Documented in `CLAUDE.md` in case it recurs.

- **`CLAUDE.md`/`PROGRESS.md` created** for this repo (didn't exist before);
  the sibling API repo's `CLAUDE.md` was also rewritten (it had leftover
  content from an unrelated project) and its `progress.md` updated with the
  matching backend-side work.

### Known gap surfaced, not yet fixed

Navigating to `/app/users` 404s — the Users admin screen has always called
a backend endpoint that never existed. Backend now built (see API
`progress.md`); **requires an API restart to take effect**, not yet
re-verified end-to-end in this session as of this entry.
