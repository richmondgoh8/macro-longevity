import { REFERENCE_ACTIONS } from './data/reference-actions.js';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS, TESTING_SCHEDULE } from './data/health-reference-groups.js';
import { escapeHTML } from './components/ui.js';
import { initReferenceNavigation } from './components/reference-navigation.js';

const mount = document.getElementById('sg-home-dashboard');
let alternate = false;
const references = new Map(HEALTH_REFERENCES.map(reference => [reference.id, reference]));
let labReferences;
let catalogueTask;
const extendedGroups = HEALTH_REFERENCE_GROUPS;

async function loadReferences() {
  if (!catalogueTask) catalogueTask = import('./data/extended-references.js').then(module => {
    labReferences = module.EXTENDED_REFERENCES;
    for (const reference of labReferences) {
      if (!references.has(reference.id)) references.set(reference.id, reference);
      else references.get(reference.id).aliases = reference.aliases;
    }
    return labReferences;
  }).catch(error => { catalogueTask = undefined; throw error; });
  return catalogueTask;
}

function renderExtended(groupId) {
  const disclosure = mount.querySelector(`[data-reference-extended="${groupId}"]`);
  if (!disclosure || disclosure.dataset.rendered) return;
  const families = new Map();
  for (const reference of labReferences.filter(item => item.groupId === groupId && !HEALTH_REFERENCES.some(core => core.id === item.id))) {
    if (!families.has(reference.familyId)) families.set(reference.familyId, []);
    families.get(reference.familyId).push(reference);
  }
  disclosure.querySelector('[data-extended-content]').innerHTML = [...families.values()].map(items => `<div class="sg-extended-family"><h3>${escapeHTML(items[0].familyLabel)}</h3><div class="sg-marker-grid">${items.map(item => card(item.id, true)).join('')}</div></div>`).join('');
  disclosure.dataset.rendered = 'true';
}

