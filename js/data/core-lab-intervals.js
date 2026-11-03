// Adult lab examples, reviewed 2026-11-02; not treatment targets.
const KKH = 'https://www.kkh.com.sg/our-specialties/elab-book/';
const kkh = (unit, values, slug) => ({ lab: 'KKH', population: 'age ≥19 years', unit, values, source: KKH + slug, reviewed: '2026-11-02' });
export const CORE_LAB_INTERVALS = {
  insulin: { lab: 'Mayo Clinic Laboratories', population: 'fasting serum; 8-hour fast required; assay-specific', unit: 'µIU/mL', values: '2.6–24.9', source: 'https://cardiology.testcatalog.org/show/INS', reviewed: '2026-11-03' },
  fibrinogen: { lab: 'Boone Health', population: 'citrated plasma; ACL TOP Clauss clotting method', unit: 'mg/dL', values: '200–393', source: 'https://boonehealth.testcatalog.org/show/FIB', reviewed: '2026-11-03' },
  b12: kkh('pmol/L', '138–652', 'vitamin-b12'),
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
  const context = reference.reference || 'Use the interval on your laboratory report; interpretation varies by laboratory, population and method.';
  return {
    ...reference, unit: interval.unit, labInterval: interval,
    reference: context, interpretation: context,
    source: interval.source, extraSource: reference.source,
  };
}
