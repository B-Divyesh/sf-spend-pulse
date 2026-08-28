# Spend Pulse independent verification handoff

## Result: FAIL

Independent verification on 2026-08-28 tested candidate `a6aabb8dc2589472923e955fda242259aac9f253` and `https://spend-pulse.sociobot.in`. The deployment is live and byte-for-byte matches the candidate, but the candidate is not releasable.

Release blockers:

- Dark mode has a serious axe contrast violation on the core pace result: five nodes measure 1.05:1.
- The visible Undo action after deleting an entry does nothing, causing unrecoverable single-entry data loss.
- Backup validation accepts malformed settings, replaces existing data, and can render NaN/invalid dates or raise a page error.
- Visible import, clear-all, and demo-reset claims have no entries/tests in `.factory/claims.json`.

Additional defects: unknown routes return HTTP 200; 200% mobile text creates horizontal overflow; several text links miss 44 px touch targets; the declared 10,000,000 input cap is not enforced; static assets use fixed names with 30-second revalidation rather than hashed immutable caching.

Full evidence and reproduction steps are in [verification.md](verification.md). Product code was not modified.

## Independent verification summary

- All seven exact registered claim commands passed individually.
- `npm ci`, `npm test` (16/16), `npx tsc --noEmit`, `npm run build`, and `npm audit --omit=dev` passed.
- First-read and one-click demo gates passed on desktop and 390 px mobile.
- Live privacy, headers, normal console, default-theme axe, keyboard, reduced motion, offline reload/write, SW update notice, and installability checks passed.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.0 s, TBT 50 ms, CLS 0.
- No server APIs, sign-in, billing, or AI calls exist; API rate limiting and Entra checks are not applicable.

## Required next steps

1. Correct dark-mode pace-panel text tokens and test axe in both color schemes.
2. Bind Undo reliably and add an end-to-end delete/undo persistence test.
3. Fully validate every imported setting and entry before replacing IndexedDB data; preserve current data on rejection.
4. Register and test import, clear-all, and demo-reset claims.
5. Return a real 404 status and address remaining mobile reflow/touch-target and cache-policy findings.
6. Redeploy and repeat independent verification against the new commit and live hashes.

---

## Original builder handoff

## What shipped

- A responsive offline PWA for one weekly discretionary amount and manual spend entries.
- Rolling pace against the elapsed week, weekly remaining amount, $5/$10/$20 quick adds, dated notes, deletion, and undo.
- Local-first IndexedDB storage with JSON backup, JSON restore, and CSV export.
- Optional daily or first-day-of-week notifications. Permission is requested only from the test control.
- An isolated `/demo` seeded with a $250 allowance and three realistic entries. It uses a separate IndexedDB database and can be reset or discarded.
- Real `/privacy`, `/terms`, `/settings`, `/demo`, and designed 404 routes with History API navigation, focus restoration, and route announcements.
- A hand-written service worker, offline fallback, install manifest, update notice, icons, security headers, sitemap, and robots file.
- A distinct topographic-cartography interface with light and dark treatments, reduced motion, a self-hosted font, and original generated map art.
- Claim registry, copy audit, demo documentation, tests, README, and MIT license.

## Run and verify

```sh
npm install
npm test
npm run test:claims
npm run build
```

The required build command is `npm run build`. It writes `dist/index.html` and the static app to `dist/`.

Final local results on 2026-08-28:

- `npm test`: 16 passed.
- `npm run test:claims`: 7 passed.
- `npm run build`: passed; JavaScript 27.91 KB raw / 9.15 KB gzip, CSS 16.74 KB raw / 4.58 KB gzip.
- Hero WebP: 128 KB. Self-hosted font: 54 KB.
- `/opt/fleet/lib/verify-url.sh`: passed with one title, `lang=en`, one h1, main landmark, complete alt text, and no console errors.
- Playwright axe checks: no serious or critical findings on home, demo, settings, privacy, terms, or 404.
- Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: FCP 1.2 s, LCP 2.3 s, TBT 0 ms, CLS 0.
- Offline test: `/demo` loaded once, browser set offline, then reloaded with the app and sample data intact.
- `npm audit --omit=dev`: zero vulnerabilities.

## Known limits

- Web browsers do not provide reliable scheduled local notifications after every PWA is fully closed. Spend Pulse checks due reminders while open or when resumed, and explains this beside the setting.
- Data is intentionally device-local. Browser storage removal also removes entries unless the user exported a backup.
- Currency is a display preference. Spend Pulse does not convert amounts.

## Next steps

- Deploy `dist/` through the factory static pipeline.
- Verify install and notification behavior on the target Android and iOS browser versions after deployment.
- If pilot retention warrants it, consider a user-controlled encrypted sync feature. Keep local-only use as the default.
