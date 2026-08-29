# Independent verification 6 — PASS

**Candidate:** `a33e56a952822b4a92e6cc57355ec8a2827b8d34`  
**Live URL:** https://spend-pulse.sociobot.in  
**Verified:** 2026-08-29 07:25 UTC  
**Scope:** independent release QA against the original work order, researched brief, and factory contract. Product code was not changed.

## Release decision

**PASS.** The deployed PWA matches the candidate build byte for byte. The one-click demo, manual spending loop, data recovery, privacy boundaries, accessibility, offline behavior, update path, and performance gates all passed. This fresh verification does not reproduce a deployment-only failure or find a release-blocking product defect.

## First-read and demo gate

A cold desktop visit answers all three required questions on the first screen:

- What it does: **“Keep weekly spending on pace.”**
- For whom: **“For people who want a quick budget check without another finance account.”**
- What to click first: **“Try it with sample data,”** with “See a filled week. Your data stays untouched.” beside it.

At 390 × 844, the action and all three privacy/offline/price facts end above 749 px. One click opens `/?demo=1`, immediately shows the populated $250 week and three realistic entries, and retains the “Demo — sample data, nothing is saved” bar with **Reset demo** and **Start for real**.

Evidence: [cold desktop screenshot](verification-artifacts/live-cold-desktop.png), [mobile dark/reduced-motion and 200% text screenshot](verification-artifacts/live-mobile-dark-reduced-6.png), and [independent live results](verification-artifacts/live-qa-6.json).

## Mandatory claim gate

`.factory/claims.json` exists and lists 11 claims. In the untouched clean checkout, the commands initially stopped before selecting tests because dependencies had not yet been installed (`ERR_MODULE_NOT_FOUND: @playwright/test`). After the required clean `npm ci`, every exact command was rerun as its own process against the production-build demo entry point and passed:

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS |
| `local-only` | PASS |
| `demo-sandbox` | PASS |
| `sample-demo` | PASS |
| `pace-check` | PASS |
| `data-export` | PASS |
| `data-import` | PASS |
| `data-clear` | PASS |
| `demo-reset` | PASS |
| `notification-permission` | PASS |
| `on-device-reminder` | PASS |

Each selected exactly one `@claim:<id>` browser test. The complete suite's registry check also passed. Visible claims on the live site and in README map to these entries; no unlisted visitor-reliable claim was found. Individual logs and the compact status list are under `verification-artifacts/`.

## Clean-checkout gates

- `npm ci`: PASS; 24 packages installed, 0 vulnerabilities.
- `npm test`: PASS, **44/44** Playwright tests in 1.2 minutes.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm audit --omit=dev`: PASS, 0 vulnerabilities.
- Exact `npm run build`: PASS and produced `dist/`.
- Production sizes: JS 30.10 kB raw / 9.69 kB gzip; CSS 17.20 kB raw / 4.66 kB gzip; font 54.35 kB; hero WebP 130.94 kB. All component budgets pass.
- `/opt/fleet/lib/verify-url.sh`: PASS after creating its required output directory: HTTP 200, correct title and `lang=en`, one H1, main landmark, no missing alt text or unnamed buttons, no console errors, 632 ms load. Evidence: [verify.json](verification-artifacts/verify-url-live/verify.json).

## Independent end-to-end exercise

The live demo started at $82.80. A $10 quick add changed it to $92.80. Zero and $10,000,000.01 were rejected with recovery text; $0.01 was accepted. A literal `<img src=x onerror=alert(1)>` note rendered as text and created no injected element. Delete, Undo, reload, and a second tab preserved the entry. JSON and CSV exports contained the expected setting and rows. A malformed backup was rejected without replacing data. Reset restored $82.80 and the original three entries.

The explicit notification check made zero permission calls on page load and one only after **Allow and test notification** was pressed. It used only `spend-pulse-demo-v1`. The repository's deterministic clock tests separately passed daily due, weekly due, and weekly-not-due reminder behavior.

## Accessibility, keyboard, responsive behavior, and motion

- Independent AxeBuilder scans on `/`, `/?demo=1`, `/settings`, `/privacy`, `/terms`, and `/missing-page`, at 390 px in both light and dark modes: **0 serious/critical findings and 0 findings at any impact level**.
- Keyboard-only: the skip link is first; it targets `#main`; the demo action opens the demo with focus moved to its H1. Both use a visible `rgb(169, 79, 29) solid 3px` focus outline.
- The repaired Import JSON control focuses `#import-file` and shows the same 3 px outline on its visible label.
- Every visible link, button, input, select, and import label measured at least 44 × 44 px on the five main routes at desktop and 390 px.
- The 390 px page has no horizontal overflow. At 200% root text, it remains 390 px wide without content loss.
- With reduced motion, no animations run and transitions reduce to `0.00001s`.

