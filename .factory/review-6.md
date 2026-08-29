# Adversarial first-read review 6 — Spend Pulse

**Date:** 2026-08-29 UTC

**Target:** https://spend-pulse.sociobot.in

**Reviewed revision:** `0c307e7d878c6dc1b3ef68ad80b974abc45f932c`
**Verdict:** **PASS** — zero findings remain, no listed claim failed, and no claim was left untested.

## Cold first read

Fresh Chromium contexts opened the production root at 390 × 844 and 1440 × 900 with service workers blocked. I did not scroll before recording these answers.

- **What it does:** It compares spending entered by hand with the pace of one weekly amount.
- **For whom:** People who want a quick budget check without another finance account.
- **What to click first:** **Try it with sample data.** The adjacent result says, **“See a filled week. Your data stays untouched.”**

All three answers are explicit in both first viewports. At 390 px, the H1 ends at 478.6 px, the action at 622.8 px, its stated result at 651.4 px, and the three facts at 690.4, 719.4, and 748.4 px. At desktop width, all three facts end by 764.8 px. The first screen therefore passes without relying on inferred product knowledge.

## Findings

None.

## Copy audit

Counts use lexical words; hyphenated terms count as one. Visible headings, labels, links, buttons, alternative text, and option groups are included because the copy rules apply to them. No unit exceeds 22 words, no banned marketing word appears, headings name their sections, and actions either name their result or clearly name a destination.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Spend Pulse | 2 | Pass; home link |
| Demo | 1 | Pass; destination link |
| Settings | 1 | Pass; destination link |
| Privacy | 1 | Pass; destination link |
| A private weekly spending check | 5 | Pass |
| Keep weekly spending on pace | 5 | Pass; job-first H1 |
| For people who want a quick budget check without another finance account. | 12 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| See a filled week. | 4 | Pass; `sample-demo` |
| Your data stays untouched. | 4 | Pass; `demo-sandbox` |
| Works offline after the first visit. | 6 | Pass; `offline-reload` |
| Your entries stay in this browser. | 6 | Pass; `local-only` |
| Free. | 1 | Pass; `local-only` |
| No account or bank connection. | 5 | Pass; `local-only` |
| A paper relief map turns a weekly route into seven trail markers. | 12 | Pass; image purpose |
| Track one weekly amount without connecting a bank. | 8 | Pass; useful caption |
| Start here · 01 | 3 | Pass; starting point and sequence |
| Set your weekly amount | 4 | Pass |
| Choose what you can spend on day-to-day extras this week. | 10 | Pass |
| Currency | 1 | Pass |
| USD / EUR / GBP / INR | 4 | Pass |
| Weekly amount | 2 | Pass |
| Set weekly amount | 3 | Pass; result-naming button |
| How it works | 3 | Pass; section label |
| Check your pace in three steps | 6 | Pass |
| Set one weekly amount | 4 | Pass |
| Use the money you plan for day-to-day extras. | 8 | Pass |
| Add spending as it happens | 5 | Pass |
| Enter an amount. | 3 | Pass |
| A short note is optional. | 5 | Pass |
| Read today’s pace | 3 | Pass |
| See how spending compares with the elapsed week. | 8 | Pass; `pace-check` |
| Privacy and data | 3 | Pass; section label |
| A manual budget check with no bank connection | 8 | Pass |
| Spend Pulse is a manual weekly spending check with no bank connection. | 12 | Pass; `local-only` |
| Your weekly amount and entries stay in this browser. | 9 | Pass; `local-only` |
| You can export a copy or clear everything. | 8 | Pass; `data-export` and `data-clear` |
| Read the privacy note | 4 | Pass; destination and result |
| One small check for weekly spending pace. | 7 | Pass |
| Privacy | 1 | Pass; destination link |
| Terms | 1 | Pass; destination link |
| Built by Param Factory (external site) | 6 | Pass; external destination announced |
| Version 1.0.0 | 2 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Spend Pulse | 2 | Pass |
| See if your weekly spending is on pace with one quick entry. | 12 | Pass; `pace-check` |
| Spend Pulse is for people who abandon large finance apps but still want a small daily or weekly check. | 19 | Pass |
| Set one weekly amount, add day-to-day spending by hand, and check it against this week’s pace. | 16 | Pass; `pace-check` |
| Your entries stay in this browser. | 6 | Pass; `local-only` |
| There is no account, analytics, bank connection, or cloud sync. | 10 | Pass; `local-only` |
| The app works offline after the first visit. | 8 | Pass; `offline-reload` |
| JSON and CSV exports let users keep a copy. | 9 | Pass; `data-export` |
| Try the isolated sample at `/?demo=1`. | 6 | Pass; `sample-demo` |
| The sample uses separate browser storage, so its changes never touch your entries. | 13 | Pass; `demo-sandbox` |
| Run locally | 2 | Pass; heading |
| Requires Node.js 22 or newer. | 5 | Pass; developer prerequisite |
| Open `http://localhost:5173`. | 2 | Pass; instruction |
| The demo is at `http://localhost:5173/?demo=1`. | 5 | Pass; location |
| Test and build | 3 | Pass; heading |
| The exact production build command is `npm run build`. | 9 | Pass; developer instruction |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | Pass; verified by build |
| Claim tests run with `npm run test:claims`. | 7 | Pass; verified script |
| The full suite checks demo reset, pace updates, import/export/clear recovery, and offline reloads. | 13 | Pass; verified by 47-test run |
| It also checks notification permission, keyboard use, mobile reflow, and serious accessibility issues. | 13 | Pass; verified by 47-test run |
| Deploy | 1 | Pass; heading |
| Deploy the contents of `dist/` as a static site. | 9 | Pass; instruction |
| `staticwebapp.config.json` routes app pages and sets security headers for Azure Static Web Apps. | 13 | Pass; verified configuration |
| Project notes | 2 | Pass; heading |
| `.factory/brief.json` records the product scope. | 5 | Pass |
| `.factory/design.md` records the topographic visual system and image provenance. | 9 | Pass |
| `.factory/demo.md` documents demo behavior. | 4 | Pass |
| `.factory/claims.json` maps every product claim to a test. | 8 | Pass; registry and one-tag regression checked |
| Licensed under the MIT License. | 5 | Pass |
| See `LICENSE`. | 2 | Pass; destination instruction |

