# Biomarker coverage implementation plan

Status: source-name/context scope completed; numerical-reference review partial.
Latest verified runtime: `678b3b2` (numerical correction).
Numerical-reference correction (2026-11-02): the completed scope above was
source-name/context coverage, not complete numerical ranges. Forty published
lab examples now have explicit units, lab and population metadata; numerical
applicability review remains partial. Preserve this distinction in release claims.
Date: 2026-11-01. Baseline: `363eb4b`.
Requirements: [Coverage specification](biomarker-coverage-spec.md).

## Current execution checkpoint

This plan retains the original phase sequence for traceability. Do not restart
completed work or describe its historical baseline as the current website.
The [progress record](biomarker-coverage-progress.md) documents the published P0
slice and the completed versioned-scope release, with test/deployment evidence
and explicit scope/clinical limitations.

| Workstream | Current state | Next exit condition |
| --- | --- | --- |
| Source inventory | 663 versioned source entries accounted for; 38 explicit exclusions; frozen baseline preserved | Preserve reviewed source/mapping checksums in the full coverage gate |
| Identity/search | 358 distinct destinations and 652 source-name fixtures; Home and Health verified | Preserve the full coverage gate for future changes |
| Numerical applicability | 40 published lab examples, 15 banded references, 303 other guidance destinations; deployed as `678b3b2` | Classify the remaining destinations individually; add verified intervals where applicable and explicit reasons where no universal numerical interval is appropriate. Do not infer completeness from name coverage. |
| Reported P0 gaps | Incremental release shipped with 51 Home cards and 13 physical cards | Preserve regressions; finish evidence/status reconciliation rather than rebuilding fields |
| Specialist guidance | Full chosen current/archive scope implemented, including reference-only specialist/research entries and row-level evidence | No independent clinical-specialist approval is claimed |
| Release hardening | Full suite, reviewed screenshots, expanded search budgets, upgrade, exact-SHA deployment and live smoke passed | Continue existing fast CI and manual/weekly full checks |

## Published lab guidance slice — implemented and deployed as `ff920d6`

Deliver a bounded, usable extension before tackling the remaining historical
organ/sensory inventory. This slice is not full-scope completion.
The steps below are completed for the captured published lab panel; release
evidence and the remaining current/archive work are in the progress record.

1. Add explicit canonical mappings for existing optional fields. Keep blood/urine,
   PSA screening/PSA analytes, and unlike methods distinct. First add regressions
   that expose missing destinations; do not join clinical identities by fuzzy name.
2. Add reviewed lab-reference data in `js/data/`, with an explicit row for every
   unique entry in the independently captured published panel. Reuse existing
   core destinations. Shared family plans must be visibly labelled and relevant;
   each entry still needs its own meaning and interpretation limits.
3. Extend `js/home-dashboard.js` with labelled native specialist disclosures inside
   the existing seven groups. Keep all 51 core references and actions visible.
   Load rich guidance on demand; never import result-entry controls into Home.
4. Extend `js/components/reference-navigation.js` so full-index search, direct
   fragments, copied URLs, reload and browser Back load/reveal/focus the actual
   destination. Handle failed loading with retry and guard against stale searches.
5. Link each `js/biomarker-library.js` row to its canonical reference. Do not add
   duplicate result controls or merge independent saved observations.
6. Provide a complete-reference reading/print path that loads and expands extended
   content before printing. Do not claim browser Find searches unfetched modules;
   an ordinary print must not silently suggest unloaded content was included.
7. Test representative numeric, qualitative, inherited and specialist entries,
   plus full row-level mapping/content assertions. Verify lazy-load failure/retry,
   offline deep links and search timing, then run the applicable full gates.

Slice exit: all unique published lab entries have a reviewed destination and
tested search path, no duplicate canonical cards, no lost stored values, unchanged
initial-load budgets and honest print behavior. The historical/current physical
and specialist reconciliation remains a separate required slice afterward.

## Requirement-to-evidence checklist

