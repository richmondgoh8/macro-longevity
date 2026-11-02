import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { EXTENDED_REFERENCES } from '../js/data/extended-references.js';
import { HEALTH_REFERENCES } from '../js/data/health-reference-groups.js';
import { SG_MARKER_ACTIONS } from '../js/data/screening-actions.js';
import { SG_MARKERS } from '../js/data/screening.js';
import { ADDITIONAL_MARKERS } from '../js/data/additional-screening.js';
import { BLUEPRINT_MARKERS } from '../js/data/blueprint-markers.js';
import { PHYSICAL_MEASUREMENTS } from '../js/data/physical-measurements.js';
import { PROTOCOL_MAPPINGS, PROTOCOL_EXCLUSIONS } from '../js/data/protocol-measurement-mappings.js';
import { measurementIdentity } from '../js/data/measurement-index.js';
import { searchMeasurements } from '../js/components/measurement-search.js';
import { MEASUREMENT_SOURCES } from '../js/data/measurement-sources.js';
import { CORE_LAB_INTERVALS } from '../js/data/core-lab-intervals.js';
import { LAB_INTERVALS } from '../js/data/lab-intervals.js';

const read = name => JSON.parse(readFileSync(new URL(`../docs/specs/${name}.json`, import.meta.url)));
const baseline = read('biomarker-coverage-inventory');
const archive = read('archived-measurement-extraction');
const current = read('current-protocol-measurement-extraction');
const supplement = read('protocol-measurement-supplement');
const fixtureNames = ['biomarker-coverage-inventory','archived-measurement-extraction','current-protocol-measurement-extraction','protocol-measurement-supplement','published-panel-reconciliation'];

