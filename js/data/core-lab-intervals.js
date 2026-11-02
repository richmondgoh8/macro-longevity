// Published laboratory examples, not diagnostic cut-offs or optimisation targets.
// Reviewed 2026-11-02. Keep the initial Home subset small; other assays load on demand.
const KKH = 'https://www.kkh.com.sg/our-specialties/elab-book/';
const kkh = (unit, values, slug) => ({ lab: 'KKH', population: 'age ≥19 years', unit, values, source: KKH + slug, reviewed: '2026-11-02' });
export const CORE_LAB_INTERVALS = {
  b12: kkh('pmol/L', '138–652', 'vitamin-b12'),
  ferritin: kkh('µg/L', 'Male: 21.8–274.7; female: 4.6–204.0', 'ferritin-serum'),
  alt: kkh('U/L', '0–55', 'alanine-transaminase-alt'),
  ast: kkh('U/L', '5–34', 'aspartate-transaminase-ast'),
  ggt: kkh('U/L', 'Male: <55; female: <38', 'gamma-glutamyl-transferase-ggt'),
  esr: { ...kkh('mm/hour', 'Male: 1–10; female age ≤50: 3–15; female age >50: 3–20', 'erythrocyte-sedimentation-rate-esr'), population: 'adult; KKH centrifugation method, intervals adopted from SGH' },
  homocysteine: { ...kkh('µmol/L', '<15.0', 'homocysteine-plasma'), lab: 'SGH via KKH catalogue', population: 'adult example; published for age ≥13 years; fasting plasma' },
  cystatin: { lab: 'Alfred Hospital, Australia', population: 'age >18 years; Abbott Alinity, reagent updated May 2026; reference cohort eGFR >80 mL/min/1.73 m²', unit: 'mg/L', values: '0.59–1.28', source: 'https://pathology.alfred.org.au/handbook/search?testid=870', reviewed: '2026-11-02' },
};

export function withLabInterval(reference, intervals) {
  const interval = intervals[reference.id];
  if (!interval || reference.labInterval) return reference;
  return {
    ...reference, unit: interval.unit, labInterval: interval,
    reference: `${interval.values} ${interval.unit}. Example laboratory interval: ${interval.lab}; ${interval.population}. Your reporting laboratory’s interval takes precedence; this is not a treatment target. ${reference.reference || ''}`.trim(),
    // The interval source is primary; retain the original interpretation source.
    source: interval.source, extraSource: reference.source,
  };
}
