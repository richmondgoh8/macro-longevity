import { expect, test } from '@playwright/test';
import { calculateNutrients } from '../js/components/nutrition-totals.js';
import { BUILDER_ITEMS } from '../js/data/nutrition.js';

test('pure nutrient arithmetic preserves fractions, duplicates, zeros and missing data', () => {
  const item = { id: 'fixture', nutrients: { protein: 12, carbs: 0, fat: 4, fiber: 2 } };
  const result = calculateNutrients([{ item, multiplier: .5 }, { item, multiplier: 2 }]);
  expect(result).toEqual({ totals: { protein: 30, carbs: 0, fat: 10, fiber: 5 }, missing: [] });
  expect(calculateNutrients([{ item: { id: 'unknown', nutrients: { protein: 0 } }, multiplier: 1 }]).missing).toEqual(['unknown:carbs', 'unknown:fat', 'unknown:fiber']);
  for (const food of BUILDER_ITEMS) {
    for (const macro of ['protein', 'carbs', 'fat']) {
      expect(Number.isFinite(food.nutrients[macro]), `${food.id}: ${macro}`).toBe(true);
      expect(food.nutrients[macro]).toBeGreaterThanOrEqual(0);
    }
    if (food.nutrients.fiber != null) expect(Number.isFinite(food.nutrients.fiber), `${food.id}: fiber`).toBe(true);
  }
  expect(BUILDER_ITEMS.find((food) => food.id === 'chia').nutrients.fiber).toBe(7);
  expect(BUILDER_ITEMS.find((food) => food.id === 'chicken').nutrients.fiber).toBeUndefined();
});

test('horizontal coverage stays below the header through maximum scroll and resize', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await expect(page.locator('[data-planner-ready]')).toHaveAttribute('aria-busy', 'false');
  for (const width of [390, 768, 1024, 1440, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator(width < 1100 ? '.bottom-nav' : '.nav-links')).toBeVisible();
    for (const fraction of [0, .25, .5, .75, 1]) {
      await page.evaluate((f) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), fraction);
      await expect.poll(async () => page.evaluate(() => {
        const header = document.querySelector('.nav').getBoundingClientRect();
        const bar = document.querySelector('[data-coverage-bar]').getBoundingClientRect();
        const macros = [...document.querySelectorAll('[data-coverage-bar] [data-macro]')].map(n => n.getBoundingClientRect());
        return bar.top >= header.bottom - 1 && bar.bottom <= innerHeight && bar.left >= 0 && bar.right <= innerWidth && macros.every(m => Math.abs(m.top - macros[0].top) < 1);
      })).toBe(true);
    }
  }
  await page.getByRole('button', { name: 'All nutrients', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const close = page.getByRole('button', { name: 'Close coverage details' });
  await close.click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('coverage gaps drill down and return without nested dialogs', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('button', { name: /^Gaps/ }).click();
  const dialog = page.locator('[data-coverage-dialog]');
  await dialog.locator('[data-nutrient-id]').first().click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Back to gaps' }).click();
  await expect(dialog.getByRole('heading', { name: 'Priority gaps', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /^Gaps/ })).toBeFocused();
});

test('meal grams save in the editor, update macros, persist and cancel without mutation', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const macro = page.locator('[data-coverage-bar] [data-macro="protein"] strong');
  const fiberMacro = page.locator('[data-coverage-bar] [data-macro="fiber"] strong');
  const before = await macro.textContent();
  const fiberBefore = await fiberMacro.textContent();
  const mealSummary = page.locator('[data-meal-macros="chia-protein-oatmeal"]');
  await expect(mealSummary).toContainText('Fiber');
  await expect(mealSummary).toContainText('incomplete food data');
  await page.locator('[data-meal-card="chia-protein-oatmeal"] [data-meal-edit]').click();
  const dialog = page.locator('[data-meal-dialog]');
  const preview = dialog.locator('[data-meal-preview]');
  const previewBefore = await preview.textContent();
  await expect(preview).toContainText('Fiber');
  await expect(preview).toContainText('incomplete food data');
  const amount = dialog.locator('[data-meal-draft-amount="oats"]');
  const initial = Number(await amount.inputValue());
  await amount.fill(String(initial * 2));
  await expect(preview).not.toHaveText(previewBefore);
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).toBeHidden();
  await expect(macro).not.toHaveText(before);
  await expect(fiberMacro).not.toHaveText(fiberBefore);
  const saved = await macro.textContent();
  const fiberSaved = await fiberMacro.textContent();
  await page.reload();
  await expect(macro).toHaveText(saved);
  await expect(fiberMacro).toHaveText(fiberSaved);
  await page.locator('[data-meal-card="chia-protein-oatmeal"] [data-meal-edit]').click();
  const persistedAmount = page.locator('[data-meal-dialog] [data-meal-draft-amount="oats"]');
  await expect(persistedAmount).toHaveValue(String(initial * 2));
  await persistedAmount.fill(String(initial));
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  const discard = dialog.getByRole('button', { name: 'Discard changes' });
  if (await discard.isVisible()) await discard.click();
  await expect(dialog).toBeHidden();
  await expect(macro).toHaveText(saved);
});

test('quick add accepts grams directly and ignores temporary blank input', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.locator('[data-start-blank]').click();
  await page.getByRole('tab', { name: /Quick add/ }).click();
  const card = page.locator('[data-quick-card="chicken"]');
  await card.locator('[data-quick-item]').click();
  const input = card.locator('[data-gram-input]');
  await expect(input).toBeVisible();
  await input.fill('200');
  const macro = page.locator('[data-coverage-bar] [data-macro="protein"] strong');
  const before = await macro.textContent();
  await input.fill('');
  await expect(macro).toHaveText(before);
  await input.fill('100');
  await input.press('Tab');
  await expect(macro).not.toHaveText(before);
});

