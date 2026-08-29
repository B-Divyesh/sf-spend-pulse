# Adversarial first-read review 3 — Spend Pulse

**Date:** 2026-08-29 UTC  
**Target:** `https://spend-pulse.sociobot.in`  
**Candidate:** `4b4ab2b0e53cfc95c4c215de9f579abf52ec9fa9`  
**Verdict:** **FAIL** — three blocking findings and six minor findings remain.

The deployed HTML, JavaScript, CSS, and service worker byte-match the clean candidate build. Product behavior is strong, but this round cannot pass while an earlier terminology finding remains half-fixed, two declared claims are not fully tested, and six copy defects remain.

## Cold first read

Fresh Chromium contexts opened the live root at 390 × 844 and 1440 × 900 with service workers blocked for the cold load. No scrolling occurred before the observations.

- **What it does:** It compares spending entered by hand with the pace of one weekly amount.
- **For whom:** People who want a quick budget check without another finance account.
- **What I would click first:** **Try it with sample data**. The adjacent result says, **“See a filled week. Your data stays untouched.”**

All three answers are present in the first viewport, so the explicit first-screen clarity blocker is not triggered. At 390 px the H1 ends at y=478.6, the action at y=622.8, its outcome at y=651.4, and the last required fact at y=748.4. The same content is visible at desktop width.

Evidence: [mobile cold capture](review-3-artifacts/cold-mobile.png), [desktop cold capture](review-3-artifacts/cold-desktop.png), and [live audit data](review-3-artifacts/live-audit.json).

## Findings

### F-2-4 — BLOCKING, reopened — browser storage is still called device storage

**Exact quote / location:** live `/settings` confirmation after saving: **“Settings saved on this device.”** Source: `src/main.ts`, `submitSettings()`.

**Why this fails:** Review 2 required browser-local storage to be called **“this browser”** everywhere because data is not shared between browsers on one device. The landing page and README were repaired, but this persisted-data confirmation retains the misleading term. The defect is therefore half-fixed. The history rule requires an unfixed earlier finding to return as blocking under the same ID.

**Concrete fix:** Change the confirmation to **“Settings saved in this browser.”** Add an assertion for that exact confirmation to the settings test and search all user-facing storage copy for “device.” Keep “device” only where it accurately describes the network or notification boundary.

### F-3-1 — BLOCKING — the pace claim test checks spending, not pace

**Exact quote / location:** `.factory/claims.json`, `pace-check`: **“A one-tap spending entry updates this week's rolling pace.”** The tagged test only asserts `.pace-primary strong` changes from `$82.80` to `$92.80`.

**Why this fails:** The assertion proves that the spent total changes. It does not prove that the elapsed-week pace, pace difference, progress percentage, or state is recalculated. A passing command therefore leaves the promised result untested.

**Concrete fix:** In the one existing `@claim:pace-check` test, record the progress value and the **Under/Over today’s pace** amount before quick-add, then assert the appropriate values change by the expected amount after quick-add. Keep exactly one tagged test for the claim.

### F-3-2 — BLOCKING — the weekly reminder branch is untested

**Exact quote / location:** `.factory/claims.json`, `on-device-reminder`: **“Checks a daily or weekly reminder while the app is open.”** The sandbox says to save a due **daily** reminder, and `tests/app.spec.ts` selects only `daily`.

**Why this fails:** The claim promises both daily and weekly behavior, but the only tagged test never selects `weekly`, never checks the configured first day of the week, and never checks suppression on other days. The weekly half of the listed claim is untested.

**Concrete fix:** Extend the single `@claim:on-device-reminder` test with a fixed clock to verify a due weekly reminder on the configured week-start day and no reminder on a different day. Alternatively, narrow the claim and UI to daily reminders.

### F-3-3 — Minor — the image caption is a metaphorical slogan

**Exact quote / location:** landing map caption: **“One route. Seven days. No bank connection.”**

**Why this fails:** “One route” is unexplained map lore, and “Seven days” repeats what “weekly” already tells the visitor. The two fragments do not provide usable product information.

**Concrete fix:** Replace the caption with **“Track one weekly amount without connecting a bank.”**

### F-3-4 — Minor — “Route notes” is a decorative section label

**Exact quote / location:** landing label above the three-step section: **“Route notes.”**

