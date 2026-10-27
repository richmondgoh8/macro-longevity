// Singapore screening data. Keep thresholds labelled as orientation points,
// not diagnoses; personal targets depend on age, risk and existing conditions.

const LIPID_SOURCE = 'https://www.acc.org/about-acc/press-releases/2026/03/13/18/01/accaha-issue-updated-guideline-for-managing-lipids-cholesterol';
const KIDNEY_SOURCE = 'https://www.niddk.nih.gov/health-information/professionals/advanced-search/quick-reference-uacr-gfr';

export const SG_ACTION_SOURCES = [
  { label: 'Activity guidance', href: 'https://www.healthhub.sg/well-being-and-lifestyle/exercise-and-fitness/150minutes' },
  { label: 'Fibre and fat swaps', href: 'https://www.healthhub.sg/health-conditions/hyperlipidemia' },
  { label: 'Sodium limit', href: 'https://www.who.int/news-room/fact-sheets/detail/sodium-reduction' },
  { label: '7,000-step evidence', href: 'https://doi.org/10.1016/S2468-2667(25)00164-1' },
];


export const SG_MARKER_GROUPS = [
  { id: 'routine', title: 'Common screening results', open: true, description: 'Start with blood pressure, body measurements, glucose and the full lipid panel. HbA1c may be offered as a glucose screening or monitoring test; ask which test fits your situation.', ids: ['bp', 'waist', 'bmi', 'glucose', 'ldl', 'tg', 'nonhdl', 'hba1c'] },
  { id: 'lipids', title: 'Beyond LDL: ApoB and Lp(a)', open: true, description: 'Ask for ApoB when particle burden may be missed by LDL-C, especially with high triglycerides, diabetes or known cardiovascular disease. Discuss a one-time adult Lp(a) test for inherited risk. These may cost extra and are not automatically included in Healthier SG screening.', ids: ['apob', 'lpa'] },
  { id: 'kidney', title: 'Kidney checks: add when your risk warrants', open: false, description: 'Particularly useful with diabetes, hypertension or suspected kidney disease. Check filtration and urine albumin together; a single abnormal result does not establish chronic kidney disease.', ids: ['egfr', 'uacr'] },
];

