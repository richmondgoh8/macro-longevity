# Biomarker and physical-measurement coverage specification

Status: implementation contract; partially implemented, not clinically approved.
Date: 2026-11-01. Original audited baseline: `363eb4b`.
Companion: [Implementation plan](biomarker-coverage-plan.md).

### Current checkpoint

The tables below describe the original problem, not the current deployed state.
The progress record reports runtime revision `e7389222a758eaedbb07f9ebe02099605cd3a006`
as deployed and verified: 51 Home reference cards, promoted HDL/total cholesterol,
13 optional physical cards, shared alias search and additive physical storage.
These omissions have been addressed in that incremental release. Full specialist
guidance, source reconciliation and complete Home search remain unfinished.
See [recorded implementation evidence](biomarker-coverage-progress.md); this
documentation update does not constitute a fresh deployment verification.

## 1. Outcome and problem

A person must be able to find an in-scope measurement by its ordinary name,
understand its units and reference context, see a practical action plan directly
below that context, and optionally record an appropriate result on Health.
Coverage must include physical measurements, not only blood and urine tests.

The existing 144-entry library is not evidence of complete health coverage.
Its fixed-count tests verify a locally maintained blood-and-urine list, not all
of Bryan Johnson's published measurements or individual guidance for every entry.
More tests, higher percentiles and more extreme values are not inherently better.

### Original verified starting state (before the incremental release)

| Surface | Current implementation | Known limitation |
| --- | --- | --- |
| Home | Seven groups, 39 reference cards | No standalone HDL, total cholesterol, grip strength or bone-density card |
| Health priority/optional cards | 13 priority + 32 optional fields | HDL is two disclosures deep; no structured grip or bone-density entry |
| Lab library | 140 baseline + 3 male-panel + 1 female-panel entries; 86 follow-up names mapped | Blood/urine scope only; largely generic report fields, not individual reference/action guidance |
| Home search | Searches Home card labels, IDs and selected aliases | `HDL cholesterol` returns Non-HDL; grip, bone density and total cholesterol have no correct destination |
| Lab search | Case-insensitive substring over names and selected aliases | `HDL-C` has no match; HDL may be confused with Non-HDL |
| DEXA reference | Body composition, lean/fat mass and VAT context | Does not provide a bone-density assessment specification |
| Saved data | Two separate localStorage stores | Same lab measurement can have independent, conflicting results |

The preceding audit confirmed these live behaviors. Optional fields must be checked
after asynchronous loading; an immediate zero DOM count is not proof of absence.

## 2. Scope and non-goals

### Included

- Repair the reported omissions and search errors first.
- Inventory every named entry in the versioned official lab panel, current public
  protocol measurement sections, and explicitly identified historical measurement
  lists. Preserve provenance; historical does not mean currently recommended.
- Classify physical, imaging, derived, qualitative, genetic and screening items
  separately from conventional lab analytes.
- Reconcile existing Home references and Health fields, including measurements
  such as B12, cystatin C and screening modalities outside the 144-entry panel.
- Provide measurement-specific guidance, or an explicit explanation of why there
  is no numerical target or appropriate self-directed intervention.
- Preserve current PWA, saved values, five destinations and approved navigation.

### Excluded from this release

- Claims to cover unpublished, future or every lifetime test Bryan has ever taken.
- Treating his results, percentiles or commercial testing schedule as guidelines.
- A recommendation that everybody order the complete inventory.
- Diagnosis, medication recommendations, automated personalised treatment targets,
  medical-device integration, accounts, cloud sync, OCR and new history charts.
- A framework rewrite, new primary navigation tabs, decorative dashboards, or a
  recording CTA on Home. Stitch is optional; native implementation is approved.

## 3. Source inventory and definition of completeness

Create a checked-in, versioned source manifest before expanding the content.
Each source records URL, publisher, title, current/historical scope, retrieval
date, relevant section, revision or extract hash, and retrieval/review status.
Store only the minimum factual name inventory and short evidence notes needed;
do not copy entire copyrighted pages into the repository.

For every source-listed name, the inventory must record:

