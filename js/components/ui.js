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
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7.5h.01"/>',
  warning: '<path d="m12 4 9 16H3L12 4Z"/><path d="M12 9v5M12 17h.01"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  delete: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  minus: '<path d="M5 12h14"/>',
  pin: '<path d="M12 17v5M5 3h14l-2 6 3 3v2H4v-2l3-3-2-6Z"/>',
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
  return `<button type="button" class="ui-icon-button ui-icon-button-${escapeHTML(tone)}" aria-label="${escapeHTML(label)}" data-tooltip-trigger${pressedAttribute}${dataAttributes}>${icon(iconName)}<span class="ui-tooltip" role="tooltip">${escapeHTML(tooltip)}</span></button>`;
}

let modalControllerPromise;
function modalController() {
  return modalControllerPromise ||= import('./modal.js');
}

export async function openModalDialog(...args) {
  return (await modalController()).openModalDialog(...args);
}

export async function closeModalDialog(...args) {
  return (await modalController()).closeModalDialog(...args);
}

let confirmControllerPromise;
export async function confirmAction(...args) {
  return (await (confirmControllerPromise ||= import('./confirm.js'))).confirmAction(...args);
}

let toastControllerPromise;
export function showToast(...args) {
  toastControllerPromise ||= import('./toast.js');
  return toastControllerPromise.then(({ showToast: renderToast }) => renderToast(...args));
}