export const SG_MARKERS = [
  {
    id: 'bp',
    label: 'Blood pressure',
    eyebrow: 'Cardiovascular',
    icon: 'gauge',
    inputLabel: 'Latest reading',
    placeholder: 'e.g. 122/78',
    inputMode: 'text',
    target: 'Aim for below 130/80 mmHg when tolerated',
    shortTarget: '<130/80',
    why: 'High blood pressure is often silent and is one of the highest-impact risks to find early.',
    screening: 'Measure at least yearly from age 18; repeat correctly if a reading is high.',

    source: 'https://www.healthhub.sg/health-conditions/stroke-risks-and-management',
  },
  {
    id: 'waist',
    label: 'Waist circumference',
    eyebrow: 'Metabolic',
    icon: 'waist',
    inputLabel: 'Waist measurement',
    placeholder: 'e.g. 82',
    inputMode: 'decimal',
    suffix: 'cm',
    target: 'Lower-risk Asian cut-offs: ≤90 cm men · ≤80 cm women',
    shortTarget: '≤90 / ≤80 cm',
    why: 'Waist adds useful context to BMI because central fat can raise cardiometabolic risk even when weight looks “normal”.',
    screening: 'Measure with BMI once a year from age 18, using the same method each time.',

    source: 'https://www.moh.gov.sg/docs/librariesprovider5/default-document-library/nphs-2020-survey-report.pdf',
  },
  {
    id: 'bmi',
    label: 'BMI',
    eyebrow: 'Body size',
    icon: 'scale',
    inputLabel: 'BMI',
    placeholder: 'e.g. 22.4',
    inputMode: 'decimal',
    target: '18.5–22.9 kg/m² is the lower-risk Asian range',
    shortTarget: '18.5–22.9',
    why: 'BMI is a screening tool, not a body-fat diagnosis. In Singapore, risk can rise from BMI 23 and above.',
    screening: 'Use together with waist, blood pressure and blood tests; do not use it alone to judge health.',

    source: 'https://www.healthhub.sg/well-being-and-lifestyle/food-diet-and-nutrition/weight_putting_me_at_risk_of_health_problems',
  },
  {
    id: 'glucose',
    label: 'Fasting glucose',
    eyebrow: 'Blood test',
    icon: 'drop',
    inputLabel: 'Latest fasting glucose',
    placeholder: 'e.g. 5.2',
    inputMode: 'decimal',
    suffix: 'mmol/L',
    target: 'HealthHub reference: normal fasting glucose <6.1 mmol/L',
    shortTarget: '<6.1 mmol/L',
    why: 'Glucose problems can develop without symptoms. The trend helps catch risk before it becomes a bigger problem.',
    screening: 'From age 40, Singapore recommends diabetes screening about every three years, or more often if advised.',

    source: 'https://www.healthhub.sg/health-conditions/understanding-prediabetes-signs-symptoms-and-treatment',
  },
  {
    id: 'ldl',
    label: 'LDL cholesterol',
    eyebrow: 'Blood test',
    icon: 'heart',
    inputLabel: 'Latest LDL-C',
    placeholder: 'e.g. 2.4',
    inputMode: 'decimal',
    suffix: 'mmol/L',
    target: 'Common care target <2.6 mmol/L; your target is risk-based',
    shortTarget: 'Discuss <2.6',
    why: 'LDL-containing particles contribute to atherosclerosis. Total cholesterol alone is not enough context.',
    screening: 'From age 40, Singapore includes fasting or non-fasting lipids in cardiovascular screening.',

    source: 'https://www.healthhub.sg/programmes/healthiersg-screening/screening-faq',
  },
  {
    id: 'tg', label: 'Triglycerides', eyebrow: 'Full lipid panel', icon: 'heart',
    inputLabel: 'Latest triglycerides', placeholder: 'e.g. 1.2', inputMode: 'decimal', suffix: 'mmol/L',
    target: 'Fasting reference <1.7 mmol/L; interpret non-fasting results with your clinic',
    why: 'High triglycerides can reveal metabolic risk and make LDL-C less informative about particle burden.',

    source: 'https://eas-society.org/wp-content/uploads/2022/05/2019_EAS-ESC_Guidelines_dyslipidaemia_ATH.pdf',
  },
  {
    id: 'nonhdl', label: 'Non-HDL cholesterol', eyebrow: 'Full lipid panel', icon: 'heart',
    inputLabel: 'Latest non-HDL-C', placeholder: 'e.g. 3.0', inputMode: 'decimal', suffix: 'mmol/L',
    target: 'Total cholesterol minus HDL-C; your goal depends on cardiovascular risk',
    why: 'Captures cholesterol in all atherogenic particles and adds context when triglycerides are elevated.',
 source: LIPID_SOURCE,
  },
  {
    id: 'hba1c', label: 'HbA1c', eyebrow: 'Glucose context', icon: 'drop',
    inputLabel: 'Latest HbA1c', placeholder: 'e.g. 5.4', inputMode: 'decimal', suffix: '%',
    target: 'Use your clinician’s reference or diabetes care goal; this guide does not diagnose from HbA1c',
    why: 'Reflects glucose exposure over roughly three months. Screening interpretation differs from targets for people already treated for diabetes.',
 source: 'https://www.ace-hta.gov.sg/healthcare-professionals/acg/managing-pre-diabetes----a-growing-health-concern-acg/',
  },
  {
    id: 'apob', label: 'Apolipoprotein B (ApoB)', eyebrow: 'Particle burden', icon: 'heart',
    inputLabel: 'Latest ApoB', placeholder: 'e.g. 0.85', inputMode: 'decimal', suffix: 'g/L', units: ['g/L', 'mg/dL'],
    target: 'Risk-based secondary goals: <1.00 / <0.80 / <0.65 g/L for moderate / high / very-high risk',
    why: 'Estimates the number of atherogenic particles. It can reveal residual risk even when LDL cholesterol looks reassuring.',
 source: 'https://eas-society.org/wp-content/uploads/2022/05/2019_EAS-ESC_Guidelines_dyslipidaemia_ATH.pdf',
  },
  {
    id: 'lpa', label: 'Lipoprotein(a) — Lp(a)', eyebrow: 'Inherited risk · usually once', icon: 'heart',
    inputLabel: 'Latest Lp(a)', placeholder: 'e.g. 40', inputMode: 'decimal', suffix: 'nmol/L', units: ['nmol/L', 'mg/dL'],
    target: 'Risk-enhancing level: ≥125 nmol/L or ≥50 mg/dL; use the units on your report',
    why: 'A largely inherited cardiovascular risk factor that a standard cholesterol panel does not measure.',
 source: LIPID_SOURCE,
  },
  {
    id: 'egfr', label: 'Kidney filtration (eGFR)', eyebrow: 'Kidney function', icon: 'drop',
    inputLabel: 'Latest eGFR', placeholder: 'e.g. 95', inputMode: 'decimal', suffix: 'mL/min/1.73m²',
    target: 'Persistent eGFR <60 needs assessment; ≥60 alone does not rule out kidney disease',
    why: 'Estimated from blood creatinine; interpret with urine albumin, age, medicines and prior results.',
 source: KIDNEY_SOURCE,
  },
  {
    id: 'uacr', label: 'Urine albumin / creatinine (ACR)', eyebrow: 'Kidney damage', icon: 'drop',
    inputLabel: 'Latest urine ACR', placeholder: 'e.g. 1.2', inputMode: 'decimal', suffix: 'mg/mmol', units: ['mg/mmol', 'mg/g'],
    target: 'Lower albumin category: <3 mg/mmol (or <30 mg/g); persistent elevation needs review',
    why: 'Finds albumin leakage that may appear before filtration falls, especially with diabetes or high blood pressure.',
 source: 'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf',
  },
];

