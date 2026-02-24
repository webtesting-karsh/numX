const CACHE_NAME = "numx-offline-v2.4.2";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/converter.html",
  "/style.css",
  "/converter.js",
  "/donate.js",
  "/ar/ar.html",
  "/ar/ar.css",
  "/ar/ar.js",
  "/logo.png",
  "/manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
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

  return self.clients.claim(); // take control immediately
});

/* FETCH (Network First) */
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only cache same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});