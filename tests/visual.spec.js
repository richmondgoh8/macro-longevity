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

test('Finance income tracker empty state visual baseline', async ({ page }) => {
  await page.goto('/pages/finance.html');
  await page.evaluate(() => localStorage.removeItem('passiveIncome'));
  await page.getByRole('tab', { name: 'Income tracker' }).click();
  await expect(page.locator('.ui-empty-state')).toBeVisible();
  await expect(page).toHaveScreenshot('finance-income-empty.png', { fullPage: true });
});

test('planner quick-add state visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('tab', { name: /Quick add/ }).click();
  await expect(page.locator('#planner-quick-add')).toBeVisible();
  // Capture the user's viewport, not a 53-card element taller than the browser's
  // screenshot surface. Full-list behavior is covered by the interaction specs.
  await page.locator('#planner-quick-add').evaluate(section => {
    const header = document.querySelector('.nav').getBoundingClientRect().height;
    const coverage = document.querySelector('[data-coverage-bar]').getBoundingClientRect().height;
    scrollTo(0, section.getBoundingClientRect().top + scrollY - header - coverage - 24);
  });
  await expect(page).toHaveScreenshot('nutrition-quick-add.png');
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
  await page.getByRole('tab', { name: /Quick add/ }).click();
  await page.locator('.quick-item-grid .builder-item').first().locator('[data-quick-item]').click();
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

test('compact coverage at the footer visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await expect(page.locator('[data-planner-ready]')).toHaveAttribute('aria-busy', 'false');
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('[data-coverage-bar]')).toHaveClass(/is-pinned/);
  await expect(page).toHaveScreenshot('nutrition-pinned-footer.png');
});

test('all nutrient details visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('button', { name: 'All nutrients', exact: true }).click();
  await expect(page.locator('[data-coverage-dialog]')).toBeVisible();
  await expect(page).toHaveScreenshot('nutrition-all-nutrients.png');
});
