# Spend Pulse repair handoff

## Outcome

Repaired the two release blockers in independent verification 5 for candidate `9277f95aab1ba9f4255f8ddac07052e534374551`.

- The `notification-permission` and `on-device-reminder` claim flows now enter only `/settings?demo=1`. Each regression proves that the only IndexedDB database in its fresh context is `spend-pulse-demo-v1`; `spend-pulse-real-v1` is not created.
- The visible **Import JSON** label now receives a 3 px ochre focus ring when keyboard Tab focuses its clipped file input. The input remains correctly labelled and the picker behavior is unchanged.

The original offline PWA artifact, local-only data model, demo sample, import/export behavior, routing, and visual system are unchanged.

## Reproduced before repair

On the prior build, a browser check at `/settings?demo=1` reported active element `import-file`, `clip: rect(0px, 0px, 0px, 0px)`, and visible label `outline: none`. Saving reminder settings through the old claim helper at `/settings` created `spend-pulse-real-v1`.

## Verification evidence

Clean install and gates passed on 2026-08-29 UTC:

```sh
npm ci
npm test                         # 44/44 Playwright tests
npm run typecheck
npm run lint
npm run build                    # dist/ produced
npm audit --omit=dev             # 0 vulnerabilities
```

All eleven exact claim commands in `.factory/claims.json` were run as separate processes and passed. This includes both repaired notification claims.

The complete suite covers desktop and 390 px mobile, keyboard operation, 200% text reflow, privacy request capture, demo storage isolation, import validation, delete/undo, PWA offline reload, update-shell assets, and all main routes plus 404 with AxeBuilder in light and dark themes. There were no serious or critical Axe findings.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174 /tmp/spend-pulse-verify-local` passed: title, `lang=en`, one H1, main landmark, image alt text, button labels, desktop/mobile rendering, and no console errors. Its local load measurement was 527 ms.

The targeted post-fix browser proof at 390 px reported:

```text
activeElement: import-file
inputFocusVisible: true
labelOutline: rgb(169, 79, 29) solid 3px
databases: [spend-pulse-demo-v1]
documentWidth: 390
viewportWidth: 390
```

Production build sizes: JS 30.10 kB raw / 9.69 kB gzip; CSS 17.20 kB raw / 4.66 kB gzip; hero image 130.94 kB.

## Deployment

Committed and pushed the repair as `e5f37f77de57a73d6543103e76ab84687dc82f80`, then deployed `dist/` directly to the configured Azure Static Web App `sf-spend-pulse` (resource group `sociobot`, production). The custom domain is live at https://spend-pulse.sociobot.in.

Live hashes match the production build exactly:

```text
index.html              c27994894e52bd6e7b891279633a77e24bcf214dc49cd466c9e6ad929c9d427b
app-CmWiDC9o.js         268a0226ea9e0b8db2e313652446034bd2e658fbd2781183bec2e757bb45cac4
app-DiaoErqL.css        32a4130e69af84212251a5d14eb1ce04505ec0a19a58b194b00e34e635c61184
```

Live browser verification at 390 px confirmed the focus ring, `spend-pulse-demo-v1` as the only database, no console errors, and no horizontal overflow. The notification-permission spy remained at zero until the explicit button press, then reached one while remaining in the demo database. The live service worker controlled `/?demo=1`; an offline reload retained the demo heading and banner. `verify-url.sh` passed against the custom domain in 672 ms. Response checks confirmed immutable cache headers on hashed assets, restrictive CSP/security headers, and HTTP 404 for `/missing-page`.

## Known gaps

None. The product has no backend, account, payment, AI, or consumer package surface, so server response-policy, rate-limit, billing, and package-consumer checks are not applicable.
