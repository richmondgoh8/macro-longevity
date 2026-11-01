import { expect, test } from '@playwright/test';

test('Finance starts with a usable budget and keeps example context accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/pages/finance.html');
  const salary = page.getByLabel('Monthly take-home salary (SGD)', { exact: true });
  await expect(salary).toBeVisible();
  const inputBox = await salary.boundingBox();
  const navBox = await page.locator('.bottom-nav').boundingBox();
  expect(inputBox.y + inputBox.height).toBeLessThan(navBox.y);
  await expect(page.locator('.invest-disclaimer')).toBeVisible();
  const guide = page.locator('.investment-guide');
  await expect(guide).not.toHaveAttribute('open');
  await guide.locator('summary').focus();
  await guide.locator('summary').press('Enter');
  await expect(guide.locator('p')).toBeVisible();
  await guide.locator('summary').press('Space');
  await expect(guide).not.toHaveAttribute('open');
  await salary.fill('5000');
  await expect(page.locator('#budgetResults .budget-card-amt')).toHaveText(['SGD 2,500', 'SGD 1,500', 'SGD 1,000']);
  await expect(page.locator('.invest-table-row .invest-monthly').first()).not.toBeEmpty();
  await salary.fill('');
  await expect(page.locator('#budgetSliders')).toBeHidden();
  await expect(page.locator('#budgetResults')).toBeEmpty();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('secondary section navigation is compact on mobile and retains keyboard and desktop access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/pages/blood.html', '/pages/avoid.html', '/pages/protocol.html', '/pages/workout.html']) {
    await page.goto(path);
    const disclosure = page.locator('.sticky-pin-disclosure');
    const summary = disclosure.locator('summary');
    await expect(disclosure).not.toHaveAttribute('open');
    expect((await summary.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect((await page.locator('.sticky-pin-rail').boundingBox()).height).toBeLessThanOrEqual(64);
    await summary.focus();
    await summary.press('Enter');
    await expect(disclosure).toHaveAttribute('open', '');
    await summary.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open');
    await expect(summary).toBeFocused();
    await summary.press('Enter');
    const first = disclosure.locator('.sticky-pin-link').first();
    const target = await first.getAttribute('data-sticky-pin-target') || await first.getAttribute('href');
    await first.click();
    await expect(disclosure).not.toHaveAttribute('open');
    await expect(page.locator(target)).toBeVisible();
    await expect(page.locator(target)).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const disclosure = page.locator('.sticky-pin-disclosure');
  await expect(disclosure).toHaveAttribute('open', '');
  await disclosure.locator('.sticky-pin-link').first().focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(disclosure).not.toHaveAttribute('open');
  await expect(disclosure.locator('summary')).toBeFocused();
});

test('mobile Training exposes all four session choices before secondary guidance', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/workout.html');
  const guide = page.locator('.workout-weekly-guide');
  await expect(guide).not.toHaveAttribute('open');
  const bottom = (await page.locator('.bottom-nav').boundingBox()).y;
  for (const tab of await page.locator('[data-pillar-tab]').all()) {
    const box = await tab.boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(bottom);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await guide.locator('summary').click();
  await expect(page.locator('.workout-metrics')).toBeVisible();
  await expect(page.locator('.workout-metrics')).toContainText('150–300');
  await guide.locator('summary').click();
  await page.getByRole('tab', { name: /Strength/ }).click();
  await expect(page.locator('#section-strength')).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test('core routes load without errors or mobile overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/pages/stack.html', '/pages/blood.html', '/pages/workout.html', '/pages/finance.html']) {
    expect((await page.goto(route)).status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.nav-links .nav-link')).toHaveCount(5);
    const usesSectionRail = ['/pages/blood.html', '/pages/workout.html'].includes(route);
    await expect(page.locator('link[href$="section-navigation.css"]')).toHaveCount(usesSectionRail ? 1 : 0);
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
