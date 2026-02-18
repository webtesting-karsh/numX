const CACHE_NAME = "numx-offline-v2.11";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/converter.html",
  "/operations.html",
  "/style.css",
  "/script.js",
  "/converter.js",
  "/operations.js",
  "/donate.js",
  "/logo.png",
  "/manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      })
  );
});
