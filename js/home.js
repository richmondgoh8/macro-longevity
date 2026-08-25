// home.js — renders the 4-Pillar spine, Longevity 101, decision rule and evidence legend
// on the home page. Data-driven from js/data/pillars.js.
import { icon } from './icons.js';
import { PILLARS, LONGEVITY_101, DECISION_RULE, EVIDENCE_TIERS } from './data/pillars.js';

function renderPillars() {
  const mount = document.getElementById('pillars-app');
  if (!mount) return;
  mount.innerHTML = PILLARS.map((p) => `
    <a class="pillar-card" data-pillar="${p.id}" href="${p.href}">
      <div class="pillar-card-head">
        <span class="pillar-card-icon">${icon(p.icon, { size: 24 })}</span>
        <div>
          <div class="pillar-card-kicker">${p.kicker}</div>
          <div class="pillar-card-name">${p.name}</div>
        </div>
      </div>
      <p class="pillar-card-desc">${p.desc}</p>
      <div class="pillar-card-tags">${p.tags.map((t) => `<span class="pillar-card-tag">${t}</span>`).join('')}</div>
      <span class="pillar-card-cta">${p.cta} ${icon('arrow', { size: 16 })}</span>
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
      <span class="callout-icon">${icon('scale', { size: 20 })}</span>
      <div class="callout-body">
        <div class="callout-title">Decision rule</div>
        <div class="callout-text">${DECISION_RULE}</div>
      </div>
    </div>`;
}

function renderEvidenceLegend() {
  const mount = document.getElementById('evidence-legend-app');
  if (!mount) return;
  const iconFor = { core: 'check', conditional: 'info', optional: 'sparkles', experimental: 'flask', skip: 'x' };
  mount.innerHTML = `
    <span class="evidence-legend-title">Evidence</span>
    ${EVIDENCE_TIERS.map((t) => `
      <span class="evidence-legend-item">
        <span class="evidence-badge evidence-badge-${t.tier}">${icon(iconFor[t.tier], { size: 14 })}${t.label}</span>
        <span>${t.def}</span>
      </span>`).join('')}`;
}

function init() {
  renderPillars();
  renderLongevity101();
  renderDecisionRule();
  renderEvidenceLegend();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