**Why this fails:** The label does not identify the section out of context. It duplicates the map motif instead of helping a visitor scan the page.

**Concrete fix:** Replace it with **“How it works”** or remove it because the H2 already names the section.

### F-3-5 — Minor — “The boundary” is a vague metaphor label

**Exact quote / location:** landing privacy-section label: **“The boundary.”**

**Why this fails:** A screen-reader heading list or a fast visual scan cannot infer that this means privacy and product limits.

**Concrete fix:** Replace it with **“Privacy and data”** or remove it because the H2 already states the boundary.

### F-3-6 — Minor — the demo heading uses unexplained developer jargon

**Exact quote / location:** demo explanation H2: **“This sandbox is separate.”**

**Why this fails:** “Sandbox” is implementation jargon, and “separate” does not name what the sample is separate from.

**Concrete fix:** Replace it with **“Sample changes do not affect your entries.”**

### F-3-7 — Minor — the demo promises empty real data when existing data is preserved

**Exact quote / location:** demo explanation: **“Reset them anytime, or start with empty real data.”**

**Why this fails:** In a fresh live context I created a real `$125` weekly amount, entered and reset the demo, then selected **Start for real**. The existing `$125` real plan correctly returned. The sentence is therefore false for returning users and is not registered in `claims.json`.

**Concrete fix:** Replace it with **“Reset the sample anytime, or return to your real data.”** Cover that outcome with the existing `demo-sandbox` claim.

### F-3-8 — Minor — the 404 headline uses map metaphors instead of naming the error

**Exact quote / location:** designed 404 eyebrow and H1: **“Off the map”** and **“This page is not on the route.”**

**Why this fails:** These are mood and metaphor phrases. The H1 does not plainly say that the page was not found, contrary to the heading rule.

**Concrete fix:** Use **“404”** as the eyebrow and **“This page was not found”** as the H1. Keep the topographic visual treatment in the art and layout.

## Copy audit

Counts use lexical words; hyphenated terms count as one. Decorative step numbers are not sentences. Interface labels, headings, actions, image alternative text, and footer copy are included because visitors encounter them. No sentence exceeds 22 words, no banned marketing word appears, and all landing actions name their result. The three landing flags are F-3-3 through F-3-5.

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
| One route. | 2 | **F-3-3** |
| Seven days. | 2 | **F-3-3** |
| No bank connection. | 3 | Pass; `local-only` |
| Start here · 01 | 3 | Pass; starting point and sequence |
| Set your weekly amount | 4 | Pass |
| Choose what you can spend on day-to-day extras this week. | 10 | Pass |
| Currency | 1 | Pass |
| USD / EUR / GBP / INR | 4 | Pass |
| Weekly amount | 2 | Pass |
| Set weekly amount | 3 | Pass; result-naming button |
| Route notes | 2 | **F-3-4** |
| Check your pace in three steps | 6 | Pass |
| Set one weekly amount | 4 | Pass |
| Use the money you plan for day-to-day extras. | 8 | Pass |
| Add spending as it happens | 5 | Pass |
| Enter an amount. | 3 | Pass |
| A short note is optional. | 5 | Pass |
| Read today’s pace | 3 | Pass |
| See how spending compares with the elapsed week. | 8 | Pass; `pace-check`, with coverage defect F-3-1 |
| The boundary | 2 | **F-3-5** |
| A manual budget check with no bank connection | 8 | Pass |
| Spend Pulse is a manual weekly spending check with no bank connection. | 12 | Pass; `local-only` |
| Your weekly amount and entries stay in this browser. | 9 | Pass; `local-only` |
| You can export a copy or clear everything. | 8 | Pass; `data-export` / `data-clear` |
| Read the privacy note | 4 | Pass; result-naming link |
| One small check for weekly spending pace. | 7 | Pass |
| Privacy | 1 | Pass; destination link |
| Terms | 1 | Pass; destination link |
| Built by Param Factory (external site) | 6 | Pass; external destination announced |
| Version 1.0.0 | 2 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Spend Pulse | 2 | Pass |
| See if your weekly spending is on pace with one quick entry. | 12 | Pass; `pace-check`, with coverage defect F-3-1 |
| Spend Pulse is for people who abandon large finance apps but still want a small daily or weekly check. | 19 | Pass |
| Set one weekly amount, add day-to-day spending by hand, and check it against this week’s pace. | 16 | Pass; `pace-check` |
| Your entries stay in this browser. | 6 | Pass; `local-only` |
| There is no account, analytics, bank connection, or cloud sync. | 10 | Pass; `local-only` |
| The app works offline after the first visit. | 8 | Pass; `offline-reload` |
| JSON and CSV exports let users keep a copy. | 9 | Pass; `data-export` |
| Try the isolated sample at `/?demo=1`. | 6 | Pass |
| The sample uses separate browser storage, so its changes never touch your entries. | 13 | Pass; `demo-sandbox` |
| Run locally | 2 | Pass; heading |
| Requires Node.js 22 or newer. | 5 | Pass; developer prerequisite |
| Open `http://localhost:5173`. | 2 | Pass |
| The demo is at `http://localhost:5173/?demo=1`. | 5 | Pass |
| Test and build | 3 | Pass; heading |
| The exact production build command is `npm run build`. | 9 | Pass |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | Pass |
| Claim tests run with `npm run test:claims`. | 7 | Pass |
| The full suite checks demo reset, pace updates, import/export/clear recovery, and offline reloads. | 13 | Pass as suite description; pace coverage is F-3-1 |
| It also checks notification permission, keyboard use, mobile reflow, and serious accessibility issues. | 13 | Pass |
| Deploy | 1 | Pass; heading |
| Deploy the contents of `dist/` as a static site. | 9 | Pass |
| `staticwebapp.config.json` routes app pages and sets security headers for Azure Static Web Apps. | 13 | Pass; developer deployment detail |
| Project notes | 2 | Pass; heading |
| `.factory/brief.json` records the product scope. | 5 | Pass |
| `.factory/design.md` records the topographic visual system and image provenance. | 9 | Pass |
| `.factory/demo.md` documents sandbox behavior. | 4 | Pass |
| `.factory/claims.json` maps every product claim to a test. | 8 | **Fails in substance through F-3-1 and F-3-2** |
| Licensed under the MIT License. | 5 | Pass |
| See `LICENSE`. | 2 | Pass |