export const SG_SCREENING_PATHS = [
  {
    id: 'cardiovascular',
    tag: '40+',
    title: 'Healthier SG cardiovascular screening',
    detail: 'For eligible Singapore Citizens who meet age, last-screening and diagnosis criteria.',
    tests: 'Blood pressure · BMI + waist · glucose · lipids',
    cadence: 'About every 3 years if eligible',
    action: 'Ask your enrolled Healthier SG or CHAS GP clinic',
    source: 'https://www.healthhub.sg/programmes/healthiersg-screening',
    matches: ({ age }) => age >= 40,
  },
  {
    id: 'cervical',
    tag: '25+',
    title: 'Cervical cancer screening',
    detail: 'For women who have had sexual intercourse; the test depends on age.',
    tests: 'Pap test age 25–29 · HPV test age 30+',
    cadence: 'Every 3 years for Pap · every 5 years for HPV',
    action: 'Ask a GP which test is right for you',
    source: 'https://www.healthhub.sg/well-being-and-lifestyle/personal-care/type-2-screening-tests',
    matches: ({ age, sex }) => age >= 25 && sex === 'female',
  },
  {
    id: 'breast',
    tag: '40+',
    title: 'Breast cancer screening',
    detail: 'Screening guidance is age-based and should be personalised with your clinician.',
    tests: 'Mammogram',
    cadence: 'Check the current Healthier SG recommendation for your age',
    action: 'Ask a participating clinic or polyclinic about eligibility',
    source: 'https://www.healthhub.sg/programmes/healthiersg-screening',
    matches: ({ age, sex }) => age >= 40 && sex === 'female',
  },
  {
    id: 'colorectal',
    tag: '50+',
    title: 'Colorectal cancer screening',
    detail: 'Average-risk adults should discuss stool testing or colonoscopy; symptoms need earlier review.',
    tests: 'FIT stool test · or colonoscopy',
    cadence: 'FIT yearly · colonoscopy every 5–10 years',
    action: 'Ask a GP which route fits your risk and history',
    source: 'https://www.healthhub.sg/well-being-and-lifestyle/personal-care/screening_colorectal_cancer_nuhs',
    matches: ({ age }) => age >= 50,
  },
];

export const SG_SOURCES = [
  { label: 'MOH Screening Test Review Committee 2026', href: 'https://www.moh.gov.sg/others/resources-and-statistics/strc-2026-volume-1/' },
  { label: 'HealthHub screening tests', href: 'https://www.healthhub.sg/well-being-and-lifestyle/personal-care/type-2-screening-tests' },
  { label: 'Healthier SG screening', href: 'https://www.healthhub.sg/programmes/healthiersg-screening' },
];
