# Independent verification 5 — FAIL

**Candidate:** `9277f95aab1ba9f4255f8ddac07052e534374551`  
**Live URL:** https://spend-pulse.sociobot.in  
**Verified:** 2026-08-29 (UTC)  
**Scope:** independent product QA against the original work order, researched brief, and factory contract. No product code was changed.

## Release decision

**FAIL.** The deployed product matches the candidate and the core spending loop works, but two acceptance-contract defects remain:

1. **High — two claim tests do not use the required demo sandbox.** `@claim:notification-permission` opens `/settings`, and the shared `saveReminder` helper used by `@claim:on-device-reminder` also opens `/settings` and writes settings to the real IndexedDB namespace. The claims and demo-sandbox contracts require every claim test to start from the demo entry point and use only demo data. Fresh browser contexts prevented actual user-data loss in this run, but the tests are not contract-compliant.
2. **Medium — keyboard focus disappears on Import JSON.** On `/settings?demo=1`, Tab reaches `#import-file`, but that input is clipped to `rect(0px, 0px, 0px, 0px)`. Its 3 px outline is clipped with it, while the visible “Import JSON” label has `outline: none`. A keyboard user therefore cannot see where focus went. Evidence: [live-import-focus-missing-5.png](verification-artifacts/live-import-focus-missing-5.png).

Both findings violate non-negotiable acceptance requirements, so otherwise passing gates do not change the result.

## First-read and one-click demo

The mandatory cold first-read gate passed.

- What it does: “Keep weekly spending on pace.”
- For whom: “For people who want a quick budget check without another finance account.”
- What to click first: **Try it with sample data**, with adjacent copy explaining that it opens a filled week without touching the visitor’s data.
- The first 390 × 844 screen also showed all three facts. Their bottom edges were 690.4, 719.4, and 748.4 px, within the viewport.
- One click opened `/?demo=1`, showed “Demo — sample data, nothing is saved,” and provided **Reset demo** and **Start for real**. The sample contained a $250 weekly amount, $82.80 spent, and three realistic entries.

Evidence: [desktop first read](verification-artifacts/live-first-read-desktop.png), [390 px demo](verification-artifacts/live-demo-mobile-390-5.png), and [dark/reduced-motion mobile](verification-artifacts/live-mobile-dark-reduced-5.png).

## Claims gate

`.factory/claims.json` exists and lists 11 claims. As the required first action, every exact command was attempted before installation; each stopped at the expected missing clean-clone dependency `@playwright/test`. After the documented prerequisite `npm ci`, every exact command was rerun separately and its selected browser test passed:

- `offline-reload`
- `local-only`
- `demo-sandbox`
- `sample-demo`
- `pace-check`
- `data-export`
- `data-import`
- `data-clear`
- `demo-reset`
- `notification-permission`
- `on-device-reminder`

The full suite also confirmed exactly one `@claim:<id>` tag per registered claim. However, the two notification claim tests use `/settings` rather than `/settings?demo=1`, producing the high-severity sandbox finding above. The live copy and README cross-check found no unlisted visitor-reliable claim.

## Clean-checkout gates

- `npm ci`: passed; 24 packages installed and 0 vulnerabilities reported.
- `npm test`: **43/43 passed** in 1.1 minutes.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm audit --omit=dev`: passed with 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh`: passed after creating its required output directory; HTTP 200, correct title and language, one H1, one main landmark, no missing alt text, no unlabeled buttons, and no console errors. Evidence: [verify.json](verification-artifacts/verify-url-5/verify.json).

## Candidate and deployment identity

The checked-out HEAD was the requested candidate. Live files matched the candidate production output byte for byte:

| File | Live SHA-256 | Result |
| --- | --- | --- |
| `index.html` | `ffba8656c68029be13069e04e646494582ef61ba8f540993cdc0b4cb32350315` | Match |
| `app-DorSZahL.js` | `2ff529842e2544e5ce873f1303a18dba07bc3aa46da7bfcf8e13c07124fe60b4` | Match |
| `app-BryEukPc.css` | `5d1de63b163c34f9138c86d6390ff5616b71b5d86bb18e58fa3c8cdc2f8c3eaa` | Match |
| `terrain-ledger-PWEQjYm4.webp` | `a27411c38273937716ce5ecc56b25a65ae3035133ad30c2464c7104c414e62f2` | Match |
| `sw.js` | `cb46fd6700b6acc45a5567b40fe53694c0ab0e4fd2c95335dc81589794080c10` | Match |
| `atkinson.ttf` | `7fb917c89019896d0b52ee84b7cbb3304c18cb90b19a62f5e32712bd23e97669` | Match |

Manifest, icons, social image, offline page, 404 page, robots file, and sitemap also matched by byte and hash.

## End-to-end product behavior

