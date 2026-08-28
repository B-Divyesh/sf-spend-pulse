const CACHE = "spend-pulse-shell-v5";
const SHELL = [
  "/",
  "/?demo=1",
  "/demo",
  "/privacy",
  "/terms",
  "/settings",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/social-card.webp",
  "/fonts/atkinson.ttf",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const shellResponse = await fetch("/");
    const shell = await shellResponse.clone().text();
    const assetUrls = [...shell.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map((match) => match[1])
      .filter((url) => url.startsWith("/"));
    const bundles = await Promise.all(assetUrls
      .filter((url) => /\.js(?:$|\?)/.test(url))
      .map(async (url) => (await fetch(url)).text()));
    const bundledAssetUrls = bundles.flatMap((bundle) => [...bundle.matchAll(/\/?assets\/[A-Za-z0-9._-]+/g)]
      .map((match) => `/${match[0].replace(/^\//, "")}`));
    await cache.put("/", shellResponse.clone());
    await cache.addAll([...new Set([...SHELL, ...assetUrls, ...bundledAssetUrls])]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request, { ignoreVary: true })) || (await caches.match("/", { ignoreVary: true })) || caches.match("/offline.html", { ignoreVary: true })));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin);
    return existing ? existing.focus() : self.clients.openWindow("/");
  }));
});
