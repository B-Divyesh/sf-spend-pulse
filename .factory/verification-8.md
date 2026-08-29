# Independent verification 8 — FAIL

**Candidate:** `ed56d770d5547ba5cd3c3a6dd0359393a041e8eb`

**Live URL:** https://spend-pulse.sociobot.in

**Verified:** 2026-08-29 10:42 UTC

**Scope:** fresh independent product QA against the original work order, researched brief, and attached factory contracts. Product code was not changed.

## Release decision

**FAIL.** The core product, all 11 registered claims, clean-checkout gates, live deployment identity, privacy boundary, accessibility, offline path, and performance budgets pass. One acceptance-contract defect remains: leaving demo mode through ordinary navigation does not discard the changed demo state. This violates the demo-sandbox lifecycle requirement and makes the candidate ineligible for release until repaired and retested.

## Release-blocking finding

### Medium — F-8-1: ordinary demo exit retains changed sample data

The demo-sandbox contract says leaving demo mode must discard demo data (unless the visitor explicitly keeps it as real data). The dedicated **Start for real** action correctly deletes the demo database, but the normal wordmark/home route does not.

Fresh live reproduction in a new browser context:

1. Open `/?demo=1`; add `$7.77` with note `Exit persistence probe`.
2. Press the **Spend Pulse** wordmark. The URL becomes `/` and the demo banner disappears.
3. Press **Demo** to enter `/?demo=1` again.
4. The supposedly exited change returns; the note is present and the sample total is `$90.57`, not the shipped `$82.80`.

No real data is touched, and **Start for real** does discard demo data. The defect is therefore medium severity rather than a privacy breach, but it is a direct mismatch with the mandatory demo lifecycle. Evidence: [demo-exit.json](verification-8-artifacts/demo-exit.json).

## First-read and one-click demo gate

This mandatory gate passes in a cold, storage-empty visit:

- What it does: **“Keep weekly spending on pace.”**
- For whom: **“For people who want a quick budget check without another finance account.”**
- What to click first: **“Try it with sample data,”** beside **“See a filled week. Your data stays untouched.”**

At 390 × 844, the action and all three offline/privacy/price facts end at 748.39 px, inside the first viewport. One click opens the populated `$250` sample week with `$82.80` spent and three realistic entries. The persistent demo bar offers **Reset demo** and **Start for real**.

Evidence: [cold desktop](verification-8-artifacts/live-cold-desktop.png), [cold 390 px dark/reduced-motion](verification-8-artifacts/live-cold-mobile-dark-reduced.png), and [live QA data](verification-8-artifacts/live-qa.json).

## Mandatory claims gate

`.factory/claims.json` exists with 11 entries. Every exact command was attempted before broader QA. In the untouched checkout, the pre-install attempts could not load the declared local `@playwright/test` package, so no test body ran. After the required lockfile install with `npm ci`, every exact manifest command was rerun independently against the production-build demo entry point and passed:

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

The suite also proves exactly one tagged test per registered claim. Landing, app, settings, privacy, terms, README, and demo documentation were cross-checked. No other unlisted visitor-reliable claim was found. F-8-1 is an uncovered lifecycle path rather than a failure of the narrower registered claim that demo changes never touch real data.

## Clean-checkout quality gates

- `npm ci`: PASS; 24 packages installed, 0 vulnerabilities.
- `npm test`: PASS; **46/46** Playwright tests in 1.3 minutes.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (the declared lint command is `tsc --noEmit`).
- Exact `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- Factory `verify-url.sh`: PASS; HTTP 200, 738 ms load, correct title and `lang=en`, one H1/main, complete image/button labels, and no browser errors. Evidence: [verify.json](verification-8-artifacts/verify-url-live/verify.json).

Production component sizes pass:

| Component | Result | Budget |
| --- | ---: | ---: |
| JS | 30,136 B raw / 9,697 B gzip | ≤ 200 KB |
| CSS | 17,202 B raw / 4,668 B gzip | ≤ 50 KB |
| Font | 54,348 B | ≤ 120 KB |
| First-screen WebP | 130,944 B | ≤ 300 KB |

## Live end-to-end exercise

The sample began at `$82.80`; a `$10` quick add changed it to `$92.80`. Zero and `$10,000,000.01` were rejected with the allowed range. `$0.01` was accepted and produced `$92.81`. An empty/invalid date produced **“Choose a valid date, then add the entry again.”** and recovered after a valid date.

A literal `<img src=x onerror=alert(1)>` note remained text, executed nothing, and persisted after reload and in a second tab. Delete, Undo, JSON export, CSV export, malformed-import rejection without data loss, and reset to the original `$82.80` all passed. JSON and CSV contained the expected settings and five entry rows.

A separate context created a real `$125` weekly amount, changed demo data, and used **Start for real**. The real amount remained `$125`, the demo-only entry did not leak, and distinct `spend-pulse-real-v1` and `spend-pulse-demo-v1` IndexedDB databases were observed. Notification permission was called zero times on load and exactly once after **Allow and test notification**.

The smallest useful weekly-spending loop therefore works; only the alternate demo-exit lifecycle fails.

## Accessibility, responsive behavior, and motion

- Twelve independent Axe scans across `/`, demo, settings, privacy, terms, and the missing route in light and dark modes found **0 violations at any impact level**.
- Keyboard-only use starts at the visible skip link with a `3px` contrast focus ring. The sample action has the same focus treatment, and client route changes focus the H1.
- Every visible mobile link, button, input, select, and import label measured at least 44 × 44 CSS px.
- The 390 px layout has no horizontal overflow. The local 200% text test passes; browser-level 200% live zoom retains all content without layout-width overflow.
- Under `prefers-reduced-motion: reduce`, there were zero running animations and the longest transition was 0.00001 s.
- Normal routes produced no console or page errors. The designed unknown route correctly returns HTTP 404.

Evidence: [keyboard focus](verification-8-artifacts/live-keyboard-focus.png), [200% mobile](verification-8-artifacts/live-mobile-200-percent.png), and [route crawl](verification-8-artifacts/live-routes.json).

## Privacy, headers, routing, and applicability

The recorded cold-home → demo → entry → persistence → settings → export/import → reset flow made 44 requests across 19 unique URLs. Every request was same-origin. There were no analytics, tracking, account, bank, billing, AI, or cloud-data calls, and no cookies, localStorage keys, or sessionStorage keys.

The main document returns CSP restricted to self with `connect-src 'self'` and `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a permissions policy disabling camera, microphone, geolocation, and payment. HTML and `sw.js` use `public, must-revalidate, max-age=30`; hashed assets use `public, max-age=31536000, immutable`.

