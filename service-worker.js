const CACHE_NAME = "bharat-veya-shell-v4";
const BASE_URL = new URL(".", self.registration.scope);
const API_PATH = new URL("api/", BASE_URL).pathname;
const APP_SHELL = [
  "./", "index.html", "style.css", "script.js", "explore-effects.js", "profile-log.js",
  "site-motion.css", "site-motion.js", "site-motion-plus.js", "bharat-ai.css", "bharat-ai.js",
  "architecture-modal.css", "architecture-modal.js", "bharat-features.css", "bharat-features.js",
  "pwa-init.js", "image-credits.html", "privacy.html", "terms.html",
  "explore-bharat.webmanifest", "manifest.webmanifest",
  "assets/veya-mark.svg", "assets/explore-bharat-mark.svg",
  "images/hero-collage.jpg", "images/kashmir.jpg", "images/kerala.jpg",
  "images/maharashtra.jpg", "images/rajasthan.jpg", "images/Kashmir%20for%20project.jpg",
  "studio.html", "studio.css", "src/main.js", "src/core/csv.js", "src/core/ingest.js",
  "src/core/analysis.js", "src/core/chart.js", "src/core/storage.js",
  "src/core/pencil.js", "src/core/export.js"
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
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith(API_PATH)) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const route = url.pathname.endsWith("/studio.html") ? "studio.html" : "index.html";
      return (await caches.match(new URL(route, BASE_URL))) || Response.error();
    }
    return Response.error();
  }));
});