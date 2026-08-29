# Spend Pulse independent verification 8 handoff

## Outcome

**FAIL.** Candidate `ed56d770d5547ba5cd3c3a6dd0359393a041e8eb` was independently tested at https://spend-pulse.sociobot.in on 2026-08-29. Product code was not changed. Full evidence and reproduction details are in [verification-8.md](verification-8.md).

The live deployment matches the candidate production build byte for byte, and the previously reported deployment-only failure was not reproduced. Release is blocked by one demo lifecycle defect:

- **Medium F-8-1:** add/change demo data, leave via the **Spend Pulse** wordmark, then re-enter through **Demo**. The changed sample returns (`$90.57` with `Exit persistence probe`) instead of being discarded back to the shipped `$82.80` sample. **Start for real** does discard it, but ordinary navigation does not satisfy the demo-sandbox exit requirement.

A low performance issue is also recorded: the 130,944-byte hero WebP has no responsive `srcset`/`sizes`; Lighthouse estimates about 100 KiB avoidable mobile transfer.

## Verification summary

- `.factory/claims.json`: present; all 11 exact claim commands passed independently after `npm ci`.
- `npm test`: 46/46 passed.
- `npm run typecheck`, `npm run lint`, exact `npm run build`, and `npm audit --omit=dev`: passed.
- First-read gate: passed on desktop and 390 px; the job, audience, first action, outcome, and three facts are visible.
- Core live loop: sample, quick/manual entries, min/max/invalid recovery, XSS text handling, delete/Undo, persistence, export, malformed-import preservation, reset, reminders, and real/demo isolation passed.
- Accessibility: 12 light/dark route scans found 0 Axe violations; keyboard focus, 44 px targets, reduced motion, 200% text/zoom, semantic structure, and mobile overflow checks passed.
- Privacy: 44 recorded requests across 19 URLs were all same-origin; no cookies or web-storage keys; required CSP/security headers present.
- PWA: installability clean; service-worker control/update notice and offline write/reload passed.
- Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.96 s, TBT 104 ms, CLS 0.
- Deployment identity: local/live hashes match for HTML, service worker, manifest, 404, hashed JS/CSS/source map, and hero.
- Server API allowance/429 and Entra sign-in checks: not applicable; this static PWA exposes neither endpoints nor authentication.

Evidence is in `.factory/verification-8-artifacts/`.

## Required repair

Discard the demo database on every transition from demo mode to a non-demo route. Add coverage for wordmark/home and non-demo nav exit followed by demo re-entry. Then repeat all claim, full-suite, build, deployment identity, PWA, accessibility, privacy, and Lighthouse checks.

## Reproduce passing gates

```sh
npm ci
npm run test:claims
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

Open `https://spend-pulse.sociobot.in/?demo=1` in a fresh context for F-8-1. Add `$7.77` with note `Exit persistence probe`, press **Spend Pulse**, then **Demo**. The defect is present when `$90.57` and the probe note return.
