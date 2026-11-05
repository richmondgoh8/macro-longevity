import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); });

test('core reference cards use consistent statuses and support copy links', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#biomarker-apob');
  await expect(card).toBeVisible();
  await expect(page.locator('.sg-reference-key')).toContainText('universal longevity targets');
  const labels = await page.locator('.sg-range-status').allTextContents();
  expect(new Set(labels).isSubsetOf(new Set(['Favourable', 'Context', 'Review']))).toBe(true);
  await expect(page.locator('#biomarker-ldl .sg-range-description')).toHaveText([
    'Desirable screening category', 'Above desirable / borderline range', 'High',
  ]);
  await expect(page.locator('#biomarker-egfr .sg-range-description').first()).toHaveText('Normal / high');
  await page.evaluate(() => {
    window.__copiedLink = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copiedLink = text; } } });
  });
  await card.getByRole('button', { name: /^Copy link/ }).click();
  expect(await page.evaluate(() => window.__copiedLink)).toContain('#biomarker-apob');
});

test('unit controls work with keyboard and preserve responsive layout', async ({ page }) => {
  for (const size of [{ width: 320, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    const alternate = page.getByRole('button', { name: 'Alternative units' });
    await alternate.focus();
    await page.keyboard.press('Enter');
    await expect(alternate).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('core reference guide has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).include('#sg-home-dashboard').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});