async function revealReference(id) {
  await loadReferences();
  const reference = references.get(id);
  if (!reference) return;
  renderExtended(reference.groupId);
  const target = document.getElementById(`biomarker-${id}`);
  if (target) for (let parent = target.parentElement; parent && parent !== mount; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
  return target;
}

function loadFailure(node) {
  node.innerHTML = 'Extended references could not load. Reconnect if these files have not been cached, then reload to retry. <button type="button" data-reference-reload>Reload to retry</button>';
}

function scale(reference) {
  const variant = alternate && reference.alternate;
  const unit = variant ? variant.unit : reference.unit;
  if (reference.labInterval) {
    const lab = reference.labInterval;
    return `<p class="sg-reference-unit">${escapeHTML(unit)}</p><dl class="sg-range-context sg-lab-interval"><dt>Example lab interval</dt><dd><strong>${escapeHTML(lab.values)} ${escapeHTML(lab.unit)}</strong></dd></dl><details class="sg-lab-details"><summary>Lab & interpretation details</summary><p>${escapeHTML(lab.lab)}; ${escapeHTML(lab.population)}.</p><p>Your reporting laboratory’s interval takes precedence; not a treatment target.</p>${reference.interpretation ? `<p>${escapeHTML(reference.interpretation)}</p>` : ''}</details>`;
  }
  if (!reference.bands) return `<p class="sg-reference-unit">${escapeHTML(unit)}</p><dl class="sg-range-context"><dt>Reference / eligibility</dt><dd>${escapeHTML(reference.reference)}</dd></dl>`;
  return `<p class="sg-reference-unit">${escapeHTML(unit)}</p>
    <dl class="sg-range-scale${reference.bands.length === 2 ? ' sg-range-binary' : ''}" aria-label="Reference categories, not a linear scale">
      ${reference.bands.map(([label, value], index) => `<div class="sg-range-band sg-range-${reference.bands.length === 2 && index === 1 ? 2 : index}"><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(variant ? variant.values[index] : value)}</dd></div>`).join('')}
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

function group(group, index) {
  const previous = HEALTH_REFERENCE_GROUPS[index - 1];
  const next = HEALTH_REFERENCE_GROUPS[index + 1];
  return `<section id="reference-${group.id}" tabindex="-1" class="sg-reference-group" data-reference-group="${group.id}" aria-labelledby="reference-${group.id}-title">
    <header><p class="section-eyebrow">${String(index + 1).padStart(2, '0')}</p><h2 id="reference-${group.id}-title">${escapeHTML(group.title)}</h2><p class="sg-reference-note">${escapeHTML(group.description)}${group.source ? ` <a href="${escapeHTML(group.source)}" target="_blank" rel="noreferrer">Screening evidence ↗</a>` : ''}</p></header>
    <div class="sg-marker-grid">${group.ids.map(id => card(id)).join('')}</div>
    <details class="sg-extended-references" data-reference-extended="${group.id}"><summary>Extended references · ${escapeHTML(group.short)}</summary><div data-extended-content><p>Lab and specialist explanations, report-specific context and shared family plans. Historical examples are not testing recommendations or personal targets.</p></div></details>
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
        <button type="button" class="sg-show-all" data-reference-show-all>Show all references</button><p class="sg-reference-note" data-reference-complete-status role="status"></p>
      </details>
      <a class="sg-reference-top" href="#reference-top" hidden>↑ Top</a>
    </aside>
    <div class="sg-reference-content">
    <p class="sg-print-warning">This print may omit unloaded extended references. Before printing a complete guide, choose “Show all references” in the contents picker.</p>
    ${HEALTH_REFERENCE_GROUPS.map(group).join('')}
    <section id="testing-schedule" tabindex="-1" class="sg-testing-schedule" aria-labelledby="testing-schedule-title"><h2 id="testing-schedule-title">Testing schedule: match the test to the question</h2><dl>${TESTING_SCHEDULE.map(([title, text]) => `<div><dt>${escapeHTML(title)}</dt><dd>${escapeHTML(text)}</dd></div>`).join('')}</dl><p class="sg-reference-note">Schedule references: <a href="https://www.healthhub.sg/well-being-and-lifestyle/personal-care/type-2-screening-tests" target="_blank" rel="noreferrer">Singapore screening guidance</a> · <a href="https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet" target="_blank" rel="noreferrer">Genetic risk assessment</a> · <a href="https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-for-prevention-of-disease" target="_blank" rel="noreferrer">Vitamin D testing guidance</a>.</p><nav class="sg-section-paging" aria-label="Testing schedule adjacent sections"><a href="#reference-functional">← Previous: Fitness &amp; body</a><a href="#reference-top">↑ Guide overview</a></nav></section>
    <p class="sg-reference-note">Educational guidance, not an individual testing prescription. Actions do not guarantee a biomarker target or cancer prevention. Start gradually and follow any limits from your care team. Action references: <a href="https://www.healthhub.sg/well-being-and-lifestyle/exercise-and-fitness/150minutes" target="_blank" rel="noreferrer">Activity</a> · <a href="https://www.healthhub.sg/health-conditions/hyperlipidemia" target="_blank" rel="noreferrer">Food and fibre</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/sodium-reduction" target="_blank" rel="noreferrer">Sodium</a>.</p>
    </div></div>
    <p class="sr-only" data-reference-feedback role="status"></p>
  </div>`;

  initReferenceNavigation(mount, HEALTH_REFERENCE_GROUPS, references, { load: loadReferences, reveal: revealReference });

  mount.querySelectorAll('[data-reference-extended]').forEach(disclosure => disclosure.addEventListener('toggle', async () => {
    if (!disclosure.open || disclosure.dataset.rendered) return;
    const content = disclosure.querySelector('[data-extended-content]');
    content.textContent = 'Loading extended references…';
    try { await loadReferences(); renderExtended(disclosure.dataset.referenceExtended); }
    catch { loadFailure(content); }
  }));
  mount.querySelector('[data-reference-show-all]').addEventListener('click', async event => {
    const button = event.currentTarget;
    const status = mount.querySelector('[data-reference-complete-status]');
    button.disabled = true;
    status.textContent = 'Loading lab and specialist references…';
    try {
      await loadReferences();
      extendedGroups.forEach(group => { renderExtended(group.id); mount.querySelector(`[data-reference-extended="${group.id}"]`).open = true; });
      mount.dataset.completeReferences = 'true';
      status.textContent = `All ${references.size} included references shown. Ready for reading or printing.`;
    } catch { loadFailure(status); }
    finally { button.disabled = false; }
  });
  let printState;
  const printLabs = [];
  window.addEventListener('beforeprint', () => {
    if (labReferences) {
      printState = { complete: mount.dataset.completeReferences, disclosures: [...mount.querySelectorAll('[data-reference-extended]')].map(node => [node, node.open]) };
      extendedGroups.forEach(group => { renderExtended(group.id); mount.querySelector(`[data-reference-extended="${group.id}"]`).open = true; });
      mount.dataset.completeReferences = 'true';
    }
    mount.querySelectorAll('.sg-lab-details:not([open])').forEach(node => { node.open = true; printLabs.push(node); });
  });
  window.addEventListener('afterprint', () => {
    printLabs.splice(0).forEach(node => { node.open = false; });
    printState?.disclosures.forEach(([node, open]) => { node.open = open; });
    if (!printState?.complete) delete mount.dataset.completeReferences;
    printState = undefined;
  });

  mount.addEventListener('click', event => {
    if (event.target.closest('[data-reference-reload]')) { location.reload(); return; }
    const button = event.target.closest('[data-reference-units]');
    if (!button) return;
    alternate = button.dataset.referenceUnits === 'alternate';
    mount.querySelectorAll('[data-reference-units]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    mount.querySelectorAll('[data-reference-card]').forEach(node => {
      node.querySelector('[data-reference-scale]').innerHTML = scale(references.get(node.dataset.referenceCard));
    });
  });
}
