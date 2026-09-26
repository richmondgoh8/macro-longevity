import { expect, test } from '@playwright/test';

test('finance explanations sit in a centered readable panel and home cards have even borders', async ({ page }) => {
  await page.goto('/');
  const border = await page.locator('.hero-pillar-card').first().evaluate((card) => {
    const style = getComputedStyle(card);
    return [style.borderLeftWidth, style.borderRightWidth];
  });
  expect(border[0]).toBe(border[1]);

  await page.goto('/pages/finance.html');
  const combo = page.locator('[data-invest-combo]').first();
  const explanation = combo.locator('.meal-details').first();
  await explanation.locator('summary').click();
  await expect(explanation.locator('.invest-body-text')).toBeVisible();
  const placement = await explanation.evaluate((panel) => {
    const outer = panel.closest('.invest-combo-body').getBoundingClientRect();
    const inner = panel.getBoundingClientRect();
    return { leftGap: inner.left - outer.left, rightGap: outer.right - inner.right, width: inner.width };
  });
  expect(Math.abs(placement.leftGap - placement.rightGap)).toBeLessThan(3);
  expect(placement.width).toBeLessThanOrEqual(760);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
});

test('countable foods and kitchen measures display natural units without changing saved gram totals', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.locator('[data-start-blank]').click();
  await page.getByRole('tab', { name: /Quick add/ }).click();

  const eggs = page.locator('[data-quick-card="eggs"]');
  await eggs.locator('[data-quick-item]').click();
  const eggInput = eggs.locator('[data-gram-input]');
  await expect(eggs.locator('[data-gram-control]')).toContainText('Amount (eggs)');
  await expect(eggInput).toHaveValue('2');
  await eggs.locator('[data-gram-action="increase"]').click();
  await expect(eggInput).toHaveValue('3');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ml-daily-current')).quickItemGrams.eggs)).toBe(150);

  const milk = page.locator('[data-quick-card="milk"]');
  await milk.locator('[data-quick-item]').click();
  await expect(milk.locator('[data-gram-control]')).toContainText('Amount (ml)');
  await expect(milk.locator('[data-gram-input]')).toHaveValue('250');

  await page.reload();
  await page.getByRole('tab', { name: /Quick add/ }).click();
  await expect(page.locator('[data-quick-card="eggs"] [data-gram-input]')).toHaveValue('3');
});

test('meal editor uses egg counts while retaining gram-based nutrient calculations', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.locator('[data-meal-card="eggs-broccoli-potato"] [data-meal-toggle]').click();
  await page.locator('[data-meal-card="eggs-broccoli-potato"] [data-meal-edit]').click();
  const dialog = page.locator('[data-meal-dialog]');
  const eggs = dialog.locator('[data-meal-draft-amount="eggs"]');
  await expect(eggs).toHaveValue('2');
  await expect(dialog.locator('label[for="draft-eggs"]')).toContainText('eggs');
  await eggs.fill('3');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ml-daily-current')).mealItemGrams['eggs-broccoli-potato'].eggs)).toBe(150);
});
