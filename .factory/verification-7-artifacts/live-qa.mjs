import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = "https://spend-pulse.sociobot.in";
const out = ".factory/verification-7-artifacts";
await mkdir(out, { recursive: true });

const result = {
  checkedAt: new Date().toISOString(),
  base,
  failures: [],
  firstRead: {},
  demoFlow: {},
  isolation: {},
  keyboard: {},
  mobile: {},
  axe: [],
  privacy: {},
  pwa: {},
  errors: [],
};

function check(condition, message) {
  if (!condition) result.failures.push(message);
}

function attachErrors(page, label) {
  page.on("console", (message) => {
    const expectedMissingPage = page.url().endsWith("/missing-page") && /status of 404/i.test(message.text());
    if (message.type() === "error" && !expectedMissingPage) result.errors.push(`${label} console: ${message.text()}`);
  });
  page.on("pageerror", (error) => result.errors.push(`${label} page: ${String(error)}`));
}

const browser = await chromium.launch({ headless: true });

// Cold first read, full user loop, request log, response headers, and recovery paths.
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const requests = [];
context.on("request", (request) => requests.push(request.url()));
const page = await context.newPage();
attachErrors(page, "flow");
let dialogs = 0;
page.on("dialog", async (dialog) => { dialogs += 1; await dialog.dismiss(); });
const response = await page.goto(base, { waitUntil: "networkidle" });
const firstSection = page.locator("main section").first();
result.firstRead = {
  status: response?.status(),
  title: await page.title(),
  h1: await page.locator("h1").allInnerTexts(),
  text: await firstSection.innerText(),
  actions: await firstSection.locator("a,button").allInnerTexts(),
  headerSubset: Object.fromEntries(Object.entries(response?.headers() ?? {}).filter(([name]) => [
    "cache-control", "content-security-policy", "permissions-policy", "referrer-policy",
    "strict-transport-security", "x-content-type-options",
  ].includes(name))),
};
check(result.firstRead.status === 200, "cold home did not return 200");
check(result.firstRead.h1.length === 1 && result.firstRead.h1[0] === "Keep weekly spending on pace", "cold H1 did not state the job");
check(result.firstRead.text.includes("For people who want a quick budget check"), "cold screen did not name the user");
check(result.firstRead.actions.includes("Try it with sample data"), "cold screen lacked one-click sample action");
await page.screenshot({ path: `${out}/live-cold-desktop.png`, fullPage: false });

await page.getByRole("link", { name: "Try it with sample data" }).click();
await page.waitForURL(/demo=1/);
const sampleEntries = ["Lunch with Sam", "Groceries", "Train and coffee"];
const originalTotal = await page.locator(".pace-primary strong").innerText();
for (const entry of sampleEntries) check(await page.getByText(entry, { exact: true }).isVisible(), `sample missing ${entry}`);
check(originalTotal === "$82.80", `unexpected sample total ${originalTotal}`);
check(await page.getByText("Demo — sample data, nothing is saved").isVisible(), "demo banner missing");

await page.getByRole("button", { name: "Add $10.00" }).click();
await page.waitForFunction(() => document.querySelector(".pace-primary strong")?.textContent === "$92.80");
const quickTotal = await page.locator(".pace-primary strong").innerText();
check(quickTotal === "$92.80", `quick add produced ${quickTotal}`);

await page.locator("#spend-amount").fill("0");
await page.getByRole("button", { name: "Add spending" }).click();
const zeroError = await page.locator("#entry-error").innerText();
check(zeroError.includes("0.01"), "zero amount lacked recovery guidance");
await page.locator("#spend-amount").fill("10000000.01");
await page.getByRole("button", { name: "Add spending" }).click();
const maxError = await page.locator("#entry-error").innerText();
check(maxError.includes("10,000,000"), "over-cap amount lacked recovery guidance");

const hostile = "<img src=x onerror=alert(1)>";
await page.locator("#spend-amount").fill("0.01");
await page.locator("#spend-note").fill(hostile);
await page.getByRole("button", { name: "Add spending" }).click();
await page.getByText(hostile, { exact: true }).waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelector(".pace-primary strong")?.textContent === "$92.81");
const minTotal = await page.locator(".pace-primary strong").innerText();
check(minTotal === "$92.81", `minimum amount produced ${minTotal}`);
check(await page.getByText(hostile, { exact: true }).isVisible(), "hostile note was not rendered as text");
check(await page.locator(".entry-list img").count() === 0 && dialogs === 0, "hostile note executed markup or script");
await page.reload({ waitUntil: "networkidle" });
check(await page.getByText(hostile, { exact: true }).isVisible(), "entry did not persist after reload");

