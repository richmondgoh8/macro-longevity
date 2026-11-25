export const BASELINE_KEY = 'sg-health-baseline-v1';
export const A1C_HISTORY_KEY = 'macro-longevity-a1c-history-v1';

export const SG_MARKERS = [
  { id: 'bp', label: 'Blood pressure', units: ['mmHg'], example: '122/78', hint: 'Enter systolic/diastolic. Bring repeated readings to your clinic.' },
  { id: 'waist', label: 'Waist circumference', units: ['cm'], example: '82', hint: 'Use the same measuring method each time.' },
  { id: 'glucose', label: 'Fasting glucose', units: ['mmol/L', 'mg/dL'], example: '5.2', hint: 'Use a result taken while fasting.' },
  { id: 'hba1c', label: 'HbA1c', units: ['%', 'mmol/mol'], example: '5.4', hint: 'Discuss what your result means with your clinician.' },
  { id: 'ldl', label: 'LDL cholesterol', units: ['mmol/L', 'mg/dL'], example: '2.4', hint: 'Your LDL goal depends on your overall cardiovascular risk.' },
  { id: 'tg', label: 'Triglycerides', units: ['mmol/L', 'mg/dL'], example: '1.2', hint: 'Tell your clinic if the sample was taken while fasting.' },
  { id: 'apob', label: 'Apolipoprotein B (ApoB)', units: ['g/L', 'mg/dL'], example: '0.85', hint: 'Ask if this result changes your lipid management plan.' },
  { id: 'lpa', label: 'Lipoprotein(a) (Lp(a))', units: ['nmol/L', 'mg/dL'], example: '40', hint: 'Use the report unit. There is no fixed conversion between these units.' },
];
