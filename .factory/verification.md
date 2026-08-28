# Independent product verification — FAIL

Verified on 2026-08-28 UTC.

- Candidate: `a6aabb8dc2589472923e955fda242259aac9f253`
- Repository: `https://github.com/B-Divyesh/sf-spend-pulse.git`, branch `main`
- Live URL: `https://spend-pulse.sociobot.in`
- Artifact class: offline PWA
- Result: **FAIL — do not release this candidate**

The deployment is available and byte-for-byte matches the candidate, so this is not a deployment-only failure. Product and contract defects remain.

## Release-blocking findings

### High — the core pace result is unreadable in dark mode

On `/demo` with `prefers-color-scheme: dark`, axe reports a serious `color-contrast` violation across five core result nodes. The pace heading, day marker, spent amount, under-pace amount, and remaining amount use `#151b19` on `#0e1512`, measured at 1.05:1. Expected ratios are 3:1 for large text and 4.5:1 for normal text.

This violates the explicit requirement for no serious/critical axe findings and contrast in both themes. The normal light-theme axe checks miss it.

Evidence: [dark-mode screenshot](verification-artifacts/live-dark-demo-contrast.png).

### High — “Undo” does not undo an entry deletion

Reproduction on a fresh `/demo`:

1. Delete “Lunch with Sam”.
2. The app shows `Entry deleted. Undo`.
3. Press `Undo`.
4. The entry remains deleted and the notice does not change.

The Undo button is inserted into the notice after event handlers are bound, so it has no click handler. This is direct local-data loss behind a control that promises recovery. It also violates the product's recorded interaction rule that destructive actions are reversible.

Evidence: [inert Undo screenshot](verification-artifacts/defect-undo-inert.png).

### High — invalid backup import can replace good data and break the app

Import validation checks only a few fields before `replaceData` clears existing stores. It accepts incomplete or invalid settings.

- Importing `{"settings":{"weeklyAllowance":100},"entries":[]}` is reported as successful, then renders `INVALID DATE`, `Day NaN of 7`, `$NaN`, and `NaN/7`.
- Importing an otherwise shaped backup with currency `X` is reported as successful, then navigation to `/demo` raises `Invalid currency code : X`; the URL changes while the old Settings DOM remains.

Because the import replaces current data before the broken state appears, this can destroy valid local records. A valid exported backup did restore successfully, and an obvious non-object such as `[]` was rejected; the structural validation boundary is the defect.

Evidence: [corrupt imported state](verification-artifacts/defect-invalid-import.png).

### Release blocker — product claims are missing from `.factory/claims.json`

All seven registered claim commands pass, but visible claim-like behaviors have no registered claim test:

- Landing/privacy: `You can export a copy or clear everything.` No claim covers clearing.
- Settings: `Importing a backup replaces data...` No claim covers JSON import/restore.
- Demo: `Reset them anytime` / `Reset demo`. No claim covers reset behavior.

The attached claims contract says every visitor-reliable claim must be registered and any unlisted claim fails verification. Manual checks found valid import/restore, clear, and demo reset working in normal cases, but that does not satisfy the required claim registry.

## Other findings

### Medium — the designed 404 route returns HTTP 200

`GET https://spend-pulse.sociobot.in/missing-page` returns `200 text/html`. The SPA displays its designed not-found screen, but `staticwebapp.config.json` has no 404 response override. Crawlers and clients cannot distinguish missing URLs from valid pages.

### Medium — mobile accessibility misses the factory touch/reflow baseline

- At a 390 px viewport with text resized to 200% (`34px` root size), document width becomes 475 px and the header navigation extends beyond the viewport.
- Visible footer links are only 18 px high; the landing privacy link and email links are about 21 px high. The factory baseline requires 44 px touch targets.

The normal-size 390 px layout has no horizontal overflow, and keyboard focus is visible and functional.

Evidence: [200% text screenshot](verification-artifacts/live-mobile-text-200.png).

### Low — declared numeric maximum is not enforced

Allowance and entry inputs declare `max="10000000"`, but forms use `novalidate` and custom submission checks only reject non-finite or non-positive values. Both an allowance and an entry of `10,000,001` were accepted.

### Low — production assets do not use immutable caching

`/assets/app.js` and `/assets/app.css` have fixed names and return `Cache-Control: public, must-revalidate, max-age=30`. This misses the performance contract's hashed, long-lived immutable asset policy. The service worker does make repeat offline use fast.

## Mandatory claim tests

`.factory/claims.json` exists. Each exact command was run separately from the clean candidate after `npm ci`:

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS, 1 test |
| `pace-check` | `npm test -- --grep @claim:pace-check` | PASS, 1 test |
| `data-export` | `npm test -- --grep @claim:data-export` | PASS, 1 test |
| `notification-permission` | `npm test -- --grep @claim:notification-permission` | PASS, 1 test |
| `on-device-reminder` | `npm test -- --grep @claim:on-device-reminder` | PASS, 1 test |

## First-read and demo test

Cold live read:

- What it does: `Keep weekly spending on pace`.
- For whom: `For people who want a quick budget check without another finance account.`
- First click: `Try it with sample data`, with `See a filled week. Your data stays untouched.` beside it.

The action is visible without scrolling at desktop and at 390 × 844 (button bottom at 706.75 px). It opens a populated $250 sample week in one click. The persistent demo bar states `Demo — sample data, nothing is saved` and offers Reset and Start for real. This gate passes.

Evidence: [desktop cold page](verification-artifacts/live-cold-desktop.png), [390 px cold page](verification-artifacts/live-cold-mobile-390.png).

## Build and repository gates

- Clean starting tree at the candidate; `npm ci`: PASS, 24 packages installed, zero audit findings.
- `npm test`: PASS, 16/16.
- `npx tsc --noEmit`: PASS.
- No lint script is provided.
- Exact `npm run build`: PASS; produced `dist/`.
- Output: JS 27.91 KB raw / 9.15 KB gzip; CSS 16.74 KB raw / 4.58 KB gzip; font 54.35 KB; hero WebP 130.94 KB.
- `npm audit --omit=dev`: PASS, zero vulnerabilities.

## End-to-end product checks

Passed normal and recovery paths:

- Created a €250.50 weekly amount, added a €12.34 `Pharmacy` entry, and verified it after reload.
- Zero allowance produced a clear `greater than zero` error and recovered after a valid value.
- Valid JSON export, clear-all confirmation, and re-import restored a $15.75 `Market` entry.
- Obvious invalid JSON/object import showed an error and retained existing data.
- Demo quick add changed $82.80 to $102.80; Reset demo restored $82.80.
- Demo and real IndexedDB namespaces remained isolated.
- CSV and JSON exports contained the expected records.
- Delete itself worked; its advertised Undo did not.

## Accessibility, keyboard, and responsive evidence

- `/opt/fleet/lib/verify-url.sh`: PASS; title, `lang=en`, one H1, main landmark, alt text, labels, and console checks passed. Report: [verify.json](verification-artifacts/verify-url/verify.json).
- Independent axe, default/light mode, desktop and 390 px on `/`, `/demo`, `/settings`, `/privacy`, `/terms`, and `/missing-page`: no serious/critical findings.
- Independent axe, dark mode: FAIL on `/demo`, one serious contrast rule affecting five core nodes.
- Keyboard-only: skip link is first, visibly focused with a 3 px outline, Enter moves focus to the H1; the demo action is reachable and Enter opens `/demo` with focus moved to its H1.
- Reduced motion: `scroll-behavior: auto`; transitions reduce to `0.01ms`; no looping or flashing motion observed.
- Normal 390 px width: 390 px document width, no horizontal overflow.
- 200% text resizing and 44 px target baseline: findings recorded above.

## Privacy, security, and network

- Fresh live demo flow, quick add, Settings, and JSON export contacted only `https://spend-pulse.sociobot.in`.
- No cookies, localStorage, or sessionStorage were created. Demo data used only `spend-pulse-demo-v1` IndexedDB.
- No analytics, trackers, bank, billing, Azure OpenAI, or Sociobot API calls were observed.
- Response headers include HSTS, CSP with `frame-ancestors 'none'`, `nosniff`, strict-origin referrer policy, and a restrictive permissions policy. No CSP or page console errors occurred on normal routes.
- There are no server-side application/API endpoints, product unlock calls, sign-in, or backend. Rate-limit burst testing and Entra authority checks are therefore not applicable.
- The brief does not benefit from an AI step; omitting AI is appropriate for this private manual habit loop.

## Live identity and PWA checks

- Live and local SHA-256 hashes match exactly for `index.html`, `assets/app.js`, `assets/app.css`, `sw.js`, and `manifest.webmanifest`.
- Live service worker is active and controlling the page with cache `spend-pulse-shell-v3`.
- Live `/demo` reloaded offline, accepted a $10 quick add offline, and retained $92.80 after another offline reload.
- A controlled local service-worker version change caused `controllerchange` and displayed `An update is ready. Reload to use it.`
- Chrome manifest inspection returned no manifest errors and `Page.getInstallabilityErrors` returned an empty list.
- All internal links and the Param Factory external link returned 200. Mail links were excluded.

## Performance

Independent Lighthouse mobile against the live URL:

| Category/metric | Result | Contract |
| --- | ---: | ---: |
| Performance | 99 | ≥ 90 |
| Accessibility | 100 | ≥ 95 (light-mode run; dark defect found separately) |
| Best practices | 100 | — |
| SEO | 100 | — |
| FCP | 1.2 s | — |
| LCP | 2.0 s | < 2.5 s |
| TBT | 50 ms | — |
| CLS | 0 | < 0.1 |
| Initial transfer | 213 KiB | Component budgets pass |

Full report: [Lighthouse JSON](verification-artifacts/lighthouse-live-mobile.json).

## Required next verification

Fix the release blockers, add claim entries and observable tests for import, clear, and demo reset, then rerun every claim command, both-theme axe checks, destructive/recovery flows, exact build, live hash comparison, PWA offline/update checks, and Lighthouse.
