// Health-only observation fields; Home needs the references, not recording schemas.
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
