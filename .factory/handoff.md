# Spend Pulse polish 1 handoff

## Outcome

Perfection-loop round 1 is complete. All eight findings in `.factory/review-1.md` are resolved, including every minor copy and metadata issue. No earlier `.factory/polish-*.md` existed. The earlier navigation, Undo, import, dark-contrast, and mobile defects remain covered by regression tests and pass.

The topographic cartography identity and offline-PWA deployment class are unchanged. The one-click sample URL is now https://spend-pulse.sociobot.in/?demo=1.

## Changes

- Rewrote the flagged README sentences with the product’s plain “day-to-day spending” and “this browser” terms.
- Removed unlisted claims about product scope, financial advice, deployment dependencies, and visitor-facing art provenance.
- Made `/?demo=1` load the isolated, populated demo immediately. The persistent banner retains Reset demo and Start for real.
- Added full per-route title, description, canonical, Open Graph, and Twitter updates.
- Rebuilt the production 404 with matching navigation, footer, legal links, metadata, apple icon, mobile layout, focus style, dark mode, and reduced motion.
- Updated the service-worker cache to `spend-pulse-shell-v5` and precached the query-demo entry.
- Added browser regressions for the query demo, route metadata, history/focus restoration, static-404 structure, claim-test uniqueness, and light/dark accessibility on every route.
- Added the 81-character verb-first catalog line in `.factory/catalog-description.txt`.

The exact finding-to-change-to-evidence matrix is in `.factory/polish-1.md`.

## Verification

Repair code commit: `95cf481` (`fix: close cumulative review findings`). It was pushed to `origin/main` before deployment.

From `/work/repo`:

- `npm ci`: passed; 24 packages, zero vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/index.html`.
- `npm test`: 42/42 passed.
- `npm audit --omit=dev`: zero vulnerabilities.
- Built JS: 30.06 KB raw / 9.73 KB gzip.
- Built CSS: 16.98 KB raw / 4.61 KB gzip.
- Hero image: 130.94 KB. Self-hosted font: 54.35 KB.

A clean clone at `/tmp/spend-pulse-polish-clean-hYkpDj` ran `npm ci`, `npm run build`, and every declared claim command separately. Each command selected one test and passed:

- `offline-reload`
- `local-only`
- `demo-sandbox`
- `pace-check`
- `data-export`
- `data-import`
- `data-clear`
- `demo-reset`
- `notification-permission`
- `on-device-reminder`

The full suite covers keyboard input, invalid and maximum amounts, delete/Undo persistence, malformed imports, mobile 200% reflow, 44 px targets, service-worker precaching, and the production route configuration. Axe found zero serious or critical issues across all routes and the 404 in both light and dark modes.

`verify-url.sh` passed locally and live with one H1, `lang=en`, main, complete image alt and button names, and zero page or console errors. Evidence is under `.factory/polish-1-artifacts/`.

Local Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 2.3 s, TBT 0 ms, CLS 0.

Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.8 s, TBT 0 ms, CLS 0.

## Deployment and live cold check

Factory deployment command:

```sh
/opt/fleet/lib/deploy-static.sh spend-pulse dist
```

Azure Static Web Apps deployment `5d6f97dc-3f0b-4859-ae0d-be655f78c8e5` succeeded for `sf-spend-pulse`. Production is https://spend-pulse.sociobot.in.

After deployment, a fresh 390 × 844 Chromium context verified:

- First screen: headline and sample action visible; document width exactly 390 px.
- Demo: title `Demo — Spend Pulse`; persistent banner visible; `$82.80 → $92.80 → $82.80` after quick add and reset.
- Isolation: Start for real opened the empty real setup, not sample data.
- Routing: H1 focus passed after forward navigation and browser Back.
- Metadata: title, description, canonical, Open Graph, and Twitter values passed on all five app routes.
- 404: unknown route returned HTTP 404 with shared navigation plus Privacy and Terms.
- Privacy: zero cross-origin requests and zero normal-flow console/page errors.
- Offline: the controlled query demo reloaded with its heading and banner while the browser was offline.
- Accessibility: live mobile axe scans found zero serious/critical findings on six routes in both themes.

SHA-256 content matches between `dist/` and production for `index.html`, `sw.js`, `manifest.webmanifest`, `404.html`, `404.css`, app JS, app CSS, and terrain art.

## Known gaps

None. No review finding or test failure is deferred.
