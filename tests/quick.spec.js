import { expect, test } from '@playwright/test';

test('core routes load without errors or mobile overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/pages/stack.html', '/pages/blood.html', '/pages/workout.html', '/pages/finance.html']) {
    expect((await page.goto(route)).status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.nav-links .nav-link')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('Singapore unit defaults, alternate-unit statuses and saved preferences work', async ({ page }) => {
  await page.goto('/pages/blood.html');
  for (const [id, defaultUnit, alternate, value, expected] of [
    ['glucose', 'mmol/L', 'mg/dL', '94', 'Within the reference'],
    ['ldl', 'mmol/L', 'mg/dL', '93', 'Below common care target'],
    ['tg', 'mmol/L', 'mg/dL', '106', 'Within fasting reference'],
    ['nonhdl', 'mmol/L', 'mg/dL', '116', 'Discuss your personal target'],
    ['hba1c', '%', 'mmol/mol', '36', 'Discuss your personal target'],
  ]) {
    const select = page.locator(`[data-marker-unit="${id}"]`);
    await expect(select).toHaveValue(defaultUnit);
    await select.selectOption(alternate);
    await page.locator(`[data-marker-input="${id}"]`).fill(value);
    await expect(page.locator(`[data-marker-card="${id}"] [data-marker-status]`)).toHaveText(expected);
  }
  await page.locator('[data-marker-input="glucose"]').fill('180');
  await expect(page.locator('[data-marker-card="glucose"] [data-marker-status]')).toHaveText('Ask about follow-up');
  await page.locator('[data-marker-unit="glucose"]').selectOption('mmol/L');
  await expect(page.locator('[data-marker-input="glucose"]')).toHaveValue('180');
  await page.locator('[data-marker-input="glucose"]').fill('5.2');
  await expect(page.locator('[data-marker-card="glucose"] [data-marker-status]')).toHaveText('Within the reference');
  await page.reload();
  await expect(page.locator('[data-marker-unit="ldl"]')).toHaveValue('mg/dL');
  await expect(page.locator('[data-marker-input="ldl"]')).toHaveValue('93');
  await expect(page.locator('[data-marker-input="ldl"]')).toHaveAttribute('placeholder', 'e.g. 93');
  await page.locator('[data-biomarker-library] > summary').click();
  await page.getByLabel('Search all biomarkers').fill('Glucose (Blood)');
  const row = page.locator('[data-library-marker="glucose"]');
  await row.locator('summary').click();
  await expect(row.getByLabel('Units on report')).toHaveValue('mmol/L');
  await row.getByLabel('Units on report').fill('mg/dL');
  await row.getByLabel('Result', { exact: true }).fill('94');
  await page.getByLabel('Search all biomarkers').fill('ApoB');
  await page.getByLabel('Search all biomarkers').fill('Glucose (Blood)');
  await expect(row.getByLabel('Units on report')).toHaveValue('mg/dL');
  await expect(row.getByLabel('Result', { exact: true })).toHaveValue('94');
});

test('Nutrition quick add remains usable', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('tab', { name: /Quick add/ }).click();
  await page.locator('[data-quick-card="chicken"] [data-quick-item]').click();
  await expect(page.locator('[data-quick-card="chicken"] [data-gram-input]')).toBeVisible();
});
