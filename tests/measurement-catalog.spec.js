import { expect, test } from '@playwright/test';
import { searchMeasurements } from '../js/components/measurement-search.js';
import { validPhysicalValue } from '../js/physical-measurements.js';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { auditMeasurementCoverage } from '../scripts/audit-measurement-coverage.mjs';
import { HEALTH_REFERENCES } from '../js/data/health-reference-groups.js';
import { ADDITIONAL_MARKERS } from '../js/data/additional-screening.js';
import { BLUEPRINT_MARKERS, normalizeTestName } from '../js/data/blueprint-markers.js';
import { measurementIdentity } from '../js/data/measurement-index.js';

test('every optional lab field shares an explicit identity with its published library entry', () => {
  for (const marker of ADDITIONAL_MARKERS) {
    const libraryId = normalizeTestName(marker.catalogName);
    expect(BLUEPRINT_MARKERS.some(item => item.id === libraryId), marker.id).toBe(true);
    expect(measurementIdentity(marker.id).libraryId, marker.id).toBe(libraryId);
    expect(measurementIdentity(libraryId).id, libraryId).toBe(marker.id);
  }
});

test('optional field aliases find library entries without merging blood and urine specimens', () => {
  for (const [query, id] of [
    ['GGT', 'ggt'], ['ALP', 'alp'], ['TIBC', 'tibc'], ['TSAT', 'tsat'],
    ['bicarbonate', 'bicarbonate'], ['haematocrit', 'hematocrit'],
    ['RBC', 'rbc'], ['WBC', 'wbc'], ['MCV', 'mcv'], ['RDW', 'rdw'],
  ]) {
    const matches = searchMeasurements(BLUEPRINT_MARKERS, query);
    expect(matches.length, query).toBeGreaterThan(0);
    expect(measurementIdentity(matches[0].id).id, query).toBe(id);
  }
  for (const [blood, urine] of [
    ['rbc', 'redbloodcellsurine'], ['wbc', 'whitebloodcellsurine'],
    ['protein', 'proteinurine'], ['bilirubin', 'bilirubinurine'],
    ['glucose', 'glucoseurine'], ['urate', 'uricacidcrystalsurine'],
  ]) expect(measurementIdentity(blood).id).not.toBe(measurementIdentity(urine).id);
});

test('optional lab explanations are measurement-specific and retain evidence links', () => {
  expect(new Set(ADDITIONAL_MARKERS.map(item => item.why)).size).toBe(ADDITIONAL_MARKERS.length);
  for (const marker of ADDITIONAL_MARKERS) {
    expect(marker.why.length, marker.id).toBeGreaterThan(65);
    expect(marker.why, marker.id).not.toContain('Record ' + marker.label);
    expect(marker.meaningSource, marker.id).toMatch(/^https:\/\/medlineplus\.gov\/lab-tests\/[a-z0-9-]+\/$/);
  }
  expect(ADDITIONAL_MARKERS.find(item => item.id === 'alp').why).toContain('not a bone-density measurement');
  expect(ADDITIONAL_MARKERS.find(item => item.id === 'hemoglobin').why).toContain('different from HbA1c');
  expect(ADDITIONAL_MARKERS.find(item => item.id === 'ft4').why).toContain('different from total T4');
});

test('coverage audit detects removed measurements, orphaned source entries and unfinished scope', () => {
  const inventory = JSON.parse(readFileSync(new URL('../docs/specs/biomarker-coverage-inventory.json', import.meta.url)));
  expect(auditMeasurementCoverage({ inventory }).failures).toEqual([]);
  for (const id of ['hdl', 'grip', 'bmd']) {
    const report = auditMeasurementCoverage({ inventory, references: HEALTH_REFERENCES.filter(item => item.id !== id) });
    expect(report.failures.some(message => message.includes(id))).toBe(true);
  }
  const orphaned = structuredClone(inventory);
  orphaned.entries[0].canonicalId = 'nonexistent-test';
  expect(auditMeasurementCoverage({ inventory: orphaned }).failures).toContain('Unresolved source mapping: lab-baseline-1');
  expect(auditMeasurementCoverage({ inventory, requireComplete: true }).failures).toContain('The full source inventory is not complete.');
});

test('lipid aliases resolve without treating non-HDL as HDL', () => {
  const items = [{ id: 'nonhdl', label: 'Non-HDL cholesterol' }, { id: 'hdl', label: 'HDL cholesterol' }, { id: 'totalchol', label: 'Total cholesterol' }];
  for (const query of ['HDL', 'HDL-C', 'HDL cholesterol', 'high density lipoprotein']) {
    expect(searchMeasurements(items, query).map(item => item.id), query).toEqual(['hdl']);
  }
  for (const query of ['non HDL', 'non-HDL-C', 'nonhdl']) expect(searchMeasurements(items, query)[0].id).toBe('nonhdl');
  for (const query of ['TC', 'total chol', 'total cholesterol']) expect(searchMeasurements(items, query)[0].id).toBe('totalchol');
  const crp = [{ id: 'highsensitivitycreactiveprotein', name: 'High-Sensitivity C-Reactive Protein' }];
  for (const query of ['hs-CRP', 'hsCRP', 'hs CRP', 'hr-csp']) expect(searchMeasurements(crp, query), query).toEqual(crp);
});

