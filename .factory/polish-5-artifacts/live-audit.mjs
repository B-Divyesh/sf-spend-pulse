import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const base = "https://spend-pulse.sociobot.in";
const out = ".factory/polish-5-artifacts";
const result = {
  checkedAt: new Date().toISOString(),
  base,
  failures: [],
  errors: [],
  firstScreen: {},
  demo: {},
  isolation: {},
  routes: [],
  axe: [],
  offline: {},
  privacy: {},
};

function check(condition, message) {
  if (!condition) result.failures.push(message);
}

function watch(page, label) {
  page.on("console", (message) => {
    const expected404 = page.url().includes("missing-page") && /404/.test(message.text());
    if (message.type() === "error" && !expected404) result.errors.push(`${label} console: ${message.text()}`);
  });
  page.on("pageerror", (error) => result.errors.push(`${label} page: ${String(error)}`));
}

const browser = await chromium.launch({ headless: true });

const flowContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const requests = [];
flowContext.on("request", (request) => requests.push(request.url()));
const flow = await flowContext.newPage();
watch(flow, "flow");
const coldResponse = await flow.goto(`${base}/?polish=5`, { waitUntil: "networkidle" });
const factBottoms = await flow.locator(".facts li").evaluateAll((items) => items.map((item) => item.getBoundingClientRect().bottom));
const firstText = await flow.locator(".hero-copy").innerText();
const setupMin = await flow.locator("#allowance").getAttribute("min");
result.firstScreen = {
  status: coldResponse?.status(),
  title: await flow.title(),
  h1: await flow.locator("h1").allInnerTexts(),
  firstText,
  factBottoms,
  setupMin,
  width: await flow.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth })),
};
check(coldResponse?.status() === 200, "cold home did not return 200");
check(result.firstScreen.title === "Spend Pulse — Keep weekly spending on pace", "cold title is wrong");
check(result.firstScreen.h1.length === 1 && result.firstScreen.h1[0] === "Keep weekly spending on pace", "cold H1 is wrong");
check(firstText.includes("For people who want a quick budget check without another finance account."), "first screen does not identify the user");
check(firstText.includes("Try it with sample data") && firstText.includes("See a filled week. Your data stays untouched."), "sample action or outcome is missing");
check(factBottoms.length === 3 && factBottoms.every((bottom) => bottom <= 844), "all three facts do not fit the first mobile screen");
check(result.firstScreen.width.scroll <= result.firstScreen.width.viewport, "cold mobile page overflows horizontally");
check(setupMin === "0.01", `setup minimum is ${setupMin}`);
await flow.screenshot({ path: `${out}/cold-mobile-390.png`, fullPage: false });

await flow.getByRole("link", { name: "Try it with sample data" }).click();
await flow.waitForURL(`${base}/?demo=1`);
const sampleEntries = ["Lunch with Sam", "Groceries", "Train and coffee"];
await flow.locator(".pace-primary strong").waitFor();
for (const entry of sampleEntries) {
  await flow.getByText(entry, { exact: true }).waitFor();
  check(await flow.getByText(entry, { exact: true }).isVisible(), `sample entry missing: ${entry}`);
}
check(await flow.getByText("Demo — sample data, nothing is saved").isVisible(), "demo banner is missing");
check(await flow.getByRole("button", { name: "Reset demo" }).isVisible(), "Reset demo is missing");
check(await flow.getByRole("button", { name: "Start for real" }).isVisible(), "Start for real is missing");
const sampleTotal = await flow.locator(".pace-primary strong").innerText();
await flow.getByRole("button", { name: "Add $10.00" }).click();
await flow.waitForFunction(() => document.querySelector(".pace-primary strong")?.textContent === "$92.80");
const changedTotal = await flow.locator(".pace-primary strong").innerText();
await flow.getByRole("button", { name: "Reset demo" }).click();
await flow.waitForFunction(() => document.querySelector(".pace-primary strong")?.textContent === "$82.80");
const resetTotal = await flow.locator(".pace-primary strong").innerText();
await flow.screenshot({ path: `${out}/demo-mobile-390.png`, fullPage: false });

