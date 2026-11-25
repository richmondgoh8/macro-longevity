from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit


class Handler(SimpleHTTPRequestHandler):
    def log_request(self, code='-', size='-'):
        if isinstance(code, int) and code >= 400 and code != 404:
            super().log_request(code, size)

    def log_error(self, format, *args):
        if args and args[0] != 404:
            super().log_error(format, *args)

    def do_GET(self):
        url = urlsplit(self.path)
        self.path = url.path.removeprefix('/macro-longevity') if url.path.startswith('/macro-longevity/') else url.path
        if self.path == '/sw.js' and url.query == 'legacy':
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.end_headers()
            self.wfile.write(b"""
const name = 'macro-longevity-offline-v63-healthspan-priorities';
const retired = new URL('pages/finance.html', self.registration.scope);
self.addEventListener('install', (event) => event.waitUntil(caches.open(name)
  .then(cache => cache.put(retired, new Response('<h1>Finance &amp; FIRE</h1>', {
    headers: { 'Content-Type': 'text/html' },
  })))));
self.addEventListener('activate', (event) => event.waitUntil((async () => {
  await self.registration.navigationPreload?.enable();
  await self.clients.claim();
})()));
self.addEventListener('fetch', (event) => {
  if (event.request.url === retired.href) event.respondWith(caches.match(retired));
});
""")
            return
        super().do_GET()


ThreadingHTTPServer(('127.0.0.1', 4173), Handler).serve_forever()
