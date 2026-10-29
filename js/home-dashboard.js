import { SG_MARKERS } from './data/screening.js';
import { SG_MARKER_ACTIONS } from './data/screening-actions.js';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS, TESTING_SCHEDULE } from './data/health-reference-groups.js';
import { escapeHTML } from './components/ui.js';
import { initReferenceNavigation } from './components/reference-navigation.js';

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
  return `<article id="biomarker-${id}" tabindex="-1" class="sg-marker-card sg-reference-card" data-reference-card="${id}" aria-labelledby="biomarker-${id}-title">
    <header><h3 id="biomarker-${id}-title">${escapeHTML(label)}</h3><button type="button" class="sg-copy-link" data-copy-reference="${id}" aria-label="Copy link to ${escapeHTML(label)}">Copy link</button></header>
    <div data-reference-scale>${scale(reference)}</div>
    <p class="sg-reference-note">${escapeHTML(reference.note)}</p>
    ${reference.safety ? `<p class="sg-reference-safety">${escapeHTML(reference.safety)} <a href="${escapeHTML(reference.safetySource)}" target="_blank" rel="noreferrer">Urgent-care guidance ↗</a></p>` : ''}
    <div class="sg-card-action"><h4>Action plan</h4><p>${escapeHTML(action)}</p></div>
    <p class="sg-marker-reference sg-reference-source"><a href="${escapeHTML(reference.source || marker.source)}" aria-label="Reference source for ${escapeHTML(label)}" target="_blank" rel="noreferrer">Reference source <span aria-hidden="true">↗</span></a>${reference.extraSource ? ` · <a href="${escapeHTML(reference.extraSource)}" aria-label="Additional guidance for ${escapeHTML(label)}" target="_blank" rel="noreferrer">Additional guidance <span aria-hidden="true">↗</span></a>` : ''}</p>
  </article>`;
}

function group(group, index) {
  const previous = HEALTH_REFERENCE_GROUPS[index - 1];
  const next = HEALTH_REFERENCE_GROUPS[index + 1];
  return `<section id="reference-${group.id}" tabindex="-1" class="sg-reference-group" data-reference-group="${group.id}" aria-labelledby="reference-${group.id}-title">
    <header><p class="section-eyebrow">${String(index + 1).padStart(2, '0')}</p><h2 id="reference-${group.id}-title">${escapeHTML(group.title)}</h2><p class="sg-reference-note">${escapeHTML(group.description)}${group.source ? ` <a href="${escapeHTML(group.source)}" target="_blank" rel="noreferrer">Screening evidence ↗</a>` : ''}</p></header>
    <div class="sg-marker-grid">${group.ids.map(card).join('')}</div>
    <div class="sg-group-plan"><h3>Put this group into practice</h3><ol>${group.plan.map(step => `<li>${escapeHTML(step)}</li>`).join('')}</ol></div>
    <nav class="sg-section-paging" aria-label="${escapeHTML(group.short)} adjacent sections">${previous ? `<a href="#reference-${previous.id}">← Previous: ${escapeHTML(previous.short)}</a>` : '<a href="#reference-top">↑ Guide overview</a>'}${next ? `<a href="#reference-${next.id}">Next: ${escapeHTML(next.short)} →</a>` : '<a href="#testing-schedule">Next: Testing schedule →</a>'}</nav>
  </section>`;
}

if (mount) {
  mount.innerHTML = `<div class="sg-reference-guide">
    <div class="sg-reference-units" role="group" aria-label="Reference units">
      <button type="button" data-reference-units="local" aria-pressed="true">Singapore units</button>
      <button type="button" data-reference-units="alternate" aria-pressed="false">Alternative units</button>
    </div>
    <p class="sg-reference-key"><strong>Green: lower concern · Amber: watch · Red: review.</strong> Adult guideposts, not diagnoses or personal targets. Neutral cards use lab-/risk-specific context; low values can also need review.</p>
    <div class="sg-reference-layout">
    <aside class="sg-reference-rail">
      <details class="sticky-pin-nav sg-reference-picker" open>
        <summary>Jump to: <span data-reference-current>Metabolic · 1/7</span></summary>
        <p class="sticky-pin-label sg-reference-desktop-label">On this page</p>
        <form class="sg-reference-search" role="search" aria-label="Find a biomarker">
          <label for="reference-search">Find a biomarker</label>
          <input id="reference-search" type="search" placeholder="e.g. ApoB" autocomplete="off" aria-describedby="reference-search-status">
          <p id="reference-search-status" role="status"></p>
          <ul data-reference-results hidden></ul>
        </form>
        <nav aria-label="Health reference groups" class="sg-reference-jumps sticky-pin-list">${HEALTH_REFERENCE_GROUPS.map(group => `<a class="sticky-pin-link" href="#reference-${group.id}">${escapeHTML(group.short)}</a>`).join('')}<a class="sticky-pin-link" href="#testing-schedule">Testing schedule</a></nav>
      </details>
      <a class="sg-reference-top" href="#reference-top" hidden>↑ Top</a>
    </aside>
    <div class="sg-reference-content">
    ${HEALTH_REFERENCE_GROUPS.map(group).join('')}
    <section id="testing-schedule" tabindex="-1" class="sg-testing-schedule" aria-labelledby="testing-schedule-title"><h2 id="testing-schedule-title">Testing schedule: match the test to the question</h2><dl>${TESTING_SCHEDULE.map(([title, text]) => `<div><dt>${escapeHTML(title)}</dt><dd>${escapeHTML(text)}</dd></div>`).join('')}</dl><p class="sg-reference-note">Schedule references: <a href="https://www.healthhub.sg/well-being-and-lifestyle/personal-care/type-2-screening-tests" target="_blank" rel="noreferrer">Singapore screening guidance</a> · <a href="https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet" target="_blank" rel="noreferrer">Genetic risk assessment</a> · <a href="https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-for-prevention-of-disease" target="_blank" rel="noreferrer">Vitamin D testing guidance</a>.</p><nav class="sg-section-paging" aria-label="Testing schedule adjacent sections"><a href="#reference-functional">← Previous: Fitness &amp; body</a><a href="#reference-top">↑ Guide overview</a></nav></section>
    <p class="sg-reference-note">Educational guidance, not an individual testing prescription. Actions do not guarantee a biomarker target or cancer prevention. Start gradually and follow any limits from your care team. Action references: <a href="https://www.healthhub.sg/well-being-and-lifestyle/exercise-and-fitness/150minutes" target="_blank" rel="noreferrer">Activity</a> · <a href="https://www.healthhub.sg/health-conditions/hyperlipidemia" target="_blank" rel="noreferrer">Food and fibre</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/sodium-reduction" target="_blank" rel="noreferrer">Sodium</a>.</p>
    </div></div>
    <p class="sr-only" data-reference-feedback role="status"></p>
  </div>`;

  initReferenceNavigation(mount, HEALTH_REFERENCE_GROUPS, references, markers);

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
