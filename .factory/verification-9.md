# Independent verification 9 — Spend Pulse

**Verdict: PASS.** Candidate `db10a0f52562a0d99661209bc1cf62012b33b986` is accepted at https://spend-pulse.sociobot.in. The previous deployment-only concern was not reproducible.

## Scope and first read

- Tested clean checkout: `db10a0f52562a0d99661209bc1cf62012b33b986`; live URL: `https://spend-pulse.sociobot.in`; date: 2026-08-29 UTC.
- Cold first screen clearly says this is a private weekly spending check for people avoiding another finance account. Its first prominent action is **Try it with sample data**, and adjacent copy says a filled week opens without touching the visitor’s data. The offline/local/free facts are also visible. This passes the plain-words and one-click-demo gates. Evidence: `verification-9-artifacts/live-first-read-desktop.png`.

## Claims and clean checks

- `.factory/claims.json` exists and all 11 exact declared commands were run independently after `npm ci`; all passed. The IDs are `offline-reload`, `local-only`, `demo-sandbox`, `sample-demo`, `pace-check`, `data-export`, `data-import`, `data-clear`, `demo-reset`, `notification-permission`, and `on-device-reminder`. The temporary command log recorded 11 `RUN:` entries and 11 passing results.
- `npm run typecheck`: PASS. `npm run lint`: PASS. `npm test`: PASS, 47/47 in 1.2m. `npm run build`: PASS and emits `dist/`. `npm audit --omit=dev`: PASS, 0 vulnerabilities. `git diff --check`: PASS.
- Build budget: JS 30,424 B raw / 9,840 B gzip; CSS 17,202 B raw / 4,660 B gzip; selected 390 px hero 36,674 B.

## Product exercise

- Real flow: set `$175`, add `$12.50` with `Coffee & snack <QA>`, reload; allowance and safely rendered note persisted, with no page or console errors.
- Demo: isolated `$250` sample, three entries, and banner appeared. `$10` quick-add changes `$82.80` to `$92.80`; reset restores the sample. The exact demo-sandbox test also proves ordinary demo exits discard altered sample data while retaining real data.
- Recovery: `$0` and `$10,000,001` weekly values and a `$0` spending entry receive specific 0.01–10,000,000 guidance. CSV export produced `spend-pulse-entries.csv`; malformed JSON reported recovery guidance; valid JSON imported `$99` settings and announced replacement.
- Keyboard, visible focus, 44 px targets, 390 px layout, and 200% text reflow pass in the full suite. A live 390 px reduced-motion check had no horizontal overflow, a visible 3 px solid focus ring, and 0.01 ms reduced-motion duration. Evidence: `verification-9-artifacts/live-mobile-demo-reduced.png`.

## Live deployment, privacy, security, and PWA

- Live root HTML exactly matches local `dist/index.html`. SHA-256 also matched `sw.js`, manifest, 404, hashed JS/CSS, and hero WebP. App JS: `c48d230d2835ec0fe8afde122114214dfc4114da2cef40200ce80c4fe8c9376d`; service worker: `3838f0fa70769069aa41a827f69d6da0bfbc9213cbb8149ad150df4a751a2fe2`.
- Cold and demo request capture found first-party product files only; no analytics, bank, account, ad, or third-party request. This static PWA has no sign-in or server-side product endpoint, so Entra and rate-limit/429 checks are not applicable.
- Headers provide self-only CSP with `frame-ancestors 'none'`, HSTS, nosniff, strict-origin referrer policy, and restrictive Permissions-Policy. HTML/SW cache for 30 seconds; hashed assets are immutable for one year.
- Live Playwright Axe on home, demo, settings, privacy, terms, and 404 in light/dark returned zero violations, including zero serious/critical. `verify-url.sh` passed in 604 ms with title/lang/H1/main/alts/button labels and no console errors. Evidence: `verification-9-artifacts/verify-url-live-2/`.
- Landing links all returned 200. The designed 404 returns 404. The active worker (`spend-pulse-shell-v6`) served an offline demo reload; a verifier-only same-origin worker update showed **An update is ready. Reload to use it.** with no errors.

## Defects

No release-blocking, high, medium, or low defects found. The standalone `@axe-core/cli` could not locate a system Chrome in this container, but the pinned Playwright Chromium Axe integration ran successfully against every live route/theme.
