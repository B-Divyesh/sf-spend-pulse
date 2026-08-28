import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

test("landing page has the required structure and works at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page).toHaveTitle("Spend Pulse — Keep weekly spending on pace");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Keep weekly spending on pace");
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});

for (const route of ["/", "/demo", "/settings", "/privacy", "/terms", "/missing-page"]) {
  test(`has no serious accessibility issues on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  });
}

test("keyboard setup and entry path works", async ({ page }) => {
  await page.goto("/");
  await page.locator("#allowance").focus();
  await page.keyboard.type("175");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#pulse-title")).toBeVisible();
  await page.locator("#spend-amount").fill("12.50");
  await page.locator("#spend-note").fill("Book");
  await page.getByRole("button", { name: "Add spending" }).click();
  await expect(page.getByText("Book", { exact: true })).toBeVisible();
});

test("invalid inputs explain what to do", async ({ page }) => {
  await page.goto("/");
  await page.locator("#allowance").fill("0");
  await page.getByRole("button", { name: "Set weekly amount" }).click();
  await expect(page.locator("#setup-error")).toContainText("0.01");
});

test("amount caps are enforced even when browser validation is bypassed", async ({ page }) => {
  await page.goto("/");
  await page.locator("#allowance").fill("10000001");
  await page.getByRole("button", { name: "Set weekly amount" }).click();
  await expect(page.locator("#setup-error")).toContainText("10,000,000");
  await page.locator("#allowance").fill("100");
  await page.getByRole("button", { name: "Set weekly amount" }).click();
  await page.locator("#spend-amount").fill("10000001");
  await page.getByRole("button", { name: "Add spending" }).click();
  await expect(page.locator("#entry-error")).toContainText("10,000,000");
});

test("deleting then undoing restores the entry after reload", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Delete Lunch with Sam entry" }).click();
  await expect(page.getByText("Lunch with Sam", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Lunch with Sam", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Lunch with Sam", { exact: true })).toBeVisible();
});

test("invalid backups are rejected before existing data is replaced", async ({ page }) => {
  await page.goto("/settings?demo=1");
  const malformedBackups = [
    { settings: { weeklyAllowance: 100 }, entries: [] },
    { settings: { weeklyAllowance: 250, currency: "X", weekStarts: 1, reminderCadence: "none", reminderTime: "18:00" }, entries: [] },
    { settings: { weeklyAllowance: 250, currency: "USD", weekStarts: 1, reminderCadence: "none", reminderTime: "18:00" }, entries: [{ id: "bad-date", amount: 1, note: "Bad", occurredAt: "2026-02-30", createdAt: "2026-08-24T12:00:00.000Z" }] },
  ];
  for (const [index, malformed] of malformedBackups.entries()) {
    await page.locator("#import-file").setInputFiles({ name: `bad-backup-${index}.json`, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(malformed)) });
    await expect(page.locator("#data-message")).toContainText("not a Spend Pulse backup");
  }
  await page.goto("/demo");
  await expect(page.getByText("Lunch with Sam", { exact: true })).toBeVisible();
  await expect(page.locator(".pace-primary strong")).toHaveText("$82.80");
});

test("@claim:pace-check adding spending updates the weekly pace", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.locator(".pace-primary strong")).toHaveText("$82.80");
  await page.getByRole("button", { name: "Add $10.00" }).click();
  await expect(page.locator(".pace-primary strong")).toHaveText("$92.80");
  await expect(page.getByText("Quick add", { exact: true }).last()).toBeVisible();
});

test("@claim:demo-sandbox demo changes do not touch real data", async ({ page }) => {
  await page.goto("/");
  await page.locator("#allowance").fill("125");
  await page.getByRole("button", { name: "Set weekly amount" }).click();
  await page.goto("/demo");
  await page.locator("#spend-amount").fill("9");
  await page.locator("#spend-note").fill("Demo only");
  await page.getByRole("button", { name: "Add spending" }).click();
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await expect(page.locator(".pace-primary small")).toContainText("$125.00");
  await expect(page.getByText("Demo only", { exact: true })).toHaveCount(0);
});

test("@claim:demo-reset reset demo restores the shipped sample week", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Add $10.00" }).click();
  await expect(page.locator(".pace-primary strong")).toHaveText("$92.80");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator(".pace-primary strong")).toHaveText("$82.80");
  await expect(page.getByText("Lunch with Sam", { exact: true })).toBeVisible();
});

test("@claim:local-only demo flow sends no cross-origin requests", async ({ page }) => {
  const external: string[] = [];
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(request.url());
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") external.push(request.url());
  });
  await page.goto("/demo");
  await page.locator("#spend-amount").fill("7.25");
  await page.getByRole("button", { name: "Add spending" }).click();
  await expect(page.locator(".pace-primary strong")).toHaveText("$90.05");
  expect(external).toEqual([]);
  expect(requests.filter((url) => /analytics|collect|tracking|bank|checkout|purchase/i.test(url))).toEqual([]);
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
  await expect(page.getByText(/buy|subscribe|per month/i)).toHaveCount(0);
});

test("@claim:data-export exports JSON and CSV data", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("link", { name: "Export or import" }).click();
  const jsonDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const json = await jsonDownload;
  const jsonStream = await json.createReadStream();
  const jsonChunks: Buffer[] = [];
  for await (const chunk of jsonStream) jsonChunks.push(Buffer.from(chunk));
  const backup = JSON.parse(Buffer.concat(jsonChunks).toString("utf8"));
  expect(backup.settings.weeklyAllowance).toBe(250);
  expect(backup.entries).toHaveLength(3);

  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csv = await csvDownload;
  const csvStream = await csv.createReadStream();
  const csvChunks: Buffer[] = [];
  for await (const chunk of csvStream) csvChunks.push(Buffer.from(chunk));
  const csvText = Buffer.concat(csvChunks).toString("utf8");
  expect(csvText).toContain('"date","amount","currency","note"');
  expect(csvText.trim().split("\n")).toHaveLength(4);
});

test("@claim:data-import imports a valid backup and replaces the demo data", async ({ page }) => {
  await page.goto("/settings?demo=1");
  const backup = {
    settings: { weeklyAllowance: 180, currency: "EUR", weekStarts: 1, reminderCadence: "none", reminderTime: "18:00" },
    entries: [{ id: "restored-entry", amount: 15.75, note: "Market", occurredAt: "2026-08-24", createdAt: "2026-08-24T12:00:00.000Z" }],
  };
  await page.locator("#import-file").setInputFiles({ name: "spend-pulse-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByText("Backup imported. It replaced the previous local data.")).toBeVisible();
  await expect(page.locator("#settings-allowance")).toHaveValue("180");
  await page.goto("/demo");
  await expect(page.getByText("Market", { exact: true })).toBeVisible();
  await expect(page.getByText("Lunch with Sam", { exact: true })).toHaveCount(0);
});

test("@claim:data-clear clear all removes settings and entries after confirmation", async ({ page }) => {
  await page.goto("/settings?demo=1");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear all demo data" }).click();
  await expect(page.locator("#settings-allowance")).toHaveValue("");
  await page.goto("/demo");
  await expect(page.locator(".pace-primary strong")).toHaveText("$82.80");
});

test("@claim:notification-permission permission waits for an explicit press", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__permissionRequests", { value: 0, writable: true });
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: {
        permission: "default",
        requestPermission: () => {
          (window as unknown as { __permissionRequests: number }).__permissionRequests += 1;
          return Promise.resolve("denied");
        },
      },
    });
  });
  await page.goto("/settings");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __permissionRequests: number }).__permissionRequests)).toBe(0);
  await page.getByRole("button", { name: "Allow and test notification" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __permissionRequests: number }).__permissionRequests)).toBe(1);
});

test("@claim:on-device-reminder a due reminder is shown while open", async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as { __notifications: Array<{ title: string; body: string }> };
    state.__notifications = [];
    Object.defineProperty(window, "Notification", { configurable: true, value: { permission: "granted", requestPermission: () => Promise.resolve("granted") } });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: {},
        addEventListener: () => undefined,
        register: () => Promise.resolve({}),
        ready: Promise.resolve({
          showNotification: (title: string, options: { body: string }) => {
            state.__notifications.push({ title, body: options.body });
            return Promise.resolve();
          },
        }),
      },
    });
  });
  await page.goto("/settings");
  await page.locator("#settings-allowance").fill("200");
  await page.locator("#reminder-cadence").selectOption("daily");
  await page.locator("#reminder-time").fill("00:00");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __notifications: unknown[] }).__notifications.length)).toBe(1);
  const notification = await page.evaluate(() => (window as unknown as { __notifications: Array<{ title: string; body: string }> }).__notifications[0]);
  expect(notification.title).toBe("Check this week’s pace");
  expect(notification.body).toContain("Add today’s spending");
});

test("@claim:offline-reload demo reloads offline after the first visit", async ({ page, context }) => {
  await page.goto("/demo");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await new Promise<void>((resolve) => {
      if (navigator.serviceWorker.controller) resolve();
      else navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
    });
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("See this week’s spending pace");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
});

test("dark mode has no serious accessibility issues in the pace result", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/demo");
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("390px layout reflows at 200% text and core links meet touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.addStyleTag({ content: ":root { font-size: 34px !important; }" });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  for (const locator of [page.getByRole("link", { name: "Privacy" }).last(), page.getByRole("link", { name: "Terms" })]) {
    const box = await locator.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("production output uses hashed assets and supplies a real 404 override", async () => {
  const assets = readdirSync(join(process.cwd(), "dist", "assets"));
  expect(assets.some((name) => /^app-[a-zA-Z0-9_-]+\.js$/.test(name))).toBeTruthy();
  expect(assets.some((name) => /^app-[a-zA-Z0-9_-]+\.css$/.test(name))).toBeTruthy();
  const config = JSON.parse(readFileSync(join(process.cwd(), "dist", "staticwebapp.config.json"), "utf8"));
  expect(config.responseOverrides["404"].rewrite).toBe("/404.html");
  expect(readFileSync(join(process.cwd(), "dist", "404.html"), "utf8")).toContain("This page is not on the route");
});

test("service worker precaches hashed shell assets", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
    }
  });
  const cachedPaths = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const cache = await caches.open(cacheNames.find((name) => name.startsWith("spend-pulse-shell-")) ?? "");
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  expect(cachedPaths).toContainEqual(expect.stringMatching(/^\/assets\/app-[A-Za-z0-9_-]+\.js$/));
  expect(cachedPaths).toContainEqual(expect.stringMatching(/^\/assets\/app-[A-Za-z0-9_-]+\.css$/));
  expect(cachedPaths).toContainEqual(expect.stringMatching(/^\/assets\/terrain-ledger-[A-Za-z0-9_-]+\.webp$/));
});
