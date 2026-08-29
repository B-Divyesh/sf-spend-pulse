# Spend Pulse verification 7 handoff

## Outcome

**PASS.** Candidate `0c57e39586ef2283dc3327d64d5c54c1da6f8ce5` was independently verified at https://spend-pulse.sociobot.in on 2026-08-29. The live deployment matches the exact local production build. The earlier deployment-only failure is not reproduced.

No product code was changed. The full evidence and defect detail are in [verification-7.md](verification-7.md).

## Verification summary

- Every exact command in `.factory/claims.json` passed after the clean lockfile install: 11/11 claims, one selected test each.
- `npm ci`, `npm test` (**44/44**), `npm run typecheck`, `npm run lint`, `npm audit --omit=dev`, and exact `npm run build` passed.
- Cold first-read and one-click isolated demo passed on desktop and 390 px mobile.
- Live normal, boundary, hostile-input, persistence, delete/undo, export/import, reset, notification, demo isolation, and recovery paths passed.
- Live request log stayed same-origin; no cookies or local/session storage keys appeared. Security and cache headers passed.
- Twelve light/dark mobile Axe scans found 0 violations. Keyboard focus, 44 px targets, reduced motion, and zoom/reflow checks passed.
- Service-worker update notice, cache population, offline reload, offline write persistence, manifest, and installability checks passed.
- Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.84 s, TBT 98 ms, CLS 0.
- Local/live SHA-256 hashes match for HTML, JS, CSS, hero WebP, service worker, manifest, and 404 page.

## Defects and known gaps

- Critical/high/medium: none.
- Low F-7-1: weekly-amount inputs declare native `min="1"` although app validation correctly accepts `$0.01`; align the attributes to `0.01` later.
- Low F-7-2: `.factory/design.md` has a stale hero source path; the real source is `src/assets/terrain-ledger.webp`.
- INP has no field data in this independent lab run; Lighthouse TBT was 98 ms and direct interactions were responsive.

Rate-limit/429, backend concurrency/health, Entra sign-in, paid unlock, CLI/library consumer, and AI-gateway checks are not applicable because this is a static, account-free, local-only PWA with no server endpoints.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm audit --omit=dev
npm run build
node .factory/verification-7-artifacts/live-qa.mjs
```

Deployment remains factory-owned; deploy `dist/` as the static site. No infra, DNS, billing, or product code was touched.
