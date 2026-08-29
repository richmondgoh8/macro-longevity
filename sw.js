const CACHE_NAME = 'macro-longevity-offline-v29-rounded-coverage-threshold';
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
  '/css/tooltip.css',
  '/css/toast.css',
  '/js/register-sw.js',
  '/js/site.js',
  '/js/components/tooltip.js',
  '/js/export.js',
  '/js/home.js',
  '/js/stack-preview.js',
  '/js/stack.js',
  '/js/avoid.js',
  '/js/blood.js',
  '/js/protocol.js',
  '/js/render.js',
  '/js/finance.js',
  '/js/components/card-swipe.js',
  '/js/components/spotlight.js',
  '/js/components/sticky-pin.js',
  '/js/components/ui.js',
  '/js/components/toast.js',
  '/js/components/modal.js',
  '/js/components/confirm.js',
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
    ).then(async () => {
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })
  );
});

async function fetchWithTimeout(request, timeoutMs = 1200) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(request, { signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

async function cacheResponse(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    await (await caches.open(CACHE_NAME)).put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const isNavigation = event.request.mode === 'navigate';
  const isImmutable = url.pathname.endsWith('.woff2') || url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg');

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const response = await Promise.race([
          event.preloadResponse.then((preloaded) => preloaded || fetchWithTimeout(event.request)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('navigation timeout')), 1300)),
        ]);
        return cacheResponse(event.request, response);
      } catch {
        return (await caches.match(event.request)) || (await caches.match('/offline.html'));
      }
    })());
  } else if (isImmutable) {
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
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      const update = fetch(event.request).then((response) => cacheResponse(event.request, response)).catch(() => null);
      if (cached) { event.waitUntil(update); return cached; }
      return (await update) || Response.error();
    })());
  }
});
