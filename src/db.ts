import type { AppData, Settings, SpendEntry } from "./types";

const DB_VERSION = 1;
const SETTINGS_KEY = "current";

function databaseName(demo: boolean): string {
  return demo ? "spend-pulse-demo-v1" : "spend-pulse-real-v1";
}

function openDatabase(demo: boolean): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(demo), DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings");
      if (!database.objectStoreNames.contains("entries")) {
        const store = database.createObjectStore("entries", { keyPath: "id" });
        store.createIndex("occurredAt", "occurredAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("The local database could not open."));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("The local change could not be saved."));
  });
}

export async function loadData(demo: boolean): Promise<AppData> {
  const database = await openDatabase(demo);
  try {
    const tx = database.transaction(["settings", "entries"], "readonly");
    const settings = await requestResult(tx.objectStore("settings").get(SETTINGS_KEY) as IDBRequest<Settings | undefined>);
    const entries = await requestResult(tx.objectStore("entries").getAll() as IDBRequest<SpendEntry[]>);
    return { settings: settings ?? null, entries: entries.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) };
  } finally {
    database.close();
  }
}

export async function saveSettings(demo: boolean, settings: Settings): Promise<void> {
  const database = await openDatabase(demo);
  try {
    await requestResult(database.transaction("settings", "readwrite").objectStore("settings").put(settings, SETTINGS_KEY));
  } finally {
    database.close();
  }
}

export async function saveEntry(demo: boolean, entry: SpendEntry): Promise<void> {
  const database = await openDatabase(demo);
  try {
    await requestResult(database.transaction("entries", "readwrite").objectStore("entries").put(entry));
  } finally {
    database.close();
  }
}

export async function removeEntry(demo: boolean, id: string): Promise<void> {
  const database = await openDatabase(demo);
  try {
    await requestResult(database.transaction("entries", "readwrite").objectStore("entries").delete(id));
  } finally {
    database.close();
  }
}

export async function replaceData(demo: boolean, data: AppData): Promise<void> {
  const database = await openDatabase(demo);
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(["settings", "entries"], "readwrite");
      tx.objectStore("settings").clear();
      tx.objectStore("entries").clear();
      if (data.settings) tx.objectStore("settings").put(data.settings, SETTINGS_KEY);
      data.entries.forEach((entry) => tx.objectStore("entries").put(entry));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("The imported data could not be saved."));
    });
  } finally {
    database.close();
  }
}

export function deleteDatabase(demo: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName(demo));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("The local data could not be cleared."));
    request.onblocked = () => reject(new Error("Close other Spend Pulse tabs, then try again."));
  });
}
