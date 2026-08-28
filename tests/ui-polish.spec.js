import { expect, test } from '@playwright/test';

test('homepage removes Diet context and keeps its actions clear', async ({ page }) => {
  await page.goto('/');
  const spacing = await page.evaluate(() => {
    const subtitle = document.querySelector('.hero-subtitle').getBoundingClientRect();
    const actions = document.querySelector('.hero-actions').getBoundingClientRect();
    return {
      hasDietContext: Boolean(document.querySelector('.hero-context')),
      gap: actions.top - subtitle.bottom,
    };
  });
  expect(spacing.hasDietContext).toBe(false);
  expect(spacing.gap).toBeGreaterThanOrEqual(24);
});

test('five navigation tabs center their labels vertically', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const desktop = await page.locator('.nav-links .nav-link').evaluateAll((nodes) => nodes.map((node) => ({
    display: getComputedStyle(node).display,
    align: getComputedStyle(node).alignItems,
    justify: getComputedStyle(node).justifyContent,
  })));
  expect(desktop).toHaveLength(5);
  desktop.forEach((tab) => {
    expect(tab.display).toBe('flex');
    expect(tab.align).toBe('center');
    expect(tab.justify).toBe('center');
  });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.locator('.bottom-nav-item').evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    const label = node.querySelector('.bottom-nav-label').getBoundingClientRect();
    return { centerDelta: Math.abs((label.top + label.height / 2) - (box.top + box.height / 2)) };
  }));
  expect(mobile).toHaveLength(5);
  mobile.forEach((tab) => expect(tab.centerDelta).toBeLessThanOrEqual(1));
});

test('workout tabs are centered and use one index prefix', async ({ page }) => {
  await page.goto('/pages/workout.html');
  const tabs = await page.locator('.workout-tab').evaluateAll((nodes) => nodes.map((node) => ({
    text: node.textContent.trim().replace(/\s+/g, ' '),
    align: getComputedStyle(node).textAlign,
    copyAlign: getComputedStyle(node.querySelector('.workout-tab-copy')).textAlign,
  })));

  expect(tabs).toHaveLength(4);
  expect(await page.locator('.workout-tab-number').count()).toBe(0);
  tabs.forEach((tab, index) => {
    expect(tab.align).toBe('center');
    expect(tab.copyAlign).toBe('center');
    expect(tab.text).toContain(`0${index + 1} /`);
    expect(tab.text.match(/\b0[1-4]\b/g)).toHaveLength(1);
  });
});

test('blood cards use intrinsic columns and responsive flow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/blood.html');
  const desktop = await page.evaluate(() => {
    const grid = document.querySelector('.blood-grid');
    const card = [...grid.querySelectorAll('.blood-card')].find((node) => node.textContent.includes('Ferritin'));
    const other = [...grid.querySelectorAll('.blood-card')].find((node) => node.textContent.includes('Uric Acid'));
    const summary = card.querySelector('summary');
    const summaryContentWidth = summary.clientWidth - parseFloat(getComputedStyle(summary).paddingLeft) - parseFloat(getComputedStyle(summary).paddingRight);
    return {
      columns: getComputedStyle(grid).columnCount,
      ferritinHeight: card.getBoundingClientRect().height,
      uricHeight: other.getBoundingClientRect().height,
      rangeDisplay: getComputedStyle(card.querySelector('.blood-card-range')).display,
      rangeWidth: card.querySelector('.blood-card-range').getBoundingClientRect().width,
      summaryContentWidth,
    };
  });
  expect(desktop.columns).toBe('2');
  expect(desktop.uricHeight).toBeLessThan(desktop.ferritinHeight);
  expect(desktop.rangeDisplay).toBe('grid');
  expect(desktop.rangeWidth).toBeGreaterThanOrEqual(desktop.summaryContentWidth - 1);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileColumns = await page.locator('.blood-grid').first().evaluate((node) => getComputedStyle(node).columnCount);
  expect(mobileColumns).toBe('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('ApoB follow-up keeps the comparison table without numbered steps', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const section = page.locator('.progressive-section').filter({ hasText: 'ApoB elevated? Options' });
  await section.locator('summary').click();
  await expect(section.locator('.apob-steps')).toHaveCount(0);
  await expect(section.locator('.apob-table')).toBeVisible();
});

