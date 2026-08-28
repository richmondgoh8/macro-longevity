// home.js — renders the 4-Pillar spine, Longevity 101, decision rule and evidence legend
// on the home page. Data-driven from js/data/pillars.js.
import { PILLARS, LONGEVITY_101, DECISION_RULE, EVIDENCE_TIERS } from './data/pillars.js';
import { initSpotlightCards } from './components/spotlight.js';

function renderHeroPillarMap() {
  const mount = document.getElementById('hero-pillar-map');
  if (!mount) return;
  mount.innerHTML = `
    <div class="hero-pillar-grid">
      ${PILLARS.map((pillar) => `
        <a class="hero-pillar-card" data-spotlight-card href="${pillar.href}">
          <span class="hero-pillar-number">${String(pillar.id).padStart(2, '0')}</span>
          <span class="hero-pillar-copy">
            <strong>${pillar.name}</strong>
            <span>${pillar.cta} →</span>
          </span>
        </a>`).join('')}
    </div>`;
}

function renderPillars() {
  const mount = document.getElementById('pillars-app');
  if (!mount) return;
  mount.innerHTML = PILLARS.map((p) => `
    <a class="pillar-card" data-pillar="${p.id}" href="${p.href}">
      <div class="pillar-card-head">
        <div>
          <div class="pillar-card-kicker">${p.kicker}</div>
          <div class="pillar-card-name">${p.name}</div>
        </div>
      </div>
      <p class="pillar-card-desc">${p.desc}</p>
      <div class="pillar-card-tags">${p.tags.map((t) => `<span class="pillar-card-tag">${t}</span>`).join('')}</div>
      <span class="pillar-card-cta">${p.cta} →</span>
    </a>`).join('');
}

function renderLongevity101() {
  const mount = document.getElementById('longevity101-app');
  if (!mount) return;
  mount.innerHTML = LONGEVITY_101.map((item) => `<li><span>${item}</span></li>`).join('');
}

function renderDecisionRule() {
  const mount = document.getElementById('decision-rule-app');
  if (!mount) return;
  mount.innerHTML = `
    <div class="callout callout-rule">
      <div class="callout-body">
        <div class="callout-title">Decision rule</div>
        <div class="callout-text">${DECISION_RULE}</div>
      </div>
    </div>`;
}

function renderEvidenceLegend() {
  const mount = document.getElementById('evidence-legend-app');
  if (!mount) return;
  mount.innerHTML = `
    <span class="evidence-legend-title">Evidence</span>
    ${EVIDENCE_TIERS.map((t) => `
      <span class="evidence-legend-item">
        <span class="evidence-badge evidence-badge-${t.tier}">${t.label}</span>
        <span>${t.def}</span>
      </span>`).join('')}`;
}

function init() {
  renderHeroPillarMap();
  initSpotlightCards();
  renderPillars();
  renderLongevity101();
  renderDecisionRule();
  renderEvidenceLegend();
  const toggle = document.querySelector('[data-longevity-toggle]');
  toggle?.addEventListener('click', () => {
    const list = document.getElementById('longevity101-app');
    const expanded = !list?.classList.contains('is-expanded');
    list?.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Show fewer actions' : 'Show all 10 actions';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
