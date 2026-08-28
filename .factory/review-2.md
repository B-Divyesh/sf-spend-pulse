# Adversarial first-read review 2 — Spend Pulse

**Date:** 2026-08-28 UTC  
**Target:** `https://spend-pulse.sociobot.in`  
**Candidate:** `8aa426434409ecd8ef59b511d20372a92f007ba0`  
**Verdict:** **FAIL** — one blocking claim-coverage defect and six minor copy/first-screen findings remain.

## Cold first read

Fresh Chromium contexts opened at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** It compares manually entered spending with the pace of one weekly amount.
- **For whom:** People who want a quick budget check without a finance account.
- **What I would click first:** **Try it with sample data**. The adjacent result says, **“See a filled week. Your data stays untouched.”**

All three answers are available in the first viewport at both widths, so the explicit clarity blocker is not triggered. On mobile, the headline ends at y=607, the action ends at y=771, and its outcome ends at y=807. The required offline/privacy/price facts are not readable in that viewport; see F-2-3.

Evidence: [mobile cold capture](review-2-artifacts/cold-mobile-390.png), [desktop cold capture](review-2-artifacts/cold-desktop.png), and the corresponding JSON files in `review-2-artifacts/`.

## Findings

### F-2-1 — BLOCKING — the passing clear-data claim test does not test that entries are cleared

**Location / quote:** `.factory/claims.json`, `data-clear`: **“You can clear everything from Settings”** with sandbox instruction **“assert settings and entries are removed.”** `tests/app.spec.ts`, test `@claim:data-clear`, checks that the settings input becomes empty, then opens the demo and checks the automatically reseeded `$82.80` total.

**Why this fails:** The command passes, but it never creates a distinguishable entry and never observes an empty entries collection. Reopening the demo invokes the sample reseed path, so `$82.80` cannot prove that entries were removed. The promised “everything” outcome remains partly untested. This violates the claims rule that the tagged test assert the observable promised result and the verdict rule that no claim remain untested.

**Concrete fix:** In the one existing `@claim:data-clear` test, add a uniquely named entry, clear data, then download JSON before leaving Settings and assert `settings === null` and `entries` is empty. Also assert the unique entry does not return. Keep exactly one tagged test for this claim.

### F-2-2 — Minor — the promised populated sample has no claims entry

**Location / quote:** landing action outcome: **“See a filled week.”** Demo introduction: **“The sample allowance is $250.”**

**Why this fails:** This is a visitor-reliable demo promise. The product fulfills it, and an untagged regression test checks `$82.80`, but no `.factory/claims.json` entry names the populated sample or maps the promise to exactly one tagged test.

**Concrete fix:** Add a `sample-demo` claim for a populated $250 sample week. Tag one test that starts from a fresh context, clicks the landing action, and asserts the $250 amount plus Lunch with Sam, Groceries, and Train and coffee on the first demo screen.

### F-2-3 — Minor — all three required product facts fall below the mobile first screen

**Location / quote:** 390 × 844 landing viewport. The facts are **“Works offline after the first visit,” “Your entries stay on this device,”** and **“Free. No account or bank connection.”** The first fact begins at y=839 and none of the three sentences is readable before scrolling.

**Why this fails:** The supplied plain-words first-screen shape requires three short privacy/offline/price facts. The large map and vertical spacing push all three below the first mobile viewport even though the job, audience, action, and action result remain visible.

**Concrete fix:** Reduce the mobile map height or hero gaps, or move the facts above the image, so all three complete facts fit within 390 × 844 without hiding the current headline or action.

### F-2-4 — Minor — storage is called both “this device” and “this browser”

**Location / quote:** landing fact: **“Your entries stay on this device.”** Later landing copy: **“Your allowance and entries stay in this browser.”** README: **“Your entries stay in this browser on your device.”**

**Why this fails:** Browser-local data is not device-wide data. Switching browsers on the same device will not expose the same entries, so the terms are inconsistent and the shorter phrase can mislead.

**Concrete fix:** Use **“Your entries stay in this browser”** everywhere. Keep “device” only in the broader tested statement that no spending data leaves the device.