| User concern | Required evidence before full completion |
| --- | --- |
| Missing HDL, grip and bone density | Dedicated references; exact aliases; left/right grip and separate BMD site/T-/Z-score fields; save/reload tests |
| “All” published measurements | Versioned independent source fixture; row-level included/alias/repeat/excluded decisions; separate accounted/implemented/guidance/search/recordable counts |
| Useful ranges and practical steps | Per-entry applicability, units and sources; actions immediately below context; justified no-target mode where needed; recorded evidence review |
| Long-page navigation | Full-inventory search, mobile contents, desktop rail, current group, Top, adjacent sections, deep-link/reload/Back and focus tests |
| Aligned cards and clean inputs | Reviewed 390/1440px screenshots plus 320/768px, landscape and enlarged-text checks; opening one card does not distort its neighbor; no nested borders or overlapping suffixes |
| Unit switching explains itself | Number remains unchanged; visible unit-change feedback; applicable reference/status updates; Lp(a) conversion guard |
| No unwanted clutter | Home remains read-only; no “Record and review my results” CTA; no new primary tabs or decorative dashboard widgets |
| Sleek native implementation | Reuse existing tokens, spacing, typography and semantic controls; no design-service dependency, framework or unnecessary runtime packages |
| Fast workflows and deployment | Fast deterministic regressions in quick CI; expensive checks remain full/manual/weekly; same tested SHA deployed, changed assets matched and isolated live smoke verified |
| Reliable offline upgrade | New assets cached; old worker and old saved-store upgrade exercised; unrelated origin caches and all legacy values preserved |

For each implementation slice, record its requirement IDs/rows, changed files,
test commands/results, reviewed screenshots and remaining gaps in the progress
document. A green suite does not replace source/content review, and a polished
screen does not replace inventory completeness.

## 1. Delivery strategy

Use small, reviewable changes in the current HTML/CSS/ES-module application.
Start with inventory and failing regressions, deliver the reported gaps next,
then finish the full source reconciliation. A P0 release may ship independently
but must be described as partial. Final completion requires every included item
in the reconciled inventory, not a visually convincing subset.

Dependency sequence:

```text
Source inventory + baseline fixtures
             ↓
Shared IDs/aliases + reference-content contract
             ↓
P0 reference cards + search + physical result fields
             ↓
Full lab and broader-measurement reconciliation
             ↓
Compatibility, accessibility, offline and performance gates
             ↓
Tested-SHA deployment + live acceptance
```

Research and engineering roles below are work responsibilities, not claims that
a clinician has reviewed the content. Record a named reviewer/date where an
actual specialist review is performed. No time estimate substitutes for a gate.

## 2. Phase A — freeze scope and capture the baseline

### A1. Source manifest and inventory

Owner: content/research; engineering validates the schema.

- Add `js/data/measurement-sources.js` with compact source metadata only.
- Add `docs/specs/biomarker-coverage-inventory.json` containing one disposition per
  source entry and its canonical mapping; it must not include patient data.
- Seed from all 144 current library entries, all 39 current Home references and
  all 45 existing structured fields; reconcile overlaps instead of adding counts.
- Extract named current-protocol and archive measurements, label their provenance,
  and include the P0 list in the spec. Identify every unresolved alias/bundle.
- Record retrieval failures explicitly. Retry safely or verify through accessible
  primary-source content; never turn an empty/blocked response into zero entries.
- Make the included/excluded scope explicit. No empty “other measurements” family
  may stand in for a reconciled list.

Deliverable: complete source accounting with provisional implementation statuses.
Gate: zero unexplained source entries; no claim yet that all content is implemented.

### A2. Baseline behavior and data fixtures

Owner: engineering/QA.

- Add named failing cases for Home HDL, total cholesterol, grip, BMD and search
  aliases, plus Health HDL discoverability and physical fields.
- Capture existing deep links, seven group IDs and saved-store structures.
- Add fixture data for `hdl`/`totalchol` saved units, independent lab-library
  results, conflicting copies, malformed storage and storage denial.
- Record current first-load transfer sizes and performance using the existing
  test profile. Keep old source-panel cardinalities versioned, not universal.