- Normal entry: adding $12.34 with the literal note `Coffee & snack <QA>` updated the sample from $82.80 to $95.14 and safely rendered the note as text.
- Boundaries: $0.01 and $10,000,000 were accepted. Zero and $10,000,000.01 were rejected with “Enter an amount from 0.01 to 10,000,000.” A valid value after an error cleared the error and saved correctly.
- Recovery: deleting the maximum-boundary entry changed the total back to $95.15; **Undo** restored it and it remained after reload. **Reset demo** returned to $82.80 and three sample entries.
- Export: JSON contained the $250 setting and three entries. CSV had the expected quoted header and four lines.
- Import: malformed data was rejected without replacing the sample. The repository suite separately proved valid replacement import.
- Persistence: a $7.77 demo entry survived closing the tab and opening the demo in a new tab in the same browser context; reset restored the shipped sample.
- Isolation: real and demo data use separate IndexedDB databases. The live sample created only `spend-pulse-demo-v1`; the automated isolation flow also preserved real data when entering and leaving demo mode.
- Keyboard: the skip link was first after settling, had a 3 px `rgb(169, 79, 29)` outline, and moved focus to the H1. A keyboard-only setup and entry flow worked. The Import JSON focus exception remains release-blocking.

## Privacy, network, and headers

The entire live demo flow made only same-origin requests for the document, hashed JS/CSS, font, and hero image. No analytics, tracking, account, bank, billing, AI, or cloud-data request occurred. Normal routes had no console or page errors.

Live HTML responses included:

- CSP restricted to self, with `connect-src 'self'`, `object-src 'none'`, and `frame-ancestors 'none'`.
- HSTS: `max-age=10886400; includeSubDomains; preload`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- Permissions policy disabling camera, microphone, geolocation, and payment.

Hashed JS, CSS, and image assets returned `public, max-age=31536000, immutable`. HTML, manifest, service worker, and other unversioned files revalidate after 30 seconds. All discovered links returned 200 or were explicit `mailto:` links. An unknown route returned a designed HTTP 404; the browser’s expected failed-document network console message on that intentional 404 was not counted as an application error.

This is a static PWA with no product API, unlock call, sign-in, or backend. Rate-limit/429, concurrency, server persistence, health identity, consumer package, and Entra tenant checks are not applicable.

## PWA and offline behavior

- The live service worker controlled the page under cache `spend-pulse-shell-v5`.
- After one visit, an offline reload of `/?demo=1` returned the demo with its sample data and `navigator.onLine === false`.
- `registration.update()` completed against the live deployment with the current worker active and no waiting update.
- A local production-build harness served a changed service-worker byte without editing the product. `skipWaiting` and `clients.claim` activated it, and the app displayed “An update is ready. Reload to use it.” No console or page error occurred.
- Manifest fields, 192/512/maskable icons, standalone display, start URL, and themed colors are present.

## Accessibility and responsive checks

- Playwright AxeBuilder scanned `/`, `/?demo=1`, `/settings`, `/privacy`, `/terms`, `/missing-page`, and `/404.html` in light and dark modes: **0 serious/critical findings and 0 findings at any impact level**.
- Each scanned route had one H1 and one main landmark. Titles were route-specific.
- Desktop and 390 × 844 mobile layouts were exercised. Mobile had `innerWidth === scrollWidth === 390`, including the demo.
- At 200% text, the repository test found no horizontal overflow and core links retained 44 px targets.
- All visible native controls and links checked at 390 px met the target baseline. The clipped file input is excluded from that visual-size result and is the documented focus defect.
- `prefers-reduced-motion: reduce` matched and produced no running CSS animations on the cold mobile screen.

## Performance and budgets

The production build produced:

- JavaScript: 30.10 kB raw / **9.68 kB gzip**.
- CSS: 17.11 kB raw / **4.64 kB gzip**.
- Self-hosted font: 54.35 kB.
- Hero image: 130.94 kB.

All asset budgets pass. Mobile Lighthouse on the live URL scored **97 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO**. Lab metrics were FCP 1.04 s, LCP 1.97 s, TBT 157 ms, CLS 0, and 219.4 kB transferred. Event Timing measured the quick-add interaction at 48 ms. Evidence: [Lighthouse JSON](verification-artifacts/lighthouse-live-mobile-5.json).

## Defects by severity

- Critical: none.
- High: claim tests for notification permission and reminder scheduling bypass the required demo entry/storage namespace.
- Medium: Import JSON has no visible keyboard focus indication because focus lands on a clipped file input and is not reflected on its visible label.
- Low: none.

## Required next steps

1. Run both notification claim tests through `/settings?demo=1` and assert they use only `spend-pulse-demo-v1`.
2. Reflect `#import-file:focus-visible` on the visible label, or use a focusable visible import button that opens the picker, then add a keyboard regression test that checks the visible indicator.
3. Rerun all 11 exact claim commands, the full suite/build, the live keyboard check, and deployment byte comparison before release.
