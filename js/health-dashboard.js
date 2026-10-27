// Shared local-first baseline workspace for the Home and Health routes.
import { SG_MARKERS, SG_MARKER_GROUPS, SG_SCREENING_PATHS, SG_SOURCES, SG_ACTION_SOURCES } from './data/screening.js';
import { escapeHTML } from './components/ui.js';

const STORAGE_KEY = 'sg-health-baseline-v1';

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { age: parsed?.age || '', sex: parsed?.sex || '', values: parsed?.values && typeof parsed.values === 'object' ? parsed.values : {}, units: parsed?.units && typeof parsed.units === 'object' ? parsed.units : {} };
  } catch {
    return { age: '', sex: '', values: {}, units: {} };
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}

function toNumber(value) {
  const text = String(value ?? '').trim().replace(',', '.');
  return /^\d+(?:\.\d+)?$/.test(text) ? Number(text) : null;
}

function parseBloodPressure(value) {
  const match = String(value).trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  return match ? { systolic: Number(match[1]), diastolic: Number(match[2]) } : null;
}

function markerUnit(marker, state) {
  return marker.units?.includes(state.units[marker.id]) ? state.units[marker.id] : marker.suffix;
}

function evaluate(marker, value, state) {
  if (!value) return { tone: 'pending', label: 'Add a result' };
  if (marker.id === 'bp') {
    const bp = parseBloodPressure(value);
    if (!bp || bp.systolic <= bp.diastolic || bp.systolic > 300 || bp.diastolic > 200) return { tone: 'attention', label: 'Check systolic/diastolic' };
    if (bp.systolic < 90 || bp.diastolic < 60) return { tone: 'review', label: 'Low reading — discuss context' };
    return bp.systolic < 130 && bp.diastolic < 80
      ? { tone: 'on-track', label: 'Within the guide' }
      : { tone: 'review', label: 'Worth a closer look' };
  }
  const number = toNumber(value);
  if (number === null || !Number.isFinite(number) || (number === 0 && !['uacr', 'lpa'].includes(marker.id))) return { tone: 'attention', label: 'Check the value and units' };
  const unit = markerUnit(marker, state);
  if (marker.id === 'apob') return { tone: 'recorded', label: 'Review against your risk-based goal' };
  if (marker.id === 'lpa') return number >= (unit === 'mg/dL' ? 50 : 125)
    ? { tone: 'review', label: 'Risk-enhancing level — discuss' }
    : { tone: 'recorded', label: 'Below risk-enhancing cut-off' };
  if (marker.id === 'egfr') return number < 60
    ? { tone: 'review', label: 'Needs clinical follow-up' }
    : { tone: 'recorded', label: 'Interpret with urine ACR and trend' };
  if (marker.id === 'uacr') return number >= (unit === 'mg/g' ? 30 : 3)
    ? { tone: 'review', label: 'Repeat and review with your clinic' }
    : { tone: 'recorded', label: 'Lower albumin category' };
  if (['hba1c', 'nonhdl'].includes(marker.id)) return { tone: 'recorded', label: 'Discuss your personal target' };
  if (marker.id === 'tg') return number < 1.7
    ? { tone: 'on-track', label: 'Within fasting reference' }
    : { tone: 'review', label: 'Interpret fasting status and risk' };
  if (marker.id === 'waist') {
    if (!state.sex) return { tone: 'recorded', label: 'Recorded — add sex for context' };
    const cutOff = state.sex === 'female' ? 80 : 90;
    return number <= cutOff ? { tone: 'on-track', label: 'Within the guide' } : { tone: 'review', label: 'Worth a closer look' };
  }
  if (marker.id === 'bmi') {
    return number >= 18.5 && number < 23 ? { tone: 'on-track', label: 'Lower-risk range' } : { tone: 'review', label: 'Use with other markers' };
  }
  if (marker.id === 'glucose') return number < 3.9 ? { tone: 'review', label: 'Low reading — discuss promptly' } : number < 6.1 ? { tone: 'on-track', label: 'Within the reference' } : { tone: 'review', label: 'Ask about follow-up' };
  if (marker.id === 'ldl') return number < 2.6 ? { tone: 'on-track', label: 'Below common care target' } : { tone: 'review', label: 'Target is risk-based' };
  return { tone: 'recorded', label: 'Recorded' };
}

