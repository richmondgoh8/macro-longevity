const CACHE_NAME = 'macro-longevity-offline-v13';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/stack.html',
  '/pages/blood.html',
  '/pages/protocol.html',
  '/pages/workout.html',
  '/pages/finance.html',
  '/pages/avoid.html',
  '/css/variables.css',
  '/css/style.css',
  '/js/register-sw.js',
  '/js/icons.js',
  '/js/theme.js',
  '/js/export.js',
  '/js/home.js',
  '/js/stack.js',
  '/js/blood.js',
  '/js/protocol.js',
  '/js/render.js',
  '/js/finance.js',
  '/js/components/card-swipe.js',
  '/js/data/core.js',
  '/js/data/stack.js',
  '/js/data/blood.js',
  '/js/data/workout.js',
  '/js/data/finance.js',
  '/js/data/pillars.js',
  '/js/data/protocol.js',
  '/js/data/singapore.js',
  '/js/data/nutrition.js',
  '/offline.html',
  '/favicon.svg',
  '/manifest.json',
  '/fonts/dm-sans-latin.woff2',
  '/fonts/inter-latin.woff2',
  '/fonts/jetbrains-mono-latin.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const isImmutable = url.pathname.endsWith('.woff2') || url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg');

  if (isImmutable) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
    );
  }
});
