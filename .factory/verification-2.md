# Independent product verification — FAIL

Verified 2026-08-28 UTC against candidate `54e3dcdd0c2de8835e23541bc65428769215438c` on `main`.

- Repository: `https://github.com/B-Divyesh/sf-spend-pulse.git`
- Live URL: `https://spend-pulse.sociobot.in`
- Artifact: local-first offline PWA
- Result: **FAIL — do not release without the accessibility correction below.**

The live production files match this candidate exactly. This is not a deployment-only failure.

## Release-blocking finding

### Medium — navigation targets miss the mandatory 44 × 44 px minimum

The factory accessibility and design contract requires each touch/click target to be at least 44 × 44 CSS px. Fresh Chromium measurements of the live landing page found:

| Viewport | Control | Measured size |
| --- | --- | --- |
| 1440 × 900 | Demo | 43 × 44 px |
| 1440 × 900 | Privacy | 43 × 44 px |
| 1440 × 900 | Terms | 39 × 44 px |
| 390 × 844 | Privacy | 43 × 44 px |
| 390 × 844 | Terms | 39 × 44 px |

The 390 px page remains within 390 px at 200% text size and these controls have 44 px height, but their clickable width is still short. This is a small visual fix, but it is an explicit acceptance requirement and therefore blocks release.

## Required claim tests — PASS

`.factory/claims.json` exists with ten entries. After `npm ci`, I ran every declared command separately against the product's Playwright demo entry point; each selected exactly one test and passed.

| Claim | Exact command | Result |
| --- | --- | --- |
| offline reload | `npm test -- --grep @claim:offline-reload` | PASS |
| local-only privacy | `npm test -- --grep @claim:local-only` | PASS |
| demo isolation | `npm test -- --grep @claim:demo-sandbox` | PASS |
| pace check | `npm test -- --grep @claim:pace-check` | PASS |
| export | `npm test -- --grep @claim:data-export` | PASS |
| import | `npm test -- --grep @claim:data-import` | PASS |
| clear data | `npm test -- --grep @claim:data-clear` | PASS |
| demo reset | `npm test -- --grep @claim:demo-reset` | PASS |
| notification permission | `npm test -- --grep @claim:notification-permission` | PASS |
| on-device reminder | `npm test -- --grep @claim:on-device-reminder` | PASS |

The visible claims in the landing page, privacy page, settings, README, and demo map to these claim tests; no unlisted visitor-reliable claim was found.

## First read and demo — PASS

Cold visits at desktop and 390 × 844 showed, without scrolling:

- What it does: “Keep weekly spending on pace.”
- For whom: “For people who want a quick budget check without another finance account.”
- First action: “Try it with sample data,” with “See a filled week. Your data stays untouched.”

One click opened the populated $250 sample, with the persistent `Demo — sample data, nothing is saved` bar, Reset demo, and Start for real controls. This satisfies the plain-words and demo-sandbox gates.

## Local quality gates — PASS

- Clean install: `npm ci` — 24 packages installed; `npm audit --omit=dev` reported 0 vulnerabilities.
- Full browser suite: `npm test` — **26 passed**.
- Type check: `npm run typecheck` — passed.
- Lint alias: `npm run lint` — passed.
- Exact production build: `npm run build` — passed and created `dist/`.
- Build output: JS 28,840 bytes / 9,504 bytes gzip; CSS 16,948 / 4,607 gzip; self-hosted font 54,348 bytes; hero WebP 130,944 bytes. All are within the static/PWA budgets.

## Independent end-to-end checks — PASS

On a fresh live `/demo`, I added a $10 quick entry ($82.80 → $92.80), deleted and restored Lunch with Sam through Undo, rejected a zero amount with a useful error, added a $12.34 `Verifier cafe` entry, and confirmed it after reload. A malformed backup was rejected while retaining that entry. Reset demo restored the $82.80 shipped total.

I also verified CSV export (`spend-pulse-entries.csv`), settings navigation, and notification behavior. A request-permission spy saw 0 calls on settings load and exactly 1 only after `Allow and test notification` was pressed.

## Accessibility, responsive, and browser checks

- `/opt/fleet/lib/verify-url.sh https://spend-pulse.sociobot.in .factory/verification-artifacts-2` passed: title, `lang=en`, one H1, main landmark, image alt, button names, and no application console/page errors.
- Independent axe checks found **zero serious or critical violations** on `/`, `/demo`, `/settings`, `/privacy`, `/terms`, and the designed 404 in light and dark schemes at desktop and 390 px.
- Keyboard: the skip link is first and has a visible `rgb(169,79,29)` 3 px focus outline; Tab/Enter reaches the demo action and navigation moves focus to the destination H1. The skip link changes the URL to `#main`, although its anchor target is not itself focused.
- Reduced motion has `scroll-behavior: auto` and transition durations of `0.01ms`; no looping/flash behavior was observed.
- At 390 px with 200% root text, document width stayed 390 px. The target-width finding above remains.
- Normal product routes generated no page/console errors. The direct HTTP 404 correctly returns status 404; Chrome logs its expected failed-resource message for that deliberately missing document, not an app exception.

## Deployment identity, PWA, privacy, and security — PASS

SHA-256 hashes match local `dist/` and live responses for `index.html`, hashed JS, hashed CSS, hashed hero image, `sw.js`, and `manifest.webmanifest`. The deployed candidate is therefore the tested commit.

The live service worker is active and controlling the page (`spend-pulse-shell-v4`). `registration.update()` completed without error; the worker uses `skipWaiting`, `clients.claim`, versioned caching, and the app includes the update-ready notice path. After first visit, `/demo` reloaded offline and accepted another $10 entry offline.

During a fresh demo, entry, settings, and CSV-export flow, all observed requests were same-origin `https://spend-pulse.sociobot.in`. Cookies, localStorage, and sessionStorage were empty; only `spend-pulse-demo-v1` IndexedDB was created. There were no analytics, trackers, bank, billing, AI, account, cloud-sync, or third-party requests.

Responses include HSTS, CSP (`default-src 'self'` with restrictive worker/connect/frame directives), `nosniff`, strict-origin referrer policy, and a restrictive permissions policy. Hashed assets return `Cache-Control: public, max-age=31536000, immutable`; unknown routes return the designed page with HTTP 404. There are no product server-side/API endpoints, unlock calls, or sign-in, so rate-limit burst and Entra-tenant checks are not applicable.

Internal product routes and the Param Factory link returned HTTP 200. `robots.txt`, sitemap, manifest, local privacy page, terms page, and MIT license are present. The product appropriately has no AI feature: the researched manual, offline habit loop does not benefit from one.

## Evidence and next step

`verification-artifacts-2/verify.json` and its desktop/mobile screenshots contain the worker verification evidence. The only required fix is to make every header navigation link's clickable box at least 44 px wide as well as high, then rerun the target measurement and the normal verification suite.