function icon(name) {
  const paths = {
    gauge: '<path d="M4 14a8 8 0 1 1 16 0"/><path d="m12 14 3-4"/><path d="M7 18h10"/>',
    waist: '<path d="M8 4c1.2 2 1.2 5 0 7s-1.2 5 0 9"/><path d="M16 4c-1.2 2-1.2 5 0 7s1.2 5 0 9"/><path d="M7 8h10M7 16h10"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14"/><path d="m5 7-3 6h6L5 7ZM19 7l-3 6h6l-3-6Z"/>',
    drop: '<path d="M12 3s5 5.3 5 10a5 5 0 0 1-10 0c0-4.7 5-10 5-10Z"/>',
    heart: '<path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.6Z"/>',
  };
  return `<svg class="sg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.gauge}</svg>`;
}

function markerCard(marker, state) {
  const value = state.values[marker.id] || '';
  const status = evaluate(marker, value, state);
  return `<article class="sg-marker-card" data-marker-card="${marker.id}">
    <div class="sg-marker-head">
      <span class="sg-marker-icon sg-marker-icon-${marker.icon}">${icon(marker.icon)}</span>
      <div><p class="sg-marker-eyebrow">${escapeHTML(marker.eyebrow)}</p><h4>${escapeHTML(marker.label)}</h4></div>
      <span class="sg-status sg-status-${status.tone}" data-marker-status>${escapeHTML(status.label)}</span>
    </div>
    <p class="sg-marker-why">${escapeHTML(marker.why)}</p>
    <div class="sg-marker-input-row">
      <label for="sg-${marker.id}">${escapeHTML(marker.inputLabel)}</label>
      <div class="sg-value-input"><input id="sg-${marker.id}" data-marker-input="${marker.id}" inputmode="${marker.inputMode}" value="${escapeHTML(value)}" placeholder="${escapeHTML(marker.placeholder)}" aria-describedby="sg-${marker.id}-target"><span data-marker-unit-label>${escapeHTML(markerUnit(marker, state) || '')}</span></div>
    </div>
    ${marker.units ? `<div class="sg-unit-field"><label for="sg-${marker.id}-unit">Units on your report (values are not converted)</label><select id="sg-${marker.id}-unit" data-marker-unit="${marker.id}">${marker.units.map(unit => `<option${markerUnit(marker, state) === unit ? ' selected' : ''}>${escapeHTML(unit)}</option>`).join('')}</select></div>` : ''}
    <p class="sg-marker-target" id="sg-${marker.id}-target"><span>Orientation</span>${escapeHTML(marker.target)}</p>
    <details class="sg-marker-details"><summary>${['lpa', 'egfr'].includes(marker.id) ? 'Actions to protect your health' : 'How to move toward this level'}</summary><div data-marker-actions><p>Open to load practical actions.</p></div><p class="sg-marker-reference"><a href="${escapeHTML(marker.source)}" target="_blank" rel="noreferrer">Guidance and reference ↗</a></p></details>
  </article>`;
}

function profileSummary(state) {
  if (!state.age) return 'Set your age to see the Singapore screening path that may apply.';
  const age = Number(state.age);
  if (age >= 50) return 'At 50+, add colorectal screening to your core cardiovascular checks.';
  if (age >= 40) return 'At 40+, ask about Healthier SG cardiovascular screening if you are eligible.';
  return 'Start with your yearly blood pressure, BMI and waist trend; earlier checks may fit your risk profile.';
}

function screeningCard(path, state) {
  const active = path.matches({ age: Number(state.age) || 0, sex: state.sex });
  return `<article class="sg-screening-card${active ? ' is-recommended' : ''}" data-screening-card="${path.id}">
    <div class="sg-screening-card-head"><span class="sg-screening-tag">${escapeHTML(path.tag)}</span>${active ? '<span class="sg-recommended">May apply now</span>' : ''}</div>
    <h3>${escapeHTML(path.title)}</h3>
    <p>${escapeHTML(path.detail)}</p>
    <dl><div><dt>Ask for</dt><dd>${escapeHTML(path.tests)}</dd></div><div><dt>Cadence</dt><dd>${escapeHTML(path.cadence)}</dd></div></dl>
    <a href="${escapeHTML(path.source)}" target="_blank" rel="noreferrer">${escapeHTML(path.action)} <span aria-hidden="true">↗</span></a>
  </article>`;
}

