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

test('specialist search reaches the real card with context and actions', async ({ page }) => {
  await page.goto('/');
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.getByRole('searchbox', { name: 'Find a biomarker' }).fill('FEV1');
  await page.locator('[data-reference-results] a[href="#biomarker-fev1"]').click();
  await expect(page.locator('#biomarker-fev1')).toBeFocused();
  await expect(page.locator('#biomarker-fev1 .sg-card-action')).toBeVisible();
  await expect(page.locator('#biomarker-fev1')).toContainText('first second');
  await page.reload();
  await expect(page.locator('#biomarker-fev1 .sg-card-action')).toBeVisible();
});

test('complete guide exposes every specialist reference without duplicate cards', async ({ page }) => {
  await page.goto('/#biomarker-hearingright');
  await expect(page.locator('#biomarker-hearingright')).toBeVisible();
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
  await page.getByRole('button', { name: 'Show all references', exact: true }).click();
  const mounted = await page.locator('[data-reference-card]').evaluateAll(cards => cards.map(card => ({
    id: card.dataset.referenceCard, plan: card.querySelector('.sg-card-action').getBoundingClientRect().height > 0,
  })));
  expect(new Set(mounted.map(item => item.id)).size).toBe(mounted.length);
  expect(mounted.length).toBe(EXTENDED_REFERENCES.length);
  expect(SPECIALIST_REFERENCES.every(reference => mounted.some(item => item.id === reference.id && item.plan))).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#biomarker-selenium .sg-card-action')).toBeVisible();
  await expect(page.locator('.sg-print-warning')).toBeHidden();
});

test('Health finds reference-only specialist tests without adding fake result controls', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const input = page.locator('[data-health-search]');
  await input.fill('FEV1');
  const link = page.locator('[data-health-results] a[href="../#biomarker-fev1"]');
  await expect(link).toContainText('Reference only');
  await link.click();
  await expect(page.locator('#biomarker-fev1 .sg-card-action')).toBeVisible();
  await page.goBack();
  await expect(input).toBeVisible();
  await input.fill('DunedinPoAm');
  await page.locator('[data-health-results] a[href="../#biomarker-dunedin"]').click();
  await expect(page.locator('#biomarker-dunedin')).toContainText('Historical protocol');
  await expect(page.locator('#biomarker-dunedin input')).toHaveCount(0);
});

test('Health Enter waits for the full index instead of dropping the query', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/js/data/extended-references.js', async route => { await gate; await route.continue(); });
  try {
    await page.goto('/pages/blood.html');
    await page.locator('[data-health-search]').fill('FEV1');
    await page.locator('[data-health-search]').press('Enter');
    release();
    await expect(page).toHaveURL(/\/#biomarker-fev1$/);
    await expect(page.locator('#biomarker-fev1 .sg-card-action')).toBeVisible();
  } finally { release(); }
});
