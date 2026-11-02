// Inventory provenance is separate from medical guidance and implementation coverage.
export const MEASUREMENT_SOURCES = [
  { id: 'blueprint-labs', url: 'https://immortals.com/pages/biomarkers', publisher: 'Immortals / Bryan Johnson', scope: 'Published baseline, sex-specific and follow-up blood/urine panel', checked: '2026-11-01', status: 'named-lists-reconciled' },
  { id: 'blueprint-current', url: 'https://protocol.bryanjohnson.com/', publisher: 'Bryan Johnson', scope: 'Current public protocol: Biomarkers, Measurement and daily-routine measurement examples', checked: '2026-11-02', status: 'versioned-names-reconciled' },
  { id: 'blueprint-archive', url: 'https://protocol-museum.bryanjohnson.com/', publisher: 'Bryan Johnson', scope: 'Historical results, routine, organ and fitness named measurement lists; unfinished items explicitly excluded', checked: '2026-11-02', status: 'versioned-names-reconciled', historical: true },
  { id: 'app-363eb4b', url: 'https://github.com/richmondgoh8/macro-longevity/tree/363eb4b', publisher: 'MacroLongevity', scope: 'Existing 39 Home references and 45 structured Health fields', checked: '2026-11-01', status: 'baseline-captured' },
  { id: 'app-coverage-additions', url: 'https://github.com/richmondgoh8/macro-longevity/tree/e738922', publisher: 'MacroLongevity', scope: 'User-requested lean-mass and VAT distinctions; not additional published panel tests', checked: '2026-11-02', status: 'named-additions-reconciled' },
];
