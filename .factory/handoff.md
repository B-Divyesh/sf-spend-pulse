# Spend Pulse adversarial review 2 handoff

## Outcome

Review 2 is complete against live production and candidate `8aa426434409ecd8ef59b511d20372a92f007ba0`.

Verdict: **FAIL**. `.factory/review-2.md` records one blocking claim-coverage defect and six minor copy/first-screen findings. No product code was changed.

The blocking issue is not a runtime failure: the `data-clear` command passes, but its test does not assert that entries are removed even though the registered sandbox requires that assertion. The live product otherwise completed the core job, one-click demo, reset, real/demo isolation, and offline flow.

## Verification performed

From a clean clone at `/tmp/spend-pulse-review-2-Lz0Lrg`:

- `npm ci`: passed; 24 packages, zero reported vulnerabilities.
- `npm run build`: passed and produced `dist/`.
- Every one of the ten `.factory/claims.json` commands ran separately and selected one passing test.
- `npm test`: passed 42/42.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm audit --omit=dev`: passed with zero vulnerabilities.

Live checks covered:

- Fresh 390 × 844 and 1440 × 900 first reads.
- Populated `$250` demo, `$82.80 → $92.80 → $82.80` quick-add/reset flow, and `$125` real-data isolation.
- Offline reload after service-worker control and same-origin request logging.
- Route metadata, H1/main/header/footer structure, 404 status and design, deep links, H1 focus, browser Back, and all links.
- Light/dark axe scans on all product routes; zero serious/critical findings.
- Earlier Undo, malformed-import, maximum-amount, dark-contrast, 200% mobile reflow, and 44 px target regressions.
- `/opt/fleet/lib/verify-url.sh`; the live root passed.

Evidence is under `.factory/review-2-artifacts/`.

## Findings left for repair

1. Strengthen `@claim:data-clear` to prove both settings and entries are empty.
2. Register and tag the populated-sample demo promise.
3. Fit all three product facts into the 390 × 844 first screen.
4. Standardize browser/device storage wording.
5. Standardize weekly amount/allowance terminology.
6. Replace “A budget tool without the baggage” with a self-contained heading.
7. Remove the internal database name from the README introduction.

See `.factory/review-2.md` for exact quotes, word counts, evidence, and concrete rewrites.
