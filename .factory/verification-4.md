# Independent verification 4 — PASS

**Candidate:** `90d4ea2f36a8399b3641b109fe8df487fe582673`  
**Live URL:** https://spend-pulse.sociobot.in  
**Verified:** 2026-08-29 (UTC)  
**Scope:** independent release QA against the researched brief and factory product contract. No product code was changed.

## Release decision

**PASS.** The live deployment is byte-for-byte aligned with the candidate’s production HTML, JavaScript, CSS, and service worker. The small manual spending loop works end to end, including the isolated sample, local data, recovery paths, and offline reload.

No product defects were found.

## First-read and demo result

A fresh cold visit answered the three required questions in plain words on its first screen:

- It does: “Keep weekly spending on pace,” with a manual weekly amount and spending entries.
- It is for: people who want a quick budget check without another finance account.
- Click first: **Try it with sample data**; its adjacent copy says that it opens a filled week without touching the visitor’s data.

The one-click demo opened `/?demo=1`, displayed the persistent “Demo — sample data, nothing is saved” banner with **Reset demo** and **Start for real**, and seeded the promised $250 week with Lunch with Sam, Groceries, and Train and coffee.

## Required claim tests

`.factory/claims.json` exists and contains 11 claims. Each exact command from it was run separately from this checkout and passed with one selected browser test:

`offline-reload`, `local-only`, `demo-sandbox`, `sample-demo`, `pace-check`, `data-export`, `data-import`, `data-clear`, `demo-reset`, `notification-permission`, and `on-device-reminder`.

The project’s cross-check also passed: every registered claim has exactly one matching `@claim:` browser test.

## Local verification

- `npm ci` passed: 24 packages installed; audit reported 0 vulnerabilities.
- `npm test` passed: **42/42** Playwright tests in 54.8 s.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed and produced `dist/`.
- Build output: app JS 30.08 kB / **9.71 kB gzip**, CSS 17.11 kB / **4.65 kB gzip**, hero image 130.94 kB. These are within the static-PWA budgets.

## Live product checks

- Candidate/deployment identity: SHA-256 comparisons matched for `index.html`, `app-DhZVsPED.js`, `app-BryEukPc.css`, and `sw.js`. Live hashes respectively matched local build/source hashes `9db980e7…`, `b202b44d…`, `5d1de63b…`, and `cb46fd67…`.
- Normal flow: sample quick-add changed spent from $82.80 to $92.80; Reset demo restored $82.80. Starting real data, setting a $100 weekly amount, and adding a $3.50 “Live QA coffee” entry worked.
- Invalid/recovery flow: an amount above 10,000,000 was rejected with “Enter an amount from 0.01 to 10,000,000.” Project tests also passed invalid backup protection, clear/export, delete/undo/reload, and amount-boundary cases.
- Privacy: the cold and demo flows made only same-origin requests for the document, local JS/CSS/font/image assets, and service worker. There were no analytics, account, bank, or cloud calls; no console or page errors occurred.
- Headers: live HTML has CSP with self-only `connect-src`, HSTS, `nosniff`, referrer policy, and permissions policy. Hashed JS/CSS are `public, max-age=31536000, immutable`; HTML, manifest, and `sw.js` revalidate every 30 seconds. Unknown route returns HTTP 404.
- PWA: a live service worker was controlling the page with `spend-pulse-shell-v5`; `registration.update()` completed with no pending update on the current build. In a fresh context, after the initial demo visit, offline reload returned HTTP 200 and still displayed the $250 sample page.
- Responsive/accessibility: desktop and 390×844 mobile were exercised; mobile had `scrollWidth === innerWidth === 390`. Keyboard Tab reached the skip link with a designed `rgb(169, 79, 29) solid 3px` focus outline. Playwright AxeBuilder reported zero serious/critical findings on `/`, `/?demo=1`, `/settings`, `/privacy`, and `/terms` in the live deployment. The local suite additionally covered light/dark routes, 200% text, touch targets, keyboard flow, heading focus, and metadata.
- Not applicable: this static, account-free PWA exposes no server-side API or sign-in, so rate-limit/429 and Entra-tenant checks do not apply.

## Tooling note

The standalone `npx @axe-core/cli` and Lighthouse CLI could not start because this container has no system Chrome binary. This is an environment limitation, not a product failure: the required Chromium is available through Playwright and the live AxeBuilder scan above completed successfully with zero serious/critical findings.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
