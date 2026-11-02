# Versioned measurement coverage review

Engineering/source review: 2026-11-02. Clinical specialist approval is **not** claimed.
This supersedes the pending implementation statuses in the frozen original captures;
those captures remain unchanged so the original omissions remain reproducible.

## Scope and counts

Correction following the B12 screenshot: the completed review below concerns
source names, destinations and contextual guidance, **not complete numerical
reference-range coverage**. That distinction was insufficiently prominent.
Numerical-reference review remains partial: 59 explicitly sourced laboratory
examples, 15 existing banded references, and 284 other guidance destinations.
The latter include formulas, study estimates, screening and qualitative tests;
they have not all been classified for numerical-interval applicability. Do not
describe these counts as 358 complete reference ranges.

| Dimension | Verified inventory |
| --- | --- |
| Source entries accounted for | 663 / 663 |
| Included distinct reference destinations | 358 / 358 |
| Included destinations with context and an action/follow-up rationale | 358 / 358 |
| Source-name → destination search fixtures | 652 / 652 |
| Canonical measurements designated recordable | 159 |
| Explicitly excluded source entries | 38; not counted as implemented |

Source memberships: 230 published baseline/sex-specific/follow-up lab entries,
325 archived measurement entries, 22 current protocol measurement examples,
84 original application entries and two explicitly labelled application additions
(lean mass and VAT). Repeats, imaging sequences, specimen bundles and multiple
source memberships do not inflate the unique-destination count. A family/context
destination is not a claim that its component quantities are identical assays.

The published panel remains 144 unique lab analytes; the whole guide is not
marketed as 358 blood tests. Initial Home content remains 51 core cards; 307
additional references load on demand inside the existing seven groups.

## Numerical-interval correction (2026-11-02)

- Added numerical examples to 40 destinations: B12, ferritin, ALT, AST, GGT,
  ESR, homocysteine, cystatin C, 15 CBC/count indices, sodium, potassium,
  creatinine, chloride, serum bicarbonate, total calcium, albumin, total
  protein, total bilirubin, magnesium, serum iron, TSH, free T4, TPO antibodies,
  urate, amylase and phosphate. Core examples are available immediately;
  the larger registry is demand-loaded. Exact values/populations/units and
  individual source URLs live in `core-lab-intervals.js` and `lab-intervals.js`.
