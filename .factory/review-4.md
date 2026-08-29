# Adversarial first-read review 4 — Spend Pulse

**Date:** 2026-08-29 UTC

**Target:** `https://spend-pulse.sociobot.in`

**Reviewed source:** `741c8aea3070cd041cbd23bcacacdf492a91f228`
**Verdict:** **FAIL** — one minor finding remains. No blocking finding or untested claim remains.

## Finding

### F-4-1 — Minor — clearing demo data reports that local data was cleared

**Exact quote / location:** live `/settings?demo=1`, after activating **“Clear all demo data”** and accepting the confirmation: **“All local data cleared.”** The same unconditional message is in `src/main.ts` inside the `clear-data` action.

**Why this fails:** The action only deletes the isolated demo database. Calling it “local data” changes the established term and can make a visitor think their real browser data was deleted. The button and confirmation correctly say “demo”; the result must preserve that scope.

**Concrete fix:** Show **“All demo data cleared.”** when `isDemo` is true and **“All local data cleared.”** otherwise. Extend `@claim:data-clear` to assert the demo result message as well as the empty exported data.

## Cold first read

Fresh Chromium contexts opened `/` at 390 × 844 and 1440 × 900 with no stored state, blocked service workers, no scrolling, and no console or page errors.

- **What it does:** It records manual spending against one weekly amount and shows whether spending is on pace with the elapsed week.
- **For whom:** People who want a quick budget check without another finance account.
- **What to click first:** **“Try it with sample data.”** The adjacent outcome says **“See a filled week. Your data stays untouched.”**

All three answers are explicit on both first screens. At 390 px the H1 begins at y=393, the action at y=574.75, and the three facts end at y=690.39, 719.39, and 748.39 within the 844 px viewport. This is not a blocking first-screen finding.

## Copy audit

Counts use lexical words; hyphenated terms count as one. Headings, labels, actions, options, image alternative text, and screen-reader additions are included because visitors encounter them. No landing or README unit exceeds 22 words. No banned marketing adjective, unexplained jargon, inconsistent product term, mood heading, or non-result-naming button appears on these two surfaces.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Spend Pulse | 2 | Pass |
| Demo | 1 | Pass; destination link |
| Settings | 1 | Pass; destination link |
| Privacy | 1 | Pass; destination link |
| A private weekly spending check | 5 | Pass |
| Keep weekly spending on pace | 5 | Pass |
| For people who want a quick budget check without another finance account. | 12 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| See a filled week. | 4 | Pass; `sample-demo` |
| Your data stays untouched. | 4 | Pass; `demo-sandbox` |
| Works offline after the first visit. | 6 | Pass; `offline-reload` |
| Your entries stay in this browser. | 6 | Pass; `local-only` |
| Free. | 1 | Pass; `local-only` |
| No account or bank connection. | 5 | Pass; `local-only` |
| A paper relief map turns a weekly route into seven trail markers. | 12 | Pass; image alternative describes the image |
| Track one weekly amount without connecting a bank. | 8 | Pass; `pace-check` / `local-only` |
| Start here · 01 | 3 | Pass; starting point and sequence |
| Set your weekly amount | 4 | Pass |
| Choose what you can spend on day-to-day extras this week. | 10 | Pass |
| Currency | 1 | Pass |
| USD / EUR / GBP / INR | 4 | Pass; options |
| Weekly amount | 2 | Pass |
| Set weekly amount | 3 | Pass; result-naming button |
| How it works | 3 | Pass |
| Check your pace in three steps | 6 | Pass |
| Set one weekly amount | 4 | Pass |
| Use the money you plan for day-to-day extras. | 8 | Pass |
| Add spending as it happens | 5 | Pass |
| Enter an amount. | 3 | Pass |
| A short note is optional. | 5 | Pass |
| Read today’s pace | 3 | Pass |
| See how spending compares with the elapsed week. | 8 | Pass; `pace-check` |
| Privacy and data | 3 | Pass |
| A manual budget check with no bank connection | 8 | Pass |
| Spend Pulse is a manual weekly spending check with no bank connection. | 12 | Pass; `local-only` |
| Your weekly amount and entries stay in this browser. | 9 | Pass; `local-only` |
| You can export a copy or clear everything. | 8 | Pass; `data-export` / `data-clear` |
| Read the privacy note | 4 | Pass; result-naming link |
| One small check for weekly spending pace. | 7 | Pass |
| Privacy | 1 | Pass; destination link |
| Terms | 1 | Pass; destination link |
| Built by Param Factory (external site) | 6 | Pass; external destination is announced |
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
| Open `http://localhost:5173`. | 2 | Pass |
| The demo is at `http://localhost:5173/?demo=1`. | 5 | Pass |
| Test and build | 3 | Pass; heading |
| The exact production build command is `npm run build`. | 9 | Pass |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | Pass; observed in the clean build |
| Claim tests run with `npm run test:claims`. | 7 | Pass |
| The full suite checks demo reset, pace updates, import/export/clear recovery, and offline reloads. | 13 | Pass; observed in the suite |
| It also checks notification permission, keyboard use, mobile reflow, and serious accessibility issues. | 13 | Pass; observed in the suite |
| Deploy | 1 | Pass; heading |
| Deploy the contents of `dist/` as a static site. | 9 | Pass |
| `staticwebapp.config.json` routes app pages and sets security headers for Azure Static Web Apps. | 13 | Pass; verified in build output and live headers |
| Project notes | 2 | Pass; heading |
| `.factory/brief.json` records the product scope. | 5 | Pass |
| `.factory/design.md` records the topographic visual system and image provenance. | 9 | Pass |
| `.factory/demo.md` documents demo behavior. | 4 | Pass |
| `.factory/claims.json` maps every product claim to a test. | 8 | Pass; all listed product claims have one tagged test |
| Licensed under the MIT License. | 5 | Pass |
| See `LICENSE`. | 2 | Pass |

