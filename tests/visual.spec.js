import { expect, test } from '@playwright/test';

const pages = [
  ['home', '/'], ['nutrition', '/pages/stack.html'], ['ingredients', '/pages/avoid.html'],
  ['health', '/pages/blood.html'], ['blueprint', '/pages/protocol.html'],
  ['training', '/pages/workout.html'], ['finance', '/pages/finance.html'],
];

for (const [name, route] of pages) {
  test(`${name} visual baseline`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}

test('split-screen hero visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.split-screen-hero')).toHaveScreenshot('home-split-screen-hero.png');
});

test('spotlight card hover visual baseline', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Spotlight enhancement is disabled for coarse pointers.');
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-spotlight-card]').first().hover({ position: { x: 24, y: 24 } });
  await page.waitForTimeout(300);
  await expect(page.locator('.split-screen-hero')).toHaveScreenshot('home-spotlight-card-hover.png');
});

test('sticky pin rail visual baseline', async ({ page }) => {
  test.skip(page.viewportSize().width < 1024, 'Sticky rail is static on tablet and mobile.');
  await page.goto('/pages/protocol.html');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.sticky-pin-layout')).toHaveScreenshot('blueprint-sticky-pin.png');
});

test('Ingredient guide filtered state visual baseline', async ({ page }) => {
  await page.goto('/pages/avoid.html');
  await page.locator('[data-avoid-search]').fill('nitrite');
  await expect(page.locator('[data-avoid-guide]')).toHaveScreenshot('ingredients-filtered.png');
});

test('planner quick-add state visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('button', { name: /Quick add/ }).click();
  await expect(page.locator('.meal-planner')).toHaveScreenshot('nutrition-quick-add.png');
});

test('destructive modal visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const clear = page.locator('[data-clear-stack]');
  await clear.scrollIntoViewIfNeeded();
  await clear.click();
  await expect(page).toHaveScreenshot('modal-confirm.png');
});

test('save-meal modal visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('button', { name: /Quick add/ }).click();
  await page.locator('.quick-item-grid .builder-item').first().locator('strong').click();
  await page.locator('[data-meal-compose-open]').click();
  await expect(page).toHaveScreenshot('modal-save-meal.png');
});

test('typed toast stack visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const { showToast } = await import('/js/components/ui.js');
    await showToast('Plan saved', { type: 'success', duration: 30_000 });
    await showToast('Review your next step', { type: 'warning', duration: 30_000 });
    await showToast('Sync is unavailable', { type: 'error', persistent: true });
  });
  await expect(page).toHaveScreenshot('toast-stack.png');
});

test('icon-control tooltip visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const trigger = page.locator('.meal-library-grid .meal-card').first().locator('[data-meal-toggle]');
  await trigger.focus();
  await expect(trigger.locator('.ui-tooltip')).toHaveAttribute('data-tooltip-open', 'true');
  await expect(trigger.locator('.ui-tooltip')).toHaveScreenshot('tooltip-icon-control.png');
});
