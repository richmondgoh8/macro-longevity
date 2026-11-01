# Coverage correction — implementation progress

Updated 2026-11-01. Overall goal remains active; full completion is unproven.
Baseline for this correction: `363eb4b`.

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
External CI, publishing and live acceptance follow these local gates; do not infer
their results from the local test counts.

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
