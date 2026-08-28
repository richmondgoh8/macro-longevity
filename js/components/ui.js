// Shared presentation helpers. Data and page modules own content; this file
// keeps escaping and the small set of repeated UI primitives consistent.

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[char]));
}

export function sectionHeader({ eyebrow = '', title = '', description = '', className = '' } = {}) {
  return `<div class="ui-section-head ${escapeHTML(className)}">${eyebrow ? `<p class="eyebrow">${escapeHTML(eyebrow)}</p>` : ''}<h2>${escapeHTML(title)}</h2>${description ? `<p>${escapeHTML(description)}</p>` : ''}</div>`;
}

export function badge(label, tone = 'neutral') {
  return `<span class="ui-badge ui-badge-${escapeHTML(tone)}">${escapeHTML(label)}</span>`;
}

const ICON_PATHS = {
  add: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  delete: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  minus: '<path d="M5 12h14"/>',
};

export function icon(name) {
  const path = ICON_PATHS[name];
  if (!path) return '';
  return `<svg class="ui-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

export function iconButton({ iconName, label, tone = 'neutral', pressed, tooltip = label, data = {} } = {}) {
  const dataAttributes = Object.entries(data)
    .map(([key, value]) => ` data-${escapeHTML(key)}="${escapeHTML(value)}"`)
    .join('');
  const pressedAttribute = typeof pressed === 'boolean' ? ` aria-pressed="${pressed}"` : '';
  return `<button type="button" class="ui-icon-button ui-icon-button-${escapeHTML(tone)}" aria-label="${escapeHTML(label)}"${pressedAttribute}${dataAttributes}>${icon(iconName)}<span class="ui-tooltip" role="tooltip">${escapeHTML(tooltip)}</span></button>`;
}

let confirmResolver = null;
let confirmReturnFocus = null;
let confirmScrollPosition = { x: 0, y: 0 };
let toastTimer = null;

export function showToast(message, { duration = 3500 } = {}) {
  let toast = document.querySelector('[data-ui-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'ui-toast';
    toast.dataset.uiToast = '';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }

  window.clearTimeout(toastTimer);
  toast.textContent = String(message || '');
  toast.classList.remove('is-visible');
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, duration);
}

function confirmationDialog() {
  let dialog = document.querySelector('[data-confirm-dialog]');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'ui-confirm-dialog';
  dialog.dataset.confirmDialog = '';
  dialog.innerHTML = `<form method="dialog" class="ui-confirm-form">
    <div class="ui-confirm-head"><div><p class="eyebrow">Please confirm</p><h2 data-confirm-title></h2></div><button type="submit" value="cancel" class="ui-icon-button" aria-label="Close">${icon('close')}<span class="ui-tooltip" role="tooltip">Close</span></button></div>
    <p class="ui-confirm-summary" data-confirm-summary></p>
    <div class="ui-confirm-details" data-confirm-details hidden></div>
    <div class="ui-confirm-actions"><button type="submit" value="cancel" class="button button-secondary" data-confirm-cancel>Cancel</button><button type="submit" value="confirm" class="button button-danger" data-confirm-submit>Delete</button></div>
  </form>`;
  dialog.addEventListener('close', () => {
    const confirmed = dialog.returnValue === 'confirm';
    const resolve = confirmResolver;
    const returnFocus = confirmReturnFocus;
    confirmResolver = null;
    confirmReturnFocus = null;
    resolve?.(confirmed);
    requestAnimationFrame(() => {
      returnFocus?.focus?.({ preventScroll: true });
      window.scrollTo({ ...confirmScrollPosition, behavior: 'instant' });
    });
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close('cancel');
  });
  document.body.append(dialog);
  return dialog;
}

export function confirmAction({ title, summary, details = '', confirmLabel = 'Delete', returnFocus = document.activeElement } = {}) {
  const dialog = confirmationDialog();
  if (dialog.open) dialog.close('cancel');
  dialog.querySelector('[data-confirm-title]').textContent = String(title || 'Confirm action');
  dialog.querySelector('[data-confirm-summary]').textContent = String(summary || 'This action cannot be undone.');
  const detailsNode = dialog.querySelector('[data-confirm-details]');
  detailsNode.textContent = String(details || '');
  detailsNode.hidden = !details;
  dialog.querySelector('[data-confirm-submit]').textContent = String(confirmLabel);
  confirmReturnFocus = returnFocus;
  confirmScrollPosition = { x: window.scrollX, y: window.scrollY };
  dialog.showModal();
  requestAnimationFrame(() => dialog.querySelector('[data-confirm-cancel]')?.focus());
  return new Promise((resolve) => { confirmResolver = resolve; });
}
