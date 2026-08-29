# Spend Pulse adversarial review 4 handoff

## Outcome

**FAIL** for source candidate `741c8aea3070cd041cbd23bcacacdf492a91f228` and its byte-matching deployment at https://spend-pulse.sociobot.in.

One minor finding remains: demo Settings reports **“All local data cleared.”** after the demo-only clear action. Full details and the required rewrite/test are in `review-4.md` as F-4-1. No product code was modified.

## Verification performed

- Cold first read at 390 × 844 and 1440 × 900.
- One-click sample, Reset demo, Start for real, real-data isolation, offline reload, and same-origin request log.
- Every one of the 11 exact `.factory/claims.json` commands in clean clone `/tmp/spend-pulse-review-4-DWOQRt`: PASS.
- Full clean-clone suite: 44/44; typecheck, lint, and production build: PASS.
- Live route metadata, 404 behavior, link crawl, history/H1 focus, light/dark Axe scans, and `/opt/fleet/lib/verify-url.sh`: PASS.
- Live and clean-build hashes match for HTML, JS, CSS, hero art, service worker, manifest, and static 404.
- Every finding from reviews 1–3 and their polish reports was rechecked; all earlier finding IDs remain fixed.

## Reproduce the remaining finding

1. Open `https://spend-pulse.sociobot.in/settings?demo=1`.
2. Activate **Clear all demo data** and accept the confirmation.
3. Observe **“All local data cleared.”** instead of a demo-scoped result.

## Next step

Use **“All demo data cleared.”** in demo mode, retain **“All local data cleared.”** for real mode, add the notice assertion to `@claim:data-clear`, and rerun the review gates.
