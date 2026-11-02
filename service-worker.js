const CACHE_NAME = "veya-shell-v2";
const APP_SHELL = [
  "/", "/index.html", "/style.css", "/studio.html", "/studio.css", "/manifest.webmanifest",
  "/assets/veya-mark.svg", "/images/Kashmir%20for%20project.jpg",
  "/src/main.js", "/src/core/csv.js", "/src/core/ingest.js", "/src/core/analysis.js",
  "/src/core/chart.js", "/src/core/storage.js", "/src/core/pencil.js", "/src/core/export.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") return (await caches.match(url.pathname === "/studio.html" ? "/studio.html" : "/index.html")) || Response.error();
    return Response.error();
  }));
});