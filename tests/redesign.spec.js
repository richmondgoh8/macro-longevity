import { expect, test } from '@playwright/test';

test('all routes keep a readable editorial introduction without overflow', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/pages/stack.html', '/pages/blood.html', '/pages/workout.html', '/pages/finance.html', '/pages/avoid.html', '/pages/protocol.html']) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('main > #view-transition-anchor, main > .page-header')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (route !== '/') {
        const colors = await page.locator('.page-header').first().evaluate((node) => ({
          background: getComputedStyle(node).backgroundColor,
          title: getComputedStyle(node.querySelector('h1')).color,
        }));
        expect(colors.background).toBe('rgb(20, 45, 35)');
        expect(colors.title).toBe('rgb(255, 255, 255)');
      }
    }
  }
});

test('the redesigned routes reflow at narrow and intermediate widths', async ({ page }) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/pages/stack.html', '/pages/blood.html', '/pages/workout.html', '/pages/finance.html', '/pages/avoid.html', '/pages/protocol.html']) {
      await page.goto(route);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
  }
});

test('Home protocol is a styled summary with an accessible route to full details', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.home-protocol-list li')).toHaveCount(2);
  await expect(page.locator('.home-protocol-preview')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#stack-summary-app .stack-table')).toHaveCount(0);
  await expect(page.locator('#longevity101-app li:visible')).toHaveCount(3);
  await page.locator('[data-longevity-toggle]').click();
  await expect(page.locator('#longevity101-app li:visible')).toHaveCount(10);
  await page.getByRole('link', { name: 'Explore the Daily Stack' }).click();
  await expect(page).toHaveURL(/\/pages\/stack.html/);
});

test('dense guidance is summarized first and remains available on request', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const annual = page.locator('#blood-annual');
  await expect(annual).not.toHaveAttribute('open', '');
  await annual.locator('> summary').click();
  await expect(annual.locator('.blood-test-row').first()).toBeVisible();

  await page.goto('/pages/finance.html');
  const intro = page.locator('.investments-intro');
  await expect(intro).toBeVisible();
  await expect(intro.locator('h2')).toHaveCSS('color', 'rgb(24, 37, 31)');
  expect(await intro.evaluate((node) => node.getBoundingClientRect().left)).toBeGreaterThanOrEqual(0);
  const combo = page.locator('[data-invest-combo]').first();
  if (page.viewportSize().width >= 767) {
    await expect(combo).not.toHaveAttribute('open', '');
    await combo.locator('> summary').click();
  }
  await expect(combo.locator('.invest-combo-body')).toBeVisible();

  await page.goto('/pages/avoid.html');
  await expect(page.locator('[data-avoid-label-card]')).toHaveCount(5);
  const detail = page.locator('[data-avoid-detail-card]').first();
  await expect(detail).not.toHaveAttribute('open', '');
  await detail.locator('> summary').click();
  await expect(detail.locator('.avoid-detail-body')).toBeVisible();
});

test('Nutrition shows concise meal cards while the detail view retains ingredients', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await expect(page.locator('[data-planner-ready]')).toHaveAttribute('aria-busy', 'false');
  const meal = page.locator('[data-meal-card]').first();
  await expect(meal.locator('.meal-ingredients')).toHaveCount(0);
  await meal.locator('[data-nutrition-detail-open]').first().click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Ingredients' })).toBeVisible();
});

test('expanded guidance keeps readable insets and mobile macros stay on one row', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, selector] of [
      ['/pages/avoid.html', '[data-avoid-label-card]'],
      ['/pages/blood.html', '.blood-prep'],
      ['/pages/finance.html', '[data-invest-combo]'],
    ]) {
      await page.goto(route);
      const card = page.locator(selector).first();
      if (!(await card.evaluate((node) => node.open))) await card.locator('> summary').click();
      const body = card.locator('> div').first();
      await expect(body).toBeVisible();
      const inset = await body.evaluate((node) => {
        const style = getComputedStyle(node);
        return [style.paddingRight, style.paddingBottom, style.paddingLeft].map(parseFloat);
      });
      expect(inset.every((value) => value >= 16), `${route} guidance body padding: ${inset}`).toBe(true);
    }
    await page.goto('/pages/stack.html');
    await expect(page.locator('[data-planner-ready]')).toHaveAttribute('aria-busy', 'false');
    const macroColumns = await page.locator('.coverage-gap-dock .macro-progress-strip').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    expect(macroColumns).toBe(4);
  }
});