- Main primary sources: [KKH eLab catalogue](https://www.kkh.com.sg/our-specialties/elab-book/vitamin-b12),
  [NUH full blood count](https://nuhsingapore.testcatalog.org/show/FBC),
  [NHG Woodlands renal panel](https://www.nhghealth.com.sg/wh/our-partners/laboratory-services/test-catalogue/renal-panel),
  [SGH free T4](https://www.sgh.com.sg/our-specialties/pathology/pathology-lab-services/thyroxine-t4-free-serum).
  Cystatin C uses an explicitly labelled [Alfred Hospital Australian assay example](https://pathology.alfred.org.au/handbook/search?testid=870),
  including its May 2026 reagent update; it is not represented as a Singapore interval.
- Added paired published Singapore screening guideposts for HDL and total
  cholesterol from [NUS University Health Centre](https://www.nus.edu.sg/uhc/articles/details/screening-for-heart-disease).
  These are explicitly risk thresholds, not population intervals or treatment goals.
- Retained clinical interpretation and action plans. No green/amber/red bands
  were invented for lab intervals. Ferritin's lower lab bound does not establish
  iron sufficiency. Sex, age, specimen and assay caveats remain visible.
- No guessed BUN/urea, free/total hormone, absolute-count/percentage or Lp(a)
  mass/molar conversions. Units on each example remain explicit when the global
  alternative-units control has no source-backed paired interval.
- The reconciliation now reports numerical coverage separately and rejects
  removal of any required registry interval. The reviewed snapshot covers
  numeric metadata as well as displayed text. This is source transcription and
  engineering review, not independent clinical validation or a blanket testing plan.

## Additional laboratory examples (2026-11-03)

- Added 19 independently source-checked examples: morning cortisol, prolactin,
  total and calculated free testosterone, FSH, LH, SHBG, estradiol, AMH,
  free T3, ALP, lipase, zinc, TIBC, transferrin saturation, BUN, urine
  specific gravity, urine pH and vitamin C. Each registry row retains its
  laboratory, population/method, units, source URL and individual review date.
- KKH hormone tables retain age and physiological-state distinctions; broad
  cycle-dependent intervals are not presented as fertility or hormone targets.
  Estradiol is explicitly an upper-limit example. Calculated free testosterone
  uses the Vermeulen equation, not a direct free-testosterone assay.
- SGH chemistry examples preserve the catalogue's specimen and age scope.
  [Mayo BUN](https://renal.testcatalog.org/show/BUN) remains in mg/dL, not
  silently relabelled as urea. [Iowa urinalysis](https://www.healthcare.uiowa.edu/path_handbook/handbook/test2590.html)
  supplies urine-only pH and relative density. [Alfred vitamin C](https://pathology.alfred.org.au/handbook/index?testid=190)
  supplies the HPLC interval, not a daily intake recommendation.
- All additions remain demand-loaded; initial Home code and the 51 core cards
  are unchanged. The offline cache revision advances to v60 and retains the
  HTTP-cache-bypassing installation fix. No result data or units are migrated.
- Outstanding applicability review still includes additional micronutrients,
  lipid subfractions, hormones, specialist physiological measurements and
  qualitative tests. The 284 context destinations must not be represented as
  284 tests proven to have no numerical interval.
- Local verification: audit and reviewed snapshot passed; all 118 quick checks
  passed across desktop/mobile Chromium, including new direct-link range and
  assay-context regressions; all four performance checks passed unchanged budgets.
  No CSS, renderer, saved-store schema or visual baseline was changed in this batch.

## Reproducible row-level evidence

- Original captures: `biomarker-coverage-inventory.json`,
  `published-panel-reconciliation.json`, `current-protocol-measurement-extraction.json`
  and `archived-measurement-extraction.json`.
- Independently captured remaining organ/fitness labels, unfinished entries and
  contextual source sections: `protocol-measurement-supplement.json`.
- Explicit reviewed name decisions, bundles and exclusion reasons:
  `js/data/protocol-measurement-mappings.js`.
- `node scripts/reconcile-measurements.mjs --json` emits every source row with its
  original name, source/section, canonical destinations, disposition/reason,
  Home/Health coverage, reference/action sources, record policy and search fixture.
- `npm run coverage` requires zero unresolved entries, substantive linked guidance,
  reachable search identities and an exact match with the reviewed checksums in
  `measurement-coverage-review.json`. The normal audit/CI invokes the same gate.
  Changed captures, mapping decisions or reference content require a reviewed
  snapshot update; the gate never rewrites or blesses its own fixture.

## Important decisions

- Undefined ETS/QT/PSEM labels remain excluded rather than guessed. The malformed
  QFISH/RRI-left line is explicitly represented as two contextual destinations.
- Unfinished organ wishlists, unspecified specimen/device bundles, the `[other]`
  placeholder and undefined CPM abbreviation are accounted for but not counted
  as implemented tests. The actual named CGM measurement has its own reference.
- Cosmetic eyelash length and undefined pinna age are not assigned health targets.
  The hearing bundle explicitly marked TBC is not represented as completed testing.
- Self-examination schedules are not promoted to universal cancer-screening rules.
  Existing risk-appropriate breast and other screening references remain available.
- Muscle estimates are distinct from lean mass; left/right hearing and artery
  segments remain distinct. Hip/spine/femur source labels reach bone-density
  context without guessing that an unspecified femur result means femoral neck.
- Direct and methylation-predicted telomeres, DHEA and DHEA-S, PSA analytes and PSA
  screening, brain and heart ventricular volumes are not silently merged.
- Shared plans are labelled. Nutrient references include concrete food choices;
  research, qualitative and specialist results use appropriate no-self-treatment
  or follow-up advice rather than invented coloured bands or supplement targets.

## Guidance evidence

The linked clinical sources, not the protocol's personal results, provide the
interpretation context. New references were checked against NLM/MedlinePlus
(lung function, echo, hearing, cognitive testing, EEG, glaucoma, semen, BNP),
NIH ODS individual nutrient sheets, NHLBI sleep studies/activity, FDA pulse
oximetry limitations, NIDDK CGM/erectile-function/EPI information, CDC STI and
STEADI resources, NIDCR gum-disease guidance, AAD skin/hair guidance,
ACR/RSNA RadiologyInfo imaging information and Mayo osteocalcin assay information.
The Stanford expert explanation is used only for limitations of ageing clocks,
not to prescribe a treatment or numerical goal. Every reference retains its
specific evidence URL; no clinical website is fetched by the app at runtime.

Source-linked context is not independent specialist endorsement. Assay-specific
tests intentionally have no invented universal interval. Personal percentiles,
modelled ages and experimental gene-therapy monitoring are not clinical targets.

## Remaining limitations, not hidden work items

This release covers the named sections in the versioned source captures, not
every lifetime test, unpublished record, future protocol revision or experimental
therapy. Historical names are labelled as such. Specialist results remain in
their full original report; reference-only entries have no fake data-entry form.
The 159 designated recordable measurements use existing structured, physical or
lab-library paths, preserving independent legacy observations and all raw units.
No clinician approval, physical-device certification or guarantee of reaching a
target is claimed. Deployment/test evidence is recorded in the progress log.