Terminology is consistent: **weekly amount** names the limit, **entries** name recorded spending, **day-to-day spending** names the activity, **sample/demo** names the try-out, and **this browser** names persistent storage. “Device” appears only for the wider network or notification boundary. No landing or README claim-like sentence lacks a matching claim entry; developer run/build statements were also executed in the clean clone.

## Demo and sandbox

The landing action opens `/?demo=1` in one click. Its first screen already shows the persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, **Start for real**, a $250 weekly amount, $82.80 spent, and three realistic entries: Lunch with Sam, Groceries, and Train and coffee.

Adding $10 changed the total to $92.80. Reset restored $82.80 and the original entries. In a fresh isolation context, real data was first set to $125, a demo-only entry was added, and **Start for real** returned to the unchanged $125 state without that entry. During demo, IndexedDB exposed separate `spend-pulse-demo-v1` and `spend-pulse-real-v1` namespaces. Ordinary exits through the wordmark, Privacy, and browser history also deleted edited demo state before re-entry.

The live interaction generated 46 requests to 21 unique URLs. Every request was same-origin; there were no cookies, localStorage keys, sessionStorage keys, analytics requests, provider keys, or account/payment controls. A service-worker-controlled demo accepted an offline write and retained it after an offline reload. The active cache was `spend-pulse-shell-v6` and included the query demo plus its shell and responsive images.

## Claims

