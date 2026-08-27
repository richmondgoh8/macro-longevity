// protocol.js — renders the Blueprint page (80/20, screening tiers, biology,
// social & mental health, frontier geroscience, Singapore localization).
import { EIGHTY_TWENTY, SOCIAL_MENTAL, FRONTIER, SCREENING_TIERS, BIOLOGY } from './data/protocol.js';
import { HAWKER, HEALTHIER_SG, SODIUM, ENVIRONMENT } from './data/singapore.js';

function evBadge(tier, label) {
  const t = (tier || '').toLowerCase().split('/')[0].trim().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
  const map = {
    core: 'core', conditional: 'conditional', optional: 'optional',
    experimental: 'experimental', skip: 'skip', 'low-priority': 'skip',
    'optional-contextual': 'optional', frontier: 'experimental',
  };
  const cls = 'evidence-badge-' + (map[t] || 'optional');
  return `<span class="evidence-badge ${cls}">${(label || tier).toUpperCase()}</span>`;
}

function section(title, eyebrow, inner, id) {
  const initiallyOpen = id === 'protocol-8020';
  return `
    <section class="section protocol-progressive-shell"${id ? ` id="${id}"` : ''}>
      <div class="section-inner">
        <details class="progressive-section protocol-progressive"${initiallyOpen ? ' open' : ''}>
          <summary>
            <span class="progressive-section-heading">${eyebrow ? `<span class="section-eyebrow">${eyebrow}</span>` : ''}<span class="section-title" role="heading" aria-level="2">${title}</span></span>
          </summary>
          <div class="progressive-section-body">${inner}</div>
        </details>
      </div>
    </section>`;
}

function render8020() {
  const col = (h, items) => `
    <article class="core-coverage-card">
      <h3>${h}</h3>
      <ul class="checklist">${items.map((i) => `<li>${i}</li>`).join('')}</ul>
    </article>`;
  const instead = EIGHTY_TWENTY.instead.map((r) => `
    <article class="instead-card">
      <div class="instead-card-row instead-card-skip"><span class="instead-card-label">Instead of</span><span class="instead-card-copy">${r.skip}</span></div>
      <div class="instead-card-row instead-card-do"><span class="instead-card-label">Do this</span><span class="instead-card-copy">${r.do}</span></div>
      <div class="instead-card-row instead-card-why"><span class="instead-card-label">Why</span><span class="instead-card-copy">${r.why}</span></div>
    </article>`).join('');
  return section('The 80/20 protocol', 'What to do today, this week, this year', `
    <div class="core-coverage-grid">
      ${col('Today', EIGHTY_TWENTY.today)}
      ${col('This week', EIGHTY_TWENTY.week)}
      ${col('This year', EIGHTY_TWENTY.year)}
    </div>
    <h3 style="margin-top:var(--space-10);">Do this instead</h3>
    <div class="instead-grid" data-instead-grid>${instead}</div>
    <div class="callout callout-rule" style="margin-top:var(--space-6);">
      <div class="callout-body">
        <div class="callout-title">Minimal Singapore protocol</div>
        <div class="callout-text">${EIGHTY_TWENTY.minimal}</div>
      </div>
    </div>`, 'protocol-8020');
}

function renderScreening() {
  const tiers = SCREENING_TIERS.map((t) => `
    <article class="stack-card">
      <div class="stack-card-head">
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">Tier ${t.tier} — ${t.label}</h3>
        </div>
      </div>
      <p class="stack-why-text">${t.examples}</p>
    </article>`).join('');
  return section('Biomarkers, screening & prevention', 'Measure what changes decisions', `
    <p class="lede">If I know this number, will it change an action proven to improve a meaningful outcome? If not, the test probably belongs lower in the stack.</p>
    <div class="stack-grid">${tiers}</div>`, 'protocol-screening');
}

function renderBiology() {
  const chips = BIOLOGY.hallmarks.map((h) => `<span class="pillar-card-tag">${h}</span>`).join(' ');
  const mit = BIOLOGY.mitochondrial;
  const reality = mit.reality.map((r) => `
    <article class="stack-card stack-card-conditional">
      <div class="stack-card-head">
        <div class="stack-card-title-group"><h3 class="stack-card-name">${r.name}</h3></div>
        ${evBadge(r.verdict, r.verdict)}
      </div>
      <p class="stack-why-text">${r.text}</p>
    </article>`).join('');
  return section('Biology & the 12 Hallmarks', 'Pillar 2 — Slow Biological Aging', `
    <p class="lede">${BIOLOGY.intro}</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:var(--space-6);">${chips}</div>
    <h3 class="core-coverage-card" style="border:none;background:none;padding:0;margin-bottom:var(--space-3);">Mitochondrial health</h3>
    <p class="stack-why-text" style="margin-bottom:var(--space-3);">${mit.intro}</p>
    <div class="core-coverage-grid">
      <article class="core-coverage-card"><h3>What mitochondria must do</h3><ul class="checklist">${mit.functions.map((f) => `<li>${f}</li>`).join('')}</ul></article>
      <article class="core-coverage-card"><h3>Highest-value interventions</h3><ul class="checklist">${mit.interventions.map((f) => `<li>${f}</li>`).join('')}</ul></article>
    </div>
    <h3 class="core-coverage-card" style="border:none;background:none;padding:0;margin:var(--space-6) 0 var(--space-3);">Mitochondrial supplement reality check</h3>
    <div class="stack-grid">${reality}</div>`, 'biology');
}

