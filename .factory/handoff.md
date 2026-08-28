# Spend Pulse v1 handoff

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
