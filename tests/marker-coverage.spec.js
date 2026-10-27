import { expect, test } from '@playwright/test';
import { SG_MARKERS, SG_MARKER_GROUPS } from '../js/data/screening.js';
import { SG_MARKER_ACTIONS } from '../js/data/screening-actions.js';
import { ADDITIONAL_MARKERS, CORE_PANEL_TRACKER_COVERAGE } from '../js/data/additional-screening.js';
import { ANNUAL_PANEL } from '../js/data/blood.js';

test('every existing core-panel reference has actual tracker fields and guidance', () => {
  const markers = [...SG_MARKERS, ...ADDITIONAL_MARKERS];
  expect(markers).toHaveLength(45);
  expect(new Set(markers.map(marker => marker.id)).size).toBe(45);
  expect(SG_MARKER_GROUPS.flatMap(group => group.ids)).toContain('hscrp');
  for (const panel of ANNUAL_PANEL.filter(panel => panel.tier === 'annual')) {
    const ids = CORE_PANEL_TRACKER_COVERAGE[panel.id];
    expect(ids, panel.name).toBeTruthy();
    for (const id of ids) expect(markers.some(marker => marker.id === id), panel.name + ': ' + id).toBe(true);
  }
  for (const marker of markers) {
    expect(marker.actions || SG_MARKER_ACTIONS[marker.actionKey || marker.id], marker.id).toHaveLength(3);
    expect(marker.source, marker.id).toMatch(/^https:\/\//);
  }
});

test('hs-CRP is visible, unit-aware, saved and does not confuse acute inflammation with a lifestyle target', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const card = page.locator('[data-marker-card="hscrp"]');
  await expect(card).toBeVisible();
  const value = card.locator('[data-marker-input]');
  const status = card.locator('[data-marker-status]');
  await expect(card.locator('[data-marker-unit]')).toHaveValue('mg/L');
  await value.fill('0.8');
  await expect(status).toHaveText('Lower relative-risk category');
  await value.fill('2');
  await expect(status).toContainText('Risk-enhancing');
  await card.locator('[data-marker-unit]').selectOption('mg/dL');
  await value.fill('0.2');
  await expect(status).toContainText('Risk-enhancing');
  await value.fill('1.1');
  await expect(status).toContainText('Possible acute inflammation');
  await card.locator('summary').click();
  await expect(card.locator('li')).toHaveCount(3);
  await expect(card).toContainText('150 minutes');
  await expect(card).toContainText('clinical assessment');
  await page.reload();
  await expect(value).toHaveValue('1.1');
  await expect(card.locator('[data-marker-unit]')).toHaveValue('mg/dL');
  await expect(status).toContainText('Possible acute inflammation');
});

test('extra tracker fields load on demand and retain saved values and counts after reload', async ({ page }) => {
  await page.goto('/pages/blood.html');
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.endsWith('additional-screening.js')))).toBe(false);
  await page.locator('[data-additional-screening] > summary').click();
  await expect(page.locator('[data-marker-card]')).toHaveCount(45);
  await page.locator('[data-marker-group="iron"] > summary').click();
  const card = page.locator('[data-marker-card="ferritin"]');
  await card.locator('[data-marker-input]').fill('80');
  await card.locator('[data-marker-unit]').selectOption('ng/mL');
  await card.locator('.sg-marker-details > summary').click();
  await expect(card.locator('li')).toHaveCount(3);
  await expect(page.locator('[data-baseline-score]')).toHaveText('1');
  await page.reload();
  await expect(page.locator('[data-marker-card]')).toHaveCount(45);
  await expect(card.locator('[data-marker-input]')).toHaveValue('80');
  await expect(card.locator('[data-marker-unit]')).toHaveValue('ng/mL');
  await expect(page.locator('[data-baseline-score]')).toHaveText('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.locator('[data-biomarker-library] > summary').click();
  for (const query of ['hs-CRP', 'hsCRP', 'hs CRP', 'hr-csp']) {
    await page.getByLabel('Search all biomarkers').fill(query);
    await expect(page.locator('[data-library-marker="highsensitivitycreactiveprotein"]')).toHaveCount(1);
  }
});
