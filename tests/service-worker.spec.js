import { chromium, expect, test } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

test('a new offline cache refreshes assets already fresh in the HTTP cache', async ({ browser }) => {
  let latest = false;
  const server = createServer((request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname;
    const file = path === '/' ? 'index.html' : path.slice(1);
    let body;
    try { body = file === 'js/home-dashboard.js' && !latest ? '// obsolete HTTP-cached renderer' : readFileSync(new URL('../' + file, import.meta.url)); }
    catch { response.writeHead(404); response.end(); return; }
    response.writeHead(200, {
      'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream',
      'Cache-Control': file === 'sw.js' ? 'no-cache' : 'public, max-age=3600',
    });
    response.end(body);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  try {
    const page = await context.newPage();
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(origin + '/favicon.svg');
    expect(await page.evaluate(async () => (await fetch('/js/home-dashboard.js')).text())).toContain('obsolete HTTP-cached renderer');
    latest = true;
    expect(await page.evaluate(async () => (await fetch('/js/home-dashboard.js')).text())).toContain('obsolete HTTP-cached renderer');
    await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    const installed = await page.evaluate(async () => {
      const response = await caches.match('/js/home-dashboard.js');
      return response.text();
    });
    expect(installed).toBe(readFileSync(new URL('../js/home-dashboard.js', import.meta.url), 'utf8'));
  } finally {
    await context.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('install metadata provides a stable identity and usable PNG icons on every route', async ({ page, context }) => {
  await page.goto('/');
  const session = await context.newCDPSession(page);
  await session.send('Page.enable');
  const { errors, data } = await session.send('Page.getAppManifest');
  expect(errors).toEqual([]);
  const manifest = JSON.parse(data);
  expect(manifest.id).toBe('./');
  expect(manifest.scope).toBe('./');
  expect(manifest.display).toBe('standalone');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(item => item.type === 'image/png' && item.sizes === `${size}x${size}`);
    expect(icon).toBeTruthy();
    const actual = await page.evaluate(async src => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    }, icon.src);
    expect(actual).toEqual([size, size]);
  }
  expect(manifest.icons.some(icon => icon.purpose.includes('maskable'))).toBe(true);
  for (const path of ['/', '/pages/stack.html', '/pages/blood.html', '/pages/protocol.html', '/pages/avoid.html', '/pages/workout.html', '/pages/finance.html']) {
    await page.goto(path);
    const icon = page.locator('link[rel="apple-touch-icon"]');
    await expect(icon).toHaveAttribute('sizes', '180x180');
    // Relative nested-page URLs are resolved against the document, not the test base URL.
    const href = await icon.evaluate(node => node.href);
    const resolved = await page.request.get(href);
    expect(resolved.ok()).toBe(true);
    expect(resolved.headers()['content-type']).toContain('image/png');
  }
});

test('Chromium installability checks pass in a non-private browser profile', async ({ baseURL }, testInfo) => {
  const context = await chromium.launchPersistentContext(testInfo.outputPath('install-profile'), {
    channel: 'chromium', serviceWorkers: 'allow',
  });
  try {
    const page = await context.newPage();
    await page.goto(baseURL);
    await page.evaluate(() => navigator.serviceWorker.ready);
    const session = await context.newCDPSession(page);
    await session.send('Page.enable');
    const { installabilityErrors } = await session.send('Page.getInstallabilityErrors');
    expect(installabilityErrors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('service worker installs the current cache and serves fast offline navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  // CacheStorage is shared across an origin, even when app/service-worker scopes differ.
  await page.goto(`${baseURL}/favicon.svg`);
  await page.evaluate(async () => {
    await caches.open('other-app-preserve-test');
    await caches.open('macro-longevity-offline-v0-test');
  });
  await page.goto(`${baseURL}/pages/stack.html`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  const cacheKeys = await page.evaluate(() => caches.keys());
  expect(cacheKeys).toContain('macro-longevity-offline-v59-reference-layout-refresh');
  expect(cacheKeys).toContain('other-app-preserve-test');
  expect(cacheKeys).not.toContain('macro-longevity-offline-v0-test');
  expect(cacheKeys.some((key) => /offline-v(?:13|14|15|16|17)$/.test(key))).toBe(false);

  await context.setOffline(true);
  const started = Date.now();
  await page.goto(`${baseURL}/pages/avoid.html`, { waitUntil: 'domcontentloaded' });
  expect(Date.now() - started).toBeLessThan(500);
  await expect(page.getByRole('heading', { name: 'Ingredients to Avoid' })).toBeVisible();
  await page.goto(`${baseURL}/pages/blood.html`);
  await page.locator('[data-biomarker-library] > summary').click();
  await page.getByLabel('Search all biomarkers').fill('ApoB');
  await expect(page.locator('[data-library-marker="apolipoproteinb"]')).toBeVisible();
  await page.locator('[data-additional-screening] > summary').click();
  await expect(page.locator('[data-marker-card="ferritin"]')).toHaveCount(1);
  await page.goto(`${baseURL}/`);
  const reference = page.locator('[data-reference-card="apob"]');
  await expect(reference.locator('.sg-card-action')).toContainText('unsaturated');
  await expect(page.locator('#biomarker-b12 .sg-range-context')).toContainText('138–652 pmol/L');
  await page.goto(`${baseURL}/#biomarker-hemoglobin`);
  await expect(page.locator('#biomarker-hemoglobin .sg-range-context')).toContainText('Male: 13.1–16.8; female: 11.5–14.9 g/dL');
  await expect(page.locator('[data-reference-group]')).toHaveCount(7);
  await page.goto(`${baseURL}/#biomarker-hearingright`);
  await expect(page.locator('#biomarker-hearingright .sg-card-action')).toBeVisible();
  await page.goto(`${baseURL}/pages/blood.html`);
  await page.locator('[data-health-search]').fill('FEV1');
  await page.locator('[data-health-results] a[href="../#biomarker-fev1"]').click();
  await expect(page.locator('#biomarker-fev1 .sg-card-action')).toBeVisible();
  await expect(page.locator('#sg-home-dashboard input')).toHaveCount(1);
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.getByRole('searchbox', { name: 'Find a biomarker' }).fill('ApoB');
  await page.locator('[data-reference-results] a').click();
  await expect(page).toHaveURL(/#biomarker-apob$/);
  await page.goto(`${baseURL}/#biomarker-bmd`);
  await expect(page.locator('[data-reference-card="bmd"]')).toContainText('T-score');
  await page.goto(`${baseURL}/pages/blood.html#physical-bmd-hip`);
  const bone = page.locator('[data-physical-card="bmd-hip"]');
  await expect(bone).toBeVisible();
  await bone.getByLabel('T-score', { exact: true }).fill('-1.3');
  await page.reload();
  await expect(bone.getByLabel('T-score', { exact: true })).toHaveValue('-1.3');
  await page.goto(`${baseURL}/#biomarker-psafree`);
  const specialist = page.locator('[data-reference-card="psafree"]');
  await expect(specialist).toBeVisible();
  await expect(specialist.locator('.sg-card-action')).toBeVisible();
  await context.close();
});
