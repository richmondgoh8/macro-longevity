import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { auditMeasurementCoverage } from '../scripts/audit-measurement-coverage.mjs';

test('Home search reveals a specialist reference with context and actions together', async ({ page }) => {
  await page.goto('/');
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.getByRole('searchbox', { name: 'Find a biomarker' }).fill('TIBC');
  await expect(page.locator('[data-reference-results] a[href="#biomarker-tibc"]')).toBeVisible();
  await page.locator('[data-reference-results] a[href="#biomarker-tibc"]').click();
  const card = page.locator('#biomarker-tibc');
  await expect(card).toBeFocused();
  await expect(card.locator('.sg-range-context')).toBeVisible();
  await expect(card.locator('.sg-card-action')).toBeVisible();
  await page.reload();
  await expect(card).toBeVisible();
  await expect(page.locator('[data-reference-card="hdl"]')).toBeVisible();
});

test('published lab guidance accounts for every independently captured unique entry', async () => {
  const { LAB_REFERENCES } = await import('../js/data/lab-references.js');
  const fixture = JSON.parse(readFileSync(new URL('../docs/specs/published-panel-reconciliation.json', import.meta.url)));
  const { normalizeTestName } = await import('../js/data/blueprint-markers.js');
  const names = ['baseline', 'male', 'female'].flatMap(panel => fixture.panels[panel]).map(normalizeTestName).sort();
  expect(LAB_REFERENCES.map(item => item.libraryId).sort()).toEqual(names);
  expect(new Set(LAB_REFERENCES.map(item => item.id)).size).toBe(names.length);
  for (const reference of LAB_REFERENCES) {
    expect(reference.note.length, reference.id).toBeGreaterThan(35);
    expect(reference.reference || reference.bands, reference.id).toBeTruthy();
    expect(reference.action.length, reference.id).toBeGreaterThan(40);
    expect(reference.source, reference.id).toMatch(/^https:\/\//);
    expect(reference.groupId, reference.id).toBeTruthy();
  }
  const inventory = JSON.parse(readFileSync(new URL('../docs/specs/biomarker-coverage-inventory.json', import.meta.url)));
  expect(auditMeasurementCoverage({ inventory, labReferences: LAB_REFERENCES.filter(item => item.id !== 'ft3') }).failures).toContain('Published lab guidance does not account for every unique source entry.');
  const boilerplate = LAB_REFERENCES.map(item => item.id === 'ft3' ? { ...item, action: 'Copy your report exactly, including its units and reference interval.' } : item);
  expect(auditMeasurementCoverage({ inventory, labReferences: boilerplate }).failures).toContain('Missing lab action/context: ft3');
});

test('specialist direct links, browser Back and complete-reference reading work', async ({ page }) => {
  await page.goto('/#biomarker-antinuclearantibodiestiter');
  await expect(page.locator('#biomarker-antinuclearantibodiestiter')).toBeVisible();
  await expect(page.locator('#biomarker-antinuclearantibodiestiter')).toContainText('dilution');
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.getByRole('searchbox', { name: 'Find a biomarker' }).fill('free PSA');
  await page.locator('[data-reference-results] a[href="#biomarker-psafree"]').click();
  await expect(page.locator('#biomarker-psafree')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/#biomarker-antinuclearantibodiestiter$/);
  await expect(page.locator('#biomarker-antinuclearantibodiestiter')).toBeVisible();
  await page.goto('/');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.getByRole('button', { name: 'Show all references', exact: true }).click();
  await expect(page.locator('#biomarker-abogroup')).toBeVisible();
  await expect(page.locator('#biomarker-abogroup .sg-card-action')).toContainText('No lifestyle intervention');
  const mounted = await page.locator('[data-reference-card]').evaluateAll(cards => cards.map(card => ({
    id: card.dataset.referenceCard,
    visiblePlan: card.querySelector('.sg-card-action').getBoundingClientRect().height > 0,
  })));
  const { LAB_REFERENCES } = await import('../js/data/lab-references.js');
  expect(new Set(mounted.map(item => item.id)).size).toBe(mounted.length);
  expect(LAB_REFERENCES.every(reference => mounted.some(item => item.id === reference.id && item.visiblePlan))).toBe(true);
  const result = await new AxeBuilder({ page }).include('#sg-home-dashboard').analyze();
  expect(result.violations).toEqual([]);
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
  await page.evaluate(() => { dispatchEvent(new Event('beforeprint')); dispatchEvent(new Event('afterprint')); });
  await expect(page.locator('#sg-home-dashboard')).toHaveAttribute('data-complete-references', 'true');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.sg-print-warning')).toBeHidden();
  await expect(page.locator('#biomarker-psafree .sg-card-action')).toBeVisible();
});

test('a failed specialist deep link provides a visible reload-and-retry path', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/js/data/lab-references.js', route => route.abort());
  await page.goto('/#biomarker-psafree');
  await expect(page.locator('[data-reference-feedback]')).toBeVisible();
  await expect(page.locator('[data-reference-feedback]')).toContainText('could not load');
  await page.unroute('**/js/data/lab-references.js');
  await page.getByRole('button', { name: 'Reload to retry' }).click();
  await expect(page.locator('#biomarker-psafree')).toBeVisible();
  expect(errors).toEqual([]);
});

test('library results link to their exact reference and print does not silently omit unloaded content', async ({ page }) => {
  await page.goto('/pages/blood.html');
  await page.locator('[data-biomarker-library] > summary').click();
  await page.getByLabel('Search all biomarkers').fill('ANA titer');
  const row = page.locator('[data-library-marker="antinuclearantibodiestiter"]');
  await row.locator('summary').click();
  await row.getByRole('link', { name: /Reference & action plan/ }).click();
  await expect(page.locator('#biomarker-antinuclearantibodiestiter')).toBeVisible();
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.sg-print-warning')).toBeVisible();
  await page.emulateMedia({ media: 'screen' });
});