export function reconcileMeasurements({ references = EXTENDED_REFERENCES, mappings = PROTOCOL_MAPPINGS, exclusions = PROTOCOL_EXCLUSIONS } = {}) {
  const byId = new Map(references.map(item => [item.id, item]));
  const map = new Map(mappings);
  const core = new Set(HEALTH_REFERENCES.map(item => item.id));
  const failures = [];
  for (const id of Object.keys({ ...CORE_LAB_INTERVALS, ...LAB_INTERVALS })) {
    const reference = byId.get(id);
    const interval = reference?.labInterval;
    if (!interval || !interval.lab || !interval.population || !interval.unit || !/\d/.test(interval.values) || !/^https:\/\//.test(interval.source) || !interval.reviewed || !reference.reference?.includes(interval.values) || reference.unit !== interval.unit) failures.push(`Missing published laboratory interval: ${id}`);
  }
  if (map.size !== mappings.length) failures.push('Duplicate protocol mapping names.');
  const entries = [];
  const seen = new Set();
  const sources = fixtureNames.map(name => ({ fixture: `${name}.json`, sha256: createHash('sha256').update(readFileSync(new URL(`../docs/specs/${name}.json`, import.meta.url))).digest('hex') }));
  function add(entry, lookup, explicitId) {
    const exclusion = exclusions[lookup];
    const decision = explicitId || map.get(lookup);
    if (!decision && !exclusion) failures.push(`Unaccounted source entry: ${entry.sourceEntryId} (${lookup})`);
    const ids = decision ? [decision].flat() : [];
    const repeated = ids.length > 0 && ids.every(id => seen.has(id));
    const destinations = ids.map(id => {
      const reference = byId.get(id);
      if (!reference) { failures.push(`Missing reference: ${entry.sourceEntryId} → ${id}`); return { id }; }
      const fields = [...SG_MARKERS, ...ADDITIONAL_MARKERS].filter(item => item.id === id).map(item => `#sg-${item.id}`);
      const library = BLUEPRINT_MARKERS.filter(item => measurementIdentity(item.id).id === id).map(item => `#library-${item.id}-result`);
      const physical = PHYSICAL_MEASUREMENTS.filter(item => item.referenceId === id).map(item => `#physical-${item.id}`);
      const targets = [...fields,...library,...physical];
      const action = reference.action || SG_MARKER_ACTIONS[id]?.[0]?.join('. ');
      if (!reference.note || reference.note.length < 35 || !(reference.reference || reference.bands) || !action || action.length < 40 || /^Copy your report/i.test(action) || !/^https:\/\//.test(reference.source)) failures.push(`Incomplete guidance: ${id}`);
      const matches = searchMeasurements(references, lookup);
      if (!matches.some(item => item.id === id)) failures.push(`Unsearchable source name: ${lookup} → ${id}`);
      seen.add(id);
      return {
        id, homeCoverage: core.has(id) ? 'core-card' : 'extended-card', reference: `#biomarker-${id}`,
        referenceCoverage: reference.labInterval ? 'published-laboratory-interval' : reference.bands ? 'source-linked-categories' : 'method/risk-specific-context',
        actionCoverage: reference.actionLabel || 'specific-plan', guidanceSource: reference.source,
        actionSource: reference.extraSource || reference.source,
        healthCoverage: targets.length ? targets : ['reference-only'],
        recordPolicy: targets.length ? 'existing-fields' : 'not-recordable',
        recordReason: targets.length ? 'Existing independent observations are preserved; no storage merge or inferred date.' : reference.recordReason || 'Contextual, derived or screening guidance; no stand-alone result entry designated in this release.',
        searchCoverage: { query: lookup, expected: id },
      };
    });
    entries.push({ ...entry, disposition: exclusion ? 'excluded' : repeated ? 'repeat' : ids.length > 1 ? 'components' : 'included', canonicalIds: ids, reason: exclusion || (ids.length > 1 ? 'Explicitly decomposed bundle or contextual components; distinct quantities and report methods are retained.' : 'Explicit source-name mapping; repeated observations do not inflate unique measurement counts.'), destinations, reviewStatus: decision || exclusion ? 'source-checked' : 'pending' });
  }
  for (const entry of baseline.entries) add({ sourceEntryId: entry.sourceEntryId, sourceId: entry.sourceId, sourceSection: entry.sourceSection, originalName: entry.originalName }, entry.originalName, measurementIdentity(entry.canonicalId).id);
  for (const [sourceId, extract] of [['blueprint-archive', archive],['blueprint-current',current]]) extract.entries.forEach((entry,index) => add({sourceEntryId:`${sourceId}-${index+1}`,sourceId,sourceSection:entry.section,originalName:entry.originalName,sourceLine:entry.sourceLine,historical:sourceId==='blueprint-archive'},entry.originalName));
  for (const [sourceId, sections] of [['blueprint-archive',supplement.archiveSections],['blueprint-current',supplement.currentSections]]) for (const [sectionIndex,section] of sections.entries()) section.rows.forEach(([sourceLine,originalName,mappingName],index)=>add({sourceEntryId:`${sourceId}-supplement-${sectionIndex+1}-${index+1}`,sourceId,sourceSection:section.section,sourceLine,originalName,historical:sourceId==='blueprint-archive'},mappingName));
  for (const [id,name] of [['leanmass','Lean mass'],['vat','Visceral adipose tissue (VAT)']]) add({sourceEntryId:`app-added-${id}`,sourceId:'app-coverage-additions',sourceSection:'User-requested body-composition distinctions',originalName:name},name,id);
  const included = [...new Set(entries.flatMap(entry=>entry.canonicalIds))];
  const implemented = new Set(references.map(item=>item.id));
  for (const id of implemented) if (!included.includes(id)) failures.push(`Reference absent from source inventory: ${id}`);
  if (implemented.size !== references.length) failures.push('Duplicate canonical reference IDs.');
  const ids = entries.map(entry=>entry.sourceEntryId);
  if (new Set(ids).size !== ids.length) failures.push('Duplicate source-entry IDs.');
  for (const source of MEASUREMENT_SOURCES) if (!entries.some(entry=>entry.sourceId===source.id)) failures.push(`Declared source has no entries: ${source.id}`);
  for (const entry of entries) if (!MEASUREMENT_SOURCES.some(source=>source.id===entry.sourceId)) failures.push(`Unknown source: ${entry.sourceId}`);
  const recordable = new Set(entries.flatMap(entry=>entry.destinations.filter(item=>item.recordPolicy==='existing-fields').map(item=>item.id)));
  return {
    schemaVersion:1, reviewed:'2026-11-02', reviewScope:'Engineering source-name, mapping, guidance-link and search review; not specialist clinical approval.',
    status:failures.length?'incomplete':'complete', sources,
    scope:'Versioned published lab lists, current Biomarkers/Measurement/daily measurement examples, archived results/routine/organ/fitness named measurements and explicit exclusions. Not every lifetime, future or unpublished test.',
    numericalReferenceReview: {
      status: 'partial',
      scope: 'Published lab intervals and banded references counted separately from source-name/guidance coverage. Other guidance can include formulas, study estimates, screening eligibility or contextual interpretation; it has not all been classified for interval applicability.',
      publishedLabIntervals: references.filter(item => item.labInterval).length,
      bandedReferences: references.filter(item => item.bands).length,
      otherReferenceGuidance: references.filter(item => !item.labInterval && !item.bands).length,
    },
    counts:{sourceEntries:entries.length,accounted:entries.filter(entry=>entry.reviewStatus==='source-checked').length,excluded:entries.filter(entry=>entry.disposition==='excluded').length,uniqueIncluded:included.length,guidanceDestinations:implemented.size,recordable:recordable.size,searchFixtures:entries.reduce((n,entry)=>n+entry.destinations.length,0)},
    failures, entries,
  };
}

export function coverageSnapshot(report = reconcileMeasurements()) {
  const { entries, ...summary } = report;
  return { ...summary, entriesSha256: createHash('sha256').update(JSON.stringify(entries)).digest('hex'), referenceContentSha256: createHash('sha256').update(JSON.stringify(EXTENDED_REFERENCES)).digest('hex') };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = reconcileMeasurements();
  if (process.argv.includes('--snapshot')) console.log(JSON.stringify(coverageSnapshot(report),null,2));
  else if (process.argv.includes('--json')) console.log(JSON.stringify(report));
  else {
    console.log(JSON.stringify(report.counts));
    if (process.argv.includes('--check-snapshot')) {
      if (JSON.stringify(read('measurement-coverage-review')) !== JSON.stringify(coverageSnapshot(report))) report.failures.push('Reviewed coverage snapshot is stale; review source/mapping changes before updating it.');
    }
    if (report.failures.length) console.error(report.failures.join('\n'));
  }
  if (report.failures.length) process.exitCode=1;
}
