import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { auditMeasurementCoverage } from '../scripts/audit-measurement-coverage.mjs';
import { EXTENDED_REFERENCES } from '../js/data/extended-references.js';
import { HEALTH_REFERENCES } from '../js/data/health-reference-groups.js';
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

test('core reference data uses explicit categories and keeps lab intervals out of display bands', () => {
  const refs = new Map(HEALTH_REFERENCES.map(item => [item.id, item]));
  for (const id of ['bp', 'glucose', 'hba1c', 'apob', 'waist', 'hscrp', 'hdl', 'ldl', 'tg', 'egfr']) {
    const reference = refs.get(id);
    expect(reference, id).toBeTruthy();
    expect(reference.reference || reference.bands || reference.guide, id).toBeTruthy();
    expect(reference.labInterval, id).toBeUndefined();
  }
  expect(refs.get('hscrp').bands.map(([label]) => label)).toEqual(['Lower relative risk', 'Intermediate relative range', 'Higher relative range']);
  expect(refs.get('hscrp').note).toContain('≥2 mg/L');
  expect(refs.get('hdl').bands).toHaveLength(3);
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

test('Home renders only core references cleanly at mobile and desktop widths', async ({ page }) => {
  await page.goto('/');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const cards = page.locator('#sg-home-dashboard [data-reference-card]');
    await expect(cards).toHaveCount(10);
    const problems = await cards.evaluateAll(nodes => nodes.flatMap(card => {
      const range = card.querySelector('[data-reference-scale]');
      const issues = [];
      if (!range?.querySelector('dl dt')?.textContent.trim() || !range.querySelector('dl dd')?.textContent.trim()) issues.push('missing presentation');
      if (range.scrollWidth > range.clientWidth + 1) issues.push('range overflow');
      if (!card.querySelector('.sg-card-action p')?.textContent.trim()) issues.push('missing action');
      return issues.map(issue => `${card.id}: ${issue}`);
    }));
    expect(problems).toEqual([]);
  }
  const result = await new AxeBuilder({ page }).include('#sg-home-dashboard').analyze();
  expect(result.violations).toEqual([]);
});
