import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const base = "https://spend-pulse.sociobot.in";
const out = ".factory/review-3-artifacts";
const browser = await chromium.launch({ headless: true });
const report = { auditedAt: new Date().toISOString(), base, cold: {}, demo: {}, routes: [], links: [], axe: [], headers: {} };

async function elementInfo(page, selector) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) return null;
  return { text: (await locator.innerText()).trim(), box: await locator.boundingBox() };
}

for (const [name, viewport] of Object.entries({ mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } })) {
  const context = await browser.newContext({ viewport, serviceWorkers: "block" });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on("request", request => requests.push(request.url()));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  const response = await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/cold-${name}.png`, fullPage: false });
  report.cold[name] = {
    viewport,
    status: response?.status(),
    scrollY: await page.evaluate(() => scrollY),
    title: await page.title(),
    bodyText: await page.locator("body").innerText(),
    h1: await elementInfo(page, "h1"),
    audience: await elementInfo(page, ".hero .lede"),
    action: await elementInfo(page, ".hero-actions a"),
    outcome: await elementInfo(page, ".hero-actions span"),
    facts: await page.locator(".facts li").evaluateAll(nodes => nodes.map(node => ({ text: node.textContent.trim(), box: node.getBoundingClientRect().toJSON() }))),
    visibleUnits: await page.locator("h1,h2,h3,p,li,figcaption,label,button,a,.eyebrow,.map-label").evaluateAll(nodes => nodes.filter(node => {
      const style = getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden";
    }).map(node => ({ tag: node.tagName.toLowerCase(), text: node.textContent.replace(/\s+/g, " ").trim() })).filter(item => item.text)),
    requests,
    crossOriginRequests: requests.filter(url => new URL(url).origin !== base),
    consoleErrors,
    pageErrors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on("request", request => requests.push(request.url()));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.locator("#allowance").fill("125");
  await page.getByRole("button", { name: "Set weekly amount" }).click();
  await page.locator(".pace-primary small").waitFor();
  await page.locator(".pace-primary small").filter({ hasText: "$125.00" }).waitFor();
  await page.getByRole("link", { name: "Demo" }).click();
  await page.waitForURL(base + "/?demo=1");
  await page.screenshot({ path: `${out}/demo-mobile.png`, fullPage: false });
  const initial = {
    url: page.url(),
    title: await page.title(),
    h1: await page.locator("h1").innerText(),
    banner: await page.locator(".demo-bar").innerText(),
    total: await page.locator(".pace-primary strong").innerText(),
    weeklyAmount: await page.locator(".pace-primary small").innerText(),
    entries: await page.locator(".entry-list strong").allInnerTexts(),
    databases: await page.evaluate(async () => (await indexedDB.databases()).map(item => item.name).sort()),
  };
  await page.getByRole("button", { name: "Add $10.00" }).click();
  await page.locator(".pace-primary strong").filter({ hasText: "$92.80" }).waitFor();
  const afterQuickAdd = await page.locator(".pace-primary strong").innerText();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.locator(".pace-primary strong").filter({ hasText: "$82.80" }).waitFor();
  await page.locator(".entry-list strong").filter({ hasText: "Quick add" }).waitFor({ state: "detached" });
  const afterReset = {
    total: await page.locator(".pace-primary strong").innerText(),
    entries: await page.locator(".entry-list strong").allInnerTexts(),
  };
  await page.locator("#spend-amount").fill("9");
  await page.locator("#spend-note").fill("Demo only review 3");
  await page.getByRole("button", { name: "Add spending" }).click();
  await page.getByText("Demo only review 3", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Start for real" }).click();
  await page.waitForURL(base + "/");
  await page.locator(".pace-primary small").filter({ hasText: "$125.00" }).waitFor();
  await page.reload({ waitUntil: "networkidle" });
  const afterExit = {
    url: page.url(),
    totalPlan: await page.locator(".pace-primary small").innerText(),
    leakedDemoEntryCount: await page.getByText("Demo only review 3", { exact: true }).count(),
    databases: await page.evaluate(async () => (await indexedDB.databases()).map(item => item.name).sort()),
  };
  report.demo = {
    initial,
    afterQuickAdd,
    afterReset,
    afterExit,
    requests,
    crossOriginRequests: requests.filter(url => new URL(url).origin !== base),
    consoleErrors,
    pageErrors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base + "/?demo=1", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  report.demo.offlineReload = {
    title: await page.title(),
    h1: await page.locator("h1").innerText(),
    bannerVisible: await page.locator(".demo-bar").isVisible(),
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base + "/settings");
  await page.locator("#settings-allowance").fill("200");
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.locator("#notice.is-visible").waitFor();
  report.settingsSaveNotice = await page.locator("#notice").innerText();
  await context.close();
}

const routePaths = ["/", "/?demo=1", "/demo", "/settings", "/privacy", "/terms", "/missing-review-3", "/404.html"];
for (const path of routePaths) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  const response = await page.goto(base + path, { waitUntil: "networkidle" });
  const metadata = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    ogDescription: document.querySelector('meta[property="og:description"]')?.content,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content,
    favicon: document.querySelector('link[rel="icon"]')?.href,
    appleTouch: document.querySelector('link[rel="apple-touch-icon"]')?.href,
    h1: [...document.querySelectorAll("h1")].map(node => node.textContent.trim()),
    mainCount: document.querySelectorAll("main").length,
    headerCount: document.querySelectorAll("header").length,
    footerCount: document.querySelectorAll("footer").length,
    privacyLinks: [...document.querySelectorAll('a[href="/privacy"]')].length,
    termsLinks: [...document.querySelectorAll('a[href="/terms"]')].length,
  }));
  report.routes.push({ path, status: response?.status(), ...metadata, consoleErrors, pageErrors });
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const hrefSet = new Set();
  for (const path of routePaths) {
    await page.goto(base + path);
    for (const href of await page.locator("a[href]").evaluateAll(nodes => nodes.map(node => node.href))) hrefSet.add(href);
  }
  const hrefs = [...hrefSet];
  for (const href of hrefs) {
    if (href.startsWith("mailto:")) report.links.push({ href, status: "mailto" });
    else {
      const response = await context.request.get(href, { failOnStatusCode: false });
      report.links.push({ href, status: response.status() });
    }
  }
  await page.goto(base + "/");
  await page.getByRole("link", { name: "Privacy" }).first().click();
  await page.waitForFunction(() => location.pathname === "/privacy" && document.activeElement?.tagName === "H1" && document.activeElement?.textContent?.includes("Your spending"));
  const forward = { url: page.url(), focused: await page.locator(":focus").innerText() };
  await page.goBack();
  await page.waitForFunction(() => location.pathname === "/" && document.activeElement?.tagName === "H1" && document.activeElement?.textContent?.includes("Keep weekly"));
  const back = { url: page.url(), focused: await page.locator(":focus").innerText() };
  report.history = { forward, back };
  await context.close();
}

for (const colorScheme of ["light", "dark"]) {
  for (const path of ["/", "/?demo=1", "/settings", "/privacy", "/terms", "/missing-review-3"]) {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    await page.goto(base + path, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page }).analyze();
    report.axe.push({ colorScheme, path, seriousOrCritical: results.violations.filter(item => ["serious", "critical"].includes(item.impact ?? "")).map(item => item.id) });
    await context.close();
  }
}

{
  const context = await browser.newContext();
  const response = await context.request.get(base + "/", { failOnStatusCode: false });
  report.headers = response.headers();
  await context.close();
}

await writeFile(`${out}/live-audit.json`, JSON.stringify(report, null, 2));
await browser.close();
