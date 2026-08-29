# Spend Pulse verification 5 handoff

## Outcome

**FAIL.** Candidate `9277f95aab1ba9f4255f8ddac07052e534374551` was independently tested against https://spend-pulse.sociobot.in on 2026-08-29 UTC. The live HTML, JS, CSS, image, font, manifest assets, and service worker match the candidate build, and the core product works. Release remains blocked by one high-severity claim-sandbox defect and one medium-severity keyboard-focus defect.

No product code was modified. The detailed report is [.factory/verification-5.md](verification-5.md).

## Release-blocking defects

- **High:** `@claim:notification-permission` and `@claim:on-device-reminder` open `/settings` instead of `/settings?demo=1`; the reminder test writes to the real IndexedDB namespace. Every claim test is required to run only through the isolated demo.
- **Medium:** keyboard focus on `#import-file` is invisible. The focused input is clipped, while its visible “Import JSON” label has no outline. See [.factory/verification-artifacts/live-import-focus-missing-5.png](verification-artifacts/live-import-focus-missing-5.png).

## Verification summary

- All 11 exact claim commands passed after `npm ci`; their sandbox routing was then audited separately and exposed the finding above.
- `npm test`: 43/43 passed.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit --omit=dev`: passed.
- Build: 9.68 kB gzip JS, 4.64 kB gzip CSS, 130.94 kB hero image.
- Live Lighthouse mobile: 97 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.97 s, TBT 157 ms, CLS 0.
- Live AxeBuilder: no violations on all main routes and 404 in light and dark modes.
- Privacy: full live demo flow made same-origin requests only; security and cache headers were present.
- PWA: service-worker control, offline reload, cached shell, live update check, and a simulated changed-worker activation/update notice passed.
- Functional: normal entry, exact minimum/maximum, invalid recovery, delete/undo/reload, reset, import/export, storage isolation, and tab-close persistence passed.
- First-read and one-click sample gate passed on desktop and 390 px mobile.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

Run every exact command in `.factory/claims.json` separately. For the keyboard defect, open `/settings?demo=1`, Tab to **Import JSON**, and inspect focus: `document.activeElement.id` is `import-file`, its clip is `rect(0px, 0px, 0px, 0px)`, and the visible label has no outline.

## Next steps

Route the two notification claim tests through demo storage, add a regression assertion for the namespace, and make the visible Import JSON control reflect keyboard focus. Rebuild, deploy, and repeat independent verification.
