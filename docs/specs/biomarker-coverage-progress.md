# Coverage correction — implementation progress

Numerical-reference correction, 2026-11-02: the previous completed scope was
name/context coverage, not complete numerical ranges. Added 40 published lab
examples plus numeric HDL/total-cholesterol screening guideposts, without
inventing optimisation bands. Numeric applicability review remains partial
(40 laboratory examples, 15 banded references, 303 other guidance destinations).
See the numerical correction in [the review](measurement-coverage-review.md).
Verification/deployment evidence for this correction is recorded separately;
the older runtime evidence below does not verify these additions.

Local verification of this numerical correction: audit passed (49 JavaScript
files, 81 precached assets); quick regressions 110/110; performance 4/4;
Home visual checks 6/6; explicit offline interval checks 2/2. B12 was also
visually inspected. The longer upstream reference text changed fractional
pixel placement in the otherwise unchanged colorectal-card screenshots;
both desktop/mobile diffs were inspected before refreshing those two
baselines. No tolerance was relaxed. Full unrelated-route UI suite was not
rerun for this bounded data change. Saved-result schemas are unchanged.

Published numerical correction: runtime `678b3b2c7b92d7f374e58583be51431f0e3d5d88`.
[Quality run 41375094503](https://github.com/richmondgoh8/macro-longevity/actions/runs/41375094503)
and [Pages run 41375292108](https://github.com/richmondgoh8/macro-longevity/actions/runs/41375292108)
succeeded for that exact SHA. All six changed runtime assets byte-matched
`https://hazelah.me/macro-longevity/`. An isolated 390px live Chromium context
verified B12, HDL screening thresholds and sex-specific haemoglobin intervals,
no horizontal overflow, installation of the v57 cache, offline phosphate and
B12 deep links, and zero page errors. These checks verify publication/behaviour,
not clinical approval or completion of the remaining numerical-applicability audit.

Earlier source-name/context checkpoint, 2026-11-02: deployed runtime `6535d61`.
Baseline for this correction: `363eb4b`.

Current implementation: 663 source entries accounted for, 358 unique reference
destinations, 38 explicit exclusions, 159 designated recordable measurements and
652 source-name search fixtures. The [review](measurement-coverage-review.md)
and reproducible row-level reconciliation supersede the frozen pending statuses
below. No clinician approval or universal lifetime-test coverage is claimed.

Planning refresh: the specification now distinguishes the original audit from the
published incremental release. The plan includes a current-state checkpoint,
an ordered specialist-guidance slice and a user-concern-to-evidence checklist.
This is a documentation-only update: it does not add missing guidance, change
runtime behavior or establish new CI/deployment evidence.

## Implemented in the first slice

- Captured an independent pre-change inventory: 314 source entries across the
  recorded lab panel, Home references and structured Health fields (167 unique
  included IDs after known baseline mappings). This is not the final source scope.
- Added explicit source metadata with pending reconciliation states.
- Independently compared the live published panel's four named lists with the
  local data: 140 baseline, 3 male, 1 female and 86 follow-up names matched after
  documented normalization, with no missing/extra names. The captured source
  fixture is now checked by the audit; this does not verify clinical guidance.
- Added shared token/alias search; HDL is distinguished from non-HDL.
- Added dedicated HDL/total cholesterol and physical/recovery reference cards;
  Home now has 51 cards across the original seven groups, with actions visible.
- Promoted existing HDL/total cholesterol fields without changing IDs or stores.
- Added Health search across structured, physical and lab-library entries, including
  lazy-group opening, deep-link reload and result focus.
- Added 13 optional physical cards, including left/right grip, site-specific BMD
  with separate signed T-/Z-scores, HRV method, sleep, composition and VO2.
- Preserved existing stores and added `health-physical-results-v1`; units never
  convert raw values. Removed single-choice unit dropdowns from physical fields.
- Reused one asynchronous disclosure loader instead of adding three duplicate
  loading implementations. Home no longer imports the result-entry dataset just
  to obtain labels and reference URLs.
- Added a coverage baseline audit and mutation regressions. Its strict
  `--require-complete` mode intentionally fails while source reviews/scope remain.

## Evidence gathered so far

- New regression initially reproduced the missing HDL reference/search behavior.
- Focused desktop/mobile checks verified saved HDL, physical measurements,
  signed scores, site/side/date persistence, aliases and accessibility.
- Quick suite passed 74 checks before the additional coverage-audit test was added.
- All three performance checks passed after removing the unnecessary Home import;
  existing thresholds were not changed. The initial oversized bundle was corrected.
- New bone-density deep links and saved physical scores worked offline in the
  focused service-worker suite on desktop and mobile.
- Screenshots reviewed at 390px and 1440px; no horizontal overflow in those checks.

Final local gates for this slice: 76 quick checks passed; full suite 327 passed
with 3 expected platform-inapplicable skips (5.9 minutes). All three desktop
performance checks passed in that full run without threshold changes. Signed bone
scores use a standard text keyboard so a mobile decimal keyboard cannot hide the
minus key. The alias-cleanup regression for `hsCRP` was corrected and reverified.
Health and new bone-density snapshots were reviewed; the existing mobile cancer
card baseline was refreshed only after verifying a one-pixel position/crop shift.
External verification: code revision `e7389222a758eaedbb07f9ebe02099605cd3a006`
passed GitHub Quality run `41318427739` and Pages deployment `41318577013`.
Seven changed runtime assets matched the tested local files byte-for-byte.
An isolated live mobile context verified the 51-card guide, exact HDL destination,
preserved legacy HDL units/value, signed bone-score save/reload and cache v53.
Offline grip guidance and saved bone/HDL results worked without browser errors.
These are incremental-release results, not full-catalogue completion or physical
iPhone/Android verification.

Research artifacts for the next slice:

- [Published-panel comparison](published-panel-reconciliation.json).
- [189 historical measurement entries](archived-measurement-extraction.json),
  including 26 clinical-table labels and 163 results/ideal-marker/routine entries;
  other organ/fitness sections and all mappings still need reconciliation.
- [21 current-protocol entries/bundles](current-protocol-measurement-extraction.json),
  with provenance and pending mappings rather than assumed clinical equivalences.

## Remaining requirements — do not claim complete

1. Complete canonical/guidance reconciliation and inventory all named measurements
   in the chosen current/archive protocol sections. Published lab name parity is
   verified, but the 314-row baseline still has 314 pending
   source-entry reviews; it is not proof that those reviews were performed.
2. Extend the canonical index beyond the initial shared aliases and reconcile all
   source membership, reference destinations and recording policies.
3. Write/review specific reference/context/actions for the remaining lab entries,
   with substantive shared family plans where appropriate; generic report fields
   are insufficient. Extend Home search to the full included specialist catalogue.
4. Complete current/archived physical, sensory, organ and specialist reconciliation
   without presenting historical or experimental tests as routine recommendations.
5. Test old-worker upgrade compatibility and the remaining release criteria,
   search timing, print behavior and available engine/device coverage.
6. Finish visual refinement against the requested sleek healthcare-dashboard
   direction without adding clutter, runtime dependencies or unrelated refactors.

Next slice: finish the independent source manifest and named-entry reconciliation,
then implement reviewed extended-family guidance and Home search destinations.

## Optional-lab identity and explanation slice

Published and verified on 2026-11-01 at runtime revision
`d6881d2fac7f0717179d83ea00ac8c5f7e07fcee`:

- Every one of the 30 optional lab fields now explicitly maps to its published
  library ID in both directions. Common aliases include GGT, ALP, TIBC, TSAT,
  bicarbonate, RBC, WBC, MCV, RDW and the British spelling haematocrit.
- Added per-test explanations rather than repeating the generic recording prompt.
  Each links to its supporting NLM/MedlinePlus test reference; existing family
  actions and interpretation limits remain. This is not specialist clinical approval.
- Blood counts, blood proteins, blood bilirubin and blood urate remain distinct
  from urine findings. The descriptions distinguish ALP from bone density,
  haemoglobin from HbA1c and free T4 from total T4.
- No result IDs, store formats, raw values, units or input controls changed.
  The worker version advances to `v54-lab-identities`; no new precached assets.
- New regressions first reproduced missing insulin/library identity and GGT search.
  Corrected quick suite: 82 passed. Four performance checks passed with unchanged
  budgets, including a new repeated-search input-to-painted-results <=200ms check
  for Home and Health under the desktop 4x CPU profile. Optional module download
  time is deliberately not represented as warm-search latency.
- Reviewed RBC front/action screenshots at 390px and 1440px; no horizontal
  overflow in these checks. Full suite: 334 passed, four expected skips (5.7
  minutes); no screenshot baselines or tolerances changed. Audit/syntax and
  whitespace checks passed; `npm audit` reported zero vulnerabilities.
- A separate isolated mobile-width upgrade experiment served the actual previous
  release `e7389222a758eaedbb07f9ebe02099605cd3a006`, then the current runtime.
  After controller change and activation, the v54 cache contained new content;
  all three saved stores were byte-preserved, another app's cache was retained,
  and new GGT guidance/TIBC search worked offline with zero page errors.
  An initial experiment switched offline before confirming new-worker control
  and saw old content; waiting for activation corrected the verification sequence.
  This experiment is not a physical-device test or a committed upgrade regression.
- [Quality run 41321310757](https://github.com/richmondgoh8/macro-longevity/actions/runs/41321310757)
  passed both jobs (41 checks each): desktop 1m34s, mobile 1m28s.
  [Pages run 41321444803](https://github.com/richmondgoh8/macro-longevity/actions/runs/41321444803)
  successfully deployed the same SHA. All four changed runtime assets matched
  local tested files byte-for-byte at `https://hazelah.me/macro-longevity/`.
- An isolated live 390px Chromium context confirmed v54, GGT explanation and
  save/reload, TIBC/TSAT/RBC/bicarbonate aliases, offline RBC guidance and evidence
  links, offline HDL guidance, 51 core cards, no overflow and zero page errors.
- CI emitted non-blocking Node 20 action-runtime deprecation annotations for
  checkout/setup-node v4. Updating and validating those action dependencies is
  remaining pipeline cleanup; green runs do not mean warning-free workflows.

Remaining scope is unchanged: optional-card explanations do not provide all 144
lab entries with Home reference/action destinations, complete the historical
inventory, or make full-catalogue search and print complete.

## Published-lab reference and navigation slice

Implemented and deployed 2026-11-01/02 as runtime revision
`ff920d6ed7d98ca022f4aa6160638e094f81aee0`.

- The captured 144 unique published lab entries now have explicit canonical
  reference destinations: 19 reuse core cards and 125 are extended cards. With
  the 51 core references, complete reading shows 176 unique cards, not 195.
  This is published-lab coverage, not every current/archive physical measurement.
- Added individual analyte explanations plus labelled shared family context,
  actions or no-self-directed-target rationale. Qualitative findings, inherited
  blood groups, immature cells, urine microscopy, hormones and assay-specific
  profiles are not forced into invented green/amber/red numerical bands.
- Added native extended disclosures inside six of the existing seven groups;
  all 51 core cards/actions remain initially visible. Rich data loads on demand.
  Home search, copied links, direct fragments, reload and Back reach actual cards.
  Library rows link to the same canonical destinations; saved observations remain
  in their original stores. PSA analytes remain separate from PSA screening.
- A complete-reading control expands the published labs before printing. A print
  of an unloaded guide explicitly warns about missing extended content. Printing
  loaded content expands it synchronously and restores the prior disclosure state.
  Native Find is not claimed to search unfetched/unrendered cards.
- New failures initially reproduced missing TIBC search. A regression caught Top
  links being rejected because their target is outside the guide mount; fixed
  without weakening the navigation assertions. Failed loads expose a visible
  reload/retry path. Offline specialist links are included in worker tests.
- The first performance run caught Home at 95,941 decoded JS bytes. Extracted
  shared first action steps into a small module so Home no longer imports Health's
  full action/context module. An exact before/after comparison proved every Health
  action and interpretation string unchanged. All four performance checks now
  pass with the original budgets, including <=200ms warm search at 4x CPU.
- Quick suite: 92 passed. Audit: 7 pages, 46 JS files, 76 precached assets.
  Full desktop/mobile suite: 344 passed, 4 expected skips (7.2 minutes), with
  unchanged visual baselines and performance budgets.
  Dependency audit: zero vulnerabilities. New static checks compare guidance
  against the independent name fixture and reject removed entries/boilerplate.
  Browser checks verify all 144 destinations have visible plans, unique card IDs,
  accessible expanded content and library-to-reference links.
- Reviewed specialist-card screenshots at 390px and 1440px. Expanded content had
  zero horizontal overflow at 320/390/768/1440px with both normal and 200% text.
  A complete-reference A4 PDF was generated; this is not a physical-printer test.
- Isolated actual v54-to-v55 upgrade preserved all three saved stores byte-for-byte,
  retained an unrelated cache, removed the old app cache and served new specialist
  guidance offline with zero page errors after reload. The first probe only
  changed the fragment, retaining the old document; corrected it to reload the
  document after worker activation rather than mistake that for a new renderer.
- Updated official workflow actions to Node-24-based releases after inspecting
  their published metadata. Kept the Node 22 test engine, npm cache, parallel
  desktop/mobile quick jobs, manual/weekly full gates and tested-SHA deployment
  guard. Explicitly retain public hidden files in the curated Pages artifact so
  the newer uploader does not omit `.nojekyll`.
- Quality run `41369727047` passed on that exact SHA: 46 checks per parallel
  project; mobile job 1m24s and desktop job 1m37s including setup. Pages run
  `41369873844` succeeded for the same SHA (16-second deployment job). Checked
  annotations: no Node 20 action-deprecation warnings; Pages retains an
  informational `ubuntu-latest` image-migration notice, not a failure.
- All nine changed runtime assets matched live bytes. An isolated live 390px
  browser verified ANA direct links, TIBC search/focus/Back, 176 expanded cards,
  the exact library reference link, no horizontal overflow, v55 activation and
  offline free-PSA guidance, with zero page errors.

The frozen 314-row baseline is not retroactively marked reviewed. Remaining work
includes full current/archive named-entry reconciliation, row-level review/status
records and broader specialist/physical destinations. This slice's release
checks are complete; full-inventory completion is not. No specialist clinical
approval or physical-device testing is claimed.

## Full versioned-scope implementation and release verification

Implemented and deployed 2026-11-02 as runtime
`6535d61103032acd2f044d434d194fd145f246ea`.

- Completed chosen current/archive source reconciliation without rewriting the
  frozen baseline. Added an independent 136-row archive supplement and one current
  air-quality example, explicit mappings/bundles/exclusions and a reproducible
  row-level report. Counts: 663/663 source entries accounted for, 358/358 distinct
  guidance destinations, 652/652 source-name search fixtures and 159 designated
  recordable canonical measurements. The 38 exclusions do not count as implemented.
- Added 182 reference-only specialist destinations, including hearing/eye/oral,
  sleep/oxygen/temperature, lung/vascular/cardiac/brain assessments, performance,
  additional nutrients, infection testing and research assays. Specific meanings,
  labelled shared plans, food-first nutrient actions and historical/current status
  accompany the method-specific context; no invented longevity intervals.
- Preserved all 51 initially visible core cards and the seven groups. Full reading
  shows 358 cards; Home and Health search reach the same specialist destinations.
  No fake result forms or extra Home recording CTA. Existing result stores/fields
  remain unchanged. Native disclosures follow the web/UI skills' guidance; no new
  framework, runtime dependency, custom listbox or design-service dependency.
- A failing FEV1 browser test reproduced the missing destination before wiring.
  New mutation checks reject removed mappings, missing guidance, an unaccounted
  exclusion, wrong HDL/non-HDL identity and boilerplate actions. The normal audit
  verifies the reviewed source/content checksums, never live-scrapes sources in CI.
- Fixed Health's immediate-Enter race by awaiting the current search; a delayed
  module response is covered on both projects. Stale previous-query results are
  cleared while loading. Reference-only links are explicitly labelled.
- Quick suite: 102 passed (2.7 minutes) before the final Enter case was added;
  the two new Enter regressions subsequently passed. All four performance tests
  passed unchanged budgets, now including FEV1, selenium and DunedinPoAm queries.
  Audit: seven pages, 49 JS modules, 79 cached assets. npm audit: zero vulnerabilities.
- Existing Home visual baselines passed unchanged on both projects. Reviewed new
  390px/1440px hearing screenshots. Expanded guide had no horizontal overflow at
  320/390/768/844-landscape/1440px at 100% and 200% text. Shortened complete-reading
  feedback after visual review to keep the contents rail compact.
- Chromium 151 and the available cached Firefox 151 binary passed targeted
  specialist loading, all-card rendering, search/navigation, section tracking after
  full expansion and mobile enlarged-text checks. This is a Firefox smoke check,
  not the full Chromium suite or physical-device/Safari certification.
- Actual v55-to-v56 update on a `/macro-longevity/` test origin preserved all three
  stores byte-for-byte, including distinct HDL values; restored signed BMD; removed
  only the old app cache and retained an unrelated cache. New Home/Health guidance
  worked offline. One initial rapid-navigation probe emitted Chromium's native
  “Transition was skipped” cancellation; reviewed primary platform guidance and
  repeated with transitions settled: zero page errors. No application-wide error
  filter or unnecessary transition script was added to hide it.

- Final frozen-runtime suite: **356 passed, four expected skips (7.0 minutes)**,
  including both Enter regressions, full source/content checks, expanded guide
  accessibility/print, all visual baselines and expanded performance searches.
  No assertions, budgets, screenshot tolerances or baselines were weakened.

- Quality run `41373081278` passed on that SHA: **52 checks per parallel project**
  (104 total); both complete jobs took 2m12s including setup/audits. Pages run
  `41373284081` successfully published the same tested SHA in a 13-second job.
  Annotations contain passing-test notices and the existing informational runner
  image-migration notice; no Node 20 action-deprecation warnings or failed gates.
- All nine changed runtime assets matched live bytes. Isolated live 390px acceptance
  verified HDL value/unit and signed BMD save/reload, independent library HDL,
  historical hearing deep link, FEV1 search/focus/Back, exact copied deployment-subpath
  link, all 358 expanded references and no horizontal overflow. v56 activated;
  Health-to-selenium reference navigation/actions worked offline. All three stores
  remained unchanged and the settled-navigation smoke recorded zero page errors.
- Final runtime and assertions remained frozen through the full suite and release.
  The follow-up records evidence/checklist completion in Markdown only; no new
  runtime changes or unnecessary second deployment are introduced.

All engineering implementation/release gates in the agreed versioned scope are
complete. Scope/clinical/platform limitations are documented in
[the review](measurement-coverage-review.md), not silently deferred implementation.