## Privacy, security, routing, and deployment identity

The full cold-home → demo → entry → settings → exports → offline flow made 25 requests across six unique URLs, all at `https://spend-pulse.sociobot.in`. There were no analytics, tracking, account, bank, billing, AI, or cloud-data requests; no cookies, localStorage, sessionStorage, console errors, or page errors. Visiting the real homepage creates an empty real IndexedDB, but the demo left it at `settings: null` and zero entries while using its separate demo database.

Browser response headers confirmed CSP restricted to self (including `connect-src 'self'` and `frame-ancestors 'none'`), HSTS, `nosniff`, strict-origin referrer policy, and a permissions policy disabling camera, microphone, geolocation, and payment. Hashed assets return `public, max-age=31536000, immutable`; HTML returns `must-revalidate, max-age=30`. Unknown routes return the designed page with HTTP 404. All published routes, robots, sitemap, and the external Param Factory link returned 200; mail links are explicit.

Fresh local/live SHA-256 pairs matched exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c27994894e52bd6e7b891279633a77e24bcf214dc49cd466c9e6ad929c9d427b` |
| `app-CmWiDC9o.js` | `268a0226ea9e0b8db2e313652446034bd2e658fbd2781183bec2e757bb45cac4` |
| `app-DiaoErqL.css` | `32a4130e69af84212251a5d14eb1ce04505ec0a19a58b194b00e34e635c61184` |
| `sw.js` | `cb46fd6700b6acc45a5567b40fe53694c0ab0e4fd2c95335dc81589794080c10` |
| `manifest.webmanifest` | `4fe384dabef1cd58c93517941ac031f3e731d79ed0cdc1d01f780b4f6bf52345` |
| `404.html` | `857496bdb92433105b375c485a62c882e0b366fa9420e1adb39ae8591c6048d1` |

## PWA and performance

The live page is controlled by the activated `/sw.js` with versioned cache `spend-pulse-shell-v5`. `registration.update()` completed with no pending error. The update event displays “An update is ready. Reload to use it.” An offline demo reload worked; a $5 offline entry persisted through another offline reload. Chrome reported no installability errors.

Mobile Lighthouse evidence: [JSON report](verification-artifacts/lighthouse-live-mobile-6.json).

| Measure | Result | Contract |
| --- | ---: | ---: |
| Performance | 99 | ≥ 90 |
| Accessibility | 100 | ≥ 95 |
| Best practices | 100 | — |
| SEO | 100 | — |
| FCP | 1.0 s | — |
| LCP | 2.0 s | < 2.5 s |
| TBT | 80 ms | — |
| CLS | 0 | < 0.1 |
| Initial transfer | 214 KiB | Component budgets pass |

## Applicability and defects by severity

This is a static, local-first PWA with no server-side product endpoint, unlock call, backend, account, payment, sign-in, CLI, or library API. Rate-limit/429, server concurrency/persistence/health, consumer-package, billing, and Entra authority checks are not applicable. The brief's manual, private spending loop does not benefit from an AI feature.

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
