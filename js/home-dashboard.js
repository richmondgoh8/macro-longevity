import { REFERENCE_ACTIONS } from './data/reference-actions.js';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS } from './data/health-reference-groups.js';
import { escapeHTML } from './components/ui.js';

const mount = document.getElementById('sg-home-dashboard');
let alternate = false;
const HOME_CORE_VITALS = [
  'bp', 'glucose', 'hba1c', 'apob', 'waist', 'hscrp', 'hdl', 'ldl', 'tg', 'egfr',
];
const references = new Map(HEALTH_REFERENCES.map(reference => [reference.id, reference]));

// Normalize the different reference sources to one display shape.
function rangeDisplay(reference) {
  const variant = alternate && reference.alternate;
  const display = { unit: variant ? variant.unit : reference.unit, items: [] };
  if (reference.labInterval) {
    display.items.push({
      label: 'Interpretive context',
      value: reference.interpretation || reference.reference,
      tone: 'neutral',
      emphasis: false,
    });
  } else if (reference.guide) {
    const [label, value, alternative] = reference.guide;
    display.items.push({ label, value: variant && alternative ? alternative : value, tone: 'neutral', emphasis: true });
  } else if (reference.bands) {
    display.items = reference.bands.map(([label, value, tone], index) => ({
      label,
      value: variant ? variant.values[index] : value,
      tone: tone || (reference.bands.length === 2 && index === 1 ? 'review' : ['normal', 'watch', 'review'][index] || 'neutral'),
      emphasis: true,
    }));
  } else {
    const cancer = HEALTH_REFERENCE_GROUPS.find(group => group.id === 'cancer');
    display.items.push({
      label: reference.groupId === 'cancer' || cancer.ids.includes(reference.id) ? 'Screening eligibility & evidence' : 'Report-specific reference context',
      value: reference.reference,
      tone: 'neutral',
      emphasis: false,
    });
  }
  return display;
}

function scale(reference) {
  const display = rangeDisplay(reference);
  const single = display.items.length === 1;
  const statusLabels = { normal: 'Favourable', watch: 'Context', review: 'Review', neutral: 'Context' };
  return `<p class="sg-reference-unit">${escapeHTML(display.unit)}</p>
    <dl class="sg-range-scale${single ? ' sg-range-single' : ''}" aria-label="Reference values">
      ${display.items.map(item => `<div class="sg-range-band" data-range-item data-range-tone="${item.tone}"><dt><span class="sg-range-status">${statusLabels[item.tone] || 'Context'}</span><span class="sg-range-description">${escapeHTML(item.label)}</span></dt><dd data-range-value>${item.emphasis ? `<strong>${escapeHTML(item.value)}</strong>` : escapeHTML(item.value)}</dd></div>`).join('')}
    </dl>`;
}

function card(id, extended = false) {
  const reference = references.get(id);
  const label = reference.label;
  const action = reference.action || REFERENCE_ACTIONS[id].join('. ');
  const heading = extended ? 'h4' : 'h3';
  const actionHeading = extended ? 'h5' : 'h4';
  return `<article id="biomarker-${id}" tabindex="-1" class="sg-marker-card sg-reference-card" data-reference-card="${id}" aria-labelledby="biomarker-${id}-title">
    <header><${heading} id="biomarker-${id}-title">${escapeHTML(label)}</${heading}><button type="button" class="sg-copy-link" data-copy-reference="${id}" aria-label="Copy link to ${escapeHTML(label)}">Copy link</button></header>
    <div data-reference-scale>${scale(reference)}</div>
    <div class="sg-reference-copy">${reference.inventoryNote ? `<p class="sg-reference-note">${escapeHTML(reference.inventoryNote)}</p>` : ''}
    <p class="sg-reference-note">${escapeHTML(reference.note)}</p>
    ${reference.safety ? `<p class="sg-reference-safety">${escapeHTML(reference.safety)} <a href="${escapeHTML(reference.safetySource)}" target="_blank" rel="noreferrer">Urgent-care guidance ↗</a></p>` : ''}</div>
    <div class="sg-card-action"><${actionHeading}>${escapeHTML(reference.actionLabel || 'Action plan')}</${actionHeading}><p>${escapeHTML(action)}</p></div>
    <p class="sg-marker-reference sg-reference-source"><a href="${escapeHTML(reference.source)}" aria-label="Reference source for ${escapeHTML(label)}" target="_blank" rel="noreferrer">Reference source <span aria-hidden="true">↗</span></a>${reference.extraSource ? ` · <a href="${escapeHTML(reference.extraSource)}" aria-label="Additional guidance for ${escapeHTML(label)}" target="_blank" rel="noreferrer">Additional guidance <span aria-hidden="true">↗</span></a>` : ''}</p>
  </article>`;
}


if (mount) {
  mount.innerHTML = `<div class="sg-reference-guide sg-core-vitals">
    <header class="sg-reference-section-head"><p class="section-eyebrow">Core health markers</p><h2>Key measures</h2><p>Blood pressure, blood sugar, cholesterol, kidney filtration and waist circumference. Match units to your report and discuss results with your clinician.</p></header>
    <div class="sg-reference-units" role="group" aria-label="Reference units">
      <button type="button" data-reference-units="local" aria-pressed="true">Singapore units</button>
      <button type="button" data-reference-units="alternate" aria-pressed="false">Alternative units</button>
    </div>
    <p class="sg-reference-key">Adult guideposts, not diagnoses or personal treatment targets.</p>
    <div class="sg-marker-grid">${HOME_CORE_VITALS.map(id => card(id)).join('')}</div>
  </div>`;

  mount.addEventListener('click', event => {
    const button = event.target.closest('[data-reference-units]');
    if (!button) return;
    alternate = button.dataset.referenceUnits === 'alternate';
    mount.querySelectorAll('[data-reference-units]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    mount.querySelectorAll('[data-reference-card]').forEach(node => {
      node.querySelector('[data-reference-scale]').innerHTML = scale(references.get(node.dataset.referenceCard));
    });
  });
}
