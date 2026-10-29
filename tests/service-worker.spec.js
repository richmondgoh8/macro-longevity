import { expect, test } from '@playwright/test';

test('service worker installs the current cache and serves fast offline navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(`${baseURL}/pages/stack.html`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  const cacheKeys = await page.evaluate(() => caches.keys());
  expect(cacheKeys).toContain('macro-longevity-offline-v49-reference-navigation');
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
  await expect(page.locator('[data-reference-group]')).toHaveCount(7);
  await expect(page.locator('#sg-home-dashboard input')).toHaveCount(1);
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.getByRole('searchbox', { name: 'Find a biomarker' }).fill('ApoB');
  await page.locator('[data-reference-results] a').click();
  await expect(page).toHaveURL(/#biomarker-apob$/);
  await context.close();
});
