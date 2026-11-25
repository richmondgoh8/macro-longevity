import { BASELINE_KEY, SG_MARKERS } from './data/screening.js?v=3';

const form = document.querySelector('#results-form');
const fields = form.querySelector('[data-results]');
const saveStatus = form.querySelector('[data-save-status]');

function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function readState() {
  const raw = localStorage.getItem(BASELINE_KEY);
  const state = objectOrEmpty(JSON.parse(raw));
  return { ...state, values: objectOrEmpty(state.values), units: objectOrEmpty(state.units) };
}

let baseline = { values: {}, units: {} };
try {
  baseline = readState();
} catch {
  saveStatus.textContent = 'Could not load results. Try the full archive.';
}

const rows = SG_MARKERS.map(({ id, label, units, example, hint }) => {
  const row = document.createElement('div');
  row.className = 'result-field';
  // Only source-controlled marker definitions enter the HTML template.
  row.innerHTML = `
    <label for="${id}">${label}</label>
    <div class="reading-controls">
      <input id="${id}" type="text" inputmode="${id === 'bp' ? 'text' : 'decimal'}" placeholder="e.g. ${example}"
        aria-describedby="${id}-context ${id}-error" autocomplete="off">
      ${units.length > 1
        ? `<label class="visually-hidden" for="${id}-unit">${label} report unit</label><select id="${id}-unit"></select>`
        : `<span class="fixed-unit" id="${id}-unit">${units[0]}</span>`}
    </div>
    <p class="hint" id="${id}-context">${hint}</p>
    ${units.length > 1 ? `<label class="unit-confirm" hidden>
      <input type="checkbox">
      <span>I checked the report and confirmed this unit for ${label}.</span>
    </label>` : ''}
    <p class="field-error" id="${id}-error" hidden></p>`;
  const input = row.querySelector('input');
  const select = row.querySelector('select');
  const confirmation = row.querySelector('.unit-confirm');
  const confirmUnit = confirmation?.querySelector('input');
  const error = row.querySelector('.field-error');
  input.value = baseline.values[id] ?? '';
  if (select) {
    const unit = typeof baseline.units[id] === 'string' ? baseline.units[id] : units[0];
    const options = new Set([...units, unit]);
    for (const option of options) select.add(new Option(option, option));
    select.value = unit;
  } else {
    input.setAttribute('aria-describedby', `${id}-unit ${id}-context ${id}-error`);
  }
  fields.append(row);
  return { id, input, select, confirmation, confirmUnit, error, value: input.value, unit: select?.value };
});

function showFieldError(row, message) {
  row.error.textContent = message;
  row.error.hidden = !message;
  if (message) row.input.setAttribute('aria-invalid', 'true');
  else row.input.removeAttribute('aria-invalid');
}

function validate(id, value) {
  if (!value) return '';
  if (id === 'bp') {
    const parts = /^(\d{2,3})\s*\/\s*(\d{2,3})$/.exec(value);
    if (parts && Number(parts[1]) > Number(parts[2]) && Number(parts[2]) > 0) return '';
    return 'Enter systolic/diastolic, for example 122/78.';
  }
  const reportValue = /^(<=|>=|[<>≤≥])?\s*(\d+(?:[.,]\d+)?|[.,]\d+)$/.exec(value);
  if (reportValue && (!reportValue[1] || id !== 'waist')) {
    const number = Number(reportValue[2].replace(',', '.'));
    if (Number.isFinite(number) && (number > 0 || id === 'lpa')) return '';
  }
  return 'Enter a number as shown on your report.';
}

function changedRows() {
  return rows.filter((row) => row.input.value.trim() !== row.value.trim() || row.select?.value !== row.unit);
}

function hasUnitCorrection(row) {
  return Boolean(row.value.trim() && row.input.value.trim() === row.value.trim() && row.select?.value !== row.unit);
}

function warnAboutUnsavedChanges(event) {
  event.preventDefault();
  event.returnValue = true;
}

form.addEventListener('input', ({ target }) => {
  const row = rows.find(({ input, select }) => target === input || target === select);
  if (!row) return;
  if (row.confirmation) {
    row.confirmUnit.checked = false;
    row.confirmation.hidden = !hasUnitCorrection(row);
  }
  if (row.input.hasAttribute('aria-invalid')) showFieldError(row, validate(row.id, row.input.value.trim()));
  if (changedRows().length) {
    window.addEventListener('beforeunload', warnAboutUnsavedChanges);
    saveStatus.textContent = 'Unsaved changes.';
  } else {
    window.removeEventListener('beforeunload', warnAboutUnsavedChanges);
    saveStatus.textContent = '';
  }
});

function saveResults() {
  const changed = changedRows();
  let firstError;
  for (const row of changed) {
    const error = row.input.value.trim() !== row.value.trim() ? validate(row.id, row.input.value.trim()) : '';
    showFieldError(row, error);
    if (error) firstError ??= row.input;
  }
  if (firstError) {
    firstError.focus();
    saveStatus.textContent = 'Check the highlighted result.';
    return;
  }
  if (!changed.length) {
    if (saveStatus.textContent.startsWith('Could not load')) return;
    saveStatus.textContent = 'No changes to save.';
    return;
  }
  const correction = changed.find((row) => hasUnitCorrection(row) && !row.confirmUnit.checked);
  if (correction) {
    correction.confirmation.hidden = false;
    correction.confirmUnit.focus();
    saveStatus.textContent = 'Check the unit against your report and confirm the correction.';
    return;
  }

  try {
    const state = readState();
    if (changed.some(({ id, value, unit, select }) =>
      String(state.values[id] ?? '').trim() !== value.trim() ||
      (select && (typeof state.units[id] === 'string' ? state.units[id] : select.options[0].value) !== unit))) {
      saveStatus.textContent = 'A result changed in another tab. Copy your draft before reloading.';
      return;
    }
    for (const { id, input, value, select } of changed) {
      const next = input.value.trim();
      if (next !== value.trim()) {
        if (next) state.values[id] = next;
        else delete state.values[id];
      }
      if (select) state.units[id] = select.value;
    }
    localStorage.setItem(BASELINE_KEY, JSON.stringify(state));
    for (const row of changed) {
      row.value = row.input.value;
      row.unit = row.select?.value;
      if (row.confirmation) {
        row.confirmation.hidden = true;
        row.confirmUnit.checked = false;
      }
    }
    window.removeEventListener('beforeunload', warnAboutUnsavedChanges);
    saveStatus.textContent = 'Results saved on this device.';
  } catch {
    saveStatus.textContent = 'Could not save results. Your edits are still here.';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (navigator.locks) navigator.locks.request(BASELINE_KEY, saveResults);
  else saveResults();
});

const downloads = document.querySelector('[data-download]');
downloads.addEventListener('click', async ({ target }) => {
  if (!target.dataset.export) return;
  const status = downloads.querySelector('[role=status]');
  try {
    const { downloadRecords } = await import('./export.js?v=3');
    downloadRecords(target.dataset.export);
    status.textContent = 'Download requested.';
  } catch {
    status.textContent = 'Could not download your data. Check browser storage.';
  }
});

form.hidden = false;
downloads.hidden = false;

document.querySelector('[data-history]').ontoggle = ({ target }) => {
  if (target.open) import('./a1c-history.js?v=2').catch(() => {
    target.querySelector('[role=status]').textContent = 'Reopen the log to retry.';
  });
};
