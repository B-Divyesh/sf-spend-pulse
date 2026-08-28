import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
  await expect(page.locator("#setup-error")).toContainText("greater than zero");
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