### F-2-5 — Minor — the weekly limit changes name on the landing page

**Location / quote:** setup heading and label: **“Set your weekly amount” / “Weekly amount.”** Privacy section: **“Your allowance and entries stay in this browser.”**

**Why this fails:** The copy audit’s terminology table selects “weekly amount,” but the landing page later calls the same value an “allowance.” A first-time reader should not have to decide whether these are different values.

**Concrete fix:** Rewrite the privacy sentence as **“Your weekly amount and entries stay in this browser.”**

### F-2-6 — Minor — a landing heading relies on a vague metaphor

**Location / quote:** privacy-section H2: **“A budget tool without the baggage.”**

**Why this fails:** “The baggage” does not name a feature or boundary when the heading is read out of context. It makes sense only after reading the paragraphs below it, contrary to the heading rule.

**Concrete fix:** Replace it with **“A manual budget check with no bank connection.”**

### F-2-7 — Minor — the README exposes internal database jargon in its user-facing introduction

**Location / quote:** README opening: **“It uses a separate `spend-pulse-demo-v1` database and never reads or writes the real-data database.”**

**Why this fails:** The internal database name and “reads or writes” implementation language interrupt the plain product explanation. `.factory/demo.md` already records the exact namespace for verifiers.

**Concrete fix:** Replace it with **“The sample uses separate browser storage, so its changes never touch your entries.”** Keep the exact database name in `.factory/demo.md`.

## Copy audit

