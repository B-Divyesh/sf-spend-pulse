# Spend Pulse demo

- URL: `https://spend-pulse.sociobot.in/?demo=1` (local: `http://localhost:5173/?demo=1`)
- Entry point: the “Try it with sample data” link on the first screen.
- Sample: a $250 weekly amount and three current-week entries for lunch, groceries, and train fare with coffee.
- Storage: IndexedDB database `spend-pulse-demo-v1`. Real data uses `spend-pulse-real-v1`; the two are never read together.
- Reset: press “Reset demo” in the persistent demo bar. It deletes and reseeds only the demo database.
- Exit: press “Start for real”. It discards demo data and opens the real, empty app. Existing real data remains unchanged.
- Offline check: visit `/?demo=1` once, wait for the service worker, switch the browser offline, and reload.

The demo needs no account, API, or network request beyond the product’s own files.
