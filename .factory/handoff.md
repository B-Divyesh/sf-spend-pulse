# Spend Pulse repair handoff

Repair completed from verification-report base `8fd4d55d2e56c1b1c2a2e31265bdf33b12212781`.

## Repair

The release blocker was the undersized clickable width of short navigation links. Header links already had a 44 px height but depended on their text width; footer links had the same issue. `src/styles.css` now sets `min-width: 44px` alongside the existing `min-height: 44px` for header navigation and footer/content links.

`tests/app.spec.ts` now contains an exact browser regression: it measures every header and footer navigation link at 1440 × 900 and 390 × 844, and requires both bounding-box dimensions to be at least 44 CSS px.

## Verification

All checks ran locally on 2026-08-28 UTC after a clean install:

- `npm ci` completed (24 packages); `npm audit --omit=dev` found 0 vulnerabilities.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed. `dist/` was produced with JS 28.84 KB raw / 9.50 KB gzip, CSS 16.98 KB raw / 4.61 KB gzip, self-hosted font 54.35 KB, and hero image 130.94 KB.
- `npm test` passed: 27/27 Playwright tests. This includes real/demo storage isolation, pace entry, invalid input and import recovery, Undo, keyboard entry, 404/static response configuration, 390 px/200% reflow, both-theme axe checks, and service-worker shell precache.
- Every declared claim command was run separately and passed with one selected test: `offline-reload`, `local-only`, `demo-sandbox`, `pace-check`, `data-export`, `data-import`, `data-clear`, `demo-reset`, `notification-permission`, and `on-device-reminder`.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 /tmp/spend-pulse-verify` passed: HTTP 200, title `Spend Pulse — Keep weekly spending on pace`, `lang=en`, one H1, main landmark, zero missing image alt attributes, zero unnamed buttons, and zero page/console errors.
- Fresh Chromium target measurements are now: desktop Demo 44 × 44, footer Privacy 44 × 44, footer Terms 44 × 44; 390 px Demo 51 × 44, header Privacy 57 × 44, footer Privacy 44 × 44, and footer Terms 44 × 44. Settings and external links are larger.
- Local Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 2.2 s, TBT 0 ms, CLS 0.
- PWA smoke test: a fresh `/demo` page was service-worker controlled, `registration.update()` completed, cache `spend-pulse-shell-v4` was present, the manifest fetched successfully, and the demo reloaded offline with heading `See this week’s spending pace`.
- Privacy remains local-first: the `@claim:local-only` browser flow observed no cross-origin request, account field, or tracking/billing path. The static response/security policy remains covered by the production-output test and `public/staticwebapp.config.json`.

## Deployment

Repair code was committed as `4d032fb` (`fix: meet navigation touch target baseline`) and pushed to `origin/main`. Production was then deployed directly with the repository’s `dist/` output and `dist/staticwebapp.config.json` to the resolved Azure Static Web App `sf-spend-pulse` in resource group `sociobot`; the Static Web Apps client confirmed the production deployment.

The custom production URL now serves the repaired `app-B733XabF.css` and `app-s_0SevFs.js` assets. SHA-256 matches between `dist/` and `https://spend-pulse.sociobot.in` for `index.html`, both app assets, the hero image, `sw.js`, and `manifest.webmanifest`. Live `verify-url.sh` passed with no page/console errors, and live Chromium measurements match the local repaired target sizes at desktop and 390 px. Production assets return immutable caching; the custom URL returns the designed 404 with HTTP 404.

## Known gaps and next step

There are no known gaps or remaining release-test failures. The target-size regression prevents the original issue from returning.
