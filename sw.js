const SITE_SCOPE = new URL("./", self.location.href);
const CACHE_PREFIX = `macro-longevity:${SITE_SCOPE.pathname}:`;
const CACHE_NAME = `${CACHE_PREFIX}v26`;
const STATIC_ASSETS = [
  "./",
  "index.html",
  "pages/stack.html",
  "pages/food-labels.html",
  "pages/blood.html",
  "pages/supplements.html",
  "pages/skin-care.html",
  "offline.html",
  "css/variables.css?v=5",
  "css/style.css?v=17",
  "js/register-sw.js?v=5",
  "js/section-nav.js?v=2",
  "js/health-dashboard.js?v=5",
  "js/data/screening.js?v=3",
  "js/export.js?v=3",
  "js/a1c-history.js?v=2",
  "images/weekday-meals.webp?v=2",
  "fonts/inter-latin.woff2",
  "favicon.svg",
  "manifest.json",
  "images/infographics/meal-plate.svg",
  "images/infographics/sugar-scale.svg",
  "images/infographics/report-pair.svg",
  "images/infographics/walking-week.svg",
  "icons/app-192.png",
  "icons/app-512.png",
  "icons/apple-touch-icon.png",
];
const urls = new Set(
  STATIC_ASSETS.map((path) => new URL(path, SITE_SCOPE).href),
);
const offline = new URL("offline.html", SITE_SCOPE).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(
          [...urls].map((url) => new Request(url, { cache: "reload" })),
        ),
      ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_NAME &&
              (key.startsWith(CACHE_PREFIX) ||
                key.startsWith("macro-longevity-offline-")),
          )
          .map((key) => caches.delete(key)),
      );
      // Previous versions enabled navigation preload for network revalidation.
      await self.registration.navigationPreload?.disable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (
    url.origin !== SITE_SCOPE.origin ||
    !url.pathname.startsWith(SITE_SCOPE.pathname)
  )
    return;
  const navigate = request.mode === "navigate";
  if (navigate) {
    url.search = "";
    url.hash = "";
  }

  if (urls.has(url.href) || navigate) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = urls.has(url.href) && (await cache.match(url.href));
        if (cached) return cached;

        try {
          return await fetch(request);
        } catch {
          return navigate &&
            url.href !== offline &&
            (await cache.match(offline))
            ? Response.redirect(offline)
            : Response.error();
        }
      })(),
    );
  }
});