The clean clone was `/tmp/spend-pulse-review-6-clean-5XI5yz` at the reviewed revision. Every exact command in `.factory/claims.json` was run separately from a fresh browser context and selected one passing test.

| Claim | Exact command | Result and observed coverage |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS 1/1; controlled demo reloaded offline with H1 and banner |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS 1/1; entry flow had no cross-origin/tracking request, account form, or paid control |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS 1/1; real $125 state survived and ordinary exits discarded demo edits |
| `sample-demo` | `npm test -- --grep @claim:sample-demo` | PASS 1/1; one click showed $250, $82.80, and all three sample entries |
| `pace-check` | `npm test -- --grep @claim:pace-check` | PASS 1/1; $10 changed progress by four points and pace difference by $10 |
| `data-export` | `npm test -- --grep @claim:data-export` | PASS 1/1; JSON settings/entries and CSV header/rows asserted |
| `data-import` | `npm test -- --grep @claim:data-import` | PASS 1/1; valid backup replaced sample settings and entries |
| `data-clear` | `npm test -- --grep @claim:data-clear` | PASS 1/1; distinct entry removed and export asserted `settings: null`, `entries: []` |
| `demo-reset` | `npm test -- --grep @claim:demo-reset` | PASS 1/1; $92.80 returned to $82.80 with original entry |
| `notification-permission` | `npm test -- --grep @claim:notification-permission` | PASS 1/1; permission calls remained zero until the explicit button, then became one |
| `on-device-reminder` | `npm test -- --grep @claim:on-device-reminder` | PASS 1/1; due daily, due Monday weekly, and skipped Tuesday weekly branches asserted |

No claim test failed and no coverage gap was found. The full suite passed 47/47. Typecheck, lint, production build, and `npm audit --omit=dev` passed. The build emitted `dist/index.html`; JavaScript is 30.42 kB raw / 9.84 kB gzip and CSS is 17.20 kB raw / 4.66 kB gzip.

## Earlier findings and repair confirmation

Every earlier `review-*.md`, `polish-*.md`, and the prior handoff was read. The production HTML, service worker, static 404, JS, CSS, and three hero files match the reviewed clean build byte-for-byte.

