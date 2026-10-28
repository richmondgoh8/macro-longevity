// Adult quick-reference categories, verified 2026-10-28. These are not diagnoses
// or individual treatment goals. Alternate units use published paired cut-offs,
// not a calculated conversion (especially for Lp(a)). Bands are categorical.
const LIPIDS = 'https://www.kkh.com.sg/our-specialties/elab-book/lipid-panel-tg-total-chol-hdl-ldl';
const MAYO = 'https://www.mayocliniclabs.com/test-catalog/overview/616727';
const KIDNEY = 'https://www.kidney.org/how-to-classify-ckd';

export const REFERENCE_RANGES = [
  {
    id: 'bp', unit: 'mmHg',
    bands: [['Within guide', '<130 and <80'], ['Watch', '130–139 or 80–89'], ['Review', '≥140 or ≥90']],
    note: 'Top / bottom number; use the higher category if they differ. Average rested clinic readings. Home thresholds differ. Below 90/60 also needs context.',
    safety: 'Above 180 systolic or 120 diastolic: seek urgent medical advice. With chest pain, breathlessness, weakness or speech changes, call emergency services (995 in Singapore).',
    source: 'https://www.hpb.gov.sg/docs/default-source/default-document-library/annex---chronic-disease-results-guidelines-docx0f83a3f6468366dea7adff00000d8c5a.pdf',
    safetySource: 'https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/when-to-call-911-for-high-blood-pressure',
  },
  {
    id: 'bmi', unit: 'kg/m²',
    bands: [['Lower risk', '18.5–<23'], ['Moderate risk', '23–<27.5'], ['Higher risk', '≥27.5']],
    note: 'Asian adult risk bands. Below 18.5 is underweight, not “better”; do not restrict further. Use waist and muscle context too.',
  },
  {
    id: 'glucose', unit: 'mmol/L',
    bands: [['Within reference', '3.9–<6.1'], ['Watch', '6.1–<7.0'], ['Review', '≥7.0']],
    alternate: { unit: 'mg/dL', values: ['70–<110', '110–<126', '≥126'] },
    note: 'Fasting adult screening, not a diagnosis. Low glucose also needs attention: below 3.9 mmol/L (70 mg/dL), especially on glucose-lowering medicines.',
  },
  {
    id: 'ldl', unit: 'mmol/L',
    bands: [['Optimal reference', '<2.6'], ['Above optimal', '2.6–<4.1'], ['High', '≥4.1']],
    alternate: { unit: 'mg/dL', values: ['<100', '100–<160', '≥160'] },
    note: 'The middle band groups desirable and borderline-high results. Your treatment target can be much lower, depending on cardiovascular risk.',
    source: LIPIDS,
  },
  {
    id: 'tg', unit: 'mmol/L',
    bands: [['Optimal reference', '<1.7'], ['Above optimal', '1.7–<2.3'], ['High', '≥2.3']],
    alternate: { unit: 'mg/dL', values: ['<150', '150–<200', '≥200'] },
    note: 'Fasting references; meals and alcohol affect the result. Very high triglycerides need prompt clinical advice, not only lifestyle changes.',
    source: LIPIDS,
  },
  {
    id: 'apob', unit: 'g/L',
    bands: [['Desirable reference', '<0.90'], ['Above desirable', '0.90–<1.20'], ['High', '≥1.20']],
    alternate: { unit: 'mg/dL', values: ['<90', '90–<120', '≥120'] },
    note: 'Adult lab categories, not personal goals. The middle band includes borderline-high results. High / very-high-risk treatment goals may be <0.80 / <0.65 g/L (80 / 65 mg/dL).',
    source: MAYO,
  },
  {
    id: 'waist', unit: 'cm',
    bands: [['Below cut-off', 'Men <90 · women <80'], ['Increased risk', 'Men ≥90 · women ≥80']],
    note: 'Asian adult cut-offs. There is no established separate middle band here. Measure consistently; this is not a requirement for everyone to lose weight.',
    source: 'https://www.primarycarepages.sg/healthier-sg/care-protocols/preventive-health-care-protocols/body-mass-index-control',
  },
  {
    id: 'nonhdl', unit: 'mmol/L',
    bands: [['Desirable reference', '<3.4'], ['Above desirable', '3.4–<4.9'], ['High', '≥4.9']],
    alternate: { unit: 'mg/dL', values: ['<130', '130–<190', '≥190'] },
    note: 'Total cholesterol minus HDL-C. Rounded adult lab bands; the middle includes borderline-high results. Personal treatment goals are risk-based.',
    source: MAYO,
  },
  {
    id: 'hba1c', unit: '%',
    bands: [['Lower probability', '≤6.0'], ['Further testing', '>6.0–<7.0'], ['High probability', '≥7.0']],
    alternate: { unit: 'mmol/mol', values: ['≤42', '43–52', '≥53'] },
    note: 'Singapore diabetes screening probabilities, not a diagnosis or treatment target. Follow up with fasting glucose / OGTT as advised. Established diabetes needs individual goals.',
    source: 'https://nuhsingapore.testcatalog.org/show/HbA1c-1',
  },
  {
    id: 'lpa', unit: 'nmol/L',
    bands: [['Lower risk', '<75'], ['Intermediate', '75–<125'], ['Higher risk', '≥125']],
    alternate: { unit: 'mg/dL', values: ['<30', '30–<50', '≥50'] },
    note: 'Inherited risk, not a lifestyle target. No fixed conversion between these units. Lifestyle usually does not lower Lp(a); manage LDL/ApoB and overall risk instead.',
    source: 'https://www.jacc.org/doi/10.1016/j.jacc.2018.11.002',
  },
  {
    id: 'hscrp', unit: 'mg/L',
    bands: [['Lower relative risk', '<1'], ['Average relative risk', '1–3'], ['Higher relative risk', '>3']],
    alternate: { unit: 'mg/dL', values: ['<0.1', '0.1–0.3', '>0.3'] },
    note: 'Use the high-sensitivity test when well. ≥2 mg/L (0.2 mg/dL) is also risk-enhancing; >10 mg/L (1 mg/dL) can reflect acute inflammation and needs assessment.',
    source: 'https://www.clevelandheartlab.com/content/dam/other-brands/clevelandheartlab/documents/pdf/CHL-D009-SEPT2019-hs-CRP-Practitioner-One-Pager.pdf',
  },
  {
    id: 'egfr', unit: 'mL/min/1.73m²',
    bands: [['Normal / high', '≥90'], ['Mildly reduced', '60–<90'], ['Review', '<60']],
    note: 'Higher is not always better. Interpret with age, trend and urine ACR. Neither ≥90 nor 60–89 excludes kidney disease; one low result does not establish chronic disease.',
    source: KIDNEY,
  },
  {
    id: 'uacr', unit: 'mg/mmol',
    bands: [['Normal / mildly raised', '<3'], ['Moderately raised', '3–30'], ['Severely raised', '>30']],
    alternate: { unit: 'mg/g', values: ['<30', '30–300', '>300'] },
    note: 'Confirm persistent elevation with your clinic. Exercise, infection and menstruation can temporarily raise ACR.',
    source: 'https://www.nhs.uk/conditions/kidney-disease/diagnosis/',
  },
];
