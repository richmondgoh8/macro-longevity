import { expect, test } from '@playwright/test';
import { SPECIALIST_REFERENCES } from '../js/data/specialist-references.js';
import { EXTENDED_REFERENCES } from '../js/data/extended-references.js';
import { PROTOCOL_MAPPINGS, PROTOCOL_EXCLUSIONS } from '../js/data/protocol-measurement-mappings.js';
import { reconcileMeasurements, coverageSnapshot } from '../scripts/reconcile-measurements.mjs';
import { readFileSync } from 'node:fs';

test('versioned full inventory has no unmatched names, missing guidance or stale review', () => {
  const report = reconcileMeasurements();
  expect(report.failures).toEqual([]);
  expect(report.status).toBe('complete');
  expect(report.counts.accounted).toBe(report.counts.sourceEntries);
  expect(report.counts.uniqueIncluded).toBe(EXTENDED_REFERENCES.length);
  expect(coverageSnapshot(report)).toEqual(JSON.parse(readFileSync(new URL('../docs/specs/measurement-coverage-review.json', import.meta.url))));
  for (const entry of report.entries) {
    expect(entry.reviewStatus).toBe('source-checked');
    if (entry.disposition === 'excluded') { expect(entry.reason.length).toBeGreaterThan(40); expect(entry.canonicalIds).toEqual([]); }
    for (const destination of entry.destinations) {
      expect(destination.referenceCoverage).toBeTruthy();
      expect(destination.actionSource).toMatch(/^https:\/\//);
      expect(destination.recordReason.length).toBeGreaterThan(40);
    }
  }
});

test('full inventory gate rejects lost mappings, unreviewed exclusions, wrong identity and boilerplate', () => {
  expect(reconcileMeasurements({ mappings: PROTOCOL_MAPPINGS.filter(([name]) => name !== 'FEV1') }).failures.some(message => message.includes('Unaccounted source entry'))).toBe(true);
  const { 'ETS score': removed, ...exclusions } = PROTOCOL_EXCLUSIONS;
  expect(removed).toBeTruthy();
  expect(reconcileMeasurements({ exclusions }).failures.some(message => message.includes('ETS score'))).toBe(true);
  expect(reconcileMeasurements({ mappings: PROTOCOL_MAPPINGS.map(([name,id])=>[name,name==='HDL'?'nonhdl':id]) }).failures).toContain('Unsearchable source name: HDL → nonhdl');
  expect(reconcileMeasurements({ references: EXTENDED_REFERENCES.filter(item => item.id !== 'heartmri') }).failures.some(message => message.includes('Missing reference:'))).toBe(true);
  expect(reconcileMeasurements({ references: EXTENDED_REFERENCES.map(item=>item.id==='fev1'?{...item,action:'Copy your report exactly, including the laboratory units and the reference range, and keep it for review with your health care team.'}:item) }).failures).toContain('Incomplete guidance: fev1');
});

test('Home core references are present without restoring the full reference guide', async ({ page }) => {
  await page.goto('/');
  const expected = ['bp', 'glucose', 'hba1c', 'apob', 'waist', 'hscrp', 'hdl', 'ldl', 'tg', 'egfr'];
  const mounted = await page.locator('#sg-home-dashboard [data-reference-card]').evaluateAll(cards => cards.map(card => card.dataset.referenceCard));
  expect(mounted).toEqual(expected);
  expect(EXTENDED_REFERENCES.some(item => item.id === 'fev1')).toBe(true);
  await expect(page.locator('#biomarker-fev1')).toHaveCount(0);
});

test('Health search opens a supported screening result', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const input = page.locator('[data-health-search]');
  await input.fill('ApoB');
  const result = page.locator('[data-health-results] a[data-health-result="sg-apob"]');
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.locator('#sg-apob')).toBeFocused();
});

test('Health Enter waits for the screening index before opening a result', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/js/data/extended-references.js', async route => { await gate; await route.continue(); });
  try {
    await page.goto('/pages/blood.html');
    const input = page.locator('[data-health-search]');
    await input.fill('ApoB');
    await input.press('Enter');
    release();
    await expect(page).toHaveURL(/#sg-apob$/);
    await expect(page.locator('#sg-apob')).toBeFocused();
  } finally { release(); }
});
