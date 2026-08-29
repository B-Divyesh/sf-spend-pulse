# Independent verification 7 — PASS

**Candidate:** `0c57e39586ef2283dc3327d64d5c54c1da6f8ce5`

**Live URL:** https://spend-pulse.sociobot.in

**Verified:** 2026-08-29 08:55 UTC

**Scope:** fresh independent product QA against the original work order, researched brief, and factory contract. Product code was not changed.

## Release decision

**PASS.** The deployed PWA matches the candidate production build byte for byte. The required one-click demo, weekly spending loop, local/demo isolation, recovery paths, accessibility, privacy boundary, offline behavior, service-worker update path, and performance budgets pass. A previously reported deployment-only failure is not present in fresh evidence.

There are no release-blocking defects. Two low-severity documentation/semantics issues are recorded below.

## First-read and one-click demo gate

A cold, storage-empty visit answers all three questions on the first screen:

- What it does: **“Keep weekly spending on pace.”**
- For whom: **“For people who want a quick budget check without another finance account.”**
- What to click first: **“Try it with sample data,”** beside “See a filled week. Your data stays untouched.”

At 390 × 844, the sample action and all three offline/privacy/price facts end at 748.39 px, inside the first viewport. One click opens `/?demo=1`, immediately shows a $250 sample week, an $82.80 total, and entries for Lunch with Sam, Groceries, and Train and coffee. The persistent banner says **“Demo — sample data, nothing is saved”** and provides **Reset demo** and **Start for real**.

Evidence: [cold desktop](verification-7-artifacts/live-cold-desktop.png), [cold 390 px dark/reduced-motion](verification-7-artifacts/live-cold-mobile-dark-reduced.png), and [live QA results](verification-7-artifacts/live-qa.json).

## Mandatory claims gate

`.factory/claims.json` exists with 11 entries. As required, every exact listed command was attempted before broader QA. The pre-install attempt could not load the declared local Playwright package because a clean clone has no `node_modules`; no test body ran. After the required lockfile install with `npm ci`, every exact command was rerun separately and selected one test:

| Claim | Exact command result |
| --- | --- |
| `offline-reload` | PASS — 1/1 |
| `local-only` | PASS — 1/1 |
| `demo-sandbox` | PASS — 1/1 |
| `sample-demo` | PASS — 1/1 |
| `pace-check` | PASS — 1/1 |
| `data-export` | PASS — 1/1 |
| `data-import` | PASS — 1/1 |
| `data-clear` | PASS — 1/1 |
| `demo-reset` | PASS — 1/1 |
| `notification-permission` | PASS — 1/1 |
| `on-device-reminder` | PASS — 1/1 |

The full suite's registry check confirms exactly one tagged browser test per claim. Landing, settings, privacy, terms, README, and demo documentation were cross-checked; no unlisted visitor-reliable product claim was found.

## Clean-checkout quality gates

- `npm ci`: PASS; 24 packages installed and 0 vulnerabilities.
- `npm test`: PASS; **44/44** Playwright tests in 1.2 minutes.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- Exact `npm run build`: PASS; `dist/` produced.
- `/opt/fleet/lib/verify-url.sh`: PASS; HTTP 200, 874 ms load, correct title and `lang=en`, one H1, main landmark, no missing alt text, no unnamed buttons, and no console/page errors. Evidence: [verify.json](verification-7-artifacts/verify-url-live/verify.json).

Production component sizes all pass: JS 30,130 bytes raw / 9,701 gzip (budget 200 KB); CSS 17,202 raw / 4,668 gzip (50 KB); font 54,348 bytes (120 KB); first-screen WebP 130,944 bytes (300 KB).

## Independent live end-to-end exercise

The demo began at $82.80. A $10 quick add changed it to $92.80. Zero and $10,000,000.01 were rejected with the allowed range; $0.01 was accepted and changed the total to $92.81. A literal `<img src=x onerror=alert(1)>` note stayed text, executed nothing, and persisted after reload and in a second tab. Delete, Undo, JSON export, CSV export, malformed-import rejection without data loss, and demo reset all passed. Export evidence contained the expected setting and five entry rows.

A separate context created a real $125 weekly amount, changed demo data, and used **Start for real**. The real amount remained $125, the demo-only entry did not leak, and browser storage showed distinct `spend-pulse-real-v1` and `spend-pulse-demo-v1` IndexedDB databases. Notification permission was called zero times on load and exactly once after **Allow and test notification**.

The smallest useful product therefore works end to end: set one amount, record spending, read pace, preserve/recover entries, own the data, and opt into a reminder check.

## Accessibility, responsive behavior, and motion

