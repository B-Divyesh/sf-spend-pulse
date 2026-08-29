# Adversarial first-read review 5 — Spend Pulse

**Date:** 2026-08-29 UTC  
**Target:** https://spend-pulse.sociobot.in  
**Reviewed revision:** `5ae17271cac29fd8515becd7752def547938fccd`  
**Verdict:** **FAIL** — two earlier documented gaps remain. Per the review instruction, each is blocking because it was left unresolved in the prior handoff.

## Cold first read

Fresh Chromium contexts opened the live root at 390 × 844 and 1440 × 900, without scrolling. There were no console or page errors.

- **What it does:** A manual weekly spending check that compares entered spending with the week’s pace.
- **For whom:** People who want a quick budget check without another finance account.
- **What to click first:** **“Try it with sample data.”** Its adjacent result text is **“See a filled week. Your data stays untouched.”**

All three answers are present before scrolling at both sizes. At 390 px, the H1 ends at y=479, the sample action at y=623, and all three facts are visible by y=748. The topographic map, paper palette, survey-cut panels, and Georgia/Atkinson pairing are distinct and do not resemble a generic SaaS template.

## Findings

### F-7-1 — BLOCKING, unresolved — native weekly-amount minimum conflicts with the accepted minimum

**Location / evidence:** The live setup input exposes `min="1"` and `step="0.01"`. Source has the same `min="1"` at `src/main.ts:161` and on the Settings input at `src/main.ts:286`. The application validation and error copy accept `0.01` (`src/main.ts:389` and `:443`); a live entry of `0.01` successfully opened the pace panel.

**Why this fails:** The prior handoff recorded this as F-7-1 and deferred it. Native validation, assistive technology, and number steppers describe a $1 minimum while the product accepts one cent. The minimum is therefore inconsistent at the point a visitor enters the weekly amount. The history rule requires this unresolved earlier finding to be blocking again.

**Concrete fix:** Change both native attributes to `min="0.01"`. Add a regression assertion that both `#allowance` and `#settings-allowance` expose `min="0.01"`, alongside the existing valid-$0.01 behavior test.

### F-7-2 — BLOCKING, unresolved — asset provenance documents a nonexistent shipped path

**Location / evidence:** `.factory/design.md:55` says the live hero is `public/assets/terrain-ledger.webp`; that path does not exist. The imported optimized asset is `src/assets/terrain-ledger.webp`, and the production build emits a hashed file in `dist/assets/`. The original PNG and prompt sidecar correctly exist in `assets/src/`.

**Why this fails:** The prior handoff recorded this as F-7-2 and deferred it. The design document is the required provenance record, so its delivery path must let a maintainer locate the actual product asset. A nonexistent `public/assets/` path breaks that handoff trail. The history rule makes this unresolved finding blocking again.

**Concrete fix:** Replace the asset-plan entry with explicit source and build paths, for example: “`assets/src/terrain-ledger.png` is the generated source; `src/assets/terrain-ledger.webp` is the optimized app asset, emitted as a hashed file in `dist/assets/`.” Keep the prompt sidecar location in the same section.

## Copy audit

Counts treat hyphenated words, URLs, paths, and version numbers as one word. Headings, labels, actions, alternative text, and footer copy are included because a visitor encounters them. No item exceeds 22 words, uses a banned marketing adjective, relies on a mood/metaphor heading, or uses a non-result-naming action. The product terms are consistent: **weekly amount**, **spending/entry**, **pace**, and **demo**.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Spend Pulse | 2 | Pass |
| Demo / Settings / Privacy | 1 each | Pass; destination links |
| A private weekly spending check | 5 | Pass |
| Keep weekly spending on pace | 5 | Pass; H1 |
| For people who want a quick budget check without another finance account. | 12 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| See a filled week. | 4 | Pass; `sample-demo` |
| Your data stays untouched. | 4 | Pass; `demo-sandbox` |
| Works offline after the first visit. | 6 | Pass; `offline-reload` |
| Your entries stay in this browser. | 6 | Pass; `local-only` |
| Free. | 1 | Pass; `local-only` |
| No account or bank connection. | 5 | Pass; `local-only` |
| A paper relief map turns a weekly route into seven trail markers. | 12 | Pass; image alternative |
| Track one weekly amount without connecting a bank. | 8 | Pass; `local-only` |
| Start here · 01 | 3 | Pass |
| Set your weekly amount | 4 | Pass |
| Choose what you can spend on day-to-day extras this week. | 10 | Pass |
| Currency | 1 | Pass |
| USD / EUR / GBP / INR | 1 each | Pass; options |
| Weekly amount | 2 | Pass |
| Set weekly amount | 3 | Pass; result-naming action |
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
| You can export a copy or clear everything. | 8 | Pass; `data-export`, `data-clear` |
| Read the privacy note | 4 | Pass; destination action |
| One small check for weekly spending pace. | 7 | Pass |
| Terms | 1 | Pass; destination link |
| Built by Param Factory | 4 | Pass; external destination is announced to screen readers |
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
| Static output lands in `dist/`, with `dist/index.html` at its root. | 10 | Pass |
| Claim tests run with `npm run test:claims`. | 7 | Pass |
| The full suite checks demo reset, pace updates, import/export/clear recovery, and offline reloads. | 13 | Pass |
| It also checks notification permission, keyboard use, mobile reflow, and serious accessibility issues. | 13 | Pass |
| Deploy | 1 | Pass; heading |
| Deploy the contents of `dist/` as a static site. | 9 | Pass |
| `staticwebapp.config.json` routes app pages and sets security headers for Azure Static Web Apps. | 13 | Pass; developer deployment detail |
| Project notes | 2 | Pass; heading |
| `.factory/brief.json` records the product scope. | 5 | Pass |
| `.factory/design.md` records the topographic visual system and image provenance. | 9 | Pass |
| `.factory/demo.md` documents demo behavior. | 4 | Pass |
| `.factory/claims.json` maps every product claim to a test. | 8 | Pass |
| Licensed under the MIT License. | 5 | Pass |
| See `LICENSE`. | 2 | Pass |

