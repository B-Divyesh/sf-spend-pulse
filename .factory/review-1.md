# Adversarial first-read review 1 — Spend Pulse

**Date:** 2026-08-28 UTC  
**Target:** `https://spend-pulse.sociobot.in`  
**Verdict:** **FAIL** — eight minor findings remain. No blocking functional or claim-test failure was reproduced.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 before scrolling. There were no page or console errors.

I understood the product as: a private, manual weekly spending check that compares what I have spent with how far through the week I am. It is for people who want a small budget check without an account or bank connection. I would click **“Try it with sample data”** first; the nearby text says **“See a filled week. Your data stays untouched.”**

This passes the first-screen clarity check. At 390 px the headline is visible at y=521–607, the action at y=723–771, and its outcome text at y=787–807; at desktop the same action is visible at y=596–644. The topographic map identity is distinct and does not resemble a generic SaaS template.

## Findings

### F-1-1 — Minor — README sentence exceeds the 22-word limit

**Location / quote:** `README.md`, Test and build: “The full suite checks the demo sandbox and reset, pace updates, import/export/clear recovery, offline reloads, explicit notification permission, keyboard use, mobile reflow, and serious accessibility issues in both color schemes.” (30 words)

**Why this fails:** The sentence is difficult to scan and breaks the stated hard copy limit.

**Concrete fix:** Replace it with: “The full suite checks demo reset, pace updates, import/export/clear recovery, and offline reloads. It also checks notification permission, keyboard use, mobile reflow, and serious accessibility issues.”

### F-1-2 — Minor — README uses storage jargon instead of the product’s plain language

**Location / quote:** `README.md`, opening copy: “Entries stay in IndexedDB on the device.”

**Why this fails:** “IndexedDB” is browser implementation jargon. It also conflicts with the landing page’s clearer terms, “this device” and “this browser.” The plain-words requirement explicitly covers the README.

**Concrete fix:** Replace it with: “Your entries stay in this browser on your device.” Put the implementation detail in a separate developer note only if needed.

### F-1-3 — Minor — README changes the name of the thing being recorded

**Location / quote:** `README.md`, opening copy: “Set one weekly amount, add discretionary spending by hand, and read the pace against the elapsed week.”

**Why this fails:** The landing page calls this “spending” and “day-to-day extras.” “Discretionary spending” introduces a third, more formal term for the same concept.

**Concrete fix:** Replace it with: “Set one weekly amount, add day-to-day spending by hand, and check it against this week’s pace.”

### F-1-4 — Minor — Landing scope claims have no entry or observable test in `claims.json`

**Location / quote:** landing privacy section: “Spend Pulse does not connect to banks, import transactions, show investments, or give financial advice.”

**Why this fails:** This is a claim-like sentence a visitor may rely on. `local-only` covers the no-account/no-analytics/no-bank-connection bundle, but no listed claim or test covers transaction importing, investment display, or financial advice. The claims contract requires every claim-like landing sentence to be listed and tested, or removed.

**Concrete fix:** Either replace it with the already-tested statement “Spend Pulse is a manual weekly spending check with no bank connection,” or split the retained promises into claim entries and add observable browser tests for each promised boundary.

### F-1-5 — Minor — A second unlisted financial-advice claim repeats in the demo result

**Location / quote:** `/demo`, pace panel: “It is a guide, not financial advice.”

**Why this fails:** This is another user-reliant scope promise with no `claims.json` entry or test.

**Concrete fix:** Remove the sentence, or add a `not-financial-advice` claim with a test that verifies the displayed explanatory copy and that no advice/recommendation action is offered.

### F-1-6 — Minor — README makes an unlisted deployment claim

**Location / quote:** `README.md`, Deploy: “No environment variables or external services are required.”

**Why this fails:** A deployer could rely on this statement, but it has no claim entry or clean-environment test.

**Concrete fix:** Add a `no-runtime-services` claim whose test builds and serves the app in a clean environment while intercepting all browser requests, or remove the sentence.

### F-1-7 — Minor — Asset-origin claim is unlisted

**Location / quote:** landing footer: “Original generated map art.”

**Why this fails:** This asserts provenance. The provenance is documented in `.factory/design.md`, but it is not listed or testable through `claims.json` as required for landing claims.

