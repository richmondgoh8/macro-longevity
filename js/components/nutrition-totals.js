// Pure reference-serving arithmetic shared by previews and daily coverage.
// Missing measurements remain distinguishable from a measured zero.
export function calculateNutrients(occurrences) {
  const totals = {};
  const missing = new Set();
  for (const { item, multiplier } of occurrences) {
    if (!item || !Number.isFinite(multiplier) || multiplier < 0) continue;
    for (const key of ['protein', 'carbs', 'fat']) {
      if (!Number.isFinite(item.nutrients?.[key])) missing.add(`${item.id}:${key}`);
    }
    for (const [key, value] of Object.entries(item.nutrients || {})) {
      if (Number.isFinite(value)) totals[key] = (totals[key] || 0) + value * multiplier;
      else missing.add(`${item.id}:${key}`);
    }
  }
  return { totals, missing: [...missing] };
}