| Field | Requirement |
| --- | --- |
| `sourceEntryId` | Stable identifier for this source/version entry |
| `originalName` | Exact published name, separate from the display label |
| `sourceId`, `sourceSection` | Traceable origin; current vs archive explicit |
| `canonicalId` | One resolved measurement or documented bundled components |
| `disposition` | Included, alias, repeat measurement, or explicitly excluded |
| `reason` | Required for exclusions and ambiguous mappings |
| `homeCoverage` | Core card, extended family card, or contextual reference |
| `healthCoverage` | Existing field, new structured field, lab-library field, or intentionally not recordable |
| `referenceCoverage` | Numeric categories, lab-/method-specific context, eligibility, or no applicable range |
| `actionCoverage` | Specific plan, explicitly shared family plan, or no self-directed target |
| `searchCoverage` | Required queries and expected canonical destinations |
| `reviewStatus` | Pending, source-checked, or specialist review needed |

No source entry may disappear because an exact-string join failed. No ambiguous
mapping may count as implemented. Repeated baseline/follow-up tests are one
measurement with multiple source memberships, not extra unique biomarkers.

Report coverage by separate dimensions, with numerator and denominator:

1. Source entries accounted for, including transparent exclusions.
2. Included canonical measurements implemented.
3. Measurements with complete reference/context and action content.
4. Required search fixtures resolving correctly.
5. Measurements explicitly designated recordable with working result entry.

An exclusion may satisfy source reconciliation, but must not count as an
implemented measurement. A generic library row alone satisfies neither reference
guidance nor action-plan completeness. Do not use the old 144 count as a release
target; preserve it as a historical baseline fixture with its source version.

## 4. Required coverage and prioritisation

### P0: reported omissions and closely related core gaps

| Canonical measurement/family | Home requirement | Health requirement | Important distinction |
| --- | --- | --- | --- |
| HDL cholesterol | Standalone Cardiovascular card | Promote existing `hdl` field into the main lipid group; keep legacy ID | HDL is not non-HDL and is not an isolated treatment target |
| Total cholesterol | Standalone Cardiovascular card | Promote existing `totalchol`; keep legacy ID | Distinguish total, LDL, HDL and non-HDL |
| Grip strength | Fitness & body reference with measurement method and left/right context | Separate left/right values, unit, date and optional method/dominance metadata | Dynamometer reading is not hang time or gripper resistance |
| Bone mineral density (BMD) | Dedicated reference, separate from body composition | Site-specific lumbar spine, total hip and femoral neck observations; optional left/right side where applicable | BMD, T-score, Z-score and percentile are different quantities |
| Resting heart rate | Cardiovascular reference | bpm, date/period and resting/bedtime context | No universal instruction to minimise heart rate |
| HRV | Fitness & body recovery reference | Metric (e.g. RMSSD/SDNN), unit, device/method and period | Do not compare unlike metrics or present a universal target |
| Sleep duration/efficiency | Fitness & body recovery reference(s) | Duration and efficiency are separate fields, with date/period and method | Wearable estimates are not a sleep-study diagnosis |
| Weight, body fat, lean mass, VAT | Expand existing body-composition context into labelled components | Optional component fields with method and units | Do not infer BMD from body fat, BMI or VAT |
| VO2 max | Preserve existing reference and aliases | Optional result with test/wearable method | Estimated and directly measured values remain distinguishable |

P0 is a useful incremental release, not completion of the full inventory.

### P1: reconcile all existing and published lab coverage

- Cardiovascular/metabolic: complete lipid context, insulin, HOMA-IR, TG:HDL,
  IGF-1, advanced lipoprotein entries and related calculated ratios.
- Blood/immune/inflammation: CBC components and differential, NLR, ferritin/iron
  studies, hs-CRP, ESR, fibrinogen, autoimmune and other published panel entries.
- Liver/kidneys: enzymes, bilirubin, albumin/proteins, creatinine, BUN, cystatin C,
  eGFR, uACR and urine qualitative/microscopy entries.