All published routes, metadata, assets, sitemap/robots files, and the Param Factory external link returned 200. The designed missing route returned 404. Mail links are explicit. Every app route has `lang=en`, one H1/main, route-specific title/canonical metadata, and no 390 px overflow.

This is a static local-first PWA with no server-side product endpoint, unlock call, account, payment, sign-in, CLI, or library API. API allowance/429, backend concurrency/persistence/health, package-consumer, billing, and Entra authority tests are not applicable. The brief's manual private spending check has no missed AI leverage.

## Deployment identity

The exact local production build and live deployment match byte for byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `b0e7803cb288f89301a7d4709cc080836284b8db82801479f678dc2a35fff7ac` |
| `sw.js` | `cb46fd6700b6acc45a5567b40fe53694c0ab0e4fd2c95335dc81589794080c10` |
| `manifest.webmanifest` | `4fe384dabef1cd58c93517941ac031f3e731d79ed0cdc1d01f780b4f6bf52345` |
| `404.html` | `857496bdb92433105b375c485a62c882e0b366fa9420e1adb39ae8591c6048d1` |
| `assets/app-vzRtLSax.js` | `ecdddf6a119da9366818994ef9db93772d9e30ae07714eac3e6ca6a8cadc15d8` |
| `assets/app-DiaoErqL.css` | `32a4130e69af84212251a5d14eb1ce04505ec0a19a58b194b00e34e635c61184` |
| `assets/app-vzRtLSax.js.map` | `2d1203968a9016ce13743657a3f8ce267de7f937f285c675e0a5a04bf6804dbd` |
| `assets/terrain-ledger-PWEQjYm4.webp` | `a27411c38273937716ce5ecc56b25a65ae3035133ad30c2464c7104c414e62f2` |

Candidate `ed56d77` changes only factory documentation/evidence after product repair `4ecd22d`; the production output above is therefore the candidate's product output. The earlier deployment-only failure is not reproduced.

## PWA and performance

The live page has no Chrome installability or manifest errors. `/sw.js` controls the page and uses versioned cache `spend-pulse-shell-v5`, including hashed JS, CSS, and hero assets. `registration.update()` completed cleanly. A verifier-only worker URL activated a new controller and surfaced **“An update is ready. Reload to use it.”** An offline `$5` entry changed `$82.80` to `$87.80` and remained `$87.80` after another offline reload.

Mobile Lighthouse 12.8.2 evidence: [lighthouse-live-mobile.json](verification-8-artifacts/lighthouse-live-mobile.json).

| Measure | Result | Contract |
| --- | ---: | ---: |
| Performance | 99 | ≥ 90 |
| Accessibility | 100 | ≥ 95 |
| Best practices | 100 | — |
| SEO | 100 | — |
| FCP | 1.11 s | — |
| LCP | 1.96 s | < 2.5 s |
| TBT | 104 ms | lab interaction proxy |
| CLS | 0 | < 0.1 |

### Low — F-8-2: hero has no responsive source variants

The hero is an optimized 130,944-byte WebP with explicit dimensions and stays within budget, but it has no `srcset`/`sizes`. Lighthouse estimates about 100 KiB avoidable transfer at its mobile render size. This does not break the performance gate (score 99, LCP 1.96 s) but misses the attached responsive-image guidance.

## Defects by severity

- Critical: none.
- High: none.
- Medium: **F-8-1**, changed sample state survives an ordinary exit from demo mode.
- Low: **F-8-2**, first-screen hero lacks responsive source variants.

## Required follow-up

Delete/reset the demo database whenever navigation changes from demo mode to a non-demo route, not only when **Start for real** is pressed. Add a browser test that changes demo data, exits via the wordmark and at least one non-demo navigation link, re-enters the demo, and expects the shipped `$82.80` sample. Then rerun every claim command, the full suite/build, live deployment hash comparison, and offline/update checks.
