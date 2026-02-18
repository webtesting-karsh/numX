const CACHE_NAME = "numx-offline-v2.12";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./converter.html",
  "./operations.html",
  "./style.css",
  "./converter.js",
  "./operations.js",
  "./donate.js",
  "./logo.png",
  "./manifest.json"
];


/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (let asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn("Failed to cache:", asset);
        }
      }
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
