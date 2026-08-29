import "./styles.css";
import { deleteDatabase, loadData, removeEntry, replaceData, saveEntry, saveSettings } from "./db";
import { entriesThisWeek, paceSummary, startOfWeek } from "./pace";
import type { AppData, Currency, ReminderCadence, Settings, SpendEntry } from "./types";
import terrainLedgerUrl from "./assets/terrain-ledger.webp";

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("The app root is missing.");
const app: HTMLDivElement = appRoot;

let isDemo = location.pathname === "/demo" || new URLSearchParams(location.search).get("demo") === "1";
let data: AppData = { settings: null, entries: [] };
let loadError = "";
let undoEntry: SpendEntry | null = null;
let noticeTimer = 0;

const MAX_AMOUNT = 10_000_000;
const currencies: readonly Currency[] = ["USD", "EUR", "GBP", "INR"];
const reminderCadences: readonly ReminderCadence[] = ["none", "daily", "weekly"];

type RouteMetadata = { title: string; description: string; canonical: string };

const routeMetadata: Record<string, RouteMetadata> = {
  "/": {
    title: "Spend Pulse — Keep weekly spending on pace",
    description: "Check weekly day-to-day spending against your plan with private entries that stay in this browser.",
    canonical: "/",
  },
  "/demo": {
    title: "Demo — Spend Pulse",
    description: "Try Spend Pulse with an isolated sample week. Reset the sample anytime without changing your entries.",
    canonical: "/demo",
  },
  "/settings": {
    title: "Settings — Spend Pulse",
    description: "Set your weekly amount, reminder, and data controls in Spend Pulse.",
    canonical: "/settings",
  },
  "/privacy": {
    title: "Privacy — Spend Pulse",
    description: "Read what Spend Pulse stores in your browser and how to export or clear it.",
    canonical: "/privacy",
  },
  "/terms": {
    title: "Terms — Spend Pulse",
    description: "Read the terms for using the free Spend Pulse weekly spending check.",
    canonical: "/terms",
  },
  "/404": {
    title: "Page not found — Spend Pulse",
    description: "This Spend Pulse page could not be found. Return to the weekly spending check.",
    canonical: "/404.html",
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}

function localDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function money(amount: number, currency = data.settings?.currency ?? "USD"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

function sampleData(): AppData {
  const now = new Date();
  const monday = startOfWeek(now, 1);
  const sample = [
    { offset: 0, amount: 18.4, note: "Lunch with Sam" },
    { offset: Math.min(2, ((now.getDay() + 6) % 7)), amount: 42, note: "Groceries" },
    { offset: Math.min(4, ((now.getDay() + 6) % 7)), amount: 22.4, note: "Train and coffee" },
  ];
  return {
    settings: {
      weeklyAllowance: 250,
      currency: "USD",
      weekStarts: 1,
      reminderCadence: "none",
      reminderTime: "18:00",
    },
    entries: sample.map((item, index) => {
      const occurred = new Date(monday);
      occurred.setDate(monday.getDate() + item.offset);
      return {
        id: `demo-${index + 1}`,
        amount: item.amount,
        note: item.note,
        occurredAt: localDate(occurred),
        createdAt: new Date(now.getTime() - index * 3_600_000).toISOString(),
      };
    }),
  };
}

async function load(): Promise<void> {
  isDemo = location.pathname === "/demo" || new URLSearchParams(location.search).get("demo") === "1";
  try {
    data = await loadData(isDemo);
    if (isDemo && !data.settings) {
      data = sampleData();
      await replaceData(true, data);
    }
    loadError = "";
  } catch (error) {
    loadError = error instanceof Error ? error.message : "The local data could not load.";
  }
}

function header(): string {
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    ${isDemo ? `<aside class="demo-bar" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span class="demo-actions"><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></span></aside>` : ""}
    <header class="site-header">
      <a class="wordmark" href="/" data-route="/"><span class="contour-mark" aria-hidden="true"><i></i></span>Spend Pulse</a>
      <nav aria-label="Main navigation">
        <a href="/?demo=1" data-route="/?demo=1">Demo</a>
        <a href="${isDemo ? "/settings?demo=1" : "/settings"}" data-route="${isDemo ? "/settings?demo=1" : "/settings"}">Settings</a>
        <a href="/privacy" data-route="/privacy">Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `<footer class="site-footer">
    <p>One small check for weekly spending pace.</p>
    <div><a href="/privacy" data-route="/privacy">Privacy</a><a href="/terms" data-route="/terms">Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></div>
    <p class="build">Version 1.0.0</p>
  </footer>`;
}

function facts(): string {
  return `<ul class="facts" aria-label="Product facts">
    <li><span aria-hidden="true">◎</span> Works offline after the first visit.</li>
    <li><span aria-hidden="true">⌂</span> Your entries stay in this browser.</li>
    <li><span aria-hidden="true">○</span> Free. No account or bank connection.</li>
  </ul>`;
}

function setupPanel(): string {
  return `<section class="setup-panel cut-corner" aria-labelledby="setup-title">
    <div class="map-label">Start here · 01</div>
    <h2 id="setup-title">Set your weekly amount</h2>
    <p>Choose what you can spend on day-to-day extras this week.</p>
    <form id="setup-form" class="setup-form" novalidate>
      <div class="field currency-field">
        <label for="currency">Currency</label>
        <select id="currency" name="currency">
          <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="INR">INR</option>
        </select>
      </div>
      <div class="field amount-field">
        <label for="allowance">Weekly amount</label>
        <input id="allowance" name="allowance" type="number" inputmode="decimal" min="1" max="${MAX_AMOUNT}" step="0.01" required aria-describedby="setup-error" />
      </div>
      <button class="primary-button" type="submit">Set weekly amount</button>
      <p id="setup-error" class="form-error" role="alert"></p>
    </form>
  </section>`;
}

function pacePanel(settings: Settings, entries: SpendEntry[]): string {
  const now = new Date();
  const pace = paceSummary(entries, settings.weeklyAllowance, now, settings.weekStarts);
  const overPace = pace.difference < 0;
  const routeState = pace.remaining < 0 ? "Weekly amount passed" : overPace ? "Above today’s pace" : "On pace";
  const weekStart = startOfWeek(now, settings.weekStarts);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const dateRange = `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  return `<section class="pulse-panel cut-corner ${overPace ? "pace-warn" : "pace-good"}" aria-labelledby="pulse-title">
    <div class="pulse-heading"><div><span class="map-label">This week · ${escapeHtml(dateRange)}</span><h2 id="pulse-title">${routeState}</h2></div><span class="day-marker">Day ${pace.day} of 7</span></div>
    <div class="pace-grid">
      <div class="pace-primary"><span>Spent</span><strong>${money(pace.spent)}</strong><progress max="100" value="${pace.percentage}" aria-label="${pace.percentage}% of weekly amount spent">${pace.percentage}%</progress><small>${pace.percentage}% of ${money(settings.weeklyAllowance)}</small></div>
      <dl>
        <div><dt>${overPace ? "Over today’s pace" : "Under today’s pace"}</dt><dd>${money(Math.abs(pace.difference))}</dd></div>
        <div><dt>${pace.remaining >= 0 ? "Left this week" : "Past your amount"}</dt><dd>${money(Math.abs(pace.remaining))}</dd></div>
      </dl>
    </div>
    <p class="pace-note">Pace compares your spending with ${pace.day}/7 of your weekly amount.</p>
  </section>`;
}

function entryForm(): string {
  return `<section class="entry-panel" aria-labelledby="entry-title">
    <div class="section-heading"><div><span class="map-label">Add spending · 02</span><h2 id="entry-title">Add today’s spending</h2></div></div>
    <div class="quick-add" aria-label="Quick amounts"><span>Quick add</span>${[5, 10, 20].map((amount) => `<button class="quick-button" type="button" data-action="quick-add" data-amount="${amount}" aria-label="Add ${money(amount)}">+${money(amount)}</button>`).join("")}</div>
    <form id="entry-form" class="entry-form" novalidate>
      <div class="field"><label for="spend-amount">Amount</label><input id="spend-amount" name="amount" type="number" inputmode="decimal" min="0.01" max="${MAX_AMOUNT}" step="0.01" required /></div>
      <div class="field note-field"><label for="spend-note">Note <span>(optional)</span></label><input id="spend-note" name="note" maxlength="80" autocomplete="off" /></div>
      <div class="field"><label for="spend-date">Date</label><input id="spend-date" name="date" type="date" value="${localDate()}" required /></div>
      <button class="primary-button" type="submit">Add spending</button>
      <p id="entry-error" class="form-error wide-error" role="alert"></p>
    </form>
  </section>`;
}

function historyPanel(settings: Settings, entries: SpendEntry[]): string {
  const current = entriesThisWeek(entries, new Date(), settings.weekStarts);
  const rows = current.length
    ? `<ol class="entry-list">${current.map((entry) => `<li>
        <span class="entry-pin" aria-hidden="true"></span>
        <div><strong>${escapeHtml(entry.note || "Spending")}</strong><time datetime="${entry.occurredAt}">${new Date(`${entry.occurredAt}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</time></div>
        <span class="entry-amount">${money(entry.amount)}</span>
        <button class="icon-button" data-action="delete-entry" data-id="${escapeHtml(entry.id)}" aria-label="Delete ${escapeHtml(entry.note || "spending")} entry">×</button>
      </li>`).join("")}</ol>`
    : `<div class="empty-state"><span class="empty-contours" aria-hidden="true"></span><h3>No spending marked this week</h3><p>Your entries will appear here. Add today’s first amount above.</p></div>`;
  return `<section class="history-panel" aria-labelledby="history-title">
    <div class="section-heading"><div><span class="map-label">Your entries · 03</span><h2 id="history-title">This week’s entries</h2></div><a href="${isDemo ? "/settings?demo=1#data" : "/settings#data"}" data-route="${isDemo ? "/settings?demo=1#data" : "/settings#data"}" class="small-link">Export or import</a></div>
    ${rows}
  </section>`;
}

function dashboard(): string {
  if (!data.settings) return setupPanel();
  return `<div class="dashboard">${pacePanel(data.settings, data.entries)}${entryForm()}${historyPanel(data.settings, data.entries)}</div>`;
}

function homePage(): string {
  return `<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">A private weekly spending check</span>
        <h1 tabindex="-1">Keep weekly spending on pace</h1>
        <p class="lede">For people who want a quick budget check without another finance account.</p>
        <div class="hero-actions"><a class="primary-button" href="/?demo=1" data-route="/?demo=1">Try it with sample data</a><span>See a filled week. Your data stays untouched.</span></div>
        ${facts()}
      </div>
      <figure class="hero-map">
        <img src="${terrainLedgerUrl}" width="1200" height="800" alt="A paper relief map turns a weekly route into seven trail markers." fetchpriority="high" decoding="async" />
        <figcaption>Track one weekly amount without connecting a bank.</figcaption>
      </figure>
    </section>
    <section class="product-section" aria-label="Spend Pulse app">
      ${loadError ? errorState() : dashboard()}
    </section>
    ${howItWorks()}
    ${privacySection()}
  </main>`;
}

function demoPage(): string {
  return `<main id="main" class="demo-main">
    <div class="demo-intro"><span class="eyebrow">Sample week</span><h1 tabindex="-1">See this week’s spending pace</h1><p>The sample weekly amount is $250. Try adding or deleting an entry.</p></div>
    ${loadError ? errorState() : dashboard()}
    <section class="demo-explain" aria-labelledby="demo-explain-title"><h2 id="demo-explain-title">Sample changes do not affect your entries</h2><p>This sample is kept apart from your entries. Reset the sample anytime, or return to your real data.</p></section>
  </main>`;
}

function howItWorks(): string {
  return `<section class="how-section" aria-labelledby="how-title">
    <div><span class="map-label">How it works</span><h2 id="how-title">Check your pace in three steps</h2></div>
    <ol>
      <li><span>01</span><div><h3>Set one weekly amount</h3><p>Use the money you plan for day-to-day extras.</p></div></li>
      <li><span>02</span><div><h3>Add spending as it happens</h3><p>Enter an amount. A short note is optional.</p></div></li>
      <li><span>03</span><div><h3>Read today’s pace</h3><p>See how spending compares with the elapsed week.</p></div></li>
    </ol>
  </section>`;
}

function privacySection(): string {
  return `<section class="privacy-section" aria-labelledby="privacy-title">
    <div class="privacy-contours" aria-hidden="true"></div>
    <div><span class="map-label">Privacy and data</span><h2 id="privacy-title">A manual budget check with no bank connection</h2><p>Spend Pulse is a manual weekly spending check with no bank connection.</p><p>Your weekly amount and entries stay in this browser. You can export a copy or clear everything.</p><a href="/privacy" data-route="/privacy">Read the privacy note</a></div>
  </section>`;
}

function errorState(): string {
  return `<section class="error-state" aria-labelledby="load-error-title"><h2 id="load-error-title">Your local data did not open</h2><p>${escapeHtml(loadError)} Reload this page. If it continues, check that browser storage is allowed.</p><button class="secondary-button" data-action="reload">Reload the app</button></section>`;
}

function settingsPage(): string {
  const settings = data.settings;
  return `<main id="main" class="text-main settings-main">
    <span class="eyebrow">Settings</span><h1 tabindex="-1">Set your weekly amount</h1><p class="lede">Change your weekly amount, first day, reminder, or data.</p>
    ${loadError ? errorState() : `<form id="settings-form" class="settings-form" novalidate>
      <section aria-labelledby="weekly-settings"><h2 id="weekly-settings">Weekly amount</h2>
        <div class="settings-grid"><div class="field"><label for="settings-currency">Currency</label><select id="settings-currency" name="currency"><option value="USD" ${settings?.currency === "USD" ? "selected" : ""}>USD</option><option value="EUR" ${settings?.currency === "EUR" ? "selected" : ""}>EUR</option><option value="GBP" ${settings?.currency === "GBP" ? "selected" : ""}>GBP</option><option value="INR" ${settings?.currency === "INR" ? "selected" : ""}>INR</option></select></div>
        <div class="field"><label for="settings-allowance">Weekly amount</label><input id="settings-allowance" name="allowance" type="number" inputmode="decimal" min="1" max="${MAX_AMOUNT}" step="0.01" value="${settings?.weeklyAllowance ?? ""}" required /></div>
        <div class="field"><label for="week-start">Week starts</label><select id="week-start" name="weekStart"><option value="1" ${settings?.weekStarts !== 0 ? "selected" : ""}>Monday</option><option value="0" ${settings?.weekStarts === 0 ? "selected" : ""}>Sunday</option></select></div></div>
      </section>
      <section aria-labelledby="reminder-settings"><h2 id="reminder-settings">On-device reminder</h2><p>The app checks reminders when it is open. Your browser may stop reminders after you close it.</p>
        <div class="settings-grid"><div class="field"><label for="reminder-cadence">Reminder</label><select id="reminder-cadence" name="reminderCadence"><option value="none" ${!settings || settings.reminderCadence === "none" ? "selected" : ""}>Off</option><option value="daily" ${settings?.reminderCadence === "daily" ? "selected" : ""}>Daily</option><option value="weekly" ${settings?.reminderCadence === "weekly" ? "selected" : ""}>Weekly, on the first day</option></select></div>
        <div class="field"><label for="reminder-time">Time</label><input id="reminder-time" name="reminderTime" type="time" value="${settings?.reminderTime ?? "18:00"}" /></div></div>
        <button class="secondary-button" type="button" data-action="test-notification">Allow and test notification</button><p class="helper">Permission is requested only when you press this button.</p>
      </section>
      <button class="primary-button" type="submit">Save settings</button><p id="settings-error" class="form-error" role="alert"></p>
    </form>
    <section id="data" class="data-section" aria-labelledby="data-title"><h2 id="data-title">Own your data</h2><p>Export a JSON backup or a CSV list. Importing a backup replaces data in this ${isDemo ? "demo" : "browser"}.</p><div class="data-actions"><button class="secondary-button" data-action="export-json">Export JSON</button><button class="secondary-button" data-action="export-csv">Export CSV</button><input class="sr-only" id="import-file" type="file" accept="application/json,.json" /><label class="secondary-button file-label" for="import-file">Import JSON</label></div><button class="danger-button" data-action="clear-data">Clear all ${isDemo ? "demo" : "local"} data</button><p id="data-message" class="form-error" role="status"></p></section>`}
  </main>`;
}

function privacyPage(): string {
  return `<main id="main" class="text-main"><span class="eyebrow">Privacy note · August 28, 2026</span><h1 tabindex="-1">Your spending stays in your browser</h1><p class="lede">Spend Pulse has no account, analytics, ads, or bank connection.</p><section><h2>What the app stores</h2><p>Your weekly amount, entries, preferences, and reminder time stay in browser storage. Demo data uses separate browser storage.</p><h2>What leaves your device</h2><p>No spending data is sent anywhere. Loading the site requests its files from the Spend Pulse web host.</p><h2>Your controls</h2><p>Export your data from Settings. You can also clear it there or remove this site’s data in your browser.</p><h2>Notifications</h2><p>Notification permission is optional. The app asks only after you press the test button. You can revoke permission in browser settings.</p><h2>Contact</h2><p>Questions can go to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></section></main>`;
}

function termsPage(): string {
  return `<main id="main" class="text-main"><span class="eyebrow">Terms · August 28, 2026</span><h1 tabindex="-1">Terms for using Spend Pulse</h1><p class="lede">These short terms apply when you use this free app.</p><section><h2>The service</h2><p>Spend Pulse compares manual entries with a weekly amount.</p><h2>Your responsibility</h2><p>You choose the amounts and entries. Keep your own export if you need a backup.</p><h2>Availability</h2><p>The app is provided as available, without a promise that local data can always be recovered.</p><h2>Acceptable use</h2><p>Do not misuse the site, interfere with it, or attempt to harm other visitors.</p><h2>Contact</h2><p>Questions can go to <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p></section></main>`;
}

function notFoundPage(): string {
  return `<main id="main" class="not-found"><div class="lost-map" aria-hidden="true"><span>404</span></div><div><span class="eyebrow">404</span><h1 tabindex="-1">This page was not found</h1><p>The address may be old or mistyped.</p><a class="primary-button" href="/" data-route="/">Return to Spend Pulse</a></div></main>`;
}

function render(moveFocus = false): void {
  const path = location.pathname;
  const metadataKey = isDemo && path === "/" ? "/demo" : path;
  const metadata = routeMetadata[metadataKey] ?? routeMetadata["/404"];
  const canonicalUrl = `https://spend-pulse.sociobot.in${metadata.canonical}`;
  document.title = metadata.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", metadata.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", metadata.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", metadata.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", metadata.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", metadata.description);
  let page = notFoundPage();
  if (isDemo && path === "/") page = demoPage();
  else if (path === "/") page = homePage();
  else if (path === "/demo") page = demoPage();
  else if (path === "/settings") page = settingsPage();
  else if (path === "/privacy") page = privacyPage();
  else if (path === "/terms") page = termsPage();
  app.innerHTML = `<div id="route-status" class="sr-only" aria-live="polite"></div>${header()}${page}${footer()}<div id="notice" class="notice" role="status" aria-live="polite"></div><div id="offline-status" class="offline-status" role="status" hidden>You are offline. Saved entries still work.</div>`;
  bindEvents();
  updateOnlineState();
  if (moveFocus) {
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    const heading = document.querySelector<HTMLElement>("h1");
    heading?.focus();
    const status = document.querySelector("#route-status");
    if (status && heading) status.textContent = heading.textContent;
  }
  if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
}

async function navigate(target: string): Promise<void> {
  const url = new URL(target, location.href);
  history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  await load();
  render(true);
}

function showNotice(message: string, withUndo = false): void {
  const notice = document.querySelector<HTMLDivElement>("#notice");
  if (!notice) return;
  clearTimeout(noticeTimer);
  notice.innerHTML = `${escapeHtml(message)}${withUndo ? ` <button class="text-button" data-action="undo-delete">Undo</button>` : ""}`;
  notice.querySelector<HTMLButtonElement>("[data-action=undo-delete]")?.addEventListener("click", () => { void restoreUndo(); });
  notice.classList.add("is-visible");
  noticeTimer = window.setTimeout(() => notice.classList.remove("is-visible"), 6000);
}

async function restoreUndo(): Promise<void> {
  if (!undoEntry) return;
  const entry = undoEntry;
  try {
    await saveEntry(isDemo, entry);
    data.entries.unshift(entry);
    undoEntry = null;
    render();
    showNotice("Entry restored.");
  } catch {
    showNotice("The entry could not be restored. Check browser storage, then try again.");
  }
}

function validAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= MAX_AMOUNT;
}

function setFormError(id: string, message: string): void {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (element) element.textContent = message;
}

async function submitSetup(form: HTMLFormElement): Promise<void> {
  const formData = new FormData(form);
  const allowance = Number(formData.get("allowance"));
  if (!validAmount(allowance)) {
    setFormError("setup-error", `Enter a weekly amount from 0.01 to ${MAX_AMOUNT.toLocaleString()}.`);
    return;
  }
  const settings: Settings = { weeklyAllowance: allowance, currency: formData.get("currency") as Currency, weekStarts: 1, reminderCadence: "none", reminderTime: "18:00" };
  try {
    await saveSettings(isDemo, settings);
    data.settings = settings;
    render();
    showNotice("Weekly amount saved.");
  } catch {
    setFormError("setup-error", "The amount was not saved. Check browser storage, then try again.");
  }
}

async function submitEntry(form: HTMLFormElement): Promise<void> {
  const formData = new FormData(form);
  const amount = Number(formData.get("amount"));
  const date = String(formData.get("date"));
  if (!validAmount(amount)) {
    setFormError("entry-error", `Enter an amount from 0.01 to ${MAX_AMOUNT.toLocaleString()}.`);
    return;
  }
  if (!isLocalDate(date)) {
    setFormError("entry-error", "Choose a valid date, then add the entry again.");
    return;
  }
  const entry: SpendEntry = { id: crypto.randomUUID(), amount, note: String(formData.get("note") ?? "").trim(), occurredAt: date, createdAt: new Date().toISOString() };
  try {
    await saveEntry(isDemo, entry);
    data.entries.unshift(entry);
    render();
    showNotice(`${money(amount)} added to this week.`);
    document.querySelector<HTMLInputElement>("#spend-amount")?.focus();
  } catch {
    setFormError("entry-error", "The entry was not saved. Check browser storage, then try again.");
  }
}

async function quickAdd(amount: number): Promise<void> {
  const entry: SpendEntry = { id: crypto.randomUUID(), amount, note: "Quick add", occurredAt: localDate(), createdAt: new Date().toISOString() };
  try {
    await saveEntry(isDemo, entry);
    data.entries.unshift(entry);
    render();
    showNotice(`${money(amount)} added to this week.`);
  } catch {
    showNotice("The entry was not saved. Check browser storage, then try again.");
  }
}

async function submitSettings(form: HTMLFormElement): Promise<void> {
  const formData = new FormData(form);
  const allowance = Number(formData.get("allowance"));
  if (!validAmount(allowance)) {
    setFormError("settings-error", `Enter a weekly amount from 0.01 to ${MAX_AMOUNT.toLocaleString()}.`);
    return;
  }
  const settings: Settings = {
    weeklyAllowance: allowance,
    currency: formData.get("currency") as Currency,
    weekStarts: Number(formData.get("weekStart")) as 0 | 1,
    reminderCadence: formData.get("reminderCadence") as ReminderCadence,
    reminderTime: String(formData.get("reminderTime") || "18:00"),
    lastReminderAt: data.settings?.lastReminderAt,
  };
  try {
    await saveSettings(isDemo, settings);
    data.settings = settings;
    showNotice("Settings saved in this browser.");
    await checkReminder();
  } catch {
    setFormError("settings-error", "Settings were not saved. Check browser storage, then try again.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isLocalDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localDate(date) === value;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function validSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false;
  return validAmount(value.weeklyAllowance as number)
    && currencies.includes(value.currency as Currency)
    && (value.weekStarts === 0 || value.weekStarts === 1)
    && reminderCadences.includes(value.reminderCadence as ReminderCadence)
    && typeof value.reminderTime === "string"
    && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.reminderTime)
    && (value.lastReminderAt === undefined || isTimestamp(value.lastReminderAt));
}

function validEntry(value: unknown): value is SpendEntry {
  return isRecord(value)
    && typeof value.id === "string" && value.id.length > 0 && value.id.length <= 200
    && validAmount(value.amount as number)
    && typeof value.note === "string" && value.note.length <= 80
    && isLocalDate(value.occurredAt)
    && isTimestamp(value.createdAt);
}

function validImport(value: unknown): value is AppData {
  if (!isRecord(value) || !Array.isArray(value.entries) || !(value.settings === null || validSettings(value.settings))) return false;
  const ids = new Set<string>();
  return value.entries.every((entry) => {
    if (!validEntry(entry) || ids.has(entry.id)) return false;
    ids.add(entry.id);
    return true;
  });
}

function downloadFile(name: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCsv(): void {
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [["date", "amount", "currency", "note"], ...data.entries.map((entry) => [entry.occurredAt, entry.amount.toFixed(2), data.settings?.currency ?? "USD", entry.note])];
  downloadFile("spend-pulse-entries.csv", rows.map((row) => row.map(quote).join(",")).join("\n"), "text/csv;charset=utf-8");
}

async function testNotification(): Promise<void> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    showNotice("This browser does not support on-device notifications.");
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    showNotice("Notifications remain off. You can change permission in browser settings.");
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification("Spend Pulse reminder", { body: "Open the app for this week’s spending pace.", icon: "/icons/icon-192.png", tag: "spend-pulse-test" });
  showNotice("Test notification sent on this device.");
}

async function checkReminder(): Promise<void> {
  const settings = data.settings;
  if (!settings || settings.reminderCadence === "none" || !("Notification" in window) || Notification.permission !== "granted" || !("serviceWorker" in navigator)) return;
  const now = new Date();
  const [hours, minutes] = settings.reminderTime.split(":").map(Number);
  if (now.getHours() < hours || (now.getHours() === hours && now.getMinutes() < minutes)) return;
  if (settings.reminderCadence === "weekly" && now.getDay() !== settings.weekStarts) return;
  if (settings.lastReminderAt && localDate(new Date(settings.lastReminderAt)) === localDate(now)) return;
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification("Check this week’s pace", { body: "Add today’s spending or review what is left.", icon: "/icons/icon-192.png", tag: "spend-pulse-reminder" });
  settings.lastReminderAt = now.toISOString();
  await saveSettings(isDemo, settings);
}

function updateOnlineState(): void {
  const status = document.querySelector<HTMLElement>("#offline-status");
  if (status) status.hidden = navigator.onLine;
}

function bindEvents(): void {
  app.querySelectorAll<HTMLAnchorElement>("a[data-route]").forEach((link) => link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void navigate(link.getAttribute("href") ?? "/");
  }));
  app.querySelector<HTMLFormElement>("#setup-form")?.addEventListener("submit", (event) => { event.preventDefault(); void submitSetup(event.currentTarget as HTMLFormElement); });
  app.querySelector<HTMLFormElement>("#entry-form")?.addEventListener("submit", (event) => { event.preventDefault(); void submitEntry(event.currentTarget as HTMLFormElement); });
  app.querySelector<HTMLFormElement>("#settings-form")?.addEventListener("submit", (event) => { event.preventDefault(); void submitSettings(event.currentTarget as HTMLFormElement); });
  app.querySelector<HTMLInputElement>("#import-file")?.addEventListener("change", async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!validImport(parsed)) throw new Error("The file is not a Spend Pulse backup.");
      await replaceData(isDemo, parsed);
      data = parsed;
      render();
      showNotice("Backup imported. It replaced the previous local data.");
    } catch (error) {
      setFormError("data-message", `${error instanceof Error ? error.message : "The file could not be read."} Choose a valid JSON backup.`);
    }
  });
  app.querySelectorAll<HTMLButtonElement>("button[data-action]").forEach((button) => button.addEventListener("click", async () => {
    const action = button.dataset.action;
    if (action === "reload") location.reload();
    if (action === "reset-demo") { await deleteDatabase(true); undoEntry = null; await load(); render(); showNotice("Demo reset to the sample week."); }
    if (action === "start-real") { await deleteDatabase(true); await navigate("/"); }
    if (action === "delete-entry") {
      const entry = data.entries.find((item) => item.id === button.dataset.id);
      if (!entry) return;
      await removeEntry(isDemo, entry.id); undoEntry = entry; data.entries = data.entries.filter((item) => item.id !== entry.id); render(); showNotice("Entry deleted.", true);
    }
    if (action === "export-json") downloadFile("spend-pulse-backup.json", JSON.stringify(data, null, 2), "application/json");
    if (action === "export-csv") exportCsv();
    if (action === "quick-add") await quickAdd(Number(button.dataset.amount));
    if (action === "test-notification") await testNotification();
    if (action === "clear-data") {
      if (confirm(`Clear every ${isDemo ? "demo" : "local"} entry and setting? This cannot be undone.`)) {
        const clearedScope = isDemo ? "demo" : "local";
        await deleteDatabase(isDemo); data = { settings: null, entries: [] }; undoEntry = null; render(); showNotice(`All ${clearedScope} data cleared.`);
      }
    }
  }));
}

window.addEventListener("popstate", async () => { await load(); render(true); });
window.addEventListener("online", updateOnlineState);
window.addEventListener("offline", updateOnlineState);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") void checkReminder(); });

async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController) showNotice("An update is ready. Reload to use it.");
      hadController = true;
    });
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    // The app still works online when service-worker registration is unavailable.
  }
}

app.innerHTML = `<main id="main" class="loading-state" aria-busy="true"><span class="contour-mark" aria-hidden="true"><i></i></span><h1>Loading your weekly pace</h1><p>Opening data saved in this browser.</p></main>`;
await load();
render();
void registerServiceWorker();
void checkReminder();