No claim-like landing or README sentence lacks a matching claim entry. Developer setup and deployment statements were verified by the clean install/build and live response inspection.

## Demo and sandbox

The one-click path passes. From a fresh landing page, **“Try it with sample data”** opened `/?demo=1` at scroll position 0. The first screen already showed:

- **“Demo — sample data, nothing is saved”**, **Reset demo**, and **Start for real**;
- the H1 **“See this week’s spending pace”**;
- `$82.80` spent, `33% of $250.00`; and
- Lunch with Sam, Groceries, and Train and coffee.

Adding $10 changed the total to $92.80. Reset restored $82.80 and the original three entries. A real $125 weekly amount created before entering demo returned unchanged after **Start for real**; the demo-only entry was absent, and the demo database had been deleted. The live flow made only same-origin requests. A service-worker-controlled demo reloaded offline with its H1 and banner intact.

F-4-1 is a result-copy defect in the secondary demo Settings path. It does not weaken isolation or the one-click populated demo enough to be blocking.

## Claims

A clean clone at `/tmp/spend-pulse-review-4-DWOQRt` ran `npm ci`, `npm run build`, and every exact command from `.factory/claims.json` separately. Each command selected exactly one test and passed.

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test; live log also same-origin only |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS, 1 test |
| `sample-demo` | `npm test -- --grep @claim:sample-demo` | PASS, 1 test |
| `pace-check` | `npm test -- --grep @claim:pace-check` | PASS, 1 test; percentage and pace difference both change |
| `data-export` | `npm test -- --grep @claim:data-export` | PASS, 1 test |
| `data-import` | `npm test -- --grep @claim:data-import` | PASS, 1 test |
| `data-clear` | `npm test -- --grep @claim:data-clear` | PASS, 1 test; settings and entries are observably empty |
| `demo-reset` | `npm test -- --grep @claim:demo-reset` | PASS, 1 test |
| `notification-permission` | `npm test -- --grep @claim:notification-permission` | PASS, 1 test |
| `on-device-reminder` | `npm test -- --grep @claim:on-device-reminder` | PASS, 1 test; due daily, due weekly, and not-due weekly branches covered |

No declared claim failed and no claim remains untested. The full clean-clone suite passed 44/44. Typecheck, lint, and production build passed. The build produced `dist/index.html`; JavaScript is 30.10 kB raw / 9.69 kB gzip.

## Earlier findings and regressions

The current production bundles match the clean build byte for byte, so the source and live checks below concern the same candidate.