function renderSocial() {
  return section('Sleep, social health & recovery', 'Pillar 4 — protect the ability to recover', `
    <p class="lede">${SOCIAL_MENTAL.intro}</p>
    <ul class="checklist" style="max-width:720px;margin:0 auto var(--space-6);">${SOCIAL_MENTAL.actions.map((a) => `<li>${a}</li>`).join('')}</ul>
    <div class="callout callout-warning">
      <div class="callout-body">
        <div class="callout-title">Recovery principle</div>
        <div class="callout-text">${SOCIAL_MENTAL.principle}</div>
      </div>
    </div>`, 'protocol-social');
}

function renderFrontier() {
  const therapies = FRONTIER.therapies.map((t) => `
    <article class="stack-card stack-card-conditional">
      <div class="stack-card-head">
        <div class="stack-card-title-group"><h3 class="stack-card-name">${t.name}</h3></div>
        ${evBadge(t.status, t.status)}
      </div>
      <p class="stack-why-text">${t.text}</p>
    </article>`).join('');
  const optional = FRONTIER.optional.map((t) => `
    <article class="stack-card">
      <div class="stack-card-head">
        <div class="stack-card-title-group"><h3 class="stack-card-name">${t.name}</h3></div>
        ${evBadge(t.verdict, t.verdict)}
      </div>
      <p class="stack-why-text">${t.text}</p>
    </article>`).join('');
  return section('Frontier geroscience', 'Interesting, but behind the fundamentals', `
    <p class="lede">${FRONTIER.intro}</p>
    <div class="stack-grid">${therapies}</div>
    <h3 class="core-coverage-card" style="border:none;background:none;padding:0;margin:var(--space-6) 0 var(--space-3);">Optional optimization tools</h3>
    <div class="stack-grid">${optional}</div>`, 'protocol-frontier');
}

function renderSingapore() {
  const hawkerSteps = HAWKER.steps.map((s, i) => `
    <article class="stack-card">
      <div class="stack-card-head">
        <div class="stack-card-title-group"><h3 class="stack-card-name">${i + 1}. ${s.step}</h3></div>
      </div>
      <p class="stack-why-text">${s.text}</p>
    </article>`).join('');
  const templates = HAWKER.templates.map((t) => `
    <div class="stack-line"><span class="stack-line-label">${t.meal}</span> ${t.tip}</div>`).join('');
  const fees = HEALTHIER_SG.fees.map((f) => `<div class="stack-line"><span class="stack-line-label">${f.group}</span> ${f.fee}</div>`).join('');
  const heat = ENVIRONMENT.heat.map((h) => `<div class="stack-line"><span class="stack-line-label">${h.wbgt}</span> ${h.level} — ${h.action}</div>`).join('');
  const haze = ENVIRONMENT.haze.map((h) => `<div class="stack-line"><span class="stack-line-label">PSI ${h.psi}</span> ${h.level} — ${h.action}</div>`).join('');
  return section('Singapore environment & hawker strategy', 'Localize the protocol to real life', `
    <p class="lede">${HAWKER.intro}</p>
    <div class="stack-grid" style="margin-bottom:var(--space-6);">${hawkerSteps}</div>
    <article class="stack-card" style="margin-bottom:var(--space-6);">
      <h3 class="stack-card-name">Good hawker templates</h3>
      <div class="stack-lines" style="margin-top:var(--space-2);">${templates}</div>
      <p class="stack-why-text" style="margin-top:var(--space-3);">Budget pantry: ${HAWKER.pantry.join(' • ')}</p>
    </article>
    <div class="core-coverage-grid" style="margin-bottom:var(--space-6);">
      <article class="core-coverage-card">
        <h3>Healthier SG Screening</h3>
        <p>${HEALTHIER_SG.intro}</p>
        <div class="stack-lines" style="margin-top:var(--space-2);">${fees}</div>
        <p class="stack-why-text" style="margin-top:var(--space-2);">${HEALTHIER_SG.note}</p>
      </article>
      <article class="core-coverage-card">
        <h3>Sodium bottleneck</h3>
        <p>${SODIUM.note}</p>
      </article>
    </div>
    <article class="stack-card" style="margin-bottom:var(--space-6);">
      <h3 class="stack-card-name">Heat, UV & haze</h3>
      <p class="stack-why-text">${ENVIRONMENT.intro}</p>
      <div class="stack-lines" style="margin-top:var(--space-2);"><span class="stack-line-label">WBGT</span></div>
      <div class="stack-lines">${heat}</div>
      <p class="stack-why-text" style="margin-top:var(--space-2);"><span class="stack-line-label">UV</span> ${ENVIRONMENT.uv}</p>
      <div class="stack-lines" style="margin-top:var(--space-2);"><span class="stack-line-label">Haze (PSI)</span></div>
      <div class="stack-lines">${haze}</div>
      <div class="callout callout-rule" style="margin-top:var(--space-4);">
        <div class="callout-body"><div class="callout-title">10-second outdoor decision</div><div class="callout-text">${ENVIRONMENT.decision}</div></div>
      </div>
    </article>`, 'protocol-singapore');
}

function init() {
  const mount = document.getElementById('protocol-app');
  if (!mount) return;
  mount.innerHTML =
    render8020() + renderScreening() + renderBiology() + renderSocial() + renderFrontier() + renderSingapore();
  const target = window.location.hash ? document.querySelector(window.location.hash) : null;
  target?.querySelector('.progressive-section')?.setAttribute('open', '');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
