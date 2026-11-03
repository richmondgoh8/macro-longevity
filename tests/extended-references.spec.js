import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { auditMeasurementCoverage } from '../scripts/audit-measurement-coverage.mjs';
import { EXTENDED_REFERENCES } from '../js/data/extended-references.js';
import { reconcileMeasurements } from '../scripts/reconcile-measurements.mjs';

test('routine numeric intervals retain sourced metadata without leaking into reference text', () => {
  const report = reconcileMeasurements();
  expect(report.numericalReferenceReview.publishedLabIntervals).toBe(60);
  expect(report.numericalReferenceReview.status).toBe('partial');
  for (const reference of EXTENDED_REFERENCES.filter(item => item.labInterval)) {
    expect(reference.reference).not.toContain(reference.labInterval.values);
    expect(reference.labInterval.population).toBeTruthy();
    expect(reference.source).toBe(reference.labInterval.source);
    expect(reference.bands, reference.id).toBeUndefined();
  }
  const incomplete = EXTENDED_REFERENCES.map(item => item.id === 'b12' ? { ...item, labInterval: undefined } : item);
  expect(reconcileMeasurements({ references: incomplete }).failures).toContain('Missing or exposed published laboratory interval: b12');
});

test('no reference card shows example lab interval values or lab interval details', async ({ page }) => {
  await page.goto('/');
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.locator('[data-reference-show-all]').click();
  for (const reference of EXTENDED_REFERENCES.filter(item => item.labInterval && item.id !== 'insulin')) {
    const card = page.locator(`[data-reference-card="${reference.id}"]`);
    await expect(card, reference.id).toHaveCount(1);
    await expect(card, reference.id).not.toContainText(reference.labInterval.values);
    await expect(card, reference.id).not.toContainText('Example lab interval');
    await expect(card.locator('.sg-lab-details'), reference.id).toHaveCount(0);
  }
});

