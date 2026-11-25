import { BASELINE_KEY, A1C_HISTORY_KEY } from './data/screening.js?v=3';

const recordKeys = [
  'macro-longevity-checklist-v1', BASELINE_KEY, A1C_HISTORY_KEY, 'blueprint-marker-results-v1',
  'health-physical-results-v1', 'ml-daily-meals', 'ml-daily-meal-library',
  'ml-daily-current', 'ml-daily-stacks', 'passiveIncome',
];

export function downloadRecords(scope) {
  const records = {};
  const healthOnly = scope === 'health';
  for (const key of healthOnly ? [BASELINE_KEY, A1C_HISTORY_KEY] : recordKeys) {
    const raw = localStorage.getItem(key);
    if (raw !== null) records[key] = raw;
  }

  const file = new Blob([JSON.stringify({ version: 1, records }, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = href;
  link.download = healthOnly ? 'macro-longevity-health-results.json' : 'macro-longevity-data.json';
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
}
