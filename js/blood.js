// blood.js — Blood Tests rendering (annual panel, deficiency markers, low-value tests)
import { ANNUAL_PANEL, BLOOD_TIERS, LOW_VALUE_TESTS, BEYOND_PANEL, APOB_EFFECTS } from './data/blood.js';
import { escapeHTML } from './components/ui.js';

function labelWithoutMarker(value) {
  return String(value ?? '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

function evidenceBadge(level) {
  if (!level) return "";
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return `<span class="evidence-badge evidence-badge-${level}">${label}</span>`;
}
function testCard(t) {
  return `
    <details class="blood-card blood-test-row">
      <summary><span><span class="blood-card-name" role="heading" aria-level="3">${t.name}</span><span class="blood-card-range"><span class="stack-line-label">Target</span> <span class="blood-range">${t.optimalRange}</span></span></span><span class="blood-test-meta"><span class="blood-card-freq">${t.frequency}</span>${t.evidence ? evidenceBadge(t.evidence) : ""}</span></summary>
      <div class="blood-test-detail"><p class="blood-card-why">${t.why}</p>${t.carnivoreNote ? `<div class="carnivore-note">${t.carnivoreNote}</div>` : ""}</div>
    </details>`;
}

function disclosureSection({ title, description, body, count = '', open = false, className = '', id = '' }) {
  return `<details class="progressive-section blood-tier ${className}"${id ? ` id="${id}"` : ''}${open ? ' open' : ''}>
    <summary>
      <span class="progressive-section-heading"><span class="blood-tier-title" role="heading" aria-level="2">${escapeHTML(title)}</span><span class="blood-tier-desc">${escapeHTML(description)}</span></span>
      ${count ? `<span class="progressive-section-count">${escapeHTML(count)}</span>` : ''}
    </summary>
    <div class="progressive-section-body">${body}</div>
  </details>`;
}

function tierSection(tier, open = false) {
  const meta = BLOOD_TIERS[tier];
  const items = ANNUAL_PANEL.filter(t => t.tier === tier);
  return disclosureSection({
    title: labelWithoutMarker(meta.label),
    description: meta.desc,
    count: `${items.length} tests`,
    open,
    id: `blood-${tier === 'annual' ? 'annual' : tier === 'one-time' ? 'one-time' : 'periodic'}`,
    body: `<div class="blood-grid">${items.map(testCard).join("")}</div>`,
  });
}

export function renderBlood() {
  const container = document.getElementById("blood-app");
  if (!container) return;

  const preparation = `
    <details class="blood-prep" id="blood-prep" data-blood-prep open>
      <summary><span><span class="blood-prep-title">Before You Draw</span><span class="blood-prep-summary">Fasting, hydration and timing guidance for comparable results.</span></span></summary>
      <div class="blood-prep-body">
      <p class="blood-prep-text">
        Follow the lab's fasting instructions · arrive normally hydrated · keep the timing and
        training conditions consistent when you trend results. A hard workout can transiently
        change creatinine, AST and CRP, so avoid testing immediately after unusually hard training.
      </p>
      <p class="blood-prep-text">
        In Singapore: Healthier SG screening covers the basics (BP, glucose, lipids) at polyclinics.
        For the real panel, a private clinic is ~S$250–450 — explicitly request ApoB, fasting insulin,
        ferritin + iron studies, Lp(a), hs-CRP and uric acid, which standard packages skip.
      </p>
      </div>
    </details>`;

  container.innerHTML = `
    ${preparation}
    ${tierSection("annual", true)}
    ${tierSection("one-time")}
    ${tierSection("periodic")}
    ${disclosureSection({
      title: 'ApoB elevated? Options',
      description: 'Low triglycerides and high HDL are favourable context — not proof that a high ApoB is harmless. Compare the practical options below with your clinician.',
      count: `${APOB_EFFECTS.length} interventions`,
      id: 'blood-apob',
      body: `
      <div class="stack-table apob-table">
        <div class="stack-table-row stack-table-header">
          <span>Intervention</span><span>Also helps</span><span>Lowers ApoB?</span>
        </div>
        ${APOB_EFFECTS.map(r => `
          <div class="stack-table-row">
            <span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span>
          </div>
        `).join("")}
      </div>
    `})}
    ${disclosureSection({
      title: 'Beyond the blood panel',
      description: 'These checkable habits matter more than most supplements and most low-value tests.',
      count: `${BEYOND_PANEL.length} habits`,
      id: 'blood-beyond',
      body: `
      <div class="blood-grid">
        ${BEYOND_PANEL.map(t => `
          <article class="blood-card">
            <div class="blood-card-head">
              <h3 class="blood-card-name">${t.name}</h3>
            </div>
            <p class="blood-card-why"><span class="stack-line-label">Do</span> ${t.action}</p>
            <p class="blood-card-why">${t.why}</p>
          </article>
        `).join("")}
      </div>
    `})}
    ${disclosureSection({
      title: 'Low-value tests — save your money',
      description: 'Expensive or fashionable tests that rarely produce an actionable decision.',
      count: `${LOW_VALUE_TESTS.length} tests`,
      className: 'progressive-section-muted',
      id: 'blood-low-value',
      body: `
      <div class="blood-grid">
        ${LOW_VALUE_TESTS.map(t => `
          <article class="blood-card blood-card-low">
            <div class="blood-card-head">
              <h3 class="blood-card-name">${t.name}</h3>
              <span class="evidence-badge evidence-badge-skip">Skip</span>
            </div>
            <p class="blood-card-why">${t.why}</p>
          </article>
        `).join("")}
      </div>
    `})}`;

  if (window.matchMedia('(max-width: 767px)').matches) {
    const prep = container.querySelector('[data-blood-prep]');
    if (prep) prep.open = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blood-app')) renderBlood();
});