const secondPage = await context.newPage();
attachErrors(secondPage, "second-tab");
await secondPage.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
check(await secondPage.getByText(hostile, { exact: true }).isVisible(), "entry did not persist in a second tab");
await secondPage.close();

const hostileRow = page.getByText(hostile, { exact: true }).locator("xpath=ancestor::li");
await hostileRow.getByRole("button", { name: /Delete .* entry/ }).click();
await page.getByText(hostile, { exact: true }).waitFor({ state: "detached" });
check(await page.getByText(hostile, { exact: true }).count() === 0, "delete did not remove entry");
await page.getByRole("button", { name: "Undo" }).click();
await page.getByText(hostile, { exact: true }).waitFor({ state: "visible" });
check(await page.getByText(hostile, { exact: true }).isVisible(), "undo did not restore entry");

await page.getByRole("link", { name: "Export or import" }).click();
const jsonDownloadEvent = page.waitForEvent("download");
await page.getByRole("button", { name: "Export JSON" }).click();
const jsonDownload = await jsonDownloadEvent;
const jsonPath = await jsonDownload.path();
const jsonText = await (await import("node:fs/promises")).readFile(jsonPath, "utf8");
const backup = JSON.parse(jsonText);
const csvDownloadEvent = page.waitForEvent("download");
await page.getByRole("button", { name: "Export CSV" }).click();
const csvDownload = await csvDownloadEvent;
const csvPath = await csvDownload.path();
const csvText = await (await import("node:fs/promises")).readFile(csvPath, "utf8");
check(backup.settings.weeklyAllowance === 250 && backup.entries.length === 5, "JSON export did not contain settings and five rows");
check(csvText.startsWith('"date","amount","currency","note"') && csvText.trim().split("\n").length === 6, "CSV export shape was wrong");

await page.locator("#import-file").setInputFiles({
  name: "malformed.json",
  mimeType: "application/json",
  buffer: Buffer.from('{"settings":{"weeklyAllowance":250},"entries":[]}'),
});
const importError = await page.locator("#data-message").innerText();
check(importError.includes("not a Spend Pulse backup"), "malformed import lacked a useful error");
await page.goto(`${base}/?demo=1`);
check(await page.getByText(hostile, { exact: true }).isVisible(), "malformed import replaced existing data");
await page.getByRole("button", { name: "Reset demo" }).click();
await page.waitForFunction(() => document.querySelector(".pace-primary strong")?.textContent === "$82.80");
check(await page.locator(".pace-primary strong").innerText() === "$82.80", "demo reset did not restore the original total");

result.demoFlow = {
  sampleTotal: originalTotal,
  quickTotal,
  zeroError,
  maxError,
  minTotal,
  hostileRenderedAsText: true,
  persistedReload: true,
  persistedSecondTab: true,
  deleteUndo: true,
  jsonRows: backup.entries.length,
  csvRows: csvText.trim().split("\n").length - 1,
  malformedImportError: importError,
  resetTotal: await page.locator(".pace-primary strong").innerText(),
};

result.privacy = {
  requestCount: requests.length,
  uniqueRequests: [...new Set(requests)],
  crossOrigin: requests.filter((url) => new URL(url).origin !== base),
  cookies: await context.cookies(),
  localStorageKeys: await page.evaluate(() => Object.keys(localStorage)),
  sessionStorageKeys: await page.evaluate(() => Object.keys(sessionStorage)),
};
check(result.privacy.crossOrigin.length === 0, `cross-origin requests observed: ${result.privacy.crossOrigin.join(", ")}`);
check(result.privacy.cookies.length === 0, "cookies were created");
check(result.privacy.localStorageKeys.length === 0 && result.privacy.sessionStorageKeys.length === 0, "web storage keys were created outside IndexedDB");
await context.close();

// Demo/real namespace isolation.
const isolationContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const isolationPage = await isolationContext.newPage();
attachErrors(isolationPage, "isolation");
await isolationPage.goto(base);
await isolationPage.locator("#allowance").fill("125");
await isolationPage.getByRole("button", { name: "Set weekly amount" }).click();
await isolationPage.locator(".pace-primary small").waitFor();
await isolationPage.goto(`${base}/?demo=1`);
await isolationPage.locator("#spend-amount").fill("9");
await isolationPage.locator("#spend-note").fill("Demo only");
await isolationPage.getByRole("button", { name: "Add spending" }).click();
const dbsDuringDemo = await isolationPage.evaluate(async () => (await indexedDB.databases()).map((db) => db.name).sort());
await isolationPage.getByRole("button", { name: "Start for real" }).click();
await isolationPage.waitForURL(`${base}/`);
await isolationPage.locator(".pace-primary small").waitFor();
await isolationPage.waitForFunction(() => document.querySelector(".pace-primary small")?.textContent?.includes("$125.00"));
const realAllowance = await isolationPage.locator(".pace-primary small").innerText();
const demoLeakCount = await isolationPage.getByText("Demo only", { exact: true }).count();
result.isolation = { dbsDuringDemo, realAllowance, demoLeakCount };
check(dbsDuringDemo.includes("spend-pulse-demo-v1") && dbsDuringDemo.includes("spend-pulse-real-v1"), "separate demo and real IndexedDB names were not present");
check(realAllowance.includes("$125.00") && demoLeakCount === 0, "demo data leaked into real data");
await isolationContext.close();

