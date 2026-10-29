import { SG_MARKERS } from './data/screening.js';
import { SG_MARKER_ACTIONS } from './data/screening-actions.js';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS, TESTING_SCHEDULE } from './data/health-reference-groups.js';
import { escapeHTML } from './components/ui.js';

const mount = document.getElementById('sg-home-dashboard');
let alternate = false;
const references = new Map(HEALTH_REFERENCES.map(reference => [reference.id, reference]));
const markers = new Map(SG_MARKERS.map(marker => [marker.id, marker]));

function scale(reference) {
  const variant = alternate && reference.alternate;
  const unit = variant ? variant.unit : reference.unit;
  if (!reference.bands) return `<p class="sg-reference-unit">${escapeHTML(unit)}</p><dl class="sg-range-context"><dt>Reference / eligibility</dt><dd>${escapeHTML(reference.reference)}</dd></dl>`;
  return `<p class="sg-reference-unit">${escapeHTML(unit)}</p>
    <dl class="sg-range-scale${reference.bands.length === 2 ? ' sg-range-binary' : ''}" aria-label="Reference categories, not a linear scale">
      ${reference.bands.map(([label, value], index) => `<div class="sg-range-band sg-range-${reference.bands.length === 2 && index === 1 ? 2 : index}"><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(variant ? variant.values[index] : value)}</dd></div>`).join('')}
    </dl>`;
}

function card(id) {
  const reference = references.get(id);
  const marker = markers.get(id);
  const label = reference.label || marker.label;
  const action = reference.action || SG_MARKER_ACTIONS[id][0].join('. ');
  return `<article class="sg-marker-card sg-reference-card" data-reference-card="${id}">
    <header><h3>${escapeHTML(label)}</h3></header>
    <div data-reference-scale>${scale(reference)}</div>
    <p class="sg-reference-note">${escapeHTML(reference.note)}</p>
    ${reference.safety ? `<p class="sg-reference-safety">${escapeHTML(reference.safety)} <a href="${escapeHTML(reference.safetySource)}" target="_blank" rel="noreferrer">Urgent-care guidance ↗</a></p>` : ''}
    <div class="sg-card-action"><h4>Action plan</h4><p>${escapeHTML(action)}</p></div>
    <p class="sg-marker-reference sg-reference-source"><a href="${escapeHTML(reference.source || marker.source)}" aria-label="Reference source for ${escapeHTML(label)}" target="_blank" rel="noreferrer">Reference source <span aria-hidden="true">↗</span></a>${reference.extraSource ? ` · <a href="${escapeHTML(reference.extraSource)}" aria-label="Additional guidance for ${escapeHTML(label)}" target="_blank" rel="noreferrer">Additional guidance <span aria-hidden="true">↗</span></a>` : ''}</p>
  </article>`;
}

function group(group, index) {
  return `<section id="reference-${group.id}" class="sg-reference-group" data-reference-group="${group.id}" aria-labelledby="reference-${group.id}-title">
    <header><p class="section-eyebrow">${String(index + 1).padStart(2, '0')}</p><h2 id="reference-${group.id}-title">${escapeHTML(group.title)}</h2><p class="sg-reference-note">${escapeHTML(group.description)}${group.source ? ` <a href="${escapeHTML(group.source)}" target="_blank" rel="noreferrer">Screening evidence ↗</a>` : ''}</p></header>
    <div class="sg-marker-grid">${group.ids.map(card).join('')}</div>
    <div class="sg-group-plan"><h3>Put this group into practice</h3><ol>${group.plan.map(step => `<li>${escapeHTML(step)}</li>`).join('')}</ol></div>
  </section>`;
}

if (mount) {
  mount.innerHTML = `<div class="sg-reference-guide">
    <div class="sg-reference-units" role="group" aria-label="Reference units">
      <button type="button" data-reference-units="local" aria-pressed="true">Singapore units</button>
      <button type="button" data-reference-units="alternate" aria-pressed="false">Alternative units</button>
    </div>
    <p class="sg-reference-key"><strong>Green: lower concern · Amber: watch · Red: review.</strong> Adult guideposts, not diagnoses or personal targets. Neutral cards use lab-/risk-specific context; low values can also need review.</p>
    <nav class="sg-reference-jumps" aria-label="Health reference groups">${HEALTH_REFERENCE_GROUPS.map(group => `<a href="#reference-${group.id}">${escapeHTML(group.short)}</a>`).join('')}</nav>
    ${HEALTH_REFERENCE_GROUPS.map(group).join('')}
    <section class="sg-testing-schedule" aria-labelledby="testing-schedule-title"><h2 id="testing-schedule-title">Testing schedule: match the test to the question</h2><dl>${TESTING_SCHEDULE.map(([title, text]) => `<div><dt>${escapeHTML(title)}</dt><dd>${escapeHTML(text)}</dd></div>`).join('')}</dl><p class="sg-reference-note">Schedule references: <a href="https://www.healthhub.sg/well-being-and-lifestyle/personal-care/type-2-screening-tests" target="_blank" rel="noreferrer">Singapore screening guidance</a> · <a href="https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet" target="_blank" rel="noreferrer">Genetic risk assessment</a> · <a href="https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-for-prevention-of-disease" target="_blank" rel="noreferrer">Vitamin D testing guidance</a>.</p></section>
    <p class="sg-reference-note">Educational guidance, not an individual testing prescription. Actions do not guarantee a biomarker target or cancer prevention. Start gradually and follow any limits from your care team. Action references: <a href="https://www.healthhub.sg/well-being-and-lifestyle/exercise-and-fitness/150minutes" target="_blank" rel="noreferrer">Activity</a> · <a href="https://www.healthhub.sg/health-conditions/hyperlipidemia" target="_blank" rel="noreferrer">Food and fibre</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/sodium-reduction" target="_blank" rel="noreferrer">Sodium</a>.</p>
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