Files: `tests/biomarker-library.spec.js`, `tests/marker-coverage.spec.js`,
`tests/reference-navigation.spec.js`, new `tests/measurement-catalog.spec.js`.
Gate: tests reproduce the omissions without changing unrelated behavior.

## 3. Phase B — shared measurement identity and search

### B1. Lightweight canonical index

Owner: engineering.

- Add `js/data/measurement-index.js`: canonical IDs, labels, aliases, type,
  family/group mapping, source memberships, legacy IDs and recording policy.
- Keep existing IDs such as `hdl`, `totalchol`, `apob`, `dexa` and existing
  `#biomarker-*` URLs. Add a new BMD ID; never repurpose `dexa` to mean bone density.
- Map library-normalised IDs explicitly to canonical IDs; do not use fuzzy
  matching to join clinical identities. Preserve original source names.
- Leave detailed source-specific ranges/actions in reviewed factual modules;
  use narrow adapters while migrating existing data, not a wholesale rewrite.
- Document the alias collision rules and unit/method distinctions in tests.

Gate: one metadata identity per measurement; every source mapping resolves, and
Home does not eagerly import the full result-entry library.

### B2. Shared search resolver and route-specific destinations

- Add `js/components/measurement-search.js` for normalization, matching and rank.
- Update `js/components/reference-navigation.js` to use it for Home results.
- Update `js/biomarker-library.js` and Health search to use the same aliases.
- Add Health's search control to `js/health-dashboard.js`; activate the appropriate
  lazy module and nested group before focusing a result field.
- Exact HDL must outrank related Non-HDL; DXA must expose both distinct meanings.
- Preserve existing keyboard, Back, copy-link, deployment-subpath and focus rules.
- Keep result rendering separate from matching. No remote search API, heavy search
  package or unnecessary custom ARIA widget.

Gate: every fixture in spec §8 passes, including a clear no-match state and
offline search. An unmatched specialist entry is not “covered” by a related card.

## 4. Phase C — P0 content and presentation

### C1. Reviewed content and Home cards

Owner: content/research; engineering owns rendering.

- Add HDL and total cholesterol to Cardiovascular; write their own contextual
  references rather than borrowing LDL targets.
- Add grip and BMD references to Fitness & body; expand method-specific composition,
  VO2, RHR, HRV and sleep content according to the P0 table.
- Keep actions below ranges/context. Separate safety/follow-up from routine actions.
- Attach claim/action source IDs, applicability and review dates. Verify any
  numerical band before use; neutral contextual cards are valid and required
  when there is no universal numerical target.
- Preserve the existing seven groups and all original visible reference/action
  cards. Add clearly labelled extended families only as necessary for scale.

Files: `js/data/health-reference-groups.js`, `js/data/reference-ranges.js`,
`js/data/screening-actions.js`, and new family data modules when justified.
Renderer: `js/home-dashboard.js`; styles: `css/singapore-health.css` only where needed.

Gate: core omissions have dedicated, source-supported destinations and relevant
actions; no test count or generic copied boilerplate is accepted as content review.

### C2. Discoverable Health fields

- Move existing HDL and total-cholesterol fields into the main lipid group;
  remove duplicate rendering from the optional group, not their saved data.
- Update optional-group wording so it no longer advertises moved fields.
- Add a physical-measurements group using an on-demand module such as
  `js/physical-measurements.js` and `js/data/physical-measurements.js`.
- Use typed fields for grip left/right, BMD site/score values, RHR, HRV,
  sleep and composition rather than forcing them through a positive lab-number
  parser. Explicitly test a negative bone score and valid zero/blank handling.
- Add a versioned additive local store (proposed `health-physical-results-v1`)
  without renaming or deleting existing keys.
- Keep dates/method metadata optional unless essential to interpretation; explain
  missing context instead of blocking simple report recording unnecessarily.
- Keep two-column cards aligned and actions independent, with no fixed-height
  clipping, double input borders or overlapping units at enlarged text sizes.

Gate: entries are discoverable, keyboard-operable, correctly labelled, persistent
after reload and unit-safe. Their presence does not change lab-panel counts.

## 5. Phase D — full reference guidance and extended coverage

Owner: content/research plus engineering, family by family.

