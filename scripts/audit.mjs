import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const routes = ['index.html', 'pages/stack.html', 'pages/food-labels.html', 'pages/blood.html', 'pages/supplements.html', 'pages/skin-care.html'];
const read = (file) => readFileSync(file, 'utf8');
const local = (file, reference) => new URL(reference, `https://example.test/app/${file}`);
const cacheAssets = [...read('sw.js').split('const STATIC_ASSETS = [')[1].split('];')[0].matchAll(/['"]([^'"]+)['"]/g)]
  .map(([, asset]) => local('index.html', asset).href);

for (const asset of cacheAssets) {
  const file = new URL(asset).pathname.slice('/app/'.length) || 'index.html';
  assert(existsSync(file), `Missing cached asset: ${file}`);
}

for (const route of routes) {
  const html = read(route);
  assert.match(html, /rel="canonical"/, route);
  assert.match(html, /rel="manifest"/, route);
  assert.match(html, /script-src 'self';/u, route);
  assert.doesNotMatch(html, /\son\w+="|<script>/iu, route);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, route);
  assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1, route);
  const nav = html.match(/<nav\b[^>]*>(.*?)<\/nav>/s)?.[1] || '';
  assert.deepEqual([...nav.matchAll(/<span>([^<]+)<\/span>/g)].map(([, label]) => label),
    ['Overview', 'Food', 'Food Labels', 'Health', 'Supplements', 'Skin Care'], route);
  const sectionNav = html.match(/<nav class="section-nav"[^>]*>(.*?)<\/nav>/s)?.[1] || '';
  assert(sectionNav, `${route}: missing section-nav`);
  for (const [, href] of sectionNav.matchAll(/href="([^"]+)"/g)) {
    assert(href.startsWith('#'), `${route}: section-nav must only link to in-page sections (${href})`);
  }
  for (const [, reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https:|tel:|#)/.test(reference)) continue;
    const url = local(route, reference);
    url.hash = '';
    assert(cacheAssets.includes(url.href), `${route}: cache is missing ${reference}`);
  }
}

for (const [index, route] of routes.entries()) {
  const pathname = index === 0 ? '' : route;
  assert(read('sitemap.xml').includes(`https://hazelah.me/macro-longevity/${pathname}</loc>`));
}
assert.deepEqual(readdirSync('pages').filter((entry) => entry.endsWith('.html')).sort(), routes.slice(1).map((route) => route.split('/').at(-1)).sort());
const manifest = JSON.parse(read('manifest.json'));
for (const key of ['id', 'start_url', 'scope']) assert.equal(manifest[key], './');
for (const { src } of manifest.icons) assert(cacheAssets.includes(local('index.html', src).href));
for (const file of ['sw.js', ...readdirSync('js', { recursive: true })
  .filter((entry) => entry.endsWith('.js')).map((entry) => `js/${entry}`)]) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}
assert.match(read('_headers'), /script-src 'self';/);
assert.match(read('.assetsignore'), /^reference\/$/m);
console.log('Navigation, metadata, offline assets and JavaScript verified.');
