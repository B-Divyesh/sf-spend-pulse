# Spend Pulse review 5 handoff

## Outcome

**FAIL.** No product code was changed. The independent review is recorded in [review-5.md](review-5.md).

The live product and clean-clone suite are otherwise healthy, but two gaps explicitly deferred in the prior handoff remain. The review contract requires every earlier unresolved finding to return as blocking.

## Verified

- Fresh clone at `5ae17271cac29fd8515becd7752def547938fccd`: `npm ci`, all 11 exact claim commands, `npm test` (44 tests), `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit --omit=dev` passed.
- The live phone and desktop first screens clearly state the job, audience, and sample action. One click opens the populated isolated demo; Reset and Start for real behaved correctly.
- Demo traffic was same-origin only. Live route metadata, 404, deep links, Back/focus restoration, link crawl, and twelve light/dark Axe scans passed.

## Blocking follow-up

- **F-7-1:** change both weekly-amount native minimum attributes from `1` to `0.01` and add an attribute regression test.
- **F-7-2:** correct `.factory/design.md` to name `assets/src/terrain-ledger.png` as the generated source and `src/assets/terrain-ledger.webp` / hashed `dist/assets/` as the shipped asset path.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

Then inspect `https://spend-pulse.sociobot.in` at 390 px and desktop, enter `/?demo=1`, and read [review-5.md](review-5.md). Deployment remains factory-owned.