Suggested slices: lipids/metabolic → CBC/immune → liver/kidney/urine →
micronutrients/electrolytes → thyroid/hormones → physical/specialist → screening.

For each slice:

1. Resolve every source entry and duplicate to the canonical index.
2. Write the explanation, method, units, source-supported reference/context,
   action or explicit no-self-treatment rationale, safety and source metadata.
3. Link every library row to its real reference destination. Remove redundant
   generic guidance only after the replacement is tested; do not delete values.
4. Make all aliases searchable on both surfaces and ensure lazy destinations open
   correctly from direct fragments, search, reload and browser Back.
5. Update the coverage inventory and add row-level tests for this slice.

Keep a lightweight full search index. Load detailed extended-family modules on
disclosure/search demand to preserve initial Home budgets. Existing core cards
remain initially rendered. Ensure direct-link loading is deterministic and handles
failure without stale focus or repeated requests. Do not virtualise away reference
cards just to improve a performance number.

Historical/experimental items must have explicit status and limitations. They may
be contextual and not recordable, but cannot be silently absent. A responsible
exclusion requires a source-entry record and reason; it does not boost the
implemented-coverage percentage.

Gate: every included inventory row has complete reference/action/search coverage;
all intended tracker/library paths work. Pending content means this phase is not done.

## 6. Phase E — compatibility and quality gates

### Data integrity

Files: existing Health/library modules, new physical store, optional narrow legacy adapter.

- Verify pre-upgrade `hdl` and `totalchol` records reappear in promoted fields.
- Preserve report text, signed scores, dates, methods and typed units exactly.
- Keep conflicting main/library results distinguishable; no automatic newest-wins
  rule when a legacy result has no timestamp. No broad storage consolidation needed.
- Test zero/negative/decimal values per type, unavailable storage, quota failures,
  malformed JSON, unexpected keys and malicious text.
- Changing display/reference units must not convert saved report values. Preserve
  the existing distinction between display ranges and internal supported status checks.

### Content/coverage validators

Add `scripts/audit-measurement-coverage.mjs` and wire it into `npm run audit` only
after it has deterministic local inputs. It must not scrape live sites in CI.

Validate IDs, mappings, required content fields, source references, unit labels,
reference modes, unique DOM targets, alias ownership and included-item coverage.
Keep a separate independent source-entry fixture: do not compute the expected
inventory solely from the renderer's own array and call that completeness.

Add mutation-style checks: deleting HDL, grip or BMD, removing an alias, orphaning
a source entry, or replacing a specific plan with generic boilerplate must fail
the relevant coverage/content check. A source URL alone does not prove a claim;
the human evidence-review checklist remains required.

### Real-browser regression matrix

| Area | Required cases |
| --- | --- |
| Reported gaps | HDL/total cholesterol reference cards; grip/BMD references and designated fields |
| Search | Every spec alias; HDL vs non-HDL; DXA's two meanings; no matches; keyboard and focus |
| Navigation | Current section, Top, adjacent groups, old/new fragments, copy URL, reload and Back |
| Content | Reference and actions visible together; assay/age/method limits; no fabricated qualitative target |
| Physical fields | Left/right grip; BMD site/T-/Z-score distinction; method/date metadata; signed score parsing |
| Storage/units | Old results, conflicting stores, reload, empty input, denied/full/malformed storage; paired unit/reference updates without changing entered values |
| Responsive | 320/390/768/1440px, landscape, 200% text; aligned cards; one card opening independently |
| Accessibility | Keyboard-only completion, focus not obscured, contrast, labels, search announcements, reduced motion |
| Offline/update | Fresh install and old-worker update; search/deep links; physical fields; all new modules cached |
| Performance | Existing budgets unchanged; search-to-painted-result <=200ms under the existing CPU profile |

Extend `tests/marker-coverage.spec.js`, `tests/biomarker-library.spec.js`,
`tests/reference-navigation.spec.js`, `tests/service-worker.spec.js`,
`tests/ui-polish.spec.js` and `tests/performance.spec.js`; use dedicated physical
tests if it keeps the existing files understandable. Add only fast deterministic
coverage regressions to `test:quick`; keep costly visuals/performance in the
full/manual/weekly gate. Do not redesign GitHub workflows as part of this change.