## Demo and sandbox

The functional demo path passes. One click from the cold landing opens `/?demo=1` with the persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, **Start for real**, a `$250` weekly amount, `$82.80` spent, and the three realistic entries Lunch with Sam, Groceries, and Train and coffee.

Quick-add changed `$82.80` to `$92.80`. Reset restored `$82.80` and the original three entries. A real `$125` plan created before entering the demo returned after **Start for real**, the demo-only entry was absent, and `spend-pulse-demo-v1` was deleted while `spend-pulse-real-v1` remained. The full interaction request log contains only same-origin product files. A service-worker-controlled demo reloaded offline with the banner and H1 intact.

The demo is not functionally weak, but its explanatory copy has F-3-6 and F-3-7.

## Claims

A clean clone at `/tmp/spend-pulse-review-3-22Cmzj` ran `npm ci`, `npm run build`, and all 11 commands from `.factory/claims.json` separately. Every command selected one test and passed.

| Claim | Exact command | Command result | Coverage result |
| --- | --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1 test | Complete |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test | Complete; live request log also same-origin only |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS, 1 test | Complete |
| `sample-demo` | `npm test -- --grep @claim:sample-demo` | PASS, 1 test | Complete |
| `pace-check` | `npm test -- --grep @claim:pace-check` | PASS, 1 test | **Incomplete — F-3-1** |
| `data-export` | `npm test -- --grep @claim:data-export` | PASS, 1 test | Complete |
| `data-import` | `npm test -- --grep @claim:data-import` | PASS, 1 test | Complete |
| `data-clear` | `npm test -- --grep @claim:data-clear` | PASS, 1 test | Complete |
| `demo-reset` | `npm test -- --grep @claim:demo-reset` | PASS, 1 test | Complete |
| `notification-permission` | `npm test -- --grep @claim:notification-permission` | PASS, 1 test | Complete |
| `on-device-reminder` | `npm test -- --grep @claim:on-device-reminder` | PASS, 1 test | **Incomplete — F-3-2** |

No additional unlisted product claim was found on the landing page or README. The demo’s false empty-data outcome is separately recorded as F-3-7.