**Concrete fix:** Remove the visitor-facing provenance assertion and retain the documented provenance, or add an `art-provenance` claim that checks the shipped prompt sidecar and generated source asset are present and named by the design document.

### F-1-8 — Minor — Non-home route metadata and the production 404 do not follow the common route skeleton

**Location / evidence:** `src/main.ts` updates `document.title` and the canonical URL in `render()`, but does not update the description, Open Graph, or Twitter title/description for `/demo`, `/settings`, `/privacy`, or `/terms`. `public/404.html` has no description, canonical, Open Graph, Twitter card, apple-touch icon, shared navigation, or shared footer containing Privacy and Terms. The live unknown route returns the designed page with HTTP 404, so this is a production-path issue rather than dead code.

**Why this fails:** A shared link to a non-home route advertises the landing page rather than the page the visitor will receive. The 404 also breaks the required consistent header/footer skeleton and omits required metadata.

**Concrete fix:** Maintain per-route metadata in the SPA and update description/OG/Twitter fields during route changes. Make the response-override 404 use the same header/footer (or a static equivalent), add its description/canonical/OG/Twitter/apple metadata, and include Privacy and Terms links.

## Copy audit

Word counts use whitespace-delimited words; labels and buttons are included because visitors read them. No landing unit exceeds 22 words. The README flags are recorded above.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Spend Pulse | 2 | Pass |
| Demo | 1 | Pass |
| Settings | 1 | Pass |
| Privacy | 1 | Pass |
| A private weekly spending check | 5 | Pass |
| Keep weekly spending on pace | 5 | Pass |
| For people who want a quick budget check without another finance account. | 12 | Pass |
| Try it with sample data | 5 | Pass |
| See a filled week. | 5 | Pass |
| Your data stays untouched. | 4 | Pass; covered by `demo-sandbox` |
| Works offline after the first visit. | 6 | Pass; covered by `offline-reload` |
| Your entries stay on this device. | 6 | Pass; covered by `local-only` |
| Free. | 1 | Pass; covered by `local-only` |
| No account or bank connection. | 5 | Pass; covered by `local-only` |
| One route. | 2 | Pass |
| Seven days. | 2 | Pass |
| No bank connection. | 3 | Pass; covered by `local-only` |
| Start here | 2 | Pass |
| Set your weekly amount | 4 | Pass |
| Choose what you can spend on day-to-day extras this week. | 10 | Pass |
| Currency | 1 | Pass |
| USD / EUR / GBP / INR | 4 | Pass |
| Weekly amount | 2 | Pass |
| Set weekly amount | 3 | Pass |
| Route notes | 2 | Pass |
| Check your pace in three steps | 6 | Pass |
| Set one weekly amount | 4 | Pass |
| Use the money you plan for day-to-day extras. | 9 | Pass |
| Add spending as it happens | 5 | Pass |
| Enter an amount. | 3 | Pass |
| A short note is optional. | 5 | Pass |
| Read today’s pace | 3 | Pass |
| See how spending compares with the elapsed week. | 8 | Pass |
| The boundary | 2 | Pass |
| A budget tool without the baggage | 6 | Pass |
| Spend Pulse does not connect to banks, import transactions, show investments, or give financial advice. | 15 | **F-1-4** |
| Your allowance and entries stay in this browser. | 8 | Pass; covered by `local-only` |
| You can export a copy or clear everything. | 8 | Pass; covered by `data-export` / `data-clear` |
| Read the privacy note | 4 | Pass |
| One small check for weekly spending pace. | 7 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| Version 1.0.0 | 2 | Pass |
| Original generated map art | 4 | **F-1-7** |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Spend Pulse | 2 | Pass |
| See if your weekly spending is on pace with one quick entry. | 12 | Pass |
| Spend Pulse is for people who abandon large finance apps but still want a small daily or weekly check. | 19 | Pass |
| Set one weekly amount, add discretionary spending by hand, and read the pace against the elapsed week. | 17 | **F-1-3** |
| Entries stay in IndexedDB on the device. | 8 | **F-1-2** |
| There is no account, analytics, bank connection, or cloud sync. | 10 | Pass; covered by `local-only` |
| The app works offline after the first visit. | 8 | Pass; covered by `offline-reload` |
| JSON and CSV exports let users keep a copy. | 9 | Pass; covered by `data-export` |
| Try the isolated sample at `/demo`. | 6 | Pass |
| It uses a separate `spend-pulse-demo-v1` database and never reads or writes the real-data database. | 13 | Pass; covered by `demo-sandbox` |
| Run locally | 2 | Pass |
| Requires Node.js 22 or newer. | 5 | Pass |
| Open `http://localhost:5173`. | 1 | Pass |
| The demo is at `http://localhost:5173/demo`. | 5 | Pass |
| Test and build | 3 | Pass |
| The exact production build command is `npm run build`. | 9 | Pass |
| Static output lands in `dist/`, with `dist/index.html` at its root. | 9 | Pass |
| Claim tests run with `npm run test:claims`. | 6 | Pass |
| The full suite checks the demo sandbox and reset, pace updates, import/export/clear recovery, offline reloads, explicit notification permission, keyboard use, mobile reflow, and serious accessibility issues in both color schemes. | 30 | **F-1-1** |
| Deploy | 1 | Pass |
| Deploy the contents of `dist/` as a static site. | 9 | Pass |
| `staticwebapp.config.json` provides SPA fallback and security headers for Azure Static Web Apps. | 10 | Plain for the intended deployer; no flag |
| No environment variables or external services are required. | 8 | **F-1-6** |
| Project notes | 2 | Pass |
| `.factory/brief.json` records the product scope. | 4 | Pass |
| `.factory/design.md` records the topographic visual system and image provenance. | 8 | Pass |
| `.factory/demo.md` documents sandbox behavior. | 4 | Pass |
| `.factory/claims.json` maps every product claim to a test. | 7 | Pass |
| Licensed under the MIT License. | 5 | Pass |
| See `LICENSE`. | 2 | Pass |