test('Deep library is a context destination with working history and no coverage bar', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.locator('.context-nav').getByRole('link', { name: 'Deep library' }).click();
  await expect(page).toHaveURL(/#deep-library$/);
  await expect(page.locator('[data-coverage-bar]')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: /^Meals/ })).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('[data-coverage-bar]')).toBeVisible();
  await page.goForward();
  await expect(page.locator('[data-coverage-bar]')).toHaveCount(0);
});

test('editing protects unsaved work and keeps save and close controls in view', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.locator('[data-meal-edit]').first().click();
  const dialog = page.locator('[data-meal-dialog]');
  await dialog.locator('[data-meal-dialog-name]').fill('Unsaved recipe');
  await page.keyboard.press('Escape');
  await expect(dialog.getByRole('button', { name: 'Discard changes' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep editing' }).click();
  await expect(dialog.locator('[data-meal-dialog-name]')).toHaveValue('Unsaved recipe');
  for (const selector of ['[data-meal-dialog-confirm]', '.ui-modal-head button']) {
    const box = await dialog.locator(selector).boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height);
  }
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await dialog.getByRole('button', { name: 'Discard changes' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('.meal-card')).not.toContainText(['Unsaved recipe']);
});

test('unavailable browser storage reports session-only changes without breaking planning', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'QuotaExceededError'); }; });
  await page.goto('/pages/stack.html');
  await page.locator('[data-start-blank]').click();
  await expect(page.locator('[data-ui-toast]')).toContainText('session only');
  await page.locator('[data-meal-toggle]').first().click();
  await expect(page.locator('[data-planner-meal-count]')).toHaveText('1');
});

test('malformed saved state does not crash initialization or erase legacy records', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.evaluate(() => {
    localStorage.setItem('ml-daily-current', '{invalid');
    localStorage.setItem('ml-daily-meals', 'null');
    localStorage.setItem('ml-daily-plans', '[{"name":"legacy"}]');
  });
  await page.reload();
  await expect(page.getByRole('tab', { name: /^Meals/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ml-daily-plans'))).toContain('legacy');
});

test('short viewport keeps compact coverage and dialog close inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto('/pages/stack.html');
  await expect(page.locator('[data-planner-ready]')).toHaveAttribute('aria-busy', 'false');
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  const bar = page.locator('[data-coverage-bar]');
  await expect(bar).toHaveClass(/is-compact/);
  await expect.poll(async () => (await bar.boundingBox()).y).toBeGreaterThanOrEqual(56);
  await bar.getByRole('button', { name: 'Coverage', exact: true }).click();
  const close = page.getByRole('button', { name: 'Close coverage details' });
  await expect(close).toBeVisible();
  const box = await close.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(450);
  await close.click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('meal editor secondary actions pin and remove without stacking dialogs', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.locator('[data-meal-edit]').first().click();
  const dialog = page.locator('[data-meal-dialog]');
  await expect(dialog.getByText('More actions', { exact: true })).toHaveCount(0);
  await dialog.locator('.meal-dialog-body').evaluate((body) => { body.scrollTop = body.scrollHeight; });
  await dialog.getByRole('button', { name: 'Pin meal', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Unpin meal', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Remove preset', exact: true }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Confirm removal' }).click();
  await expect(page.locator('[data-meal-card="chia-protein-oatmeal"]')).toHaveCount(0);
  await expect(page.locator('[data-planner-meal-count]')).toHaveText('0');
});

test('meal detail actions stay visible and meal editor fields have space', async ({ page }) => {
  await page.goto('/pages/stack.html');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 500 });
    await page.locator('[data-meal-card="chia-protein-oatmeal"] [data-nutrition-detail-open]').first().click();
    const detail = page.locator('[data-nutrition-detail-dialog]');
    await detail.locator('[data-detail-toggle="meal"]').click();
    const layout = await detail.evaluate((dialog) => {
      const tags = [...dialog.querySelectorAll('.meal-detail-tags .planner-card-tag')].map((tag) => tag.getBoundingClientRect());
      const actions = [...dialog.querySelectorAll('.meal-detail-actions button')].map((button) => button.getBoundingClientRect());
      const dialogBox = dialog.getBoundingClientRect();
      return {
        tagGap: tags[1].left - tags[0].right,
        scrollable: dialog.scrollHeight > dialog.clientHeight,
        actionsVisible: actions.every((box) => box.top >= dialogBox.top && box.bottom <= dialogBox.bottom && box.left >= dialogBox.left && box.right <= dialogBox.right),
      };
    });
    expect(layout.tagGap).toBeGreaterThanOrEqual(7.5);
    expect(layout.scrollable).toBe(true);
    expect(layout.actionsVisible).toBe(true);
    await detail.evaluate((dialog) => { dialog.scrollTop = dialog.scrollHeight / 2; });
    await expect.poll(async () => detail.locator('.meal-detail-actions').evaluate((actions) => {
      const box = actions.getBoundingClientRect();
      const dialogBox = actions.closest('dialog').getBoundingClientRect();
      return box.top >= dialogBox.top && box.bottom <= dialogBox.bottom;
    })).toBe(true);
    await detail.getByRole('button', { name: 'Edit meal' }).click();
    const editor = page.locator('[data-meal-dialog]');
    await expect(editor).toBeVisible();
    const fieldGap = await editor.evaluate((dialog) => {
      const label = dialog.querySelector('label[for="meal-dialog-name"]').getBoundingClientRect();
      const input = dialog.querySelector('#meal-dialog-name').getBoundingClientRect();
      return input.top - label.bottom;
    });
    expect(fieldGap).toBeGreaterThanOrEqual(7.5);
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
});
