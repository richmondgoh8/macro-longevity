import { escapeHTML, iconButton, openModalDialog } from './ui.js';
import { NUTRIENT_TARGETS } from '../data/nutrition.js';

function shell(kicker, title, summary, body) {
  return `<div class="coverage-dialog-form"><div class="ui-modal-head"><div><p class="eyebrow">${escapeHTML(kicker)}</p><h2 id="coverage-dialog-title">${escapeHTML(title)}</h2></div>${iconButton({ iconName: 'close', label: 'Close coverage details', tooltip: null, data: { 'coverage-dialog-close': '' } })}</div><div class="coverage-dialog-body"><p id="coverage-dialog-summary">${escapeHTML(summary)}</p><div data-coverage-dialog-content>${body}</div></div></div>`;
}

export function open({ root, trigger, bodyWeightKg, returnFocus, renderAll }) {
  const dialog = root.querySelector('[data-coverage-dialog]') || document.createElement('dialog');
  if (!dialog.parentNode) { dialog.id = 'coverage-detail-dialog'; dialog.className = 'ui-modal coverage-detail-dialog'; dialog.setAttribute('data-coverage-dialog', ''); dialog.setAttribute('aria-labelledby', 'coverage-dialog-title'); dialog.setAttribute('aria-describedby', 'coverage-dialog-summary'); dialog.setAttribute('closedby', 'any'); root.append(dialog); }
  const mode = trigger?.dataset.coverageOpen;
  const originalFocus = dialog.open ? dialog.coverageReturnFocus : returnFocus;
  dialog.coverageReturnFocus = originalFocus;
  const card = mode === 'gap' ? trigger : null;
  const target = card ? NUTRIENT_TARGETS.find((candidate) => candidate.id === card.dataset.nutrientId || candidate.name === card.querySelector('strong')?.textContent) : null;
  const sourceNames = target ? card?.querySelector('p')?.textContent?.replace(/^Food-first:\s*/, '') || 'Check the food pattern' : '';
  if (mode === 'settings') {
    dialog.innerHTML = shell('Coverage settings', 'Coverage settings', 'Choose the body-weight reference used for the protein floor.', `<div class="builder-profile coverage-dialog-profile"><label for="coverage-body-weight">Protein reference body weight</label><div><input id="coverage-body-weight" type="number" min="35" max="250" step="1" value="${bodyWeightKg}" data-body-weight><span>kg · uses a 1.2 g/kg floor</span></div></div><p class="coverage-detail-note">This reference only changes the protein floor shown in the coverage view.</p>`);
  } else if (mode === 'gaps') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderAll();
    dialog.innerHTML = shell('Nutrient coverage', 'Priority gaps', 'Coverage counts use the existing approximate 80% threshold, not full target attainment.', wrapper.querySelector('.coverage-priority')?.outerHTML || '<p>No unresolved gaps.</p>');
  } else if (mode === 'all') {
    let renderedAll = '';
    if (typeof renderAll === 'function') {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderAll();
      const macroStrip = wrapper.querySelector('.macro-progress-strip');
      const all = wrapper.querySelector('.coverage-all');
      const note = wrapper.querySelector(".coverage-summary-note");
      all?.classList.add('coverage-all-modal');
      all?.querySelectorAll('details').forEach((group) => { group.open = true; });
      renderedAll = [note?.outerHTML, macroStrip?.outerHTML, all?.outerHTML].filter(Boolean).join('');
    }
    dialog.innerHTML = shell('Nutrient coverage', 'All nutrients', 'Amounts are planning estimates. “Covered” uses an approximate 80% reference threshold; exceeding a reference is not automatically unsafe.', `<div class="coverage-legend" aria-label="Coverage status legend"><span class="coverage-legend-item coverage-status-covered">Covered</span><span class="coverage-legend-item coverage-status-partial">In progress</span><span class="coverage-legend-item coverage-status-gap">Gap</span><span class="coverage-legend-item coverage-status-empty">Not started</span></div>${renderedAll || '<p>No nutrient coverage is available yet.</p>'}`);
  } else if (target && card) {
    const copy = card.cloneNode(true);
    copy.removeAttribute('data-coverage-open');
    dialog.innerHTML = shell('Unresolved gap', target.name, `Food-first · ${sourceNames}`, `<button type="button" class="text-button" data-coverage-open="gaps">Back to gaps</button>${copy.outerHTML}`);
  } else return;
  openModalDialog(dialog, { initialFocus: dialog.querySelector('[data-coverage-dialog-close]'), returnFocus: originalFocus, lightDismiss: true });
}
