import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { BLUEPRINT_MARKERS, BLUEPRINT_REFERENCE, normalizeTestName } from '../js/data/blueprint-markers.js';
import { SG_MARKERS } from '../js/data/screening.js';
import { SG_MARKER_ACTIONS } from '../js/data/screening-actions.js';

test('published panel includes every baseline, sex-specific and follow-up measurement', () => {
  expect(BLUEPRINT_REFERENCE.baseline).toHaveLength(140);
  expect(BLUEPRINT_REFERENCE.male).toHaveLength(3);
  expect(BLUEPRINT_REFERENCE.female).toHaveLength(1);
  expect(BLUEPRINT_REFERENCE.followup).toHaveLength(86);
  expect(new Set(BLUEPRINT_MARKERS.map(marker => marker.id)).size).toBe(144);
  for (const name of BLUEPRINT_REFERENCE.followup) {
    expect(BLUEPRINT_MARKERS.some(marker => marker.id === normalizeTestName(name)), name).toBe(true);
  }
  for (const name of ['Apolipoprotein B', 'Lipoprotein (A)', 'High-Sensitivity C-Reactive Protein', 'Insulin', 'Vitamin D', 'Testosterone, Free', 'Mercury, Blood', 'Thyroid Stimulating Hormone (TSH)']) {
    expect(BLUEPRINT_MARKERS.some(marker => marker.name === name), name).toBe(true);
  }
  for (const marker of SG_MARKERS) {
    expect(SG_MARKER_ACTIONS[marker.id]).toHaveLength(3);
    expect(SG_MARKER_ACTIONS[marker.id].map(step => step.join(' ')).join(' ')).not.toMatch(/bring the whole panel|ask for|check package|make the test|repeat testing/i);
  }
});

test('library is lazy, searchable, paginated and saves qualitative and numeric results', async ({ page }) => {
  const loaded = [];
  page.on('request', request => loaded.push(request.url()));
  await page.goto('/pages/blood.html');
  const library = page.locator('[data-biomarker-library]');
  expect(loaded.some(url => url.includes('blueprint-markers.js'))).toBe(false);
  await library.locator('> summary').click();
  await expect(library.locator('[data-library-count]')).toContainText('144 matching');
  await expect(library.locator('[data-library-marker]')).toHaveCount(20);
  await library.locator('[data-library-more]').click();
  await expect(library.locator('[data-library-marker]')).toHaveCount(40);
  const search = library.getByLabel('Search all biomarkers');
  await search.fill('ApoB');
  const row = library.locator('[data-library-marker="apolipoproteinb"]');
  await row.locator('summary').click();
  await row.getByLabel('Result', { exact: true }).fill('0.85');
  await row.getByLabel('Units on report').fill('g/L');
  await row.getByLabel('Lab reference interval').fill('<1.00');
  await row.getByLabel('Collection date').fill('2026-10-27');
  await expect(library.locator('[data-library-count]')).toContainText('1 results recorded');
  await page.reload();
  await library.locator('> summary').click();
  await search.fill('ApoB');
  await row.locator('summary').click();
  await expect(row.getByLabel('Result', { exact: true })).toHaveValue('0.85');
  await expect(row.getByLabel('Units on report')).toHaveValue('g/L');
  await expect(row.getByLabel('Lab reference interval')).toHaveValue('<1.00');
  const accessibility = await new AxeBuilder({ page }).include('[data-biomarker-library]').analyze();
  expect(accessibility.violations).toEqual([]);
  await row.getByRole('button', { name: 'Clear this result' }).click();
  await expect(row.getByLabel('Result', { exact: true })).toHaveValue('');
  await search.fill('ABO');
  await library.locator('[data-library-marker="abogroup"] summary').click();
  await library.locator('[data-library-marker="abogroup"]').getByLabel('Result', { exact: true }).fill('AB');
  await search.fill('');
  await library.getByLabel('Panel or specimen').selectOption('followup');
  await expect(library.locator('[data-library-count]')).toContainText('86 matching');
  await library.getByLabel('Panel or specimen').selectOption('male');
  await expect(library.locator('[data-library-marker]')).toHaveCount(3);
  await library.getByLabel('Panel or specimen').selectOption('female');
  await expect(library.locator('[data-library-marker]')).toHaveCount(1);
  await search.fill('no-such-marker');
  await expect(library).toContainText('No matching biomarkers');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('library handles unavailable storage and treats saved text as text', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('blueprint-marker-results-v1', JSON.stringify({ abogroup: { result: '<img src=x onerror=alert(1)>' } })));
  await page.goto('/pages/blood.html');
  const library = page.locator('[data-biomarker-library]');
  await library.locator('> summary').click();
  await library.getByLabel('Search all biomarkers').fill('ABO');
  const row = library.locator('[data-library-marker="abogroup"]');
  await row.locator('summary').click();
  await expect(row.locator('img')).toHaveCount(0);
  await expect(row.getByLabel('Result', { exact: true })).toHaveValue('<img src=x onerror=alert(1)>');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('unavailable'); }; });
  await row.getByLabel('Result', { exact: true }).fill('A');
  await expect(library.locator('[data-library-storage]')).toContainText('Storage unavailable');
});
