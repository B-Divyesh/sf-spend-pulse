# Independent verification 3 — PASS

**Candidate:** `f582afaba9766a2997c389e2549e8e73c1ae39df` (`main`)  
**Verified:** 2026-08-28 UTC  
**Live URL:** https://spend-pulse.sociobot.in

## Decision

**PASS.** This is an offline, local-first weekly discretionary-spend pace check, matching the researched smallest useful product. The live deployment is byte-identical to this candidate for all publicly served application artifacts checked.

## Required first-read and demo check

Cold-opening the live home page answers the three required questions in plain language:

- **What:** “Keep weekly spending on pace” / “A private weekly spending check.”
- **For whom:** “For people who want a quick budget check without another finance account.”
- **First action:** the visible first-screen link is **Try it with sample data**, with the adjacent result “See a filled week. Your data stays untouched.”

The action opens `/demo` in one click. It immediately displays a realistic $250 week with Lunch with Sam, Groceries, and Train and coffee, and retains the persistent “Demo — sample data, nothing is saved” bar with Reset demo and Start for real. This passes the plain-words and demo-sandbox gates.

## Clean-clone checks

`npm ci` completed (24 packages; npm reported 0 vulnerabilities). All declared claim commands were then run individually against the Playwright demo entry point and passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `pace-check` | `npm test -- --grep @claim:pace-check` | PASS |
| `data-export` | `npm test -- --grep @claim:data-export` | PASS |
| `data-import` | `npm test -- --grep @claim:data-import` | PASS |
| `data-clear` | `npm test -- --grep @claim:data-clear` | PASS |
| `demo-reset` | `npm test -- --grep @claim:demo-reset` | PASS |
| `notification-permission` | `npm test -- --grep @claim:notification-permission` | PASS |
| `on-device-reminder` | `npm test -- --grep @claim:on-device-reminder` | PASS |

One preliminary, non-required combined-grep invocation transiently reported `demo-reset` failed; its required isolated command passed immediately afterwards, and the clean complete suite also passed. This was not reproducible, but is recorded for transparency.

Additional local gates:

- `npm test`: **27/27 passed** in 48.0 seconds, including all claims, invalid input/import recovery, undo persistence, 390px/200% reflow, both-theme axe checks, and the service-worker shell check.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; produced `dist/`.
- Production bundles: JS 28,840 bytes raw / 9,500 bytes gzip; CSS 16,978 bytes raw / 4,610 bytes gzip; self-hosted font 54,348 bytes; hero WebP 130,944 bytes. Each is inside the stated static/PWA budgets.

## Independent live product exercise

In fresh live Chromium contexts, the demo started at **$82.80**. The $10 quick-add updated it to **$92.80**. A $0 entry was rejected with “Enter an amount from 0.01 to 10,000,000.” A $0.01 entry updated it to **$92.81**; deleting it removed it, and Undo restored it. CSV export downloaded `spend-pulse-entries.csv`.

The live app has no console or page errors during normal home/demo/settings/privacy/terms flows. The designed 404 has HTTP 404; its browser console has the expected failed-resource message caused by that intentional HTTP status, with no page exception.

At 390px, document and body width were both exactly 390px. Keyboard Tab reaches the skip link, wordmark, nav, demo action, and setup controls in order; each examined focus state used a visible `rgb(169, 79, 29) solid 3px` outline. Mobile header/footer targets measured at least 44×44 px. With reduced motion enabled, the pace-panel transition duration was `0.00001s`.

Live axe-core checks found **zero violations** in either light or dark demo mode; route checks for `/`, `/demo`, `/settings`, `/privacy`, `/terms`, and `/not-a-route` found zero serious/critical violations. `/opt/fleet/lib/verify-url.sh` also passed: HTTP 200, title, `lang=en`, one h1, main landmark, no image missing alt, no unnamed buttons, and no console/page errors.

## PWA, privacy, deployment, and policy checks

- Fresh live `/demo` was controlled by `https://spend-pulse.sociobot.in/sw.js`, had cache `spend-pulse-shell-v4`, and reloaded offline successfully with the demo heading and banner present. An explicit `registration.update()` completed with no waiting/installing error.
- The live normal/demo flow made only same-origin requests. Source review and network capture found no analytics, account, bank, payment, cloud data, or runtime API call. Data uses the documented separate real/demo IndexedDB databases. This static site has no server-side/API endpoint, so a 429/rate-limit threshold is not applicable; it has no sign-in, so Entra tenant validation is not applicable.
- HTTPS headers include CSP restricting all sources to self (plus data images), HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a restrictive Permissions-Policy. Hashed JS/CSS use `Cache-Control: public, max-age=31536000, immutable`. All home-page internal links and the factory external link returned 200; the intentional unknown route returned 404.
- SHA-256 matched between local `dist/` and live for `index.html`, `assets/app-s_0SevFs.js`, `assets/app-B733XabF.css`, `assets/terrain-ledger-PWEQjYm4.webp`, `sw.js`, and `manifest.webmanifest`. `staticwebapp.config.json` is correctly present in `dist/` but is not publicly served (404), as expected for deployment configuration.
- Lighthouse’s live mobile run generated 98 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO with FCP 1.2s, LCP 1.8s, TBT 150ms, CLS 0. The Chromium process then crashed while capturing Lighthouse’s final full-page screenshot (`TARGET_CRASHED`), so treat these generated scores as supplemental; Playwright remained stable and all functional/a11y checks passed.

## Defects

No release-blocking, high, medium, or low product defects found.

The one transient combined-grep claim-test observation above is non-reproducible: the exact declared command and full clean suite both pass. It is an observation, not a current release failure.
