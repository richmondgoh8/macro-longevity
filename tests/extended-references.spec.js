import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { auditMeasurementCoverage } from '../scripts/audit-measurement-coverage.mjs';
import { EXTENDED_REFERENCES } from '../js/data/extended-references.js';
import { reconcileMeasurements } from '../scripts/reconcile-measurements.mjs';

test('routine numeric intervals have provenance and cannot regress to context-only coverage', () => {
  const report = reconcileMeasurements();
  expect(report.numericalReferenceReview.publishedLabIntervals).toBe(40);
  expect(report.numericalReferenceReview.status).toBe('partial');
  for (const reference of EXTENDED_REFERENCES.filter(item => item.labInterval)) {
    expect(reference.reference).toContain(reference.labInterval.values);
    expect(reference.reference).toContain(reference.labInterval.population);
    expect(reference.source).toBe(reference.labInterval.source);
    expect(reference.bands, reference.id).toBeUndefined();
    expect(reference.reference).toContain('not a treatment target');
  }
  const incomplete = EXTENDED_REFERENCES.map(item => item.id === 'b12' ? { ...item, labInterval: undefined } : item);
  expect(reconcileMeasurements({ references: incomplete }).failures).toContain('Missing published laboratory interval: b12');
});

test('B12 shows an actual adult lab interval before the extended catalogue loads', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#biomarker-b12');
  await expect(card.locator('.sg-range-context')).toContainText('138–652 pmol/L');
  await expect(card.locator('.sg-lab-details')).not.toHaveAttribute('open');
  await card.locator('.sg-lab-details summary').click();
  await expect(card.locator('.sg-lab-details')).toContainText('KKH; age ≥19 years');
  await expect(card.getByRole('link', { name: 'Reference source for Vitamin B12', exact: true })).toHaveAttribute('href', 'https://www.kkh.com.sg/our-specialties/elab-book/vitamin-b12');
  await page.getByRole('button', { name: 'Alternative units', exact: true }).click();
  await expect(card.locator('.sg-reference-unit')).toHaveText('pmol/L');
  await expect(card.locator('.sg-range-context')).toContainText('138–652 pmol/L');
});

test('extended numeric intervals preserve sex, specimen and assay distinctions', async ({ page }) => {
  for (const [id, values, context] of [
    ['hemoglobin', 'Male: 13.1–16.8; female: 11.5–14.9 g/dL', 'NUH; adult'],
    ['bicarbonate', '22–29 mmol/L', 'serum total CO₂, not blood-gas bicarbonate'],
    ['ft4', '8.8–14.4 pmol/L', 'SGH; adult example'],
    ['phosphate', '0.7–1.5 mmol/L', 'KKH; age ≥19 years'],
  ]) {
    await page.goto(`/#biomarker-${id}`);
    const card = page.locator(`#biomarker-${id}`);
    await expect(card.locator('.sg-range-context')).toContainText(values);
    await card.locator('.sg-lab-details summary').click();
    await expect(card.locator('.sg-lab-details')).toContainText(context);
    await expect(card.locator('.sg-card-action')).toBeVisible();
  }
});

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

test('numeric ranges are prominent and paired action panels align even when details expand', async ({ page }) => {
  await page.goto('/');
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [left, right] of [['ast', 'cystatin'], ['vitd', 'b12'], ['glucose', 'insulin']]) {
      const a = page.locator(`#biomarker-${left}`);
      const b = page.locator(`#biomarker-${right}`);
      for (const selector of ['[data-reference-scale]', '.sg-reference-copy', '.sg-card-action', '.sg-reference-source']) {
        const one = await a.locator(selector).boundingBox();
        const two = await b.locator(selector).boundingBox();
        expect(Math.abs(one.y - two.y), `${left}/${right}: ${selector}`).toBeLessThan(1);
      }
    }
    const ast = page.locator('#biomarker-ast');
    const cystatin = page.locator('#biomarker-cystatin');
    await expect(ast.locator('.sg-lab-interval strong')).toHaveText('5–34 U/L');
    await expect(cystatin.locator('.sg-lab-interval strong')).toHaveText('0.59–1.28 mg/L');
    const summary = cystatin.locator('.sg-lab-details summary');
    await summary.focus();
    await summary.press('Enter');
    await expect(cystatin.locator('.sg-lab-details p').first()).toBeVisible();
    const a = await ast.locator('.sg-card-action').boundingBox();
    const b = await cystatin.locator('.sg-card-action').boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThan(1);
    expect(Math.abs(a.height - b.height)).toBeLessThan(1);
    await summary.press('Enter');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.locator('#biomarker-cystatin .sg-lab-details summary').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator('#biomarker-cystatin .sg-card-action')).toBeVisible();
});

test('printing exposes lab details and restores the reader disclosure state', async ({ page }) => {
  await page.goto('/');
  const b12 = page.locator('#biomarker-b12 .sg-lab-details');
  const cystatin = page.locator('#biomarker-cystatin .sg-lab-details');
  await cystatin.locator('summary').click();
  await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
  await expect(b12).toHaveAttribute('open');
  await page.emulateMedia({ media: 'print' });
  await expect(b12.locator('p').first()).toBeVisible();
  await page.evaluate(() => dispatchEvent(new Event('afterprint')));
  await expect(b12).not.toHaveAttribute('open');
  await expect(cystatin).toHaveAttribute('open');
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