- Independent AxeBuilder scans of `/`, `/?demo=1`, `/settings`, `/privacy`, `/terms`, and `/missing-page` at 390 px in light and dark modes: **0 violations at any impact level**, including 0 serious/critical.
- Keyboard-only: the skip link is first and has a visible `rgb(169, 79, 29) solid 3px` focus ring. The sample action has the same focus treatment; route navigation moves focus to the new H1.
- Every visible mobile link, button, input, select, and import label measured at least 44 × 44 CSS px.
- The 390 px layout has no horizontal overflow. The repository's 200% text test passes; a live browser-level 200% scale also retains all content without layout-width overflow.
- Under `prefers-reduced-motion: reduce`, there are zero running animations and the longest transition is 0.00001 s.
- Normal live routes produced no console errors or page errors. The deliberate `/missing-page` request returns a designed HTTP 404.

Evidence: [keyboard focus](verification-7-artifacts/live-keyboard-focus.png), [200% mobile](verification-7-artifacts/live-mobile-200-percent.png), and [full live QA JSON](verification-7-artifacts/live-qa.json).

## Privacy, headers, routing, and applicability

The recorded cold-home → demo → entry → persistence → settings → export/import → reset flow made 44 requests across 19 unique URLs. Every request was to `https://spend-pulse.sociobot.in`; there were no analytics, tracking, account, bank, billing, AI, or cloud-data calls. No cookies, localStorage keys, or sessionStorage keys were created.

The browser's main-document response included CSP restricted to self with `connect-src 'self'` and `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a permissions policy disabling camera, microphone, geolocation, and payment. HTML and `sw.js` return `public, must-revalidate, max-age=30`; hashed JS returns `public, max-age=31536000, immutable`.

All published routes, `robots.txt`, `sitemap.xml`, the manifest, and the external Param Factory link returned 200. The designed unknown route returned 404. Mail links and in-page fragments were explicit.

This is a static local-first PWA with no server-side product endpoint, unlock call, backend, account, payment, sign-in, CLI, or library API. API allowance/429, backend concurrency/persistence/health, package-consumer, billing, and Entra authority tests are therefore not applicable. The brief's manual private spending check has no missed AI leverage.

## Deployment identity

The exact local production files and live files have matching SHA-256 hashes:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `865e6cd3521b8143e2121d913e5b8adf90d4e1ed9ccf2b2dd74f8065efa7beb5` |
| `app-BEe7-jaw.js` | `76b9a591c3607a6d50d323afa175f5d9595e382c1e9215733ca43e781d57d818` |
| `app-DiaoErqL.css` | `32a4130e69af84212251a5d14eb1ce04505ec0a19a58b194b00e34e635c61184` |
| `terrain-ledger-PWEQjYm4.webp` | `a27411c38273937716ce5ecc56b25a65ae3035133ad30c2464c7104c414e62f2` |
| `sw.js` | `cb46fd6700b6acc45a5567b40fe53694c0ab0e4fd2c95335dc81589794080c10` |
| `manifest.webmanifest` | `4fe384dabef1cd58c93517941ac031f3e731d79ed0cdc1d01f780b4f6bf52345` |
| `404.html` | `857496bdb92433105b375c485a62c882e0b366fa9420e1adb39ae8591c6048d1` |

The candidate only changes factory documentation/evidence after the deployed product repair, and the production build output above is the deployed output.

## PWA and performance

The activated `/sw.js` controls the page and uses versioned cache `spend-pulse-shell-v5`, including hashed JS, CSS, and the hero asset. `registration.update()` completed with no waiting/installing error. Re-registering the same live worker under a verifier-only update URL activated the new controller and displayed **“An update is ready. Reload to use it.”** Offline demo reload worked; a $5 offline entry changed $82.80 to $87.80 and remained $87.80 after another offline reload. Chrome reported no installability errors.

Mobile Lighthouse evidence: [lighthouse JSON](verification-7-artifacts/lighthouse-live-mobile.json).

| Measure | Result | Contract |
| --- | ---: | ---: |
| Performance | 99 | ≥ 90 |
| Accessibility | 100 | ≥ 95 |
| Best practices | 100 | — |
| SEO | 100 | — |
| FCP | 1.02 s | — |
| LCP | 1.84 s | < 2.5 s |
| TBT | 98 ms | lab interaction proxy |
| CLS | 0 | < 0.1 |
| Initial transfer | 219,447 bytes | component budgets pass |

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low — **F-7-1:** the setup and settings weekly-amount inputs declare `min="1"`, while validation text and runtime logic accept `$0.01`. A `$0.01` weekly amount works, but native validity reports `rangeUnderflow`, so assistive technology can announce the wrong minimum. Align both `min` attributes to `0.01` in a future repair.
- Low — **F-7-2:** `.factory/design.md` names `public/assets/terrain-ledger.webp`, but the authored asset is `src/assets/terrain-ledger.webp` and Vite emits a hashed `dist/assets/terrain-ledger-*.webp`. Correct the provenance path when documentation is next edited.
