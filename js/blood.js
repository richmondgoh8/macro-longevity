// blood.js — Blood Tests rendering (annual panel, deficiency markers, low-value tests)
import { ANNUAL_PANEL, BLOOD_TIERS, LOW_VALUE_TESTS, BEYOND_PANEL, APOB_PLAN, APOB_EFFECTS } from './data/blood.js';

function evidenceBadge(level) {
  if (!level) return "";
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return `<span class="evidence-badge evidence-badge-${level}">${label}</span>`;
}
function testCard(t) {
  return `
    <article class="blood-card">
      <div class="blood-card-head">
        <h3 class="blood-card-name">${t.name}</h3>
        <span class="blood-card-freq">${t.frequency}</span>
        ${t.evidence ? evidenceBadge(t.evidence) : ""}
      </div>
      <p class="blood-card-range"><span class="stack-line-label">Target</span> <span class="blood-range">${t.optimalRange}</span></p>
      <p class="blood-card-why">${t.why}</p>
      ${t.carnivoreNote ? `<div class="carnivore-note">🥩 ${t.carnivoreNote}</div>` : ""}
    </article>`;
}

function tierSection(tier) {
  const meta = BLOOD_TIERS[tier];
  const items = ANNUAL_PANEL.filter(t => t.tier === tier);
  return `
    <section class="blood-tier">
      <div class="blood-tier-head">
        <h2 class="blood-tier-title">${meta.label}</h2>
        <p class="blood-tier-desc">${meta.desc}</p>
      </div>
      <div class="blood-grid">
        ${items.map(testCard).join("")}
      </div>
    </section>`;
}

export function renderBlood() {
  const container = document.getElementById("blood-app");
  if (!container) return;

  const preparation = `
    <div class="blood-prep">
      <h3 class="blood-prep-title">📋 Before You Draw</h3>
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
    </div>`;

  container.innerHTML = `
    ${preparation}
    ${tierSection("annual")}
    ${tierSection("one-time")}
    ${tierSection("periodic")}
    <section class="blood-tier">
      <div class="blood-tier-head">
        <h2 class="blood-tier-title">🧭 ApoB Elevated? Next Steps</h2>
        <p class="blood-tier-desc">Low triglycerides and high HDL are favourable context — not proof that a high ApoB is harmless. Work through these in order.</p>
      </div>
      <ol class="apob-steps">
        ${APOB_PLAN.map(s => `<li><strong>${s.step}.</strong> ${s.action}</li>`).join("")}
      </ol>
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
    </section>
    <section class="blood-tier">
      <div class="blood-tier-head">
        <h2 class="blood-tier-title">💪 Beyond the Blood Panel</h2>
        <p class="blood-tier-desc">Not lab tests — and more important than most of them. These eight checkable habits outperform most supplements and most of the low-value tests below.</p>
      </div>
      <div class="blood-grid">
        ${BEYOND_PANEL.map(t => `
          <article class="blood-card">
            <div class="blood-card-head">
              <h3 class="blood-card-name">${t.icon} ${t.name}</h3>
            </div>
            <p class="blood-card-why"><span class="stack-line-label">Do</span> ${t.action}</p>
            <p class="blood-card-why">${t.why}</p>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="blood-tier">
      <div class="blood-tier-head">
        <h2 class="blood-tier-title">🚫 Low-Value Tests — Save Your Money</h2>
        <p class="blood-tier-desc">Expensive, fashionable, and nothing actionable comes out of them.</p>
      </div>
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
    </section>`;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blood-app')) renderBlood();
});
