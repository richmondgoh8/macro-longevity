# Versioned measurement coverage review

Engineering/source review: 2026-11-02. Clinical specialist approval is **not** claimed.
This supersedes the pending implementation statuses in the frozen original captures;
those captures remain unchanged so the original omissions remain reproducible.

## Scope and counts

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
