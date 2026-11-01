// Source-checked 2026-11-01. Personal percentiles are not clinical targets.
const ACTIVITY = 'https://www.nhlbi.nih.gov/health/heart-healthy-living/physical-activity';
const SLEEP = 'https://www.nhlbi.nih.gov/health/heart-healthy-living/sleep';
const COMPOSITION = 'https://iscd.org/official-positions-2023/';
const BODY_COMPOSITION = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10661987/';
export const PHYSICAL_REFERENCES = [
  {
    id: 'grip', label: 'Hand grip strength', unit: 'kgf · left and right hand',
    reference: 'Compare with a cited age-/sex- and protocol-matched reference. There is no single adult longevity target.',
    note: 'Measure each hand using a dynamometer with the same posture, handle setting and trial protocol. Gripper resistance and dead-hang time are not equivalent measurements.',
    action: 'Train strength twice weekly. Include manageable rows and loaded carries, progressing gradually without hand or wrist pain. Allow recovery between hard sessions; new weakness or a painful asymmetry needs assessment.',
    source: 'https://nihtoolbox.org/test/grip-strength-test/', extraSource: ACTIVITY,
  },
  {
    id: 'bmd', label: 'Bone mineral density (DXA)', unit: 'g/cm² · T-score and Z-score are separate',
    reference: 'Record lumbar spine, total hip and femoral neck separately. T-scores are generally used after menopause and in men aged 50+; younger adults generally use Z-scores.',
    note: 'Use the report’s applicable score and interpretation, not a whole-body composition percentile. Bone density alone does not describe all fracture risk; machine precision matters when comparing scans.',
    action: 'Do appropriate weight-bearing activity and resistance training regularly, and include calcium-containing foods. If osteoporosis, fracture or fall risk is present, adapt exercises to your care plan; avoid unadvised high-impact work or heavy loaded spinal bending.',
    source: COMPOSITION, extraSource: 'https://www.nhs.uk/conditions/osteoporosis/prevention/',
  },
  {
    id: 'rhr', label: 'Resting heart rate', unit: 'beats/minute (bpm)',
    reference: 'A typical adult resting pulse is 60–100 bpm, but training, medicines and the measurement conditions affect interpretation.',
    note: 'Resting, sleeping and pre-bedtime measurements are different contexts. Lower is not always better; a wearable cannot diagnose a rhythm problem.',
    action: 'Build regular aerobic activity gradually and protect a consistent sleep schedule. Record trends under similar rested conditions. Do not change medicines to lower the number; a new persistent change or symptoms needs assessment.',
    source: 'https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse', extraSource: ACTIVITY,
  },
  {
    id: 'hrv', label: 'Heart rate variability (HRV)', unit: 'ms · specify RMSSD, SDNN or report metric',
    reference: 'Compare your own trend using the same metric, device and sampling conditions. There is no universal wearable HRV goal.',
    note: 'RMSSD and SDNN describe different calculations; overnight and short resting samples are not interchangeable. Illness, stress and recovery can affect the result.',
    action: 'Keep a regular sleep routine, exercise consistently and allow easier recovery days after unusually hard training. Try comfortable slow breathing for relaxation; avoid escalating supplements or training just to chase a device score.',
    source: 'https://my.clevelandclinic.org/health/articles/21773-heart-rate-variability-hrv',
  },
  {
    id: 'sleep', label: 'Sleep duration', unit: 'hours/night',
    reference: 'Most adults need about 7–9 hours of sleep. Use a representative pattern, not a single night or a perfect-score target.',
    note: 'Time asleep is different from time in bed. Wearable sleep stages are estimates and cannot establish a sleep-disorder diagnosis.',
    action: 'Keep a consistent bedtime and wake time, leave enough time for sleep and make the final hour quieter. Avoid late caffeine and heavy evening meals. Persistent insomnia, gasping or marked daytime sleepiness warrants assessment.',
    source: SLEEP,
  },
  {
    id: 'sleepefficiency', label: 'Sleep efficiency', unit: '% · time asleep ÷ time in bed × 100',
    reference: 'Interpret with sleep duration, symptoms and measurement method. There is no universal longevity score or wearable target.',
    note: 'Devices estimate sleep differently. A high percentage caused by too little time in bed is not necessarily healthy, and sleep efficiency alone cannot diagnose insomnia.',
    action: 'Use consistent sleep and wake times and a calm wind-down routine. Do not shorten sleep opportunity to improve a percentage. Persistent sleep problems need an appropriate assessment rather than more sleep-tracker optimisation.',
    source: SLEEP,
  },
  {
    id: 'weight', label: 'Body weight', unit: 'kg',
    reference: 'Interpret with height, waist, body composition and your own trend. There is no single ideal weight for every adult.',
    note: 'Fluid shifts and measurement timing affect short-term changes. Unintended weight loss or rapid unexplained changes need context, not further restriction.',
    action: 'Keep regular balanced meals and strength training. If excess weight is present, replace sugary drinks and oversized portions gradually; if underweight or losing weight unintentionally, avoid dieting and have the cause assessed.',
    source: 'https://www.nhlbi.nih.gov/health/overweight-and-obesity',
  },
  {
    id: 'bodyfat', label: 'Body fat percentage', unit: '% · method-specific',
    reference: 'Use an age-/sex- and method-appropriate reference. DXA, bioimpedance scales and skinfold estimates are not interchangeable.',
    note: 'Body fat includes essential tissue; minimising it is not a universal health goal. Hydration and device algorithms can change estimates.',
    action: 'Train strength twice weekly and keep regular aerobic activity. If reducing excess fat, use sustainable food portions while preserving muscle; avoid crash dieting or dehydration to change a reading.',
    source: BODY_COMPOSITION, extraSource: ACTIVITY,
  },
  {
    id: 'leanmass', label: 'Lean mass', unit: 'kg · method- and region-specific',
    reference: 'Distinguish whole-body lean mass from appendicular lean mass. Use the report’s method, region and reference population.',
    note: 'Lean mass includes non-muscle tissue and is not a direct strength measurement. Compare repeat scans using compatible equipment and report precision.',
    action: 'Train major muscle groups on two days each week and include protein-containing foods in regular meals. Progress resistance gradually; avoid aggressive calorie restriction when trying to preserve muscle.',
    source: BODY_COMPOSITION, extraSource: ACTIVITY,
  },
  {
    id: 'vat', label: 'Visceral adipose tissue (VAT)', unit: 'g, cm² or cm³ · report-specific',
    reference: 'Copy the exact quantity and unit: visceral fat mass, area and volume are not directly interchangeable.',
    note: 'Use the device’s reference and repeat-test precision; no universal VAT longevity target applies to all reports. Waist circumference is related context, not a replacement measurement.',
    action: 'Walk regularly, train strength twice weekly and replace sugary drinks. If excess fat is present, make sustainable portion changes while preserving muscle; do not pursue extreme weight loss to chase a scan value.',
    source: COMPOSITION, extraSource: ACTIVITY,
  },
].map(reference => ({ ...reference, reviewed: '2026-11-01' }));