- Micronutrients/electrolytes: every published entry plus existing B12/MMA
  references; distinguish intake recommendations from blood-test intervals.
- Thyroid/hormones: published thyroid, adrenal, reproductive and sex-specific
  entries, with age, physiological and assay context where necessary.
- Genetics/qualitative findings: ABO/Rh and other qualitative entries explain
  what the result means without an invented ideal or lifestyle treatment.
- Screening/imaging: retain the existing seven screening modalities and CAC
  reference, with eligibility, benefits/harms and follow-up context instead of
  forcing them into lab-style coloured numerical bands.

Every one of the existing 144 lab entries requires a row-level disposition and
guidance decision. The categories above do not substitute for that inventory.

### P2: broader public physical/specialist measurements

Reconcile all named current and archived entries: strength/performance tests,
sleep respiration/SpO2/body temperature, hearing, vision, oral/skin assessments,
vascular assessments, and specialist imaging/organ or biological-age measures.
Add other nutrients or trace elements only when the chosen source actually lists
them. Historical grip and DXA site lists must be accounted for explicitly.

These are inventory families, not a claim that every family is already verified
or appropriate for self-testing. Each named item receives the same include,
alias, repeat or exclusion decision. Supervised tests must say so. Extensions
such as CDC functional assessments must be labelled clinical additions, not
misattributed to Bryan. Full-scope completion includes P2 reconciliation;
deferred included entries must remain visibly incomplete in the coverage report.

## 5. Data contract and architecture

Use shared metadata and IDs, not a new framework or one monolithic data bundle.
Existing factual files remain the source until entries are deliberately migrated
with parity tests. No renderer should maintain its own medical names or aliases.

Proposed lightweight contracts:

```js
// Descriptive schema; module names are specified in the implementation plan.
{
  id: 'hdl',                    // retain an existing stable ID when possible
  label: 'HDL cholesterol',
  aliases: ['HDL', 'HDL-C', 'HDL cholesterol', 'high-density lipoprotein cholesterol'],
  kind: 'lab',                // lab | physical | imaging | derived | screening | qualitative
  groupId: 'cardiovascular',
  familyId: 'lipids',
  sourceMemberships: [],       // sourceEntryIds, not a marketing coverage count
  referenceKey: 'hdl',
  recordPolicy: 'structured',  // structured | library | components | not-recordable
  legacyIds: [],
  relatedIds: ['ldl', 'nonhdl', 'totalchol', 'tg', 'apob']
}
```

Detailed reference content, loaded by family when needed:

- Explanation; specimen/method; displayed units; applicability.
- Reference mode: clinical category, assay interval, population percentile,
  personal trend, screening eligibility, or no numerical range.
- Value boundaries and units only when source-supported and applicable.
- Source IDs for individual factual claims and each action, review date,
  limitations, related measurements and safety notes.
- Structured action items: verb-led title, concrete action, frequency/dose when
  supported, applicability/cautions, and evidence link.
- Explicit state when a measurement has no actionable self-directed target.

The lightweight index can be eagerly loaded for global search. Family-specific
guidance and advanced result controls stay route-/interaction-specific. Metadata
unification must not force Home to import the full Blueprint result-entry code.

### Observation contract for new physical measurements

Preserve raw entered value and report units. Each observation stores canonical
ID, value(s), unit, observed date or period, method/device where meaningful,
site/side where relevant, and an optional copied lab/report range. Unprovided
metadata remains unknown; do not fabricate a device, date, sex or demographic.

Use dedicated parsers for signed scores, percentages, durations and paired values.
The existing positive-number parser cannot be reused unmodified for negative
bone T-/Z-scores. Accept valid zero where meaningful; reject NaN/infinity and
malformed input without erasing the text. No inferred diagnosis from free text.

## 6. Reference and action-content rules

### General

- Bryan's protocol supplies an inventory, not clinical authority for targets.
- Prefer Singapore clinical/lab sources for local context; label any international
  guidance and its population. Record an access date and source section.
- Distinguish reference interval, treatment target, diagnostic category, personal
  result, percentile and proposed optimisation target in data and visible copy.
