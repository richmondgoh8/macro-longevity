import { measurementIdentity } from '../data/measurement-index.js';

export const normalizeMeasurement = value => String(value).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Exact aliases rank before token-prefix matches. Token boundaries keep HDL out of nonhdl.
export function searchMeasurements(items, query, label = item => item.label || item.name) {
  const normalized = normalizeMeasurement(query);
  if (!normalized) return [];
  const tokens = normalized.split(' ');
  return items.map((item, index) => {
    const identity = measurementIdentity(item.id);
    const names = [label(item), item.id, identity.id, identity.libraryId, ...identity.aliases, ...(item.aliases ? [item.aliases] : [])].map(normalizeMeasurement);
    const exact = names.some(name => name === normalized);
    const words = names.join(' ').split(' ');
    const match = exact || tokens.every(token => words.some(word => word.startsWith(token)));
    // HDL/HDL-C is a distinct measurement, not a shorthand for non-HDL cholesterol.
    const wrongLipid = identity.id === 'nonhdl' && tokens.includes('hdl') && !tokens.includes('non') && !tokens.includes('nonhdl');
    return { item, index, score: match && !wrongLipid ? (exact ? 2 : 1) : 0 };
  }).filter(result => result.score).sort((a, b) => b.score - a.score || a.index - b.index).map(result => result.item);
}
