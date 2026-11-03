import { PHYSICAL_MEASUREMENTS } from './data/physical-result-fields.js';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS } from './data/health-reference-groups.js';
import { PHYSICAL_REFERENCES } from './data/physical-measurements.js';
import { escapeHTML as escape } from './components/ui.js';

const KEY = 'health-physical-results-v1';

export function validPhysicalValue(value, field) {
  if (value === '') return true;
  const pattern = field.signed ? /^-?\d+(?:[.,]\d+)?$/ : /^\d+(?:[.,]\d+)?$/;
  const number = Number(value.replace(',', '.'));
  return pattern.test(value) && Number.isFinite(number) && (field.max === undefined || number <= field.max);
}

export function mountPhysicalMeasurements(root) {
  let records = {};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) records = saved;
  } catch { /* Keep a usable session if storage is unavailable. */ }
  const references = new Map([...PHYSICAL_REFERENCES, ...HEALTH_REFERENCES].map(item => [item.id, item]));
  const guideIds = new Set(HEALTH_REFERENCE_GROUPS.flatMap(group => group.ids));
  const input = (cardId, key, label, value, attributes = '') => `<div><label for="physical-${cardId}-${key}">${escape(label)}</label><input id="physical-${cardId}-${key}" data-physical-field="${key}" value="${escape(String(value || ''))}" maxlength="120" ${attributes}></div>`;
  root.innerHTML = `<p class="sg-group-copy">Optional measurements beyond the blood draw. Copy your report and method; these do not count toward the blood-and-urine panel. Units label your entered value and never convert it.</p>
    <div class="sg-marker-grid">${PHYSICAL_MEASUREMENTS.map(measurement => {
      const reference = references.get(measurement.referenceId);
      const saved = records[measurement.id] && typeof records[measurement.id] === 'object' ? records[measurement.id] : {};
      return `<article class="sg-marker-card sg-physical-card" data-physical-card="${measurement.id}" id="physical-${measurement.id}" tabindex="-1">
        <h4>${escape(measurement.label || reference.label)}</h4><p class="sg-group-copy">${escape(reference.reference)}</p>
        <div class="sg-physical-fields">${measurement.fields.map(field => {
          const inputMode = field.signed ? 'text' : 'decimal';
          const units = [...new Set([...(saved[`${field.id}-unit`] ? [String(saved[`${field.id}-unit`])] : []), ...field.units])];
          const unit = saved[`${field.id}-unit`] || field.units[0];
          if (units.length === 1) return `<div class="sg-physical-fixed-unit"><label for="physical-${measurement.id}-${field.id}">${escape(field.label)}</label><div class="sg-value-input"><input id="physical-${measurement.id}-${field.id}" data-physical-field="${field.id}" value="${escape(String(saved[field.id] || ''))}" inputmode="${inputMode}" maxlength="120" aria-describedby="physical-${measurement.id}-${field.id}-unit-label physical-${measurement.id}-status"><span id="physical-${measurement.id}-${field.id}-unit-label">${escape(unit)}</span></div><input type="hidden" data-physical-field="${field.id}-unit" value="${escape(unit)}"></div>`;
          return `${input(measurement.id, field.id, field.label, saved[field.id], `inputmode="${inputMode}" aria-describedby="physical-${measurement.id}-status"`)}<div><label for="physical-${measurement.id}-${field.id}-unit">${escape(field.label)} units</label><select id="physical-${measurement.id}-${field.id}-unit" data-physical-field="${field.id}-unit">${units.map(option => `<option${option === unit ? ' selected' : ''}>${escape(option)}</option>`).join('')}</select></div>`;
        }).join('')}</div>
        <details class="sg-physical-context"><summary>Measurement details</summary><div class="sg-physical-fields">
          ${input(measurement.id, 'date', 'Measurement date (optional)', saved.date, 'type="date"')}
          ${input(measurement.id, 'method', measurement.method + ' (optional)', saved.method)}
          ${measurement.side ? `<div><label for="physical-${measurement.id}-side">Reported side</label><select id="physical-${measurement.id}-side" data-physical-field="side">${['Not specified', 'Left', 'Right'].map(side => `<option${saved.side === side ? ' selected' : ''}>${side}</option>`).join('')}</select></div>` : ''}
          ${measurement.metric ? `<div><label for="physical-${measurement.id}-metric">HRV metric</label><select id="physical-${measurement.id}-metric" data-physical-field="metric">${['Not specified', ...measurement.metric].map(metric => `<option${saved.metric === metric ? ' selected' : ''}>${escape(metric)}</option>`).join('')}</select></div>` : ''}
        </div></details>
        <p id="physical-${measurement.id}-status" data-physical-status role="status"></p>
        ${guideIds.has(measurement.referenceId) ? `<a href="../#biomarker-${measurement.referenceId}">Reference &amp; action plan →</a>` : ''}
      </article>`;
    }).join('')}</div><p data-physical-storage role="status">Physical results stay in this browser, separately from laboratory results.</p>`;

  function updateCard(card) {
    const measurement = PHYSICAL_MEASUREMENTS.find(item => item.id === card.dataset.physicalCard);
    let invalid = false;
    for (const field of measurement.fields) {
      const node = card.querySelector(`[data-physical-field="${field.id}"]`);
      const valid = validPhysicalValue(node.value, field);
      node.setAttribute('aria-invalid', String(!valid));
      invalid ||= !valid;
    }
    card.querySelector('[data-physical-status]').textContent = invalid ? 'Check the value: enter a number in the displayed units. T-scores and Z-scores can be negative; percentages cannot exceed 100.' : '';
  }
  root.querySelectorAll('[data-physical-card]').forEach(updateCard);
  root.addEventListener('focusout', event => {
    if (event.target.matches('[data-physical-field]')) updateCard(event.target.closest('[data-physical-card]'));
  });
  root.addEventListener('input', event => {
    if (!event.target.matches('[data-physical-field]')) return;
    const card = event.target.closest('[data-physical-card]');
    records[card.dataset.physicalCard] = Object.fromEntries([...card.querySelectorAll('[data-physical-field]')].map(node => [node.dataset.physicalField, node.value]));
    let stored = true;
    try { localStorage.setItem(KEY, JSON.stringify(records)); } catch { stored = false; }
    root.querySelector('[data-physical-storage]').textContent = stored ? 'Physical results saved on this device. Units never convert entered values.' : 'Storage unavailable or full. Physical results are kept for this page session only.';
    if (event.target.matches('select')) {
      updateCard(card);
      if (!card.querySelector('[aria-invalid="true"]')) card.querySelector('[data-physical-status]').textContent = 'Context updated; entered values are unchanged.';
    }
  });
}