test('Quick-add quantity controls and hover tips stay inside their bounds', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pages/stack.html');
    await page.getByRole('tab', { name: /Quick add/ }).click();
    const card = page.locator('.quick-item-grid .builder-item').first();
    const toggle = card.locator('[data-quick-item]');
    if (await toggle.getAttribute('aria-pressed') !== 'true') await toggle.click();
    await expect(card.locator('[data-quick-serving-toggle]')).toHaveText('Adjust servings');
    await card.locator('[data-quick-serving-toggle]').click();
    await toggle.hover();
    const bounds = await page.evaluate(() => {
      const grid = document.querySelector('.quick-item-grid');
      const card = grid.querySelector('.builder-item');
      const control = card.querySelector('.portion-control');
      const minus = card.querySelector('[data-portion-action="decrease"]');
      const plus = card.querySelector('[data-portion-action="increase"]');
      const tooltip = card.querySelector('.ui-tooltip');
      const rect = (node) => node.getBoundingClientRect();
      const gridRect = rect(grid);
      const cardRect = rect(card);
      const controlRect = rect(control);
      const minusRect = rect(minus);
      const plusRect = rect(plus);
      const tooltipRect = rect(tooltip);
      return {
        controlsInsideCard: controlRect.left >= cardRect.left && controlRect.right <= cardRect.right
          && minusRect.left >= cardRect.left && plusRect.right <= cardRect.right,
        tooltipInsideGrid: tooltipRect.top >= gridRect.top && tooltipRect.right <= gridRect.right,
        transform: getComputedStyle(card).transform,
      };
    });
    expect(bounds.controlsInsideCard).toBe(true);
    expect(bounds.tooltipInsideGrid).toBe(true);
    expect(bounds.transform).toBe('none');
  }
});

test('planner food selection is compact and fuzzy-searchable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/stack.html');
  const search = page.locator('[data-planner-search]');
  await expect(search).toBeVisible();
  await expect(page.getByText('Fast find', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: /Quick add/ }).click();
  await search.fill('sardn');
  const quickResults = page.locator('.quick-item-grid .builder-item');
  await expect(quickResults).toHaveCount(1);
  await expect(quickResults.first()).toContainText('Sardines with bones');
  const quickGrid = await page.locator('.quick-item-grid').evaluate((node) => ({
    maxHeight: parseFloat(getComputedStyle(node).maxHeight),
    cardPadding: parseFloat(getComputedStyle(node.querySelector('.builder-item')).paddingTop),
  }));
  expect(quickGrid.maxHeight).toBeGreaterThanOrEqual(560);
  expect(quickGrid.cardPadding).toBeLessThanOrEqual(12);

  await page.getByRole('tab', { name: /Meals/ }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.meal-library-grid .meal-card')).toHaveCount(6);
  await search.fill('salmon');
  await expect(page.locator('.meal-library-grid .meal-card')).toHaveCount(1);
  await expect(page.locator('.meal-library-grid .meal-card').first()).toContainText('Salmon, greens & potato');
});

test('meal and Quick Add cards toggle from their content', async ({ page }) => {
  await page.goto('/pages/stack.html');

  const mealCard = page.locator('.meal-library-grid .meal-card').nth(1);
  await expect(mealCard.locator('[data-meal-toggle]')).toHaveAttribute('aria-pressed', 'false');
  await mealCard.locator('h3').click();
  await expect(mealCard.locator('[data-meal-toggle]')).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('tab', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  await expect(quickCard.locator('[data-quick-item]')).toHaveAttribute('aria-pressed', 'false');
  await quickCard.locator('strong').click();
  await expect(quickCard.locator('[data-quick-item]')).toHaveAttribute('aria-pressed', 'true');
});

test('serving actions progressively appear after an item is selected', async ({ page }) => {
  await page.goto('/pages/stack.html');

  const mealCard = page.locator('.meal-library-grid .meal-card').nth(1);
  const mealServingToggle = mealCard.locator('[data-meal-serving-toggle]');
  await expect(mealServingToggle).toBeHidden();
  await mealCard.locator('h3').click();
  await expect(mealServingToggle).toBeVisible();
  await expect(mealServingToggle).toHaveText('Adjust servings');

  await page.getByRole('tab', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  const quickServingToggle = quickCard.locator('[data-quick-serving-toggle]');
  await expect(quickServingToggle).toBeHidden();
  await quickCard.locator('strong').click();
  await expect(quickServingToggle).toBeVisible();
  await expect(quickServingToggle).toHaveText('Adjust servings');
});

test('meal ingredients have independent serving controls', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const mealCard = page.locator('.meal-library-grid .meal-card').first();
  const ingredientControls = mealCard.locator('[data-portion-scope="meal-item"]');
  const mealControl = mealCard.locator('[data-portion-scope="meal"]');
  await expect(ingredientControls).toHaveCount(4);
  await expect(mealControl).toBeHidden();
  await expect(mealCard.locator('[data-meal-serving-toggle]')).toHaveText('Adjust servings');
  await mealCard.locator('[data-meal-serving-toggle]').click();
  await expect(ingredientControls.first()).toBeVisible();
  await expect(mealControl.locator('[data-portion-input]')).toHaveValue('1');

  await mealControl.locator('[data-portion-action="increase"]').click();
  await expect(mealControl.locator('[data-portion-input]')).toHaveValue('1.25');

  const firstInput = ingredientControls.nth(0).locator('[data-portion-input]');
  const secondInput = ingredientControls.nth(1).locator('[data-portion-input]');
  await firstInput.fill('2');
  await firstInput.blur();
  await expect(firstInput).toHaveValue('2');
  await expect(secondInput).toHaveValue('1');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ml-daily-current')));
  expect(saved.mealItemQuantities['chia-protein-oatmeal'].whey).toBe(2);
});

test('Quick Add includes Natural Smooth Peanut Butter', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('tab', { name: /Quick add/ }).click();
  await page.locator('[data-planner-search]').fill('peanut');
  await expect(page.locator('.quick-item-grid .builder-item')).toHaveCount(1);
  await expect(page.locator('.quick-item-grid .builder-item').first()).toContainText('Natural Smooth Peanut Butter');
});

