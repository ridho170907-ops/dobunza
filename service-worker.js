const CACHE_NAME = 'dobunza-pwa-v1';
const APP_ASSETS = [
  "./admin-dashboard.html",
  "./admin.css",
  "./admin.html",
  "./admin.js",
  "./content-store.js",
  "./game.css",
  "./game.html",
  "./game.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./images/foto-utama.jpg",
  "./images/gallery/photo1.jpg",
  "./images/gallery/photo2.jpg",
  "./images/gallery/photo3.jpg",
  "./images/gallery/photo4.jpg",
  "./images/gallery/photo5.jpg",
  "./images/gallery/photo6.jpg",
  "./images/story.jpg",
  "./images/story1.jpg",
  "./index.html",
  "./manifest.webmanifest",
  "./music/music.mp3",
  "./photo-store.js",
  "./script.js",
  "./service-worker.js",
  "./settings-store.js",
  "./style.css"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('Offline and resource not cached');
      });
    })
  );
});