await flow.goto(`${base}/settings?demo=1`, { waitUntil: "networkidle" });
const settingsMin = await flow.locator("#settings-allowance").getAttribute("min");
await flow.locator("#settings-allowance").fill("0.01");
const settingsUnderflow = await flow.locator("#settings-allowance").evaluate((input) => input.validity.rangeUnderflow);
await flow.getByRole("button", { name: "Save settings" }).click();
await flow.waitForFunction(() => document.querySelector("#notice")?.textContent === "Settings saved in this browser.");
const saveNotice = await flow.locator("#notice").innerText();
flow.once("dialog", (dialog) => dialog.accept());
await flow.getByRole("button", { name: "Clear all demo data" }).click();
await flow.waitForFunction(() => document.querySelector("#notice")?.textContent === "All demo data cleared.");
const clearNotice = await flow.locator("#notice").innerText();
check(settingsMin === "0.01" && settingsUnderflow === false, `settings minimum is ${settingsMin} or rejects 0.01`);
check(saveNotice === "Settings saved in this browser.", `settings notice is ${saveNotice}`);
check(clearNotice === "All demo data cleared.", `demo clear notice is ${clearNotice}`);
result.demo = { sampleTotal, changedTotal, resetTotal, entries: sampleEntries, settingsMin, settingsUnderflow, saveNotice, clearNotice };
check(sampleTotal === "$82.80" && changedTotal === "$92.80" && resetTotal === "$82.80", "demo sample/add/reset totals are wrong");
result.privacy = { requests: requests.length, crossOrigin: requests.filter((url) => new URL(url).origin !== base) };
check(result.privacy.crossOrigin.length === 0, `cross-origin requests: ${result.privacy.crossOrigin.join(", ")}`);
await flowContext.close();

const isolationContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const isolation = await isolationContext.newPage();
watch(isolation, "isolation");
await isolation.goto(base);
await isolation.locator("#allowance").fill("125");
await isolation.getByRole("button", { name: "Set weekly amount" }).click();
await isolation.locator(".pace-primary small").waitFor();
await isolation.goto(`${base}/?demo=1`);
await isolation.locator("#spend-amount").fill("9");
await isolation.locator("#spend-note").fill("Demo only");
await isolation.getByRole("button", { name: "Add spending" }).click();
const databaseNames = await isolation.evaluate(async () => (await indexedDB.databases()).map((database) => database.name).sort());
await isolation.getByRole("button", { name: "Start for real" }).click();
await isolation.waitForURL(`${base}/`);
const realAmount = await isolation.locator(".pace-primary small").innerText();
const leakedEntries = await isolation.getByText("Demo only", { exact: true }).count();
result.isolation = { databaseNames, realAmount, leakedEntries };
check(databaseNames.includes("spend-pulse-demo-v1") && databaseNames.includes("spend-pulse-real-v1"), "demo and real storage were not separate");
check(realAmount.includes("$125.00") && leakedEntries === 0, "demo data touched real data");
await isolationContext.close();

