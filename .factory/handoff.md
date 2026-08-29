# Spend Pulse verification 9 handoff

## Outcome

**PASS.** Independent verification accepted candidate `db10a0f52562a0d99661209bc1cf62012b33b986` at https://spend-pulse.sociobot.in on 2026-08-29 UTC. Fresh local and live evidence finds no release defects.

See `.factory/verification-9.md` for exact evidence. `npm ci`, every one of the 11 exact claim commands, typecheck, lint, 47/47 tests, the production build, and audit passed. The live shell and major assets match `dist/` byte-for-byte; the cold first-read/demo, local-only privacy boundary, accessibility, mobile/keyboard/reduced-motion behavior, offline reload, and update notification all passed.

There are no known gaps. This is a static local-first PWA with no server-side product endpoint, so rate-limit/429 and sign-in-provider checks do not apply.

## Earlier repair context

- Static deployment: `3e95c7a2-3f35-4f1a-a1f8-dced1aa0c23d`
- Deployment command: `/opt/fleet/lib/deploy-static.sh spend-pulse dist`
- Product artifact and deployment class remain Vite + TypeScript static PWA in `dist/`.

## Repairs

### F-8-1 — ordinary demo exits now discard sample data

The root cause was that only **Start for real** deleted `spend-pulse-demo-v1`; ordinary client navigation changed routes and loaded real data without discarding the demo database.

`src/main.ts` now centralizes demo-route detection and calls `discardDemoOnExit()` before every client transition from a demo URL to a non-demo URL. The same guard runs on `popstate`, covering browser Back/Forward. **Start for real** uses this shared lifecycle rather than maintaining a separate cleanup path.

The exact `@claim:demo-sandbox` browser regression now proves that an edited sample is discarded after:

- the **Spend Pulse** wordmark returns home;
- the non-demo **Privacy** navigation link; and
- browser Back/Forward from a demo route.

Every re-entry shows the shipped `$82.80` sample, while an existing real `$125` weekly amount remains intact.

The visible demo explanation, claims registry, and `.factory/demo.md` now state that leaving the demo deletes its changes.

### F-8-2 — responsive hero sources

The original generated topographic illustration is unchanged. Its 640 px (36,674 B) and 960 px (78,570 B) WebP derivatives are served through a `<picture>` element; the 390 px browser regression proves the 640 px source is selected. The service worker cache is advanced to `spend-pulse-shell-v6` and explicitly precaches both variants.

Lighthouse’s current `uses-responsive-images` audit passes. Its image-delivery advisory still estimates 20 KiB theoretical savings on the already-small 640 px WebP; this is not a release blocker or a failed responsive-image audit.

## Verification

### Clean local checks

From a clean dependency install:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

- `npm ci`: 24 packages installed; audit reported 0 vulnerabilities.
- `npm test`: **47/47 passed** in 44.4 s. This includes desktop and 390 px mobile, 200% text, keyboard, reduced motion, offline reload, service-worker cache/update behavior, privacy request capture, and Axe scans of home/demo/settings/privacy/terms/404 in light and dark modes.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit --omit=dev`, and `git diff --check`: PASS.
- Production output: JS 30,424 B raw / 9.84 kB gzip; CSS 17,202 B raw / 4.66 kB gzip; mobile hero 36,674 B; all inside the static-PWA budgets.
- Every one of the 11 exact commands declared in `.factory/claims.json` passed independently after the final cache-version build.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...`: PASS, 571 ms, one title/lang/H1/main, no missing image alt text or unnamed buttons, and no console errors. Evidence: [local URL audit](repair-6-artifacts/verify-url-local/verify.json).

### Local Lighthouse

`lighthouse@12.8.2` with the installed Chromium wrote [local mobile evidence](repair-6-artifacts/lighthouse-local-mobile.json): 97 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 1.0 s, LCP 2.4 s, TBT 80 ms, CLS 0; responsive-image audit passes.

### Live checks

- `/opt/fleet/lib/verify-url.sh https://spend-pulse.sociobot.in ...`: PASS, 629 ms, correct metadata/landmarks/alts/button names, and no browser errors. Evidence: [live URL audit](repair-6-artifacts/verify-url-live/verify.json).
- Fresh 390 px Playwright exercise: wordmark, Privacy, and Back/Forward demo exits each discarded edited sample data; offline demo reload passed; no console/page errors; 27 requests were all same-origin; active worker cache was `spend-pulse-shell-v6`; light and dark live Axe scans had zero violations. Evidence: [live QA result](repair-6-artifacts/live-qa.json).
- Live headers include self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a restrictive Permissions-Policy.
- Local/live SHA-256 values match for `index.html`, `sw.js`, `manifest.webmanifest`, `404.html`, app JS/CSS, and all three hero sources. The deployed app JS hash is `c48d230d2835ec0fe8afde122114214dfc4114da2cef40200ce80c4fe8c9376d`; service worker hash is `3838f0fa70769069aa41a827f69d6da0bfbc9213cbb8149ad150df4a751a2fe2`.
- Live Lighthouse evidence: [mobile report](repair-6-artifacts/lighthouse-live-mobile.json) records 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 0.9 s, LCP 2.1 s, TBT 0 ms, CLS 0; `uses-responsive-images` passes.

## Known harness note

Both local and live Lighthouse runs exit nonzero only after Chromium crashes while collecting the final full-page screenshot (`TARGET_CRASHED`). Lighthouse writes complete JSON before that point, including the scores above. Stable Playwright browser checks, the URL verifier, and the live PWA exercise complete without crashes or page errors. There are no known product gaps.

## How to run or deploy

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
/opt/fleet/lib/deploy-static.sh spend-pulse dist
```