| Earlier finding | Current live and code confirmation |
| --- | --- |
| F-1-1 — long README sentence | Fixed. The replacement suite sentences are each 13 words. |
| F-1-2 — IndexedDB/device jargon | Fixed. README and live storage copy use “this browser”; IndexedDB detail remains only in demo documentation. |
| F-1-3 — “discretionary spending” terminology | Fixed. README uses “day-to-day spending.” |
| F-1-4 — unlisted four-part scope claim | Fixed. Live copy uses the registered manual/no-bank boundary. |
| F-1-5 — unlisted financial-advice copy | Fixed. The phrase is absent from source and live demo. |
| F-1-6 — unlisted deployment-dependency claim | Fixed. The promise is absent from README. |
| F-1-7 — visitor-facing art-provenance claim | Fixed. It is absent from the live footer; provenance remains in `design.md`. |
| F-1-8 — route metadata and incomplete 404 skeleton | Fixed. All routes set full metadata; the live 404 has the shared header/footer and legal links. |
| F-2-1 — clear-data test did not observe entries | Fixed. The test creates an entry and asserts exported `settings: null` and `entries: []`. |
| F-2-2 — sample promise lacked a claim | Fixed. `sample-demo` verifies the action, banner, $250 amount, and three entries. |
| F-2-3 — mobile facts below the fold | Fixed. All facts end by y=748.39 at 390 × 844. |
| F-2-4 — device/browser storage inconsistency | Fixed at the cited storage locations. The live save notice says “Settings saved in this browser.” |
| F-2-5 — allowance/weekly amount inconsistency | Fixed. Visitor-facing copy consistently uses “weekly amount.” |
| F-2-6 — metaphorical privacy heading | Fixed. The live H2 is “A manual budget check with no bank connection.” |
| F-2-7 — README database jargon | Fixed. README says “separate browser storage.” |
| F-3-1 — pace test did not test pace | Fixed. The tagged test asserts a four-point progress change and a $10 pace-difference change. |
| F-3-2 — weekly reminder branch untested | Fixed. Fixed-clock tests cover due Monday and skipped Tuesday behavior. |
| F-3-3 — “One route. Seven days.” slogan | Fixed. The live caption names the weekly amount and no-bank boundary. |
| F-3-4 — “Route notes” label | Fixed. The live section label is “How it works.” |
| F-3-5 — “The boundary” label | Fixed. The live section label is “Privacy and data.” |
| F-3-6 — demo sandbox jargon | Fixed. The live H2 says sample changes do not affect entries. |
| F-3-7 — false empty-real-data promise | Fixed. The live copy says users can return to real data, and the $125 isolation flow confirmed it. |
| F-3-8 — metaphorical 404 copy | Fixed. Both SPA and static 404 use “404” and “This page was not found.” |

Earlier unnumbered defects also remain fixed: delete/Undo survives reload; malformed imports leave data unchanged; the amount cap is enforced; dark result contrast has no serious/critical Axe failure; 200% text does not overflow 390 px; navigation targets meet 44 px; and the static 404 deploy path returns HTTP 404.

## Structure, accessibility, links, and identity

- `/`, `/?demo=1`, `/demo`, `/settings`, `/privacy`, and `/terms` return 200. An unknown route returns the designed page with HTTP 404; `/404.html` returns 200.
- Every checked route has one H1, one main, `lang=en`, a route-specific plain title, description, canonical, Open Graph/Twitter data, favicon, apple-touch icon, consistent header/footer, Privacy, and Terms.
- The 1200 × 630 social card is real product art. The favicon, 180 × 180 apple icon, robots file, sitemap, manifest, and security headers are present.
- The live link crawl found no dead navigation link. The factory link returned 200; mail links were identified explicitly.
- Client navigation and browser Back restored the correct URL and focused the destination H1. The polite route announcer is present in code.
- `/opt/fleet/lib/verify-url.sh` reported HTTP 200, one H1, `lang=en`, a main landmark, complete image/button names, and no errors.
- Live AxeBuilder scans on six routes in light and dark modes found zero serious or critical violations. The clean suite also covers keyboard use, visible import focus, 200% text reflow, 44 px targets, and reduced motion.
- The topographic paper illustration, grid, contour mark, cut corners, pine/ochre palette, and serif/hyperlegible type pairing form a distinct identity. This is not a centered generic SaaS hero or a three-card template.

The only console resource error was the browser’s expected report for the deliberately requested 404 document; no application error occurred.

## Missed leverage

No finding. The brief asks for a local weekly pace check, manual entry, offline use, and an optional reminder. Those are present. JSON/CSV import and export supply the obvious portability path. Sync, bank aggregation, or an AI feature would conflict with or expand the private, local, manual job. No decorative AI or embedded provider key exists.

## What would make this perfect

Resolve F-4-1 by making the clear-data success message demo-aware and asserting the exact demo result in `@claim:data-clear`. Then rerun that exact claim, the full suite, and the live demo-clear path. A PASS requires that final terminology mismatch to be gone.