const routeCases = [
  ["/", "Spend Pulse — Keep weekly spending on pace", "/"],
  ["/?demo=1", "Demo — Spend Pulse", "/demo"],
  ["/settings", "Settings — Spend Pulse", "/settings"],
  ["/privacy", "Privacy — Spend Pulse", "/privacy"],
  ["/terms", "Terms — Spend Pulse", "/terms"],
];
const routeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const routePage = await routeContext.newPage();
watch(routePage, "routes");
for (const [route, expectedTitle, canonicalPath] of routeCases) {
  const response = await routePage.goto(`${base}${route}`, { waitUntil: "networkidle" });
  const record = {
    route,
    status: response?.status(),
    title: await routePage.title(),
    description: await routePage.locator('meta[name="description"]').getAttribute("content"),
    canonical: await routePage.locator('link[rel="canonical"]').getAttribute("href"),
    h1Count: await routePage.locator("h1").count(),
    mainCount: await routePage.locator("main").count(),
    privacyLinks: await routePage.getByRole("link", { name: "Privacy", exact: true }).count(),
    termsLinks: await routePage.getByRole("link", { name: "Terms", exact: true }).count(),
  };
  result.routes.push(record);
  check(record.status === 200 && record.title === expectedTitle, `${route} status or title is wrong`);
  check(Boolean(record.description) && record.canonical === `${base}${canonicalPath}`, `${route} metadata is incomplete`);
  check(record.h1Count === 1 && record.mainCount === 1 && record.privacyLinks > 0 && record.termsLinks > 0, `${route} skeleton is incomplete`);
}
await routePage.goto(base);
await routePage.getByRole("link", { name: "Privacy" }).first().click();
await routePage.waitForFunction(() => document.activeElement === document.querySelector("h1"));
check(await routePage.locator("h1").evaluate((heading) => document.activeElement === heading), "route change did not focus the H1");
await routePage.goBack();
await routePage.waitForFunction(() => document.activeElement === document.querySelector("h1"));
check(await routePage.locator("h1").evaluate((heading) => document.activeElement === heading), "Back did not restore H1 focus");
const missingResponse = await routePage.goto(`${base}/missing-page`, { waitUntil: "networkidle" });
check(missingResponse?.status() === 404, "missing page did not return HTTP 404");
check(await routePage.locator("h1").innerText() === "This page was not found", "404 H1 is not plain");
check(await routePage.getByRole("link", { name: "Privacy", exact: true }).count() > 0 && await routePage.getByRole("link", { name: "Terms", exact: true }).count() > 0, "404 legal links are missing");
await routePage.screenshot({ path: `${out}/live-404-mobile.png`, fullPage: false });
await routeContext.close();

for (const colorScheme of ["light", "dark"]) {
  const axeContext = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme, reducedMotion: "reduce" });
  const axePage = await axeContext.newPage();
  watch(axePage, `axe-${colorScheme}`);
  for (const route of ["/", "/?demo=1", "/settings", "/privacy", "/terms", "/missing-page"]) {
    await axePage.goto(`${base}${route}`, { waitUntil: "networkidle" });
    const audit = await new AxeBuilder({ page: axePage }).analyze();
    const serious = audit.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
    result.axe.push({ colorScheme, route, violations: audit.violations.length, serious: serious.length });
    check(serious.length === 0, `${colorScheme} ${route} has ${serious.length} serious/critical Axe findings`);
  }
  await axeContext.close();
}

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
watch(offlinePage, "offline");
await offlinePage.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
await offlinePage.evaluate(async () => {
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
});
await offlineContext.setOffline(true);
await offlinePage.reload({ waitUntil: "domcontentloaded" });
await offlinePage.getByRole("button", { name: "Add $5.00" }).click();
await offlinePage.waitForFunction(() => document.querySelector(".pace-primary strong")?.textContent === "$87.80");
const offlineAdded = await offlinePage.locator(".pace-primary strong").innerText();
await offlinePage.reload({ waitUntil: "domcontentloaded" });
const offlineReloaded = await offlinePage.locator(".pace-primary strong").innerText();
result.offline = { heading: await offlinePage.locator("h1").innerText(), offlineAdded, offlineReloaded };
check(result.offline.heading === "See this week’s spending pace" && offlineAdded === "$87.80" && offlineReloaded === "$87.80", "offline demo write/reload failed");
await offlinePage.screenshot({ path: `${out}/demo-offline-mobile.png`, fullPage: false });
await offlineContext.close();

check(result.errors.length === 0, `${result.errors.length} unexpected console/page errors occurred`);
await browser.close();
await writeFile(`${out}/live-audit.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(result.failures.length ? 1 : 0);