test('core guideposts have usable comparators; contextual markers stay in the extended reference list', async ({ page }) => {
  await page.goto('/');
  for (const [id, value] of [['hdl', '≥1.0 mmol/L'], ['totalchol', '<5.2 mmol/L'], ['mma', '>0.271 µmol/L'], ['rhr', '60–100 bpm'], ['sleep', '7–9 hours/night'], ['bmd', 'T-score ≤−2.5']]) {
    const card = page.locator(`#biomarker-${id}`);
    await expect(card.locator('[data-range-value] strong')).toContainText(value);
    await expect(card.locator('.sg-range-scale [data-range-item]')).toHaveCount(1);
    await expect(card.locator('.sg-lab-details')).not.toHaveAttribute('open');
  }
  for (const id of ['fibrinogen', 'esr']) {
    const card = page.locator(`#biomarker-${id}`);
    await expect(card.locator('[data-range-value]')).toContainText('Use the interval on your laboratory report');
    await expect(card.locator('[data-range-value]')).not.toContainText('Example lab interval');
  }
  for (const id of ['homair', 'igf1', 'grip', 'vo2', 'bodyfat', 'hrv', 'tghdl', 'nlr']) {
    await expect(page.locator(`#biomarker-${id}`)).toHaveCount(0);
  }
  await expect(page.locator('#biomarker-insulin')).toHaveCount(0);
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  const search = page.getByRole('searchbox', { name: 'Find a biomarker' });
  for (const query of ['fasting insulin', 'HOMA-IR', 'triglyceride-to-HDL ratio', 'neutrophil-to-lymphocyte ratio']) {
    await search.fill(query);
    await expect(page.locator('#reference-search-status')).toContainText('No matches');
    await expect(page.locator('#biomarker-insulin')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Alternative units', exact: true }).click();
  await expect(page.locator('#biomarker-hdl [data-range-value] strong')).toHaveText('≥40 mg/dL');
  await expect(page.locator('#biomarker-totalchol [data-range-value] strong')).toHaveText('<200 mg/dL');
  await expect(page.locator('#biomarker-fibrinogen [data-range-value]')).toContainText('Use the interval on your laboratory report');
  await expect(page.locator('#biomarker-bmd .sg-reference-copy')).toContainText('≤−2.0');
  await expect(page.locator('#biomarker-colorectal [data-range-item] dt')).toHaveText('Screening eligibility & evidence');
});

test('every core and extended reference has a readable range or explicitly contextual presentation', async ({ page }) => {
  await page.goto('/');
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.locator('[data-reference-show-all]').click();
  await expect(page.locator('#sg-home-dashboard')).toHaveAttribute('data-complete-references', 'true');
  for (const [id, text] of [['igf1', 'no single adult longevity range']]) {
    await expect(page.locator(`#biomarker-${id}`)).toContainText(text);
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const problems = await page.locator('[data-reference-card]').evaluateAll(cards => cards.flatMap(card => {
      const range = card.querySelector('[data-reference-scale]');
      const issues = [];
      if (!range?.querySelector('dl dt')?.textContent.trim() || !range.querySelector('dl dd')?.textContent.trim()) issues.push('missing presentation');
      if (range.scrollWidth > range.clientWidth + 1) issues.push('range overflow');
      if (!card.querySelector('.sg-card-action p')?.textContent.trim()) issues.push('missing action');
      if (range.querySelector('dt')?.textContent === 'Reference / eligibility') issues.push('ambiguous legacy heading');
      return issues.map(issue => `${card.id}: ${issue}`);
    }));
    expect(problems).toEqual([]);
    await expect(page.locator('[data-reference-card]')).toHaveCount(354);
    await expect(page.locator('#biomarker-insulin')).toHaveCount(0);
  }
});

test('hormone examples retain age, cycle and assay limits rather than universal targets', () => {
  const interval = id => EXTENDED_REFERENCES.find(item => item.id === id).labInterval;
  expect(interval('testosteronetotal').values).toContain('female ≥50: 0.4–1.2');
  expect(interval('testosteronetotal').population).toContain('no interval supplied here for age ≤20');
  expect(interval('antimullerianhormoneamh').values).toContain('45–50: 0.01–2.71');
  expect(interval('luteinizinghormone').population).toContain('menstrual phase');
  expect(interval('estradiol').population).toContain('upper reference limits');
  expect(interval('zinc').unit).toBe('µg/L');
  for (const id of ['cortisol', 'bun', 'vitc']) expect(interval(id).reviewed).toBe('2026-11-03');
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
  await expect(card.locator('.sg-range-scale')).toBeVisible();
  await expect(card.locator('.sg-card-action')).toBeVisible();
  await page.reload();
  await expect(card).toBeVisible();
  await expect(page.locator('[data-reference-card="hdl"]')).toBeVisible();
});

test('lab context stays legible and paired action panels align when details expand', async ({ page }) => {
  await page.goto('/');
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [left, right] of [['ast', 'cystatin'], ['vitd', 'b12'], ['glucose', 'hba1c']]) {
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
    await expect(ast.locator('[data-range-value]')).toContainText('Use the interval on your laboratory report');
    await expect(cystatin.locator('[data-range-value]')).toContainText('Use the assay interval');
    await expect(cystatin.locator('.sg-lab-details')).toHaveCount(0);
    await expect(cystatin).not.toContainText('0.59–1.28 mg/L');
    const a = await ast.locator('.sg-card-action').boundingBox();
    const b = await cystatin.locator('.sg-card-action').boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThan(1);
    expect(Math.abs(a.height - b.height)).toBeLessThan(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(page.locator('#biomarker-cystatin .sg-lab-details')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator('#biomarker-cystatin .sg-card-action')).toBeVisible();
});

test('printing does not reintroduce example lab intervals', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({ media: 'print' });
  for (const [id, value] of [['b12', '138–652'], ['fibrinogen', '200–393'], ['esr', '3–20'], ['cystatin', '0.59–1.28']]) {
    const card = page.locator(`#biomarker-${id}`);
    await expect(card).not.toContainText(value);
    await expect(card.locator('.sg-lab-details')).toHaveCount(0);
  }
  await page.evaluate(() => dispatchEvent(new Event('afterprint')));
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
    expect(reference.reference || reference.bands || reference.guide, reference.id).toBeTruthy();
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
  expect(LAB_REFERENCES.filter(reference => reference.id !== 'insulin').every(reference => mounted.some(item => item.id === reference.id && item.visiblePlan))).toBe(true);
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