// Notification permission is explicit.
const notificationContext = await browser.newContext();
const notificationPage = await notificationContext.newPage();
attachErrors(notificationPage, "notification");
await notificationPage.addInitScript(() => {
  Object.defineProperty(window, "__permissionRequests", { value: 0, writable: true });
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: { permission: "default", requestPermission: () => { window.__permissionRequests += 1; return Promise.resolve("denied"); } },
  });
});
await notificationPage.goto(`${base}/settings?demo=1`);
const permissionBefore = await notificationPage.evaluate(() => window.__permissionRequests);
await notificationPage.getByRole("button", { name: "Allow and test notification" }).click();
const permissionAfter = await notificationPage.evaluate(() => window.__permissionRequests);
result.notification = { permissionBefore, permissionAfter };
check(permissionBefore === 0 && permissionAfter === 1, "notification permission was not limited to the explicit action");
await notificationContext.close();

// Keyboard-only path and visible focus.
const keyboardContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const keyboardPage = await keyboardContext.newPage();
attachErrors(keyboardPage, "keyboard");
await keyboardPage.goto(base, { waitUntil: "networkidle" });
await keyboardPage.waitForTimeout(1000);
await keyboardPage.bringToFront();
await keyboardPage.keyboard.press("Tab");
const firstFocus = await keyboardPage.evaluate(() => ({
  text: document.activeElement?.textContent?.trim(),
  outline: getComputedStyle(document.activeElement).outline,
}));
await keyboardPage.screenshot({ path: `${out}/live-keyboard-focus.png`, fullPage: false });
await keyboardPage.keyboard.press("Enter");
await keyboardPage.getByRole("link", { name: "Try it with sample data" }).focus();
const actionFocus = await keyboardPage.getByRole("link", { name: "Try it with sample data" }).evaluate((element) => getComputedStyle(element).outline);
await keyboardPage.keyboard.press("Enter");
await keyboardPage.waitForURL(/demo=1/);
await keyboardPage.locator("h1").waitFor();
await keyboardPage.waitForFunction(() => document.activeElement === document.querySelector("h1"));
const routeHeadingFocused = await keyboardPage.locator("h1").evaluate((element) => document.activeElement === element);
result.keyboard = { firstFocus, actionFocus, routeHeadingFocused };
check(firstFocus.text === "Skip to main content" && !firstFocus.outline.includes("none"), "skip link was not first with visible focus");
check(actionFocus.includes("3px") && routeHeadingFocused, "demo action focus or route focus management failed");
await keyboardContext.close();