Counts are whitespace-delimited. Hyphenated terms, code paths, and version numbers count as one word. Fragments, headings, labels, and actions are included because visitors encounter them as copy. No unit exceeds 22 words, and no banned marketing word appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Spend Pulse | 2 | Pass |
| Demo | 1 | Pass; link |
| Settings | 1 | Pass; link |
| Privacy | 1 | Pass; link |
| A private weekly spending check | 5 | Pass |
| Keep weekly spending on pace | 5 | Pass |
| For people who want a quick budget check without another finance account. | 12 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| See a filled week. | 4 | **F-2-2** |
| Your data stays untouched. | 4 | Pass; `demo-sandbox` |
| Works offline after the first visit. | 6 | Pass; `offline-reload`; placement **F-2-3** |
| Your entries stay on this device. | 6 | **F-2-4**; placement **F-2-3** |
| Free. | 1 | Pass; `local-only`; placement **F-2-3** |
| No account or bank connection. | 5 | Pass; `local-only`; placement **F-2-3** |
| A paper relief map turns a weekly route into seven trail markers. | 12 | Pass; image alternative |
| One route. | 2 | Pass |
| Seven days. | 2 | Pass |
| No bank connection. | 3 | Pass; `local-only` |
| Start here | 2 | Pass |
| Set your weekly amount | 4 | Pass |
| Choose what you can spend on day-to-day extras this week. | 10 | Pass |
| Currency | 1 | Pass |
| USD / EUR / GBP / INR | 4 | Pass |
| Weekly amount | 2 | Pass |
| Set weekly amount | 3 | Pass; result-naming button |
| Route notes | 2 | Pass |
| Check your pace in three steps | 6 | Pass |
| Set one weekly amount | 4 | Pass |
| Use the money you plan for day-to-day extras. | 8 | Pass |
| Add spending as it happens | 5 | Pass |
| Enter an amount. | 3 | Pass |
| A short note is optional. | 5 | Pass |
| Read today’s pace | 3 | Pass |
| See how spending compares with the elapsed week. | 8 | Pass; `pace-check` |
| The boundary | 2 | Pass |
| A budget tool without the baggage | 6 | **F-2-6** |
| Spend Pulse is a manual weekly spending check with no bank connection. | 12 | Pass; `local-only` |
| Your allowance and entries stay in this browser. | 8 | **F-2-5** |
| You can export a copy or clear everything. | 8 | `data-export`; **F-2-1** for incomplete clear coverage |
| Read the privacy note | 4 | Pass; result-naming link |
| One small check for weekly spending pace. | 7 | Pass |
| Privacy | 1 | Pass; link |
| Terms | 1 | Pass; link |
| Built by Param Factory (external site) | 6 | Pass; external destination announced |
| Version 1.0.0 | 2 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Spend Pulse | 2 | Pass |
| See if your weekly spending is on pace with one quick entry. | 12 | Pass; `pace-check` |
| Spend Pulse is for people who abandon large finance apps but still want a small daily or weekly check. | 19 | Pass |
| Set one weekly amount, add day-to-day spending by hand, and check it against this week’s pace. | 16 | Pass; `pace-check` |
| Your entries stay in this browser on your device. | 9 | **F-2-4** |
| There is no account, analytics, bank connection, or cloud sync. | 10 | Pass; `local-only` |
| The app works offline after the first visit. | 8 | Pass; `offline-reload` |
| JSON and CSV exports let users keep a copy. | 9 | Pass; `data-export` |
| Try the isolated sample at `/?demo=1`. | 6 | **F-2-2** |
| It uses a separate `spend-pulse-demo-v1` database and never reads or writes the real-data database. | 14 | **F-2-7**; behavior covered by `demo-sandbox` |
| Run locally | 2 | Pass |
| Requires Node.js 22 or newer. | 5 | Pass; developer prerequisite |
| Open `http://localhost:5173`. | 2 | Pass |
| The demo is at `http://localhost:5173/?demo=1`. | 5 | Pass |
| Test and build | 3 | Pass |
| The exact production build command is `npm run build`. | 9 | Pass |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | Pass |
| Claim tests run with `npm run test:claims`. | 7 | Pass |
| The full suite checks demo reset, pace updates, import/export/clear recovery, and offline reloads. | 13 | **F-2-1** for incomplete entry-clear coverage |
| It also checks notification permission, keyboard use, mobile reflow, and serious accessibility issues. | 13 | Pass |
| Deploy | 1 | Pass |
| Deploy the contents of `dist/` as a static site. | 9 | Pass |
| `staticwebapp.config.json` routes app pages and sets security headers for Azure Static Web Apps. | 13 | Pass; developer deployment detail |
| Project notes | 2 | Pass |
| `.factory/brief.json` records the product scope. | 5 | Pass |
| `.factory/design.md` records the topographic visual system and image provenance. | 9 | Pass |
| `.factory/demo.md` documents sandbox behavior. | 4 | Pass |
| `.factory/claims.json` maps every product claim to a test. | 8 | **F-2-1 / F-2-2** |
| Licensed under the MIT License. | 5 | Pass |
| See `LICENSE`. | 2 | Pass |

## Demo and sandbox

The one-click path passes functionally. A fresh `/?demo=1` first screen shows the banner, H1, `$250` sample explanation, and the live `$82.80` pace panel. The sample contains Lunch with Sam, Groceries, and Train and coffee. Quick add changes `$82.80 → $92.80`; Reset demo restores `$82.80`.

A separate live context created a real `$125` weekly amount, entered and reset the demo, then selected Start for real. The real view still showed `$125`, showed no sample entry, and the demo database had been discarded. All demo-flow requests were same-origin. After the first visit, the controlled demo reloaded offline with its heading and banner and no console/page error.

Evidence: [demo first screen](review-2-artifacts/demo-top-mobile.png) and [live audit](review-2-artifacts/live-audit.json).

## Claims

A clean clone at `/tmp/spend-pulse-review-2-Lz0Lrg` ran `npm ci`, `npm run build`, and every command from `.factory/claims.json` separately.

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS, 1 test |
| `pace-check` | `npm test -- --grep @claim:pace-check` | PASS, 1 test |
| `data-export` | `npm test -- --grep @claim:data-export` | PASS, 1 test |
| `data-import` | `npm test -- --grep @claim:data-import` | PASS, 1 test |
| `data-clear` | `npm test -- --grep @claim:data-clear` | Command passes, but claim coverage fails F-2-1 |
| `demo-reset` | `npm test -- --grep @claim:demo-reset` | PASS, 1 test |
| `notification-permission` | `npm test -- --grep @claim:notification-permission` | PASS, 1 test |
| `on-device-reminder` | `npm test -- --grep @claim:on-device-reminder` | PASS, 1 test |

