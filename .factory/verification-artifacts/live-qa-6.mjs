import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const base = "https://spend-pulse.sociobot.in";
const results = { checks: {}, observations: {} };
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(base, { waitUntil: "networkidle" });
  const firstRead = {
    title: await page.title(),
    heading: await page.locator("h1").innerText(),
    audience: await page.locator(".lede").innerText(),
    action: await page.getByRole("link", { name: "Try it with sample data" }).innerText(),
    actionOutcome: await page.locator(".hero-actions > span").innerText(),
    facts: await page.locator(".facts li").allInnerTexts(),
  };
  assert(firstRead.heading === "Keep weekly spending on pace", "cold page does not state the job");
  assert(firstRead.audience.includes("people who want a quick budget check"), "cold page does not name its audience");
  assert(firstRead.action === "Try it with sample data", "cold page lacks one-click sample action");
  results.observations.firstRead = firstRead;

  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.getByText("Demo — sample data, nothing is saved").waitFor();
  assert(page.url() === `${base}/?demo=1`, "sample action did not open query demo");
  assert(await page.getByText("Demo — sample data, nothing is saved").isVisible(), "demo banner absent");
  assert((await page.locator(".pace-primary strong").innerText()) === "$82.80", "sample total differs");
  assert((await page.locator(".entry-list li").count()) === 3, "sample entry count differs");

  await page.getByRole("button", { name: "Add $10.00" }).click();
  await page.locator(".pace-primary strong").filter({ hasText: "$92.80" }).waitFor();
  assert((await page.locator(".pace-primary strong").innerText()) === "$92.80", "quick add did not update pace");

  await page.locator("#spend-amount").fill("0");
  await page.getByRole("button", { name: "Add spending" }).click();
  assert((await page.locator("#entry-error").innerText()).includes("0.01"), "zero amount lacked recovery guidance");
  await page.locator("#spend-amount").fill("0.01");
  await page.locator("#spend-note").fill("<img src=x onerror=alert(1)>");
  await page.getByRole("button", { name: "Add spending" }).click();
  await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).waitFor();
  assert(await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).isVisible(), "literal note was not safely rendered");
  assert((await page.locator("img[src=x]").count()) === 0, "note created injected markup");

  await page.locator("#spend-amount").fill("10000000.01");
  await page.getByRole("button", { name: "Add spending" }).click();
  assert((await page.locator("#entry-error").innerText()).includes("10,000,000"), "over-maximum entry was not rejected");

  const injectionDelete = page.getByRole("button", { name: "Delete <img src=x onerror=alert(1)> entry" });
  await injectionDelete.click();
  await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).waitFor({ state: "hidden" });
  assert((await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).count()) === 0, "delete did not remove entry");
  await page.getByRole("button", { name: "Undo" }).click();
  await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).waitFor();
  assert(await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).isVisible(), "undo did not restore entry");
  await page.reload({ waitUntil: "networkidle" });
  assert(await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).isVisible(), "restored entry did not persist");

  const persisted = await context.newPage();
  await persisted.goto(`${base}/?demo=1`);
  assert(await persisted.getByText("<img src=x onerror=alert(1)>", { exact: true }).isVisible(), "entry did not persist across tabs");
  await persisted.close();

  await page.getByRole("link", { name: "Export or import" }).click();
  await page.locator("#data-title").waitFor();
  const jsonPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const jsonDownload = await jsonPromise;
  const jsonPath = await jsonDownload.path();
  const jsonText = await (await import("node:fs/promises")).readFile(jsonPath, "utf8");
  const backup = JSON.parse(jsonText);
  assert(backup.settings.weeklyAllowance === 250 && backup.entries.length === 5, "JSON export contents differ");

  const csvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csvDownload = await csvPromise;
  const csvPath = await csvDownload.path();
  const csvText = await (await import("node:fs/promises")).readFile(csvPath, "utf8");
  assert(csvText.startsWith('"date","amount","currency","note"'), "CSV header differs");
  assert(csvText.trim().split("\n").length === 6, "CSV row count differs");

  await page.locator("#import-file").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"settings":{"weeklyAllowance":100},"entries":[]}'),
  });
  assert((await page.locator("#data-message").innerText()).includes("not a Spend Pulse backup"), "invalid import lacked clear rejection");
  await page.goto(`${base}/?demo=1`);
  assert(await page.getByText("<img src=x onerror=alert(1)>", { exact: true }).isVisible(), "invalid import replaced existing data");

  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.locator(".pace-primary strong").filter({ hasText: "$82.80" }).waitFor();
  assert((await page.locator(".pace-primary strong").innerText()) === "$82.80", "reset did not restore sample total");
  assert((await page.locator(".entry-list li").count()) === 3, "reset did not restore sample entries");

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });
  const sw = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return {
      controller: navigator.serviceWorker.controller?.scriptURL ?? null,
      active: registration.active?.state ?? null,
      waiting: registration.waiting?.state ?? null,
      caches: await caches.keys(),
    };
  });
  assert(sw.controller === `${base}/sw.js` && sw.active === "activated", "service worker is not active and controlling");
  results.observations.serviceWorker = sw;

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  assert(await page.getByText("Demo — sample data, nothing is saved").isVisible(), "offline reload lost demo");
  await page.getByRole("button", { name: "Add $5.00" }).click();
  await page.locator(".pace-primary strong").filter({ hasText: "$87.80" }).waitFor();
  assert((await page.locator(".pace-primary strong").innerText()) === "$87.80", "offline entry failed");
  await page.reload({ waitUntil: "domcontentloaded" });
  assert((await page.locator(".pace-primary strong").innerText()) === "$87.80", "offline entry did not persist");
  await context.setOffline(false);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.locator(".pace-primary strong").filter({ hasText: "$82.80" }).waitFor();

  const dbs = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name).sort());
  const realData = await page.evaluate(async () => new Promise((resolve, reject) => {
    const request = indexedDB.open("spend-pulse-real-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(["settings", "entries"], "readonly");
      const settings = tx.objectStore("settings").get("current");
      const entries = tx.objectStore("entries").count();
      tx.oncomplete = () => { db.close(); resolve({ settings: settings.result ?? null, entries: entries.result }); };
      tx.onerror = () => reject(tx.error);
    };
  }));
  const storage = await page.evaluate(() => ({ localStorage: localStorage.length, sessionStorage: sessionStorage.length, cookies: document.cookie }));
  assert(JSON.stringify(dbs) === JSON.stringify(["spend-pulse-demo-v1", "spend-pulse-real-v1"]), `unexpected databases: ${dbs}`);
  assert(realData.settings === null && realData.entries === 0, "demo flow changed real data");
  assert(storage.localStorage === 0 && storage.sessionStorage === 0 && storage.cookies === "", "unexpected browser storage/cookie use");
  assert(requests.every((url) => new URL(url).origin === base), "cross-origin request observed");
  assert(consoleErrors.length === 0 && pageErrors.length === 0, "console or page error observed");
  results.observations.privacy = { requestCount: requests.length, uniqueRequests: [...new Set(requests)].sort(), dbs, realData, storage, consoleErrors, pageErrors };
  results.checks.liveFlow = "PASS";

  const keyboard = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await keyboard.goto(base);
  await keyboard.getByRole("link", { name: "Try it with sample data" }).waitFor();
  await keyboard.keyboard.press("Tab");
  const skip = await keyboard.evaluate(() => {
    const el = document.activeElement;
    const css = el ? getComputedStyle(el) : null;
    return { text: el?.textContent?.trim(), outline: css ? `${css.outlineColor} ${css.outlineStyle} ${css.outlineWidth}` : "" };
  });
  assert(skip.text === "Skip to main content" && !skip.outline.includes("none"), "skip link is not first with visible focus");
  await keyboard.keyboard.press("Enter");
  assert(new URL(keyboard.url()).hash === "#main", "skip link did not target main");
  await keyboard.goto(base);
  await keyboard.getByRole("link", { name: "Try it with sample data" }).waitFor();
  let foundDemo = false;
  let demoFocus = null;
  for (let i = 0; i < 12; i += 1) {
    await keyboard.keyboard.press("Tab");
    const current = await keyboard.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), outline: getComputedStyle(document.activeElement).outline }));
    if (current.text === "Try it with sample data") { foundDemo = true; demoFocus = current; break; }
  }
  assert(foundDemo && demoFocus && !demoFocus.outline.includes("none"), "sample action was not keyboard reachable with visible focus");
  await keyboard.keyboard.press("Enter");
  await keyboard.locator("h1").filter({ hasText: "See this week’s spending pace" }).waitFor();
  assert(keyboard.url() === `${base}/?demo=1`, "keyboard activation did not open demo");
  assert(await keyboard.locator("h1").evaluate((element) => element === document.activeElement), "route change did not move focus to h1");
  await keyboard.goto(`${base}/settings?demo=1`);
  await keyboard.getByRole("button", { name: "Export CSV" }).focus();
  await keyboard.keyboard.press("Tab");
  const importFocus = await keyboard.evaluate(() => ({
    activeId: document.activeElement?.id,
    inputFocusVisible: document.querySelector("#import-file")?.matches(":focus-visible"),
    labelOutline: getComputedStyle(document.querySelector('label[for="import-file"]')).outline,
  }));
  assert(importFocus.activeId === "import-file" && importFocus.inputFocusVisible && !importFocus.labelOutline.includes("none"), "import control focus is not visible");
  results.observations.keyboard = { skip, demoFocus, importFocus };
  results.checks.keyboard = "PASS";
  await keyboard.close();

  const axeFindings = [];
  for (const colorScheme of ["light", "dark"]) {
    for (const route of ["/", "/?demo=1", "/settings", "/privacy", "/terms", "/missing-page"]) {
      const axeContext = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme });
      const axePage = await axeContext.newPage();
      await axePage.goto(`${base}${route}`);
      await axePage.locator("h1").waitFor();
      const report = await new AxeBuilder({ page: axePage }).analyze();
      const serious = report.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
      axeFindings.push({ colorScheme, route, serious: serious.map((item) => item.id), all: report.violations.map((item) => item.id) });
      await axeContext.close();
    }
  }
  assert(axeFindings.every((item) => item.serious.length === 0), "axe serious/critical findings present");
  results.observations.axe = axeFindings;
  results.checks.axe = "PASS";

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "dark", reducedMotion: "reduce" });
  await mobile.goto(base);
  await mobile.getByRole("link", { name: "Try it with sample data" }).waitFor();
  const mobileFirstScreen = await mobile.evaluate(() => ({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    factsBottom: [...document.querySelectorAll(".facts li")].map((el) => el.getBoundingClientRect().bottom),
    transitionDurations: [...document.querySelectorAll("*")].map((el) => getComputedStyle(el).transitionDuration).filter((value) => value !== "0s"),
    animations: document.getAnimations().filter((animation) => animation.playState === "running").length,
  }));
  assert(mobileFirstScreen.scrollWidth <= 390, "390px page overflows");
  assert(mobileFirstScreen.factsBottom.every((bottom) => bottom <= 844), "first-screen facts fall below mobile viewport");
  assert(mobileFirstScreen.animations === 0, "animation continues under reduced motion");
  await mobile.evaluate(() => { document.documentElement.style.fontSize = "34px"; });
  const zoomWidth = await mobile.evaluate(() => document.documentElement.scrollWidth);
  assert(zoomWidth <= 390, "200% text causes horizontal overflow");
  await mobile.screenshot({ path: ".factory/verification-artifacts/live-mobile-dark-reduced-6.png", fullPage: true });
  results.observations.mobile = { ...mobileFirstScreen, zoomWidth };
  results.checks.mobileReducedMotion = "PASS";
  await mobile.close();

  const cdpPage = await context.newPage();
  await cdpPage.goto(base);
  await cdpPage.locator("h1").waitFor();
  const cdp = await context.newCDPSession(cdpPage);
  const installability = await cdp.send("Page.getInstallabilityErrors");
  assert(installability.installabilityErrors.length === 0, "PWA installability errors present");
  results.observations.installability = installability;
  results.checks.pwaInstallability = "PASS";
  await cdpPage.close();

  await writeFile(".factory/verification-artifacts/live-qa-6.json", `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
