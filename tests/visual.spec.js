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

test('Ingredient guide filtered state visual baseline', async ({ page }) => {
  await page.goto('/pages/avoid.html');
  await page.locator('[data-avoid-search]').fill('nitrite');
  await expect(page.locator('[data-avoid-guide]')).toHaveScreenshot('ingredients-filtered.png');
});

test('planner quick-add state visual baseline', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('tab', { name: /Quick add/ }).click();
  await expect(page.locator('.meal-planner')).toHaveScreenshot('nutrition-quick-add.png');
});