function updateWorkspace(root, state) {
  const completed = SG_MARKERS.filter((marker) => state.values[marker.id] && evaluate(marker, state.values[marker.id], state).tone !== 'attention').length;
  const onTrack = SG_MARKERS.filter((marker) => evaluate(marker, state.values[marker.id], state).tone === 'on-track').length;
  const score = root.querySelector('[data-baseline-score]');
  const scoreCopy = root.querySelector('[data-baseline-copy]');
  if (score) score.textContent = String(completed);
  if (scoreCopy) scoreCopy.textContent = completed ? `${onTrack} results within the displayed guideposts. Other results need individual context. You do not need every test listed.` : 'Add the results you have. This is a record count, not a health score or a checklist of required tests.';
  root.querySelectorAll('[data-marker-card]').forEach((card) => {
    const marker = SG_MARKERS.find((item) => item.id === card.dataset.markerCard);
    const status = evaluate(marker, state.values[marker.id], state);
    const statusNode = card.querySelector('[data-marker-status]');
    statusNode.className = `sg-status sg-status-${status.tone}`;
    statusNode.textContent = status.label;
    card.querySelector('[data-marker-input]').setAttribute('aria-invalid', String(status.tone === 'attention'));
    card.querySelector('[data-marker-unit-label]').textContent = markerUnit(marker, state) || '';
  });
  const profile = root.querySelector('[data-profile-summary]');
  if (profile) profile.textContent = profileSummary(state);
  root.querySelectorAll('[data-screening-card]').forEach((card) => {
    const path = SG_SCREENING_PATHS.find((item) => item.id === card.dataset.screeningCard);
    const active = path.matches({ age: Number(state.age) || 0, sex: state.sex });
    card.classList.toggle('is-recommended', active);
    const recommended = card.querySelector('.sg-recommended');
    if (active && !recommended) card.querySelector('.sg-screening-card-head').insertAdjacentHTML('beforeend', '<span class="sg-recommended">May apply now</span>');
    if (!active && recommended) recommended.remove();
  });
}