// Separate observation fields prevent conflating sites, sides, metrics or score types.
const field = (id, label, units, options = {}) => ({ id, label, units, ...options });
export const PHYSICAL_MEASUREMENTS = [
  { id: 'grip', referenceId: 'grip', fields: [field('left', 'Left hand', ['kgf', 'lbf']), field('right', 'Right hand', ['kgf', 'lbf'])], method: 'Dynamometer / posture / handle setting / dominant hand' },
  ...[['spine', 'Lumbar spine'], ['hip', 'Total hip'], ['neck', 'Femoral neck']].map(([site, label]) => ({ id: `bmd-${site}`, label: `Bone density · ${label}`, referenceId: 'bmd', fields: [field('bmd', 'Reported BMD', ['g/cm²']), field('t', 'T-score', ['score'], { signed: true }), field('z', 'Z-score', ['score'], { signed: true })], method: 'Scanner / report interpretation', side: site !== 'spine' })),
  { id: 'rhr', referenceId: 'rhr', fields: [field('value', 'Resting pulse', ['bpm'])], method: 'Device / morning, daytime resting or pre-bedtime' },
  { id: 'hrv', referenceId: 'hrv', fields: [field('value', 'Reported HRV', ['ms'])], method: 'Device / sampling conditions', metric: ['RMSSD', 'SDNN', 'Other / copy in method'] },
  { id: 'sleep', referenceId: 'sleep', fields: [field('value', 'Time asleep', ['hours'])], method: 'Device or diary / night or averaging period' },
  { id: 'sleepefficiency', referenceId: 'sleepefficiency', fields: [field('value', 'Reported efficiency', ['%'], { max: 100 })], method: 'Device or diary / averaging period' },
  { id: 'weight', referenceId: 'weight', fields: [field('value', 'Body weight', ['kg', 'lb'])], method: 'Scale / measurement conditions' },
  { id: 'bodyfat', referenceId: 'bodyfat', fields: [field('value', 'Body fat', ['%'], { max: 100 })], method: 'DXA, bioimpedance or other method' },
  { id: 'leanmass', referenceId: 'leanmass', fields: [field('value', 'Lean mass', ['kg', 'lb'])], method: 'Device / whole body or appendicular region' },
  { id: 'vat', referenceId: 'vat', fields: [field('value', 'Reported VAT', ['g', 'cm²', 'cm³'])], method: 'Device / mass, area or volume' },
  { id: 'vo2', label: 'Cardiorespiratory fitness (VO₂ max)', referenceId: 'vo2', fields: [field('value', 'VO₂ max', ['mL/kg/min'])], method: 'Lab exercise test or wearable estimate' },
];
