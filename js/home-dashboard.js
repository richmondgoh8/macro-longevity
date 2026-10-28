import { SG_MARKERS } from './data/screening.js';
import { REFERENCE_RANGES } from './data/reference-ranges.js';
import { escapeHTML } from './components/ui.js';

const mount = document.getElementById('sg-home-dashboard');
let alternate = false;

function scale(reference) {
  const variant = alternate && reference.alternate;
  return `<p class="sg-reference-unit">${escapeHTML(variant ? variant.unit : reference.unit)}</p>
    <dl class="sg-range-scale${reference.bands.length === 2 ? ' sg-range-binary' : ''}" aria-label="Reference categories, not a linear scale">
      ${reference.bands.map(([label, value], index) => `<div class="sg-range-band sg-range-${reference.bands.length === 2 && index === 1 ? 2 : index}"><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(variant ? variant.values[index] : value)}</dd></div>`).join('')}
    </dl>`;
}

function card(reference) {
  const marker = SG_MARKERS.find(marker => marker.id === reference.id);
  return `<article class="sg-marker-card sg-reference-card" data-reference-card="${marker.id}">
    <div class="sg-marker-front">
      <header><p class="sg-marker-eyebrow">${escapeHTML(marker.eyebrow)}</p><h3>${escapeHTML(marker.label)}</h3></header>
      <div data-reference-scale>${scale(reference)}</div>
      <p class="sg-reference-note">${escapeHTML(reference.note)}</p>
      ${reference.safety ? `<p class="sg-reference-safety">${escapeHTML(reference.safety)} <a href="${escapeHTML(reference.safetySource)}" target="_blank" rel="noreferrer">Urgent-care guidance ↗</a></p>` : ''}
    </div>
    <details class="sg-marker-details">
      <summary aria-label="View actions for ${escapeHTML(marker.label)}"><span class="sg-flip-open">View actions ↻</span><span class="sg-flip-close">← Back to ranges</span></summary>
      <h3 class="sg-marker-back-title">${escapeHTML(marker.label)}</h3>
      <div data-reference-actions></div>
      <p class="sg-marker-reference"><a href="${escapeHTML(reference.source || marker.source)}" target="_blank" rel="noreferrer">Range source ↗</a></p>
    </details>
  </article>`;
}

if (mount) {
  mount.innerHTML = `<div class="sg-reference-guide">
    <header class="sg-reference-intro"><p class="section-eyebrow">Compare your report · choose your next step</p>
      <h2>Know your range. Know what to do.</h2>
      <p>Compare your result with the labelled bands, then flip for practical actions. No result entry needed.</p>
    </header>
    <div class="sg-reference-toolbar"><div class="sg-reference-units" role="group" aria-label="Reference units">
      <button type="button" data-reference-units="local" aria-pressed="true">Singapore units</button>
      <button type="button" data-reference-units="alternate" aria-pressed="false">Alternative units</button>
    </div><a href="pages/blood.html#sg-health-dashboard">Record and review my results →</a></div>
    <p class="sg-reference-key"><strong>Green: lower concern · Amber: watch · Red: review.</strong> Adult reference categories—not diagnoses or personal targets. Equal-width bands aren’t a numeric ruler; low values can also be concerning.</p>
    <div class="sg-marker-grid">${REFERENCE_RANGES.slice(0, 6).map(card).join('')}</div>
    <details class="sg-marker-group sg-reference-more"><summary>More reference cards · waist, non-HDL, HbA1c, Lp(a), hs-CRP and kidneys</summary><div class="sg-marker-grid">${REFERENCE_RANGES.slice(6).map(card).join('')}</div></details>
    <p class="sg-reference-note">Actions support your care; they do not guarantee a lab target. Start gradually and follow any diet or exercise limits from your care team. <a href="pages/blood.html">See screening guidance and action references →</a></p>
  </div>`;

  mount.addEventListener('click', event => {
    const button = event.target.closest('[data-reference-units]');
    if (!button) return;
    alternate = button.dataset.referenceUnits === 'alternate';
    mount.querySelectorAll('[data-reference-units]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    mount.querySelectorAll('[data-reference-card]').forEach(node => {
      node.querySelector('[data-reference-scale]').innerHTML = scale(REFERENCE_RANGES.find(reference => reference.id === node.dataset.referenceCard));
    });
  });

  mount.addEventListener('toggle', async event => {
    const details = event.target;
    if (!details.matches('.sg-marker-details')) return;
    const node = details.closest('[data-reference-card]');
    const marker = SG_MARKERS.find(marker => marker.id === node.dataset.referenceCard);
    node.dataset.flipped = details.open ? 'back' : 'front';
    details.querySelector('summary').setAttribute('aria-label', `${details.open ? 'Back to ranges' : 'View actions'} for ${marker.label}`);
    details.querySelector('summary').scrollIntoView({ block: 'nearest', behavior: 'instant' });
    if (!details.open || details.dataset.loaded) return;
    const target = details.querySelector('[data-reference-actions]');
    target.setAttribute('aria-busy', 'true');
    try {
      const { SG_MARKER_ACTIONS, SG_MARKER_CONTEXT } = await import('./data/screening-actions.js');
      target.innerHTML = `<ol>${SG_MARKER_ACTIONS[marker.id].map(([title, text]) => `<li><strong>${escapeHTML(title)}</strong><span>${escapeHTML(text)}</span></li>`).join('')}</ol><p class="sg-marker-reference">${escapeHTML(SG_MARKER_CONTEXT[marker.id])}</p>`;
      details.dataset.loaded = 'true';
    } catch {
      target.textContent = 'Actions could not load. Close and reopen to retry.';
    } finally { target.removeAttribute('aria-busy'); }
  }, true);
}