test('coverage omits removed nutrient requirements', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const coverage = page.locator('[data-coverage]');
  for (const nutrient of ['Linoleic acid', 'Copper', 'Phosphorus', 'Manganese', 'Molybdenum', 'Chloride', 'Sodium', 'Vitamin B6', 'Vitamin E', 'Vitamin K', 'Riboflavin (B2)', 'Niacin (B3)', 'Pantothenic acid (B5)', 'Biotin (B7)']) {
    await expect(coverage).not.toContainText(nutrient);
  }
});

test('Daily Plan progressively presents nutrient gaps', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const mobile = page.viewportSize().width <= 767;
  const coverage = mobile ? page.locator('[data-mobile-coverage-panel]') : page.locator('.plan-readout');
  if (mobile) await coverage.locator('> summary').click();
  await expect(coverage.locator('.coverage-priority')).toBeVisible();
  await expect(coverage.locator('.coverage-priority-item')).toHaveCount(3);
  await expect(coverage.locator('.coverage-all')).not.toHaveAttribute('open', '');
  await expect(coverage.locator('.coverage-all > summary')).toContainText('All nutrient coverage');
  await expect(coverage.locator('.coverage-priority-item').first()).toContainText('Food-first:');
});

test('Clear plan uses centered confirmation and a layout-independent toast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/stack.html');
  await page.locator('.meal-library-grid .meal-card').nth(1).locator('h3').click();
  const clear = page.locator('[data-clear-stack]');
  await clear.scrollIntoViewIfNeeded();
  const before = await clear.boundingBox();

  await clear.click();
  const dialog = page.locator('.ui-confirm-dialog');
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(Math.abs(dialogBox.x - (390 - dialogBox.width) / 2)).toBeLessThanOrEqual(1);
  expect(Math.abs(dialogBox.y - (844 - dialogBox.height) / 2)).toBeLessThanOrEqual(1);

  await dialog.locator('[data-confirm-submit]').click();
  const toast = page.locator('[data-ui-toast]');
  await expect(toast).toHaveText('Today’s plan cleared');
  await expect(toast).toHaveClass(/is-visible/);
  expect(await toast.evaluate((node) => !node.closest('.planner-controls'))).toBe(true);
  expect(await clear.boundingBox()).toEqual(before);
});

test('first-time Nutrition state identifies the example and can start blank', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await expect(page.locator('[data-starter-example]')).toContainText('Starter example loaded');
  await page.locator('[data-start-blank]').click();
  await expect(page.locator('[data-starter-example]')).toHaveCount(0);
  await expect(page.locator('[data-planner-meal-count]')).toHaveText('0');
});

test('mobile homepage progressively reveals Longevity 101', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#longevity101-app li:visible')).toHaveCount(3);
  await page.locator('[data-longevity-toggle]').click();
  await expect(page.locator('#longevity101-app li:visible')).toHaveCount(10);
});

test('mobile Health prep is scan-first and expandable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/blood.html');
  const prep = page.locator('[data-blood-prep]');
  await expect(prep).not.toHaveAttribute('open', '');
  await prep.locator('> summary').click();
  await expect(prep).toHaveAttribute('open', '');
});

test('mobile Finance keeps visible tabs and one expanded combo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/finance.html');
  await expect(page.locator('[data-finance-tab]:visible')).toHaveCount(3);
  await expect(page.locator('[data-finance-select]')).toHaveCount(0);
  await expect(page.locator('[data-invest-combo][open]')).toHaveCount(1);
  await page.getByRole('tab', { name: 'FIRE calculator' }).click();
  await expect(page.locator('#financeFire')).toBeVisible();
});

test('running workout exposes a mobile timer dock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/workout.html');
  await page.getByRole('button', { name: 'Start session' }).first().click();
  const dock = page.locator('[data-mobile-timer-dock]');
  await expect(dock).toBeVisible();
  await expect(dock.locator('[data-mobile-timer-time]')).toContainText(':');
  await dock.getByRole('button', { name: 'Pause' }).click();
  await expect(dock.locator('[data-mobile-timer-phase]')).toContainText('Paused');
});
