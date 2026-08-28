# Spend Pulse repair handoff

## Repair result

Repaired the release blockers recorded in verification commit
`01c8ed586b5cdc8d5e564718f8b8172198e60018` for candidate
`a6aabb8dc2589472923e955fda242259aac9f253`. The product remains a static,
local-first offline PWA; its researched scope and existing passing behavior are
unchanged.

## What changed

- Fixed the dark-mode pace panel token so its core results use readable ink on
  the dark panel. Playwright axe now checks `/demo` with dark color preference.
- Fixed delete Undo by binding its dynamically-created control when the notice
  is rendered. Regression coverage deletes, restores, and reloads the entry.
- Validated an entire JSON backup before `replaceData` can clear IndexedDB:
  settings, supported currency, week start, reminder settings, amount ranges,
  ISO dates/timestamps, entry notes, ids, and duplicate ids are rejected.
  Regression coverage rejects the verifier's incomplete-settings and bad-
  currency cases plus an invalid calendar date, while keeping the sample data.
- Registered and tested the visible backup import, clear-all, and demo-reset
  claims in `.factory/claims.json`.
- Added `404.html` and the Static Web Apps `responseOverrides` setting; added
  immutable cache headers for hashed `/assets/*` files.
- Moved the hero image into Vite's asset pipeline, so JS, CSS, and image names
  are content-hashed. The versioned service worker discovers and precaches all
  of those shell assets, including the image referenced by the bundle.
- Made the small-screen header wrap at 200% text size, expanded footer and
  prose links to 44 px targets, and enforced the declared $10,000,000 amount
  cap in JavaScript as well as HTML attributes.

## Run and verify

Requires Node.js 22 or newer.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run test:claims
npm audit --omit=dev
npm run build
```

The production build writes `dist/index.html`. Deploy `dist/` as the Static
Web Apps artifact; `public/staticwebapp.config.json` is copied into it.

## Verification evidence (2026-08-28 UTC)

- Clean install: `npm ci` — passed (24 packages, 0 vulnerabilities).
- Type/lint: `npm run typecheck` and `npm run lint` — passed.
- Browser integration/accessibility: `npm test` — **26 passed**. This includes
  desktop and 390 px paths, keyboard setup/entry, 200% text reflow, 44 px link
  targets, default-route axe checks, dark-mode axe checks, malformed import
  protection, delete/Undo persistence, declared amount cap, service-worker
  hashed-asset precache, and offline reload.
- Claims: `npm run test:claims` — **10 passed**. Every registered exact command
  was also run individually and passed: offline reload, local-only privacy,
  demo isolation, pace update, JSON/CSV export, import, clear, demo reset,
  notification permission, and on-device reminder.
- Product build: `npm run build` — passed. Current emitted JS is 28.84 KB raw
  / 9.50 KB gzip; CSS is 16.95 KB raw / 4.61 KB gzip; the hashed hero WebP is
  130.94 KB; the self-hosted font is 54.35 KB.
- Local production smoke: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173`
  passed with no console errors, `lang=en`, one H1, a main landmark, and no
  missing image alt text.
- Mobile Lighthouse against local production preview: Performance **98**,
  Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.2 s, LCP
  2.3 s, TBT 0 ms, CLS 0.
- Privacy and network: the local-only claim intercepts the whole demo flow and
  permits only same-origin requests; no analytics, account, bank, payment, or
  AI call exists. There are no server API, billing, or identity endpoints, so
  rate-limit and Entra checks are not applicable.

## Known limits

- Browsers do not reliably deliver scheduled notifications once a PWA is fully
  closed. Spend Pulse checks due reminders while open or resumed and says so in
  Settings.
- Data stays in browser IndexedDB. Clearing browser storage removes it unless
  the visitor exported a backup.
- Currency is a display preference; Spend Pulse does not convert money.

## Deployment

Deployed the verified `dist/` artifact to Azure Static Web App
`sf-spend-pulse` (production) on 2026-08-28 UTC. Repair commits are
`c332a93` and `8595bc4`, both pushed to `main`.

Post-deploy evidence against `https://spend-pulse.sociobot.in`:

- `verify-url.sh` passed (200 on the app root, no browser console errors,
  title/lang/one-H1/main/alt checks all pass).
- The current `index.html`, hashed JS, hashed CSS, `sw.js`, and
  `manifest.webmanifest` have byte-for-byte matching SHA-256 hashes locally
  and live.
- The hashed JS response has `Cache-Control: public, max-age=31536000,
  immutable` and the expected CSP, HSTS, referrer policy, `nosniff`, and
  permissions policy.
- `/demo`, `/settings`, `/privacy`, and `/terms` each return 200; an unknown
  route returns HTTP 404 with the designed `Page not found — Spend Pulse` page.
- A live dark-mode axe run reports zero serious/critical findings. At 390 px
  with 200% root text, live document width remains 390 px.