Verification commands, after the relevant code exists:

```sh
node --check <each-changed-module>
npm run audit
npm run test:quick
npm run test:ui
npm run test:perf
git diff --check
```

Review screenshots before changing baselines. Do not weaken tolerances or budgets.
Try available non-Chromium engines and real devices; report anything unavailable
instead of claiming those platforms were tested. No physical-device claim is a
substitute for the source, data or content gates.

## 7. Phase F — staged publication and live acceptance

- Freeze runtime files after verification; update source scope/review notes and
  reconcile every inventory status with the actual tested implementation.
- Add new local assets to `sw.js`, advance its app-scoped version and update cache
  expectations. Check route-relative URLs under `/macro-longevity/`.
- Commit the focused change; push only when implementation/publication is authorised.
- Confirm both GitHub Quality jobs pass, then Pages publishes that same SHA;
  preserve the current tested-revision/stale-deployment safeguards.
- Compare deployed changed assets with the tested local files.
- In an isolated live browser, test Home HDL, grip and BMD search/navigation;
  Health promoted/physical fields; save/reload and no browser errors.
- After the new worker controls the page, go offline and repeat the new search,
  reference deep links and physical-result flow. Verify all app assets cached and
  unrelated origin caches retained.
- Perform an old-store/old-worker upgrade check in an isolated profile; never
  change a user's real saved health records for deployment validation.

Rollback: publish a focused revert of runtime changes with a new cache version;
never erase localStorage to hide a compatibility issue. Preserve additive physical
records so a subsequent fix can read them. Reverting HTML alone is insufficient
when an old service worker still serves incompatible assets.

## 8. Risks and explicit decisions

| Risk | Decision / mitigation |
| --- | --- |
| “All biomarkers” is unbounded | Pin named sources/sections/versions; publish denominator and exclusions |
| Personal results treated as medical targets | Separate inventory provenance from clinical evidence; verify claims individually |
| Card count grows into clutter | Seven groups, extended family disclosures, complete app search and persistent contents |
| New content breaks first-load budget | Lightweight metadata; demand-loaded rich families; enforce current budgets |
| HDL/non-HDL alias collision | Exact alias ownership and negative assertions; avoid substring identity joins |
| DXA conflates composition and BMD | Distinct IDs, score/site fields and references; retain old DEXA link |
| Data consolidation loses observations | Preserve legacy keys; additive stores; explicit conflicts; defer broad migration |
| Source content blocked or changes | Retrieval status, checked-in factual fixtures, reviewed diffs; no live CI scraping |
| Specialist measurements lack safe targets | Contextual/no-self-treatment mode; do not fabricate a range or exercise plan |
| Search points at unloaded/missing cards | Await family load/open; deterministic target IDs; offline and error tests |

Default product decisions are specified: native implementation, Home read-only,
Health owns recording, seven groups/five primary destinations retained, no new
history/cloud system and no universal longevity targets. Outstanding work is
source reconciliation, evidence review and implementation—not a request for the
user to choose an unrelated redesign.

## 9. Handoff evidence and completion checklist

- [x] Versioned source manifest and full row-level inventory exist.
- [x] No unexplained/ambiguous included source mappings remain; exclusions are explicit.
- [x] Each included item has a tested reference/context, actions and aliases.
- [x] All P0 omissions and designated physical-result fields are implemented.
- [x] Lab/specialist rows have real reference destinations, not only generic fields.
- [x] Legacy values, conflicts, unit changes and signed scores pass regression tests.
- [x] Browser suites, content audit and performance gates pass unchanged.
- [x] Screenshots and keyboard/mobile/zoom flows are reviewed.
- [x] Tested SHA is live; new cache and offline/upgrade flows pass.
- [x] Final report includes coverage dimensions, source versions and honest limits.

Checked against runtime `6535d61`; see [implementation progress](biomarker-coverage-progress.md)
and the [scope/source review](measurement-coverage-review.md). This completes the
documented versioned scope, not every possible medical test or clinical approval.