// Mobile first screen, reduced motion, 200% text, touch sizes, and Axe across routes/themes.
const routes = ["/", "/?demo=1", "/settings", "/privacy", "/terms", "/missing-page"];
for (const colorScheme of ["light", "dark"]) {
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme,
    reducedMotion: "reduce",
  });
  const mobilePage = await mobileContext.newPage();
  attachErrors(mobilePage, `mobile-${colorScheme}`);
  for (const route of routes) {
    const routeResponse = await mobilePage.goto(`${base}${route}`, { waitUntil: "networkidle" });
    const axe = await new AxeBuilder({ page: mobilePage }).analyze();
    const serious = axe.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    result.axe.push({ colorScheme, route, status: routeResponse?.status(), violations: axe.violations.length, serious: serious.length });
    check(serious.length === 0, `${colorScheme} ${route} had ${serious.length} serious/critical Axe findings`);
    if (route !== "/missing-page") {
      check(await mobilePage.locator("h1").count() === 1 && await mobilePage.locator("main").count() === 1, `${route} lacked one H1/main`);
    }
  }
  if (colorScheme === "dark") {
    await mobilePage.goto(base, { waitUntil: "networkidle" });
    const factsBottom = await mobilePage.locator(".facts li").last().evaluate((element) => element.getBoundingClientRect().bottom);
    const overflow = await mobilePage.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }));
    const motion = await mobilePage.evaluate(() => {
      const all = [...document.querySelectorAll("*")];
      return {
        animations: document.getAnimations().length,
        maxTransitionSeconds: Math.max(...all.map((element) => {
          const value = getComputedStyle(element).transitionDuration.split(",").map((duration) => parseFloat(duration) || 0);
          return Math.max(...value);
        })),
      };
    });
    const interactive = mobilePage.locator("a:visible,button:visible,input:visible,select:visible,label.file-label:visible");
    let minWidth = Infinity;
    let minHeight = Infinity;
    for (let index = 0; index < await interactive.count(); index += 1) {
      const box = await interactive.nth(index).boundingBox();
      if (box) { minWidth = Math.min(minWidth, box.width); minHeight = Math.min(minHeight, box.height); }
    }
    await mobilePage.screenshot({ path: `${out}/live-cold-mobile-dark-reduced.png`, fullPage: false });
    const cdp = await mobileContext.newCDPSession(mobilePage);
    await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
    const zoomOverflow = await mobilePage.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }));
    await mobilePage.screenshot({ path: `${out}/live-mobile-200-percent.png`, fullPage: true });
    result.mobile = { factsBottom, overflow, motion, minWidth, minHeight, zoomOverflow };
    check(factsBottom <= 844, `mobile first-screen facts ended at ${factsBottom}px`);
    check(overflow.width <= overflow.viewport && zoomOverflow.width <= zoomOverflow.viewport, "mobile page overflowed horizontally");
    check(motion.animations === 0 && motion.maxTransitionSeconds <= 0.00002, "reduced-motion did not remove motion");
    check(minWidth >= 44 && minHeight >= 44, `mobile control target was ${minWidth}x${minHeight}`);
  }
  await mobileContext.close();
}

// PWA registration, cache update check, and a fully offline write/reload.
const pwaContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const pwaPage = await pwaContext.newPage();
attachErrors(pwaPage, "pwa");
await pwaPage.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
const pwaBefore = await pwaPage.evaluate(async () => {
  const registration = await navigator.serviceWorker.ready;
  await registration.update();
  if (!navigator.serviceWorker.controller) {
    await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
  }
  return {
    controller: navigator.serviceWorker.controller?.scriptURL,
    active: registration.active?.scriptURL,
    waiting: registration.waiting?.scriptURL ?? null,
    installing: registration.installing?.scriptURL ?? null,
    caches: await caches.keys(),
    cachedUrls: (await (await caches.open((await caches.keys()).find((name) => name.startsWith("spend-pulse-shell-")))).keys()).map((request) => request.url),
  };
});
await pwaPage.evaluate(async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  await registration?.unregister();
  await navigator.serviceWorker.register("/sw.js?verification-update=7");
});
await pwaPage.locator("#notice").filter({ hasText: "An update is ready" }).waitFor({ state: "visible" });
const updateNotice = await pwaPage.locator("#notice").innerText();
const updateController = await pwaPage.evaluate(() => navigator.serviceWorker.controller?.scriptURL);
await pwaContext.setOffline(true);
await pwaPage.reload({ waitUntil: "domcontentloaded" });
const offlineHeading = await pwaPage.locator("h1").innerText();
await pwaPage.getByRole("button", { name: "Add $5.00" }).click();
await pwaPage.waitForFunction(() => document.querySelector(".pace-primary strong")?.textContent === "$87.80");
const offlineAdded = await pwaPage.locator(".pace-primary strong").innerText();
await pwaPage.reload({ waitUntil: "domcontentloaded" });
const offlineReloaded = await pwaPage.locator(".pace-primary strong").innerText();
await pwaPage.screenshot({ path: `${out}/live-demo-offline.png`, fullPage: false });
result.pwa = { ...pwaBefore, updateNotice, updateController, offlineHeading, offlineAdded, offlineReloaded };
check(pwaBefore.controller?.endsWith("/sw.js") && pwaBefore.active?.endsWith("/sw.js"), "service worker did not control the page");
check(pwaBefore.caches.some((name) => name.startsWith("spend-pulse-shell-")), "versioned shell cache missing");
check(pwaBefore.cachedUrls.some((url) => /\/assets\/app-.*\.js$/.test(url)), "hashed JS was not cached");
check(updateNotice === "An update is ready. Reload to use it." && updateController?.includes("verification-update=7"), "service-worker update did not activate and announce itself");
check(offlineHeading === "See this week’s spending pace" && offlineAdded === "$87.80" && offlineReloaded === "$87.80", "offline reload/write/reload failed");
await pwaContext.close();

check(result.errors.length === 0, `${result.errors.length} browser console/page errors occurred`);
await browser.close();
await writeFile(`${out}/live-qa.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(result.failures.length ? 1 : 0);
