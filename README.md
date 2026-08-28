# Spend Pulse

See if your weekly spending is on pace with one quick entry.

Spend Pulse is for people who abandon large finance apps but still want a small daily or weekly check. Set one weekly amount, add day-to-day spending by hand, and check it against this week’s pace.

Your entries stay in this browser on your device. There is no account, analytics, bank connection, or cloud sync. The app works offline after the first visit. JSON and CSV exports let users keep a copy.

Try the isolated sample at `/?demo=1`. It uses a separate `spend-pulse-demo-v1` database and never reads or writes the real-data database.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. The demo is at `http://localhost:5173/?demo=1`.

## Test and build

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

The exact production build command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

Claim tests run with `npm run test:claims`. The full suite checks demo reset, pace updates, import/export/clear recovery, and offline reloads. It also checks notification permission, keyboard use, mobile reflow, and serious accessibility issues.

## Deploy

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` routes app pages and sets security headers for Azure Static Web Apps.

## Project notes

- `.factory/brief.json` records the product scope.
- `.factory/design.md` records the topographic visual system and image provenance.
- `.factory/demo.md` documents sandbox behavior.
- `.factory/claims.json` maps every product claim to a test.

Licensed under the MIT License. See `LICENSE`.