No unlisted visitor-facing product claim was found on the landing page or README. The implementation/build statements in the README were checked directly against the repository and build output.

## Demo, claims, and sandbox

The one-click path passes functionally. From the landing link, `/?demo=1` immediately showed the persistent **“Demo — sample data, nothing is saved”** banner, Reset demo, Start for real, the $250 sample amount, $82.80 spent, and three realistic entries: Lunch with Sam, Groceries, and Train and coffee. Adding $10 gave $92.80; Reset restored $82.80.

A separate live context set a real $125 amount, added a demo-only $9 entry, then selected Start for real. The real view returned at `0% of $125.00` and did not contain the demo entry. The live demo request log contained only `https://spend-pulse.sociobot.in`; no cross-origin request, account flow, analytics request, or provider key was observed. The clean-clone offline claim also passed.

All eleven exact commands in `.factory/claims.json` passed from fresh clone `/tmp/spend-pulse-review-5-eMxd4Q`, each selecting one test: `offline-reload`, `local-only`, `demo-sandbox`, `sample-demo`, `pace-check`, `data-export`, `data-import`, `data-clear`, `demo-reset`, `notification-permission`, and `on-device-reminder`. The full suite passed 44 tests. `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit --omit=dev` passed; the build emitted `dist/` with 9.70 kB gzip JavaScript.

## Earlier findings and regressions

Every prior review, polish note, and handoff was read and checked against current source and the live site.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 through F-1-3 | Fixed: README sentences are short, say “this browser,” and use “day-to-day spending.” |
| F-1-4 through F-1-7 | Fixed: only registered product boundaries remain; financial-advice, deployment-service, and footer-provenance claims are absent. |
| F-1-8 | Fixed: live routes have route-specific metadata and the 404 has the shared skeleton and legal links. |
| F-2-1 | Fixed: `data-clear` creates a unique entry and observes exported empty settings and entries. |
| F-2-2 | Fixed: `sample-demo` verifies the populated $250 sample and all three entries. |
| F-2-3 | Fixed: all required facts fit in the 390 × 844 first screen. |
| F-2-4 through F-2-7 | Fixed: visitor copy consistently says browser and weekly amount, uses direct headings, and keeps database jargon out of README. |
| F-3-1 | Fixed: `pace-check` observes progress and pace-difference changes, not only the spent total. |
| F-3-2 | Fixed: the reminder test covers due daily, due weekly, and non-due weekly branches. |
| F-3-3 through F-3-8 | Fixed: the landing, demo, and 404 use plain section labels and accurate demo-return wording. |
| F-4-1 | Fixed: clearing demo data says “All demo data cleared.” |
| F-7-1 | **Unfixed; reopened as blocking above.** |
| F-7-2 | **Unfixed; reopened as blocking above.** |

The earlier unnumbered regressions also remain fixed: delete/Undo survives reload, malformed imports preserve existing data, the maximum amount is enforced, 390 px reflow has no horizontal overflow, and navigation targets meet the 44 px baseline.

## Structure, accessibility, links, and identity

- `/`, `/?demo=1`, `/demo`, `/settings`, `/privacy`, and `/terms` returned 200. `/missing-page` returned the designed 404; `/404.html` returned 200 as the static 404 document.
- Every route had one H1, one main landmark, `lang="en"`, a description, canonical, Open Graph/Twitter metadata, favicon, apple touch icon, header, footer, Privacy, and Terms. Titles followed the required product/page pattern.
- Clicking Privacy moved focus to its H1; Back returned to `/` and focused the landing H1. Direct deep links opened their destination state.
- The crawl found no dead link: internal destinations and the factory link returned 200; the two explicit mail links were identified as `mailto:`.
- Live Axe scans found zero violations on six routes in both light and dark mode. No console error occurred on normal routes. The documented visual system is visibly distinct and respects reduced motion in the local regression suite.

## Missed leverage

No additional feature finding. The brief calls for a private offline weekly pace check, one-tap entry, and optional on-device reminder; those are present. Import/export covers the implied portability need. AI, sync, and bank aggregation would expand or conflict with the manual, local-first job, and no decorative AI or embedded provider key exists.

## What would make this perfect

Resolve F-7-1 and F-7-2, add their small regression checks, then rerun the clean-clone claim commands, full suite, and live cold/demo route audit. A PASS requires those two previously deferred gaps to be gone as well as the existing functional checks to remain green.