| Earlier finding | Live and code confirmation |
| --- | --- |
| F-1-1 — long README sentence | Fixed. README uses two 13-word suite sentences; the copy table above reconfirms them. |
| F-1-2 — IndexedDB/device jargon | Fixed. README and live storage copy say “this browser”; the database name remains only in verifier documentation. |
| F-1-3 — “discretionary spending” term | Fixed. README and live copy use “day-to-day spending.” |
| F-1-4 — unlisted multi-part scope claim | Fixed. Landing retains only the registered manual-check/no-bank and local-only wording. |
| F-1-5 — unlisted financial-advice copy | Fixed. The sentence is absent from source and the live pace panel. |
| F-1-6 — unlisted runtime-services promise | Fixed. The sentence is absent from README. |
| F-1-7 — visitor-facing art provenance claim | Fixed. The footer makes no provenance claim; provenance remains in `design.md`. |
| F-1-8 — incomplete route metadata/404 skeleton | Fixed. All routes have specific metadata; the live 404 has the shared header/footer, icons, Privacy, and Terms. |
| F-2-1 — clear claim did not prove entries cleared | Fixed. The tagged test creates a distinct entry and asserts an empty exported collection. |
| F-2-2 — sample promise unregistered | Fixed. `sample-demo` is registered and verifies $250 plus all three entries. |
| F-2-3 — mobile facts below first screen | Fixed live. Their bottoms are 690.4, 719.4, and 748.4 px in the 844 px viewport. |
| F-2-4 — device/browser storage inconsistency | Fixed. Persistent-data copy and save confirmation say “this browser”; device wording is limited to notifications/network scope. |
| F-2-5 — allowance/weekly amount inconsistency | Fixed. Visitor copy uses “weekly amount”; allowance remains only an internal field name. |
| F-2-6 — “without the baggage” heading | Fixed live as “A manual budget check with no bank connection.” |
| F-2-7 — README database jargon | Fixed as “separate browser storage.” |
| F-3-1 — pace test only checked spent total | Fixed. It asserts progress and the under/over pace difference. |
| F-3-2 — weekly reminder branch untested | Fixed. Due and not-due weekly branches use fixed clocks. |
| F-3-3 — metaphorical image caption | Fixed live as “Track one weekly amount without connecting a bank.” |
| F-3-4 — “Route notes” label | Fixed live as “How it works.” |
| F-3-5 — “The boundary” label | Fixed live as “Privacy and data.” |
| F-3-6 — demo sandbox jargon | Fixed live as “Sample changes do not affect your entries.” |
| F-3-7 — false empty-real-data promise | Fixed. Live isolation returns existing $125 real data and deletes demo changes. |
| F-3-8 — metaphorical 404 | Fixed in SPA and static 404 as “404 / This page was not found.” |
| F-4-1 — demo clear called local clear | Fixed. Demo reports “All demo data cleared”; code selects demo/local scope and the claim asserts the demo wording. |
| F-7-1 — native minimum conflicted with validation | Fixed. Both weekly-amount controls expose `min="0.01"`; the browser regression accepts 0.01. |
| F-7-2 — nonexistent asset provenance path | Fixed. `design.md` names the generated PNG, source WebP, and hashed build path; all exist and the test passes. |
| F-8-1 — ordinary demo exits retained edits | Fixed. `discardDemoOnExit()` runs before navigation and on `popstate`; live and tagged tests cover wordmark, Privacy, and history exits. |
| F-8-2 — oversized mobile hero | Fixed. The live 390 px browser selects the 640 px WebP, with 960 px and 1200 px fallbacks precached. |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, and identity

- `/`, `/?demo=1`, `/demo`, `/settings`, `/privacy`, and `/terms` return 200. An unknown route returns the designed 404 with HTTP 404; `/404.html` returns 200.
- Every route has `lang=en`, exactly one H1 and one main, its required title pattern, description, canonical, Open Graph and Twitter metadata, SVG favicon, and 180 px apple icon. The social card is 1200 × 630.
- Direct deep links load the correct state. Client navigation and browser Back/Forward restore the route and focus its H1; the polite route announcer is present.
- The complete link union across all routes has no dead destination: product and factory links return 200, mail links are explicit `mailto:` links, and hash-only skip links target each page’s existing `main`. `robots.txt`, `sitemap.xml`, manifest, favicon, social card, and apple icon return 200.
- The URL verifier reports HTTP 200, the correct title and language, one H1/main, no missing image alternatives, no unnamed buttons, and no console errors. Twelve live Axe scans across six routes in light and dark modes report zero violations. Keyboard focus is visible, the skip link is first, touch targets are at least 44 px, 200% text has no horizontal overflow, and reduced motion removes active animation.
- Restrictive production headers are present, including self-only CSP, `frame-ancestors 'none'`, HSTS, `nosniff`, referrer policy, and Permissions-Policy.
- The topographic relief art, paper grid, clipped survey shapes, pine/ochre palette, Georgia/Atkinson pairing, and restrained contour motion form a recognisable product-specific identity. The page does not use a centered gradient hero or generic SaaS feature-card layout.

## Missed leverage

No finding. The brief asks for a manual, local-first weekly pace check, offline use, and an optional reminder. The product already includes JSON/CSV portability and JSON restore. Cloud sync or bank aggregation would conflict with its explicit privacy boundary, and an AI step would add cost and disclosure without completing an implied user task. No decorative AI feature or embedded provider key exists.

## What would make this perfect

Nothing remains to change for the reviewed scope. Preserve the existing claim tests, demo-isolation regressions, route metadata crawl, and first-screen geometry checks in future releases.