test('physical values support signed scores without accepting malformed or impossible percentages', () => {
  for (const value of ['-2.5', '0', '1,2', '']) expect(validPhysicalValue(value, { signed: true }), value).toBe(true);
  for (const value of ['NaN', 'Infinity', '2x', '--2']) expect(validPhysicalValue(value, { signed: true }), value).toBe(false);
  expect(validPhysicalValue('-2', {})).toBe(false);
  expect(validPhysicalValue('101', { max: 100 })).toBe(false);
  expect(validPhysicalValue('0', { max: 100 })).toBe(true);
});

test('Health promotes existing HDL records and searches physical, optional and library fields', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('sg-health-baseline-v1')) localStorage.setItem('sg-health-baseline-v1', JSON.stringify({ values: { hdl: '61', totalchol: '190' }, units: { hdl: 'mg/dL', totalchol: 'mg/dL' } }));
    if (!localStorage.getItem('blueprint-marker-results-v1')) localStorage.setItem('blueprint-marker-results-v1', JSON.stringify({ hdlcholesterol: { result: '55', unit: 'mg/dL', date: '2026-10-01' } }));
  });
  await page.goto('/pages/blood.html');
  await expect(page.locator('[data-marker-input="hdl"]')).toBeVisible();
  await expect(page.locator('[data-marker-input="hdl"]')).toHaveValue('61');
  await expect(page.locator('[data-marker-unit="hdl"]')).toHaveValue('mg/dL');
  const search = page.getByRole('searchbox', { name: 'Find a result field' });
  for (const [query, target] of [['HDL-C', 'sg-hdl'], ['TSH', 'sg-tsh'], ['TIBC', 'sg-tibc'], ['bicarbonate', 'sg-bicarbonate'], ['RBC', 'sg-rbc'], ['grip', 'physical-grip'], ['mercury', 'library-mercuryblood-result']]) {
    await search.fill(query);
    const result = page.locator(`[data-health-result="${target}"]`);
    await expect(result).toBeVisible();
    await result.click();
    await expect(page.locator(`#${target}`)).toBeFocused();
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('blueprint-marker-results-v1')).hdlcholesterol.result)).toBe('55');
  await expect(page.locator('[data-marker-input="hdl"]')).toHaveValue('61');
  const rbc = page.locator('[data-marker-card="rbc"]');
  await expect(rbc.locator('.sg-marker-why')).toContainText('distinct from red cells found in urine');
  await rbc.locator('summary').click();
  await expect(rbc.getByRole('link', { name: 'About this test' })).toHaveAttribute('href', 'https://medlineplus.gov/lab-tests/complete-blood-count-cbc/');
});

test('physical results persist sides, signed bone scores and report units without conversion', async ({ page }) => {
  await page.goto('/pages/blood.html#physical-grip');
  const grip = page.locator('[data-physical-card="grip"]');
  await expect(grip).toBeVisible();
  await grip.getByLabel('Left hand', { exact: true }).fill('31.5');
  await grip.getByLabel('Right hand', { exact: true }).fill('34');
  await grip.getByLabel('Left hand units').selectOption('lbf');
  await expect(grip.getByLabel('Left hand', { exact: true })).toHaveValue('31.5');
  await expect(grip.locator('[data-physical-status]')).toContainText('unchanged');
  const bone = page.locator('[data-physical-card="bmd-hip"]');
  await expect(bone.getByLabel('T-score', { exact: true })).toHaveAttribute('inputmode', 'text');
  await bone.getByLabel('T-score', { exact: true }).fill('-2.5');
  await bone.getByLabel('Z-score', { exact: true }).fill('-1.2');
  await bone.getByLabel('T-score', { exact: true }).blur();
  await expect(bone.getByLabel('T-score', { exact: true })).toHaveAttribute('aria-invalid', 'false');
  await bone.locator('summary').click();
  await bone.getByLabel('Reported side').selectOption('Left');
  await bone.getByLabel('Measurement date (optional)').fill('2026-10-15');
  await page.reload();
  await expect(grip).toBeVisible();
  await expect(grip.getByLabel('Left hand units')).toHaveValue('lbf');
  await expect(bone.getByLabel('T-score', { exact: true })).toHaveValue('-2.5');
  await bone.locator('summary').click();
  await expect(bone.getByLabel('Reported side')).toHaveValue('Left');
  await expect(bone.getByLabel('Measurement date (optional)')).toHaveValue('2026-10-15');
  const result = await new AxeBuilder({ page }).include('[data-physical-measurements]').analyze();
  expect(result.violations).toEqual([]);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test('Home has dedicated guidance for the reported missing measurements', async ({ page }) => {
  await page.goto('/');
  for (const [query, id] of [['HDL-C', 'hdl'], ['total cholesterol', 'totalchol'], ['hand grip', 'grip'], ['bone density', 'bmd']]) {
    const picker = page.locator('.sg-reference-picker');
    if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
    await page.getByRole('searchbox', { name: 'Find a biomarker' }).fill(query);
    await expect(page.locator('[data-reference-results] a').first()).toHaveAttribute('href', `#biomarker-${id}`);
    await page.locator('[data-reference-results] a').first().click();
    const card = page.locator(`[data-reference-card="${id}"]`);
    await expect(card.locator('.sg-card-action')).toBeVisible();
    await expect(card.locator('.sg-range-scale')).toBeVisible();
  }
  await expect(page.locator('[data-reference-card="bmd"]')).toContainText('T-score');
  await expect(page.locator('[data-reference-card="bmd"]')).toContainText('Z-score');
  await expect(page.locator('[data-reference-card="dexa"]')).toBeVisible();
});
