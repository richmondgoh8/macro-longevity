import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/pages/stack.html', '/pages/avoid.html', '/pages/blood.html', '/pages/protocol.html', '/pages/workout.html', '/pages/finance.html'];

for (const route of routes) {
  test(`${route} keeps the five-destination shell`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('.nav-links .nav-link')).toHaveCount(5);
    await expect(page.locator('.bottom-nav-item')).toHaveCount(5);
    const shellText = await page.locator('.nav-links, .bottom-nav').allTextContents();
    expect(shellText.join(' ')).not.toMatch(/Avoid|Blueprint|Daily Stack|Blood Tests/);
    const labels = await page.locator('.nav-links .nav-link').allTextContents();
    expect(labels.map((label) => label.trim())).toEqual(['Home', 'Nutrition', 'Health', 'Training', 'Finance']);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('same-origin route navigation is view-transition ready', async ({ page }) => {
  await page.goto('/');
  const transitionRules = await page.evaluate(() => {
    const texts = [];
    const collect = (rules) => {
      for (const rule of rules) {
        texts.push(rule.cssText);
        if (rule.cssRules) collect(rule.cssRules);
      }
    };
    for (const sheet of document.styleSheets) {
      try { collect(sheet.cssRules); } catch { /* Ignore inaccessible third-party sheets. */ }
    }
    return texts;
  });
  expect(transitionRules.some((text) => text.includes('@view-transition') && text.includes('navigation: auto'))).toBe(true);
  expect(transitionRules.some((text) => text.includes('@view-transition') && text.includes('navigation: none'))).toBe(true);

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('link[rel="expect"][href="#view-transition-anchor"][blocking="render"]')).toHaveCount(1);
    await expect(page.locator('#view-transition-anchor')).toHaveCount(1);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('link', { name: 'Nutrition' }).first().click();
  await expect(page).toHaveURL(/pages\/stack\.html$/);
  await expect(page.getByRole('heading', { name: 'Build your Daily Stack' })).toBeVisible();
});

test('Nutrition context navigation owns the Ingredient guide', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await expect(page.getByRole('navigation', { name: 'Nutrition' }).getByRole('link')).toHaveCount(2);
  await page.getByRole('link', { name: 'Ingredient guide' }).click();
  await expect(page).toHaveURL(/avoid\.html$/);
  await expect(page.locator('.nav-links .nav-link.active')).toHaveText('Nutrition');
  await expect(page.getByRole('link', { name: 'Ingredient guide' })).toHaveAttribute('aria-current', 'page');
});

test('Ingredient guide filtering preserves five-screen context and resets', async ({ page }) => {
  await page.goto('/pages/avoid.html');
  await expect(page.locator('[data-avoid-label-card]')).toHaveCount(5);
  await page.locator('[data-avoid-search]').fill('nitrite');
  await expect(page.locator('[data-avoid-count]')).toHaveText('1 of 5 screens match');
  await expect(page.locator('[data-avoid-label-card]:visible')).toHaveCount(1);
  await page.locator('[data-avoid-reset]').click();
  await expect(page.locator('[data-avoid-count]')).toHaveText('Showing all 5 screens');
  await expect(page.locator('[data-avoid-label-card]:visible')).toHaveCount(5);
  await page.locator('[data-avoid-search]').fill('alcohol');
  await expect(page.locator('[data-avoid-detail-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-avoid-detail-card]:visible')).toHaveAttribute('open', '');
});

test('Planner mode switching is stable and keyboard operable', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const planner = page.locator('.meal-planner');
  const marker = await planner.evaluate((node) => { node.dataset.testIdentity = 'stable'; return node.dataset.testIdentity; });
  await page.getByRole('button', { name: /Quick add/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose foods and supplements' })).toBeVisible();
  expect(await planner.getAttribute('data-test-identity')).toBe(marker);
  await page.getByRole('button', { name: /Quick add/ }).press('ArrowLeft');
  await expect(page.getByRole('button', { name: /Meals/ })).toHaveAttribute('aria-pressed', 'true');
});

test('key pages have no automatically detectable serious accessibility violations', async ({ page }) => {
  for (const route of ['/', '/pages/stack.html', '/pages/avoid.html', '/pages/protocol.html']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact))).toEqual([]);
  }
});