## Demo, claims, privacy, and history checks

- One click from the landing action opened `/demo`. The first demo screen already showed a $250 allowance, a $82.80 total, and three realistic entries: Lunch with Sam, Groceries, and Train and coffee.
- The persistent banner said **“Demo — sample data, nothing is saved”** and exposed **Reset demo** and **Start for real**. Adding $10 changed the total to $92.80; Reset restored $82.80. The clean-clone `@claim:demo-sandbox` test also proved real data remains separate.
- A fresh live demo visit was service-worker controlled; after `context.setOffline(true)`, it reloaded with the demo heading and banner and no console error.
- Fresh clone `/tmp/spend-pulse-review-1` passed `npm ci`, `npm test` (27/27), `npm run build`, and each listed command separately: `offline-reload`, `local-only`, `demo-sandbox`, `pace-check`, `data-export`, `data-import`, `data-clear`, `demo-reset`, `notification-permission`, and `on-device-reminder`.
- The live demo request trace contained only same-origin product files. No account, tracking, billing, or external request was observed.
- Earlier history consisted of `.factory/handoff.md` and no prior `review-*.md` or `polish-*.md`. Its navigation-touch-target defect has been fixed: the current source has 44 px minimum dimensions, and the clean-clone regression test passed at desktop and 390 px. No earlier finding was merely marked fixed.

## Structure check

Live `GET` responses were 200 for `/`, `/demo`, `/settings`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, favicon, manifest, and `/404.html`; `/missing-page` correctly returned the designed 404 with HTTP 404. The main routes have one H1, landmarks, valid titles, canonical URLs, self-hosted assets, favicon, manifest, robots, sitemap, CSP, referrer policy, and Privacy/Terms links. The app focuses the H1 and announces it after client-side route changes. All landing links resolved (including the external factory link and mail links). The per-route metadata and static-404 exceptions are F-1-8.

## Missed leverage

No additional feature finding. The brief calls for a private offline weekly allowance, one-tap entry, rolling pace, and optional on-device reminder; each is present. Import/export is already supplied. AI, sync, and bank aggregation would conflict with the stated local-first no-bank scope and are not implied necessities.

## What would make this perfect

Resolve F-1-1 through F-1-8, then rerun the clean-clone claim commands, full suite, and live route metadata/404 checks. A PASS requires zero remaining findings, including unlisted claims and README copy flags.
