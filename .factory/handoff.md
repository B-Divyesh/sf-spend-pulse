# Spend Pulse polish 4 handoff

## Outcome

**PASS.** Repair commit `2d8b4c4339ae6f77ceca237e7b5204b3f90d4e25` resolves the only open review finding, F-4-1. The demo-only clear action now reports **“All demo data cleared.”** Real mode retains **“All local data cleared.”** The repair is pushed to `origin/main` and deployment `f84e0937-b378-4483-9442-358f1e881f34` is live at https://spend-pulse.sociobot.in.

The catalog description is now the verb-first, 61-character sentence: “Track weekly spending pace with entries kept in this browser.”

## What changed

- The clear-data handler derives its result copy from the active storage scope.
- `@claim:data-clear` now observes the exact demo confirmation before verifying the cleared JSON backup.
- The new `.factory/polish-4.md` maps F-1-1 through F-4-1 to current evidence.

## Exact verification

- Fresh remote clone: `/tmp/spend-pulse-polish-4-clean` at `2d8b4c4`.
- `npm ci`: pass; `npm audit --omit=dev`: **0 vulnerabilities**.
- Every exact command in `.factory/claims.json` passed separately and selected one test: `offline-reload`, `local-only`, `demo-sandbox`, `sample-demo`, `pace-check`, `data-export`, `data-import`, `data-clear`, `demo-reset`, `notification-permission`, and `on-device-reminder`.
- Full browser suite: `npm test -- --reporter=dot` — **44 passed**.
- `npm run typecheck`, `npm run lint`, and `npm run build`: pass. The build produced `dist/index.html`; JS is 30.13 kB raw / 9.70 kB gzip, CSS is 17.20 kB raw / 4.66 kB gzip, and the hero asset is 130.94 kB.
- Live `verify-url.sh`: HTTP 200; one H1; `lang=en`; main landmark; labelled buttons and images; no console or page errors. Evidence: `.factory/polish-4-artifacts/live-verify/verify.json`.
- Cold production check at 390 × 844: the three facts end at 690, 719, and 748 px; the one-click sample shows the banner, reset/start controls, $82.80 total, and all three sample entries. Evidence: `.factory/polish-4-artifacts/cold-mobile-390.png` and `.factory/polish-4-artifacts/demo-mobile-390.png`.
- Live demo clear at `/settings?demo=1`: HTTP 200 and exact visible result **“All demo data cleared.”** Evidence: `.factory/polish-4-artifacts/demo-clear-mobile-390.png`.
- Live demo reset restored $82.80, and Start for real returned an existing $125 real weekly amount without the demo-only entry. Live offline demo reload also passed after first visit. Route audit passed for `/`, `/?demo=1`, `/settings`, `/privacy`, and `/terms` (200, one H1/main, metadata, legal links); `/missing-page` returned the designed HTTP 404 with legal links.
- Live AxeBuilder scan: 12 scans (light/dark across the six app routes), **0 serious or critical violations**.
- Live mobile Lighthouse: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; LCP 1,964 ms, TBT 0 ms, CLS 0. Evidence: `.factory/polish-4-artifacts/lighthouse-live-mobile.json`.

## Run and deploy

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

Deploy `dist/` as the static site with `public/staticwebapp.config.json` as the configuration source.

## Known gaps

None. No review finding of any severity is deferred.
