import { expect, test } from '@playwright/test';

test('service worker installs the current cache and serves fast offline navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(`${baseURL}/pages/stack.html`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  const cacheKeys = await page.evaluate(() => caches.keys());
  expect(cacheKeys).toContain('macro-longevity-offline-v20-warm-canvas');
  expect(cacheKeys.some((key) => /offline-v(?:13|14|15|16|17)$/.test(key))).toBe(false);

  await context.setOffline(true);
  const started = Date.now();
  await page.goto(`${baseURL}/pages/avoid.html`, { waitUntil: 'domcontentloaded' });
  expect(Date.now() - started).toBeLessThan(1_500);
  await expect(page.getByRole('heading', { name: 'Ingredients to Avoid' })).toBeVisible();
  await context.close();
});