The full clean-clone suite passed 42/42. Typecheck, lint, build, and production-output checks passed. `npm audit --omit=dev` reported zero vulnerabilities. F-2-1 and F-2-2 prevent a clean claims verdict.

## Earlier findings and regressions

Every finding in `.factory/review-1.md` and every repair assertion in `.factory/polish-1.md` and the prior handoff was checked against current source and production.

| Earlier item | Current confirmation |
| --- | --- |
| F-1-1, long README test sentence | Fixed in source; both replacement sentences are 13 words. |
| F-1-2, “IndexedDB on the device” | Fixed at that location; README now says “this browser on your device.” F-2-4 records the remaining cross-page inconsistency. |
| F-1-3, “discretionary spending” | Fixed; README uses “day-to-day spending.” |
| F-1-4, unlisted four-part landing boundary | Fixed; live copy now uses the registered manual-check/no-bank statement. |
| F-1-5, unlisted financial-advice demo copy | Fixed; neither source nor live demo contains it. |
| F-1-6, unlisted deployment-dependency claim | Fixed; the sentence is absent. |
| F-1-7, visitor-facing art provenance | Fixed; the footer no longer makes this claim, while provenance remains in `design.md`. |
| F-1-8, route metadata and 404 skeleton | Fixed; five routes update title/description/canonical/OG/Twitter fields. The live unknown route returns 404 with the shared header, footer, Privacy, and Terms. |
| Dark result contrast | Fixed; fresh live axe scans found zero serious/critical findings on all six routes in light and dark modes. |
| Inert Undo | Fixed; live delete produced 0 matching entries, Undo restored 1, and reload retained 1. |
| Unsafe malformed import | Fixed; live malformed JSON shape was rejected and the `$82.80` sample remained intact. |
| Amount maximum | Fixed; live `10,000,001` produced the documented range error. |
| Mobile reflow and touch targets | Fixed; at a 34 px root size, document width remained 390 px. Header/footer targets were at least 44 px in each dimension. |

Evidence: [history regression results](review-2-artifacts/history-regressions.json).

## Structure, accessibility, links, and identity

- `/`, `/?demo=1`, `/demo`, `/settings`, `/privacy`, and `/terms` return 200 with one H1, one main, route-specific title/description/canonical/OG/Twitter metadata, favicon, header, footer, Privacy, and Terms. The designed unknown route returns HTTP 404.
- Client navigation and browser Back both restore the correct URL and focus the destination H1. The polite route announcer is present in source.
- All crawled HTTP links return 200. The two mail links are explicit `mailto:` links. No dead link was found.
- `robots.txt`, the five-route sitemap, 1200 × 630 social card, SVG favicon, 180 px apple icon, manifest, and restrictive response headers are present.
- Live axe scans report zero serious/critical violations in light and dark modes. `verify-url.sh` reports `lang=en`, one H1, main, complete image alternatives/button names, and no normal-route errors. The only console resource error was the expected deliberate 404 navigation.
- The topographic paper map, contour language, serif/sans pairing, clipped survey corners, and quiet field-note palette are distinct. This is not a generic centered-gradient SaaS template, and `design.md` records tokens, type, spacing, motion, rationale, and asset provenance.

## Missed leverage

No finding. The brief asks for a private offline weekly pace check with manual entry and an optional on-device reminder. Import/export already covers the obvious portability need. Sync, bank aggregation, or an AI step would expand or conflict with the local-only job rather than complete an implied workflow. No decorative AI or embedded provider key exists.

## What would make this perfect

Strengthen the clear-data claim test, register the populated-sample promise, fit the three facts into the 390 × 844 first screen, standardize “browser” and “weekly amount,” replace the vague privacy heading, and simplify the README demo-storage sentence. Then rerun every claim command, the full suite, and the live cold/demo checks. A PASS requires all seven findings to be gone.