export function mountHealthDashboard(mount, { compact = false } = {}) {
  if (!mount) return;
  const state = readState();
  mount.innerHTML = `<section class="sg-workspace${compact ? ' sg-workspace-compact' : ''}" aria-labelledby="sg-baseline-title">
    <div class="sg-workspace-intro"><div><p class="section-eyebrow">Your Singapore baseline</p><h2 id="sg-baseline-title">Know where you stand, then pick one next move.</h2><p>Enter results from your latest screening to make the guide personal. This stays in your browser; it is not a diagnosis or a replacement for your doctor.</p></div><div class="sg-score-card"><span class="sg-score-label">Results recorded</span><strong data-baseline-score>0</strong><span data-baseline-copy>Add the results you have. You do not need every test listed.</span></div></div>
    <aside class="sg-priority-note" aria-label="High-value screening shortlist"><strong>Priority first</strong><span>Compare packages for blood pressure, BMI + waist, glucose and a full lipid panel (total cholesterol, HDL-C, LDL-C, triglycerides). Ask explicitly about ApoB for particle risk and a one-time Lp(a) test for inherited risk. Add kidney checks when indicated; more tests do not automatically mean better screening.</span></aside>
    <form class="sg-profile" data-profile-form><div><label for="sg-age">Age</label><input id="sg-age" data-profile-age type="number" min="18" max="120" inputmode="numeric" value="${escapeHTML(state.age)}" placeholder="e.g. 42"></div><div><label for="sg-sex">Sex for screening context</label><select id="sg-sex" data-profile-sex><option value="">Choose if useful</option><option value="female"${state.sex === 'female' ? ' selected' : ''}>Female</option><option value="male"${state.sex === 'male' ? ' selected' : ''}>Male</option></select></div><p data-profile-summary>${escapeHTML(profileSummary(state))}</p></form>
    <div class="sg-marker-groups">${SG_MARKER_GROUPS.map(group => `<details class="sg-marker-group" data-marker-group="${group.id}"${group.open ? ' open' : ''}><summary><h3>${escapeHTML(group.title)}</h3></summary><p class="sg-group-copy">${escapeHTML(group.description)}</p><div class="sg-marker-grid">${group.ids.map(id => markerCard(SG_MARKERS.find(marker => marker.id === id), state)).join('')}</div></details>`).join('')}</div>
    <details class="sg-marker-group sg-library" data-biomarker-library><summary><h3>Full Blueprint biomarker library · 144 measurements</h3></summary><div data-library-mount><p>Open to search the published blood-and-urine panel and record your results.</p></div></details>
    <section class="sg-roadmap" aria-labelledby="sg-roadmap-title"><div class="sg-section-head"><div><p class="section-eyebrow">Screening roadmap</p><h2 id="sg-roadmap-title">Ask for the right checks at the right time.</h2></div><p>Eligibility can depend on age, sex, last screening date, diagnosis and risk. Use this as a conversation starter with a primary care clinic.</p></div><div class="sg-screening-grid">${SG_SCREENING_PATHS.map((path) => screeningCard(path, state)).join('')}</div></section>
    <p class="sg-source-note">Built from <a href="${SG_SOURCES[0].href}" target="_blank" rel="noreferrer">MOH’s 2026 screening review</a> and <a href="${SG_SOURCES[1].href}" target="_blank" rel="noreferrer">HealthHub guidance</a>. Guidance changes; confirm the current recommendation with your clinic.</p>
    <p class="sg-source-note">Action references: ${SG_ACTION_SOURCES.map(source => `<a href="${source.href}" target="_blank" rel="noreferrer">${escapeHTML(source.label)}</a>`).join(' · ')}. Start gradually and adapt to your health and mobility; 7,000 steps is a practical goal, not a guarantee of reaching a lab target. If your kidney care team has set diet, fluid or exercise limits, follow those instead.</p>
    <p class="sg-source-note" data-baseline-storage role="status">Results are saved on this device.</p>
  </section>`;

  const form = mount.querySelector('[data-profile-form]');
  mount.addEventListener('toggle', async event => {
    const details = event.target;
    if (!details.matches('.sg-marker-details') || !details.open || details.dataset.actionsLoaded) return;
    details.dataset.actionsLoaded = 'loading';
    const target = details.querySelector('[data-marker-actions]');
    target.setAttribute('aria-busy', 'true');
    try {
      const { SG_MARKER_ACTIONS, SG_MARKER_CONTEXT } = await import('./data/screening-actions.js');
      const id = details.closest('[data-marker-card]').dataset.markerCard;
      target.innerHTML = `<ol>${SG_MARKER_ACTIONS[id].map(([title, text]) => `<li><strong>${escapeHTML(title)}</strong><span>${escapeHTML(text)}</span></li>`).join('')}</ol><p class="sg-marker-reference"><strong>Interpretation, separate from actions:</strong> ${escapeHTML(SG_MARKER_CONTEXT[id])}</p>`;
      details.dataset.actionsLoaded = 'true';
    } catch {
      target.textContent = 'Actions could not load. Close and reopen to retry.';
      delete details.dataset.actionsLoaded;
    } finally { target.removeAttribute('aria-busy'); }
  }, true);
  const library = mount.querySelector('[data-biomarker-library]');
  let libraryLoading = false;
  library.addEventListener('toggle', async () => {
    if (!library.open || libraryLoading) return;
    libraryLoading = true;
    const target = library.querySelector('[data-library-mount]');
    target.setAttribute('aria-busy', 'true');
    try {
      const { mountBiomarkerLibrary } = await import('./biomarker-library.js');
      mountBiomarkerLibrary(target);
    } catch {
      target.textContent = 'The library could not load. Close and reopen to retry; if offline, reconnect once to download it.';
      libraryLoading = false;
    } finally { target.removeAttribute('aria-busy'); }
  });
  const persist = () => {
    state.age = mount.querySelector('[data-profile-age]').value;
    state.sex = mount.querySelector('[data-profile-sex]').value;
    mount.querySelectorAll('[data-marker-input]').forEach((input) => { state.values[input.dataset.markerInput] = input.value.trim(); });
    mount.querySelectorAll('[data-marker-unit]').forEach((input) => { state.units[input.dataset.markerUnit] = input.value; });
    mount.querySelector('[data-baseline-storage]').textContent = saveState(state) ? 'Results are saved on this device.' : 'Browser storage is unavailable. Results are kept for this page session only.';
    updateWorkspace(mount, state);
  };
  form.addEventListener('input', persist);
  form.addEventListener('submit', event => event.preventDefault());
  mount.querySelectorAll('[data-marker-input]').forEach((input) => input.addEventListener('input', persist));
  mount.querySelectorAll('[data-marker-unit]').forEach((input) => input.addEventListener('change', persist));
  updateWorkspace(mount, state);
}
