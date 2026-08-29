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

Push `main` to trigger the configured static deployment, then verify the deployed hashed JS/CSS identity, live `/settings?demo=1` focus behavior, service-worker offline reload/update behavior, headers, and the two demo-only notification claims.

## Known gaps

None. The product has no backend, account, payment, AI, or consumer package surface, so server response-policy, rate-limit, billing, and package-consumer checks are not applicable.