The clean-clone full suite passed 42/42. Typecheck, lint, and build passed. The build emitted `dist/` with 9.71 kB gzip JavaScript, 4.65 kB gzip CSS, and a 130.94 kB hero image.

## Earlier findings and repair assertions

Every finding in reviews 1 and 2, both polish reports, and the prior handoff was checked against current source and the byte-matching live deployment.

| Earlier item | Current confirmation |
| --- | --- |
| F-1-1, long README test sentence | Fixed; the two replacement sentences are 13 words each. |
| F-1-2, README IndexedDB jargon | Fixed in README; it says “this browser.” |
| F-1-3, “discretionary spending” | Fixed; README uses “day-to-day spending.” |
| F-1-4, unlisted four-part landing boundary | Fixed; live copy uses the registered manual-check/no-bank statement. |
| F-1-5, unlisted financial-advice copy | Fixed; the phrase is absent from source and live demo. |
| F-1-6, unlisted deployment-dependency promise | Fixed; the sentence is absent. |
| F-1-7, visitor-facing art-provenance claim | Fixed; it is absent from the live footer and remains documented in `design.md`. |
| F-1-8, route metadata and 404 skeleton | Fixed; all app routes update metadata, and the 404 has the shared header/footer and legal links. F-3-8 is a new plain-language defect in its H1. |
| F-2-1, clear-data claim coverage | Fixed; the tagged test creates a distinct entry and asserts exported `settings: null` and `entries: []`. |
| F-2-2, missing sample-demo claim | Fixed; `sample-demo` exists and verifies `$250` plus all three sample entries. |
| F-2-3, facts below the mobile first screen | Fixed; the live facts end at y=690.4, 719.4, and 748.4. |
| F-2-4, device/browser storage terms | **Half-fixed and reopened as BLOCKING.** The landing and README say browser, but the live save notice says “this device.” |
| F-2-5, weekly amount called allowance | Fixed in visitor-facing copy. |
| F-2-6, “without the baggage” heading | Fixed; the live H2 plainly names the manual/no-bank boundary. |
| F-2-7, README database jargon | Fixed; README uses “separate browser storage.” |

The prior handoff’s additional repair assertions also hold: live dark/light axe scans found zero serious or critical findings; Undo persists after reload; malformed imports are rejected; the amount maximum is enforced; 200% text reflows at 390 px; touch targets pass; and the static 404 override is present.

## Structure, links, accessibility, and identity

- `/`, `/?demo=1`, `/demo`, `/settings`, `/privacy`, and `/terms` return 200. The designed missing route returns 404, and `/404.html` returns 200.
- Every route has `lang=en`, one H1, one main, route-specific title/description/canonical/OG/Twitter metadata, favicon, apple-touch icon, consistent header/footer, Privacy, and Terms. The social card is 1200 × 630.
- The live root title is **“Spend Pulse — Keep weekly spending on pace.”** Route titles follow the required page-first pattern.
- Client navigation and browser Back focus the destination H1. Deep links load directly.
- Every link discovered across all app routes returned its expected status. Navigational destinations returned 200; explicit mail links were skipped; the deliberate missing route remained 404.
- `/opt/fleet/lib/verify-url.sh` reports 200, one H1, `lang=en`, `main`, complete alt/button names, and no page errors. Live Playwright AxeBuilder scans found no serious or critical violation on six routes in light or dark mode.
- The topographic relief art, map-paper grid, clipped survey shapes, restrained palette, and type pairing are distinctive rather than a generic SaaS template. The visual system and original-asset provenance are documented in `design.md`.

The only console resource error was the browser’s expected report for the intentionally 404 main document; no application script error occurred.

## Missed leverage

No finding. The brief calls for a local weekly pace check, manual entry, optional reminder, and offline use. JSON/CSV import and export already provide the obvious portability path. Sync, bank aggregation, or AI would expand or conflict with the private local-only job. No decorative AI or embedded provider key exists.

## What would make this perfect

Close F-2-4 and F-3-1 through F-3-8. Then rerun every claim command separately, the full suite, the live demo isolation flow, and the route/copy crawl. A PASS requires the weekly and rolling-pace promises to be fully observed and all remaining metaphor, jargon, and false outcome copy to be removed.