- When no universal range exists, provide specific method/applicability guidance;
  do not invent a three-band green/amber/red scale.
- No tests scheduled for everybody by default. Frequency is risk-/indication-based.
- Neither a source URL nor boilerplate such as “use your laboratory range” is
  enough: explain the particular result's limits and appropriate next step.

### HDL and lipids

HDL gets its own card and aliases. Explain cardiovascular context without
claiming that continually raising HDL prevents events, or that high HDL cancels
high LDL/ApoB. Actions address overall cardiovascular risk; never recommend
alcohol to raise HDL. Numeric context must be verified for the displayed
population and units. See the [AHA lipid guide](https://www.heart.org/en/health-topics/cholesterol/your-complete-guide-to-understanding-cholesterol-and-lipids).

### Grip strength

Specify dynamometer measurement, side, unit and reproducible protocol. Reference
comparisons require a cited population and compatible method; an unsupported
single “longevity goal” must not appear. Do not convert device resistance into
measured grip force. Appropriate strength/carrying exercises may be offered with
progression and injury cautions, not a guarantee of reaching a percentile.
Protocol reference: [NIH Toolbox grip-strength test](https://nihtoolbox.org/test/grip-strength-test/).

### Bone density

Support site-specific reported BMD (g/cm²), T-score and Z-score as separate
quantities; do not derive one from another without the required reference data.
Explain which scores apply to which population. Do not use a whole-body
composition percentile to classify hip/spine osteoporosis. Any classification
must follow the relevant eligibility and report context; avoid diagnosis from
the number alone. Actions include appropriate weight-bearing/resistance activity,
food-first nutritional adequacy and fall-risk considerations, with osteoporosis,
fracture and exercise restrictions respected. No universal supplement prescription
or automatic annual DXA interval. Basis: [ISCD adult positions](https://iscd.org/official-positions-2023/).

### RHR, HRV, sleep and composition

Capture repeatable conditions, method and date/period; keep unlike devices or
metrics separate. Avoid universal “higher is better” HRV or “lower is better” RHR
bands. Do not diagnose sleep apnoea from a wearable; concerning symptoms need
assessment. Body-composition interpretation is method-/population-dependent.

### Action plans

Keep practical steps below reference context on Home, not behind a flip or
“View actions” control. Use specific, supportable steps rather than “bring your
whole panel” or “ask about a test” as the entire plan. Safety/follow-up instructions
belong in a distinct section and may be the only appropriate next step for some
findings. Do not invent lifestyle actions for inherited blood groups, abnormal
blasts, or results needing clinical investigation merely to fill three slots.
Shared family plans must be explicitly identified and substantively relevant.

## 7. UX and information architecture

### Home

- Remains a reference guide, never a personal-result entry dashboard.
- Keep the seven existing group IDs and all existing deep links. Add subheadings
  for thyroid/hormones within the current structure rather than a new primary tab.
- Keep all current cards and plans visible. Add P0 cards to appropriate groups.
- Large specialist families may use labelled native disclosures within their
  group. Once opened, each card shows reference context and actions together.
  Do not move existing core actions into disclosures or flip cards.
- The contents rail/picker, current section, Top, previous/next links and normal
  document scrolling remain. A search-selected extended card must be loaded,
  revealed, scrolled to and focused without requiring a second manual disclosure.
- Search spans the complete included inventory, not just the initial 39 cards.
  Distinguish core vs extended destinations in results without implying lower quality.
- Loading/error states explain what is happening and allow retry; offline use must
  not depend on contacting clinical websites at runtime.

### Health

- Keep optional tracking here. HDL and total cholesterol join the lipid group
  instead of being hidden among optional specialist labs.
- Add a clearly labelled physical-measurements group. Do not make fitness results
  masquerade as blood tests or inflate the published lab-panel count.
- Provide one discoverable search entry that can find core, optional, physical and
  lab-library results, reveal the necessary parent groups and focus the field.
- Reuse existing accessible result/action behavior. A new measurement must not
  stretch, clip or distort a neighboring two-column card when its actions open.
- Keep recordable screening completion separate from numeric lab interpretation;
  no new scheduling/reminder feature is required.

### Layout and accessibility

Use established warm colours, local fonts and tokens. Retain one column on narrow
screens and aligned two-column shells where space permits. Use content-sized
layouts rather than fixed heights that clip guidance or enlarged text. A single
input boundary plus a distinct focus ring must not look like nested input boxes.
Units are visibly associated with fields and never overlap entered text.
Changing a supported reference unit updates the unit label and its source-verified
paired limits together. In Health, changing a report-unit selector must clearly
state that the entered number is unchanged and must update applicable reference
context/status; never leave mmol/L thresholds beside an mg/dL-labelled result.
Unsupported units retain report-specific context rather than a guessed conversion.

Keyboard opening/closing, visible focus, landmark/heading order, live search
counts and safe-area clearance are required. Prefer native `<details>` and
ordinary fragment links; don't add a custom listbox unless its complete keyboard
contract is implemented. No gesture-only actions or hover-only information.
Support 320/390/768/1440px, landscape, 200% text, reduced motion and print.

Native Find can discover loaded native-disclosure content where the browser
supports that behavior. It cannot search content not yet fetched. App search
must cover the full index regardless; do not claim full native Find coverage
for unloaded families. Printing should load/expand reference content or explicitly
offer a complete-reference print path before invoking print.

## 8. Search contract

Share normalization/alias resolution across Home and Health while allowing
different destination renderers. Normalise case, whitespace, hyphens, accents,
subscripts and supported punctuation without collapsing semantically distinct IDs.

Rank: exact canonical label/alias > token/prefix name matches > related matches.
Related matches must be labelled and cannot outrank an exact measurement. Do not
use arbitrary substring matching to turn HDL into non-HDL. Broad words may return
multiple results; preserve meaningful measurement distinctions in every label.

Minimum executable fixtures:

| Queries | Required best destination |
| --- | --- |
| HDL; HDL-C; HDL cholesterol; high density lipoprotein | HDL, not non-HDL |
| non HDL; non-HDL-C; nonhdl | Non-HDL, not HDL |
| total cholesterol; total chol; TC | Total cholesterol |
| grip; hand grip; handgrip; grip strength | Grip reference; left/right fields discoverable |
| bone density; BMD; bone mineral density; T-score; Z-score | Bone-density reference; score/site options explicit |
| DXA; DEXA | Both bone density and body composition, distinctly labelled |
| VAT; visceral fat | Body-composition/VAT reference |
| RHR; resting heart rate | Resting heart rate |
| HRV; heart rate variability | HRV |
| VO2; VO₂ max; vo2max | Cardiorespiratory fitness |
| sleep; sleep duration; sleep efficiency | Appropriate distinct sleep references |
| TSH; free T4; CBC; haemoglobin; hemoglobin | Corresponding included references, not unrelated keyword hits |

No-match feedback suggests useful names and does not falsely announce that a test
is medically unnecessary. Announce counts without moving focus on every keystroke.
Enter/arrow/Escape behavior, result activation, browser Back, reload and copied
deployment-relative URLs must remain predictable. All required aliases work offline.

## 9. Saved-data compatibility and deduplication

Keep existing IDs, keys and values readable:

- `sg-health-baseline-v1`: age, sex, values and units.
- `blueprint-marker-results-v1`: result, unit, report range and collection date.

Promoting HDL/total cholesterol must not create new fields or erase their values.
Canonical metadata may map both legacy representations, but must not silently
choose between conflicting observations, attach a date to an undated result,
convert a value when a unit selector changes, or count one observation twice.

For the initial release, preserve both legacy stores and clearly distinguish
conflicting entries. A canonical resolver may route an existing result to its
original field; storage consolidation is not required to fix coverage. New
physical fields may use a versioned additive store. If consolidation is later
implemented, it needs an idempotent migration, retained legacy data, deterministic
conflict handling and rollback tests before activation.

Dates, methods, body site, left/right side and units are part of observation
identity. A later test and a repeated measure on the other hand are not duplicate
records merely because their canonical measurement family is the same.

## 10. Safety, privacy, performance and offline contract

- Results remain local. No medical result text in analytics, requests or query
  strings. Fragment links identify a measurement, never encode a person's value.
- Escape report text and treat unknown/malformed storage safely. Storage denial
  or quota exhaustion must report session-only behavior without erasing data.
- Do not reinterpret old unit labels or migrate unsupported units speculatively.
  Lp(a) retains no fixed mg/dL-to-nmol/L conversion.
- Runtime stays dependency-free. Keep detailed content out of unrelated route CSS
  and JavaScript. No new runtime network dependency or design-tool requirement.
- Keep existing performance budgets unchanged: Home/Ingredient-guide initial JS
  <=90,000 decoded bytes; Nutrition CSS <=190,000 and JS <=160,000; throttled LCP
  <=2,500ms, usable <=3,000ms, CLS <=0.1 and existing interaction/long-task limits.
- Measure Home/Health search input-to-painted results; target <=200ms under the
  existing desktop 4x CPU test profile. Add a test rather than asserting speed.
- Precache all new local data/modules. Bump the app-scoped cache version only for
  runtime changes; preserve caches belonging to other apps on the same origin.
- Test an update from the existing version with saved values, not only a fresh
  installation. Offline search, deep links and newly added reference/result
  controls must all work after first successful caching.

## 11. Acceptance and release gates

Full release is complete only when all of the following are true:

1. The source manifest and row-level inventory are reviewed; zero unaccounted
   source entries and zero ambiguous included mappings remain.
2. Every included measurement has a usable reference destination, specific context,
   appropriate actions/no-self-treatment rationale, sources and reviewed aliases.
3. P0 omissions are implemented; all designated result-entry paths persist their
   values correctly. Broader scope is not silently deferred while called complete.
4. Search fixtures pass on Home and Health, including HDL vs non-HDL, bone density
   vs composition and the old deep links.
5. Legacy data, conflicts, unavailable storage and unit-switching behaviors pass.
6. Mobile/desktop layout, keyboard/accessibility, action visibility, print and
   reduced-motion checks pass; screenshots are reviewed before baseline updates.
7. Audit, fast/full browser suites, content/coverage tests and performance budgets
   pass without weakening assertions, budgets or screenshot tolerances.
8. GitHub Quality and Pages deployment succeed for the same tested SHA. Live
   asset/version, search, saved-result and offline checks pass in isolated contexts.
9. Handoff states source/version scope and known limits. Do not claim specialist
   clinical approval, physical-device testing or a perfect experience without evidence.

## 12. Source register for implementation research

Sources checked for this specification on 2026-11-01; this is a starting register,
not a completed per-measurement clinical evidence review.

- [Official published lab panel](https://immortals.com/pages/biomarkers): scope and
  named lab entries. Browser-extracted content was accessible; a direct automated
  request during the audit returned 429. Do not interpret that as an empty panel.
- [Current public protocol](https://protocol.bryanjohnson.com/): published physical
  measurement examples, including grip strength and bone mineral density.
- [Historical protocol museum](https://protocol-museum.bryanjohnson.com/): archived
  grip left/right, DXA sites, sleep and other measurement lists; historical only.
- [AHA lipid guide](https://www.heart.org/en/health-topics/cholesterol/your-complete-guide-to-understanding-cholesterol-and-lipids): HDL is contextual, not an isolated treatment target.
- [ISCD adult positions](https://iscd.org/official-positions-2023/): bone-density
  measurement, site and score-population distinctions.
- [NIH Toolbox grip-strength test](https://nihtoolbox.org/test/grip-strength-test/):
  measurement-method starting reference; verify full protocol before authoring steps.
- [CDC STEADI clinical resources](https://www.cdc.gov/steadi/hcp/clinical-resources/):
  optional clinical functional-assessment references, not proof of Bryan's test list.
- [MDN details element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details): native disclosure semantics; implementation must verify supported-browser behavior.

Unresolved numeric reference ranges are research tasks, not approved placeholders.
Do not populate production bands from this planning document alone.
