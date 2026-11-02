import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS } from '../js/data/health-reference-groups.js';
import { SG_MARKER_ACTIONS } from '../js/data/screening-actions.js';
import { SG_MARKERS } from '../js/data/screening.js';
import { ADDITIONAL_MARKERS } from '../js/data/additional-screening.js';
import { BLUEPRINT_MARKERS, BLUEPRINT_REFERENCE, normalizeTestName } from '../js/data/blueprint-markers.js';
import { MEASUREMENT_SOURCES } from '../js/data/measurement-sources.js';
import { searchMeasurements } from '../js/components/measurement-search.js';
import { LAB_REFERENCES } from '../js/data/lab-references.js';
import { measurementIdentity } from '../js/data/measurement-index.js';

const REQUIRED_QUERIES = [['HDL-C', 'hdl'], ['non-HDL-C', 'nonhdl'], ['total cholesterol', 'totalchol'], ['hand grip', 'grip'], ['bone density', 'bmd'], ['RHR', 'rhr'], ['HRV', 'hrv'], ['sleep duration', 'sleep'], ['sleep efficiency', 'sleepefficiency']];
const PUBLISHED_PANEL = JSON.parse(readFileSync(new URL('../docs/specs/published-panel-reconciliation.json', import.meta.url)));
export function auditMeasurementCoverage({ inventory, references = HEALTH_REFERENCES, labReferences = LAB_REFERENCES, search = searchMeasurements, requireComplete = false }) {
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  for (const panel of ['baseline', 'male', 'female', 'followup']) {
    const published = PUBLISHED_PANEL.panels[panel].map(normalizeTestName).sort();
    const local = BLUEPRINT_REFERENCE[panel].map(normalizeTestName).sort();
    check(JSON.stringify(published) === JSON.stringify(local), `Published panel name inventory drift: ${panel}`);
  }
  const publishedIds = ['baseline', 'male', 'female'].flatMap(panel => PUBLISHED_PANEL.panels[panel]).map(normalizeTestName).sort();
  check(JSON.stringify(labReferences.map(item => item.libraryId).sort()) === JSON.stringify(publishedIds), 'Published lab guidance does not account for every unique source entry.');
  check(new Set(labReferences.map(item => item.id)).size === labReferences.length, 'Duplicate canonical lab guidance IDs.');
  for (const reference of labReferences) {
    check(HEALTH_REFERENCE_GROUPS.some(group => group.id === reference.groupId), `Unknown lab guidance group: ${reference.id}`);
    check(Boolean(reference.unit && reference.note?.length > 35 && (reference.reference || reference.bands)), `Incomplete lab guidance: ${reference.id}`);
    check(/^https:\/\//.test(reference.source), `Missing lab guidance source: ${reference.id}`);
    check(reference.action?.length > 40 && !/^Copy your report/i.test(reference.action), `Missing lab action/context: ${reference.id}`);
  }
  const sourceIds = new Set(MEASUREMENT_SOURCES.map(source => source.id));
  const known = new Set([...references, ...SG_MARKERS, ...ADDITIONAL_MARKERS, ...BLUEPRINT_MARKERS].map(item => item.id));
  const seen = new Set();
  for (const entry of inventory.entries) {
    check(Boolean(entry.sourceEntryId) && !seen.has(entry.sourceEntryId), `Duplicate or missing source-entry ID: ${entry.sourceEntryId}`);
    seen.add(entry.sourceEntryId);
    check(sourceIds.has(entry.sourceId), `Unknown source: ${entry.sourceId}`);
    check(Boolean(entry.originalName && entry.sourceSection), `Missing source name/section: ${entry.sourceEntryId}`);
    check(['included', 'alias', 'repeat', 'excluded'].includes(entry.disposition), `Missing disposition: ${entry.sourceEntryId}`);
    check(entry.disposition === 'excluded' ? Boolean(entry.reason) : known.has(entry.canonicalId), `Unresolved source mapping: ${entry.sourceEntryId}`);
  }
  for (const [query, id] of REQUIRED_QUERIES) {
    check(search(references, query)[0]?.id === id, `Required query has no correct reference: ${query} → ${id}`);
  }
  for (const reference of references) {
    const action = reference.action || SG_MARKER_ACTIONS[reference.id]?.[0]?.join('. ');
    check(Boolean(reference.label && reference.unit && reference.note && (reference.reference || reference.bands)), `Incomplete reference: ${reference.id}`);
    check(/^https:\/\//.test(reference.source), `Missing reference source: ${reference.id}`);
    check(typeof action === 'string' && action.length >= 40, `Missing substantive action/context: ${reference.id}`);
  }
  if (requireComplete) {
    check(inventory.status === 'complete' && !inventory.remaining?.length, 'The full source inventory is not complete.');
    check(inventory.entries.every(entry => entry.reviewStatus === 'source-checked'), 'Some source entries still need guidance/source review.');
    check(MEASUREMENT_SOURCES.every(source => inventory.entries.some(entry => entry.sourceId === source.id)), 'A declared source has no inventoried entries.');
    const implemented = new Set([...references, ...labReferences].map(reference => reference.id));
    for (const entry of inventory.entries.filter(entry => entry.disposition !== 'excluded')) {
      check(implemented.has(measurementIdentity(entry.canonicalId).id), `No guidance destination for included entry: ${entry.sourceEntryId}`);
    }
  }
  return { failures, sourceEntries: inventory.entries.length, uniqueIncluded: new Set(inventory.entries.filter(entry => entry.disposition !== 'excluded').map(entry => entry.canonicalId)).size, references: references.length, labReferences: labReferences.length, pendingReview: inventory.entries.filter(entry => entry.reviewStatus !== 'source-checked').length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const inventory = JSON.parse(readFileSync(new URL('../docs/specs/biomarker-coverage-inventory.json', import.meta.url)));
  const report = auditMeasurementCoverage({ inventory, requireComplete: process.argv.includes('--require-complete') });
  console.log(`Frozen pre-implementation baseline: ${report.sourceEntries} source entries, ${report.uniqueIncluded} original IDs, ${report.references} current core Home references, ${report.labReferences} published lab references, ${report.pendingReview} original pending statuses (superseded by the reconciled review).`);
  if (report.failures.length) { console.error(report.failures.join('\n')); process.exitCode = 1; }
}
