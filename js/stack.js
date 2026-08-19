// stack.js — Daily Stack rendering (supplements, food & spices, extras, skip list)
import {
  DAILY_SUPPLEMENTS,
  FOOD_SPICES,
  EXTRAS,
  AVOID_INGREDIENTS,
  SKIP_LIST,
  CONDITIONAL_LIST,
} from './data/stack.js';

let stackTab = "supplements";

function selectStackTab(tab) {
  stackTab = tab;
  renderStack();
}

const stackTabCache = {};

function stackTabsHTML() {
  const tabs = ["supplements", "food-spices", "extras", "conditional", "skip"];
  const labels = {
    supplements: "💊 Supplements",
    "food-spices": "🍖 Food & Spices",
    extras: "☕ Extras",
    conditional: "⚠️ Conditional",
    skip: "⛔ Skip List",
  };
  return `
    <div class="meal-controls">
      <div class="meal-tabs">
        ${tabs.map(t =>
          `<button class="meal-tab ${stackTab === t ? "active" : ""}" onclick="selectStackTab('${t}')">${labels[t]}</button>`
        ).join("")}
        <select class="meal-tab-select" onchange="selectStackTab(this.value)">
          ${tabs.map(t =>
            `<option value="${t}" ${stackTab === t ? "selected" : ""}>${labels[t].replace(/^[^\s]+\s/, "")}</option>`
          ).join("")}
        </select>
      </div>
    </div>`;
}

function supplementCard(s) {
  const synergy = s.synergy && s.synergy.length
    ? `<div class="stack-line"><span class="stack-line-label">✨ Synergy</span> ${s.synergy.join(", ")}</div>` : "";
  const carnivore = s.carnivoreNote
    ? `<div class="carnivore-note">🥩 ${s.carnivoreNote}</div>` : "";
  return `
    <article class="stack-card">
      <div class="stack-card-head">
        <span class="stack-card-icon">${s.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
          <span class="stack-card-dose">${s.dose}</span>
        </div>
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">⏰ Timing</span> ${s.timing}</div>
        <div class="stack-line"><span class="stack-line-label">🍽 Pairing</span> ${s.pairing}</div>
        ${synergy}
      </div>
      <details class="meal-details stack-why">
        <summary>Why</summary>
        <p class="stack-why-text">${s.why}</p>
      </details>
      ${carnivore}
    </article>`;
}

function foodCard(f) {
  return `
    <article class="stack-card">
      <div class="stack-card-head">
        <span class="stack-card-icon">${f.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${f.name}</h3>
          <span class="stack-card-dose">${f.serving}</span>
        </div>
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">⏰ When</span> ${f.timing}</div>
      </div>
      <details class="meal-details stack-why">
        <summary>Why</summary>
        <p class="stack-why-text">${f.why}</p>
      </details>
      ${f.risk ? `<div class="stack-risk">⚠️ ${f.risk}</div>` : ""}
    </article>`;
}

function conditionalCard(s) {
  return `
    <article class="stack-card stack-card-conditional">
      <div class="stack-card-head">
        <span class="stack-card-icon">${s.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
        </div>
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">👤 Who</span> ${s.who}</div>
        <div class="stack-line"><span class="stack-line-label">💊 Dose</span> ${s.dose}</div>
      </div>
      <details class="meal-details stack-why">
        <summary>Why</summary>
        <p class="stack-why-text">${s.why}</p>
      </details>
      <div class="stack-risk">⚠️ ${s.caution}</div>
    </article>`;
}

function skipCard(s) {
  return `
    <article class="stack-card stack-card-skip">
      <div class="stack-card-head">
        <span class="stack-card-icon">${s.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
        </div>
      </div>
      <p class="stack-why-text">${s.why}</p>
    </article>`;
}

function renderStackContent() {
  if (stackTab === "supplements") {
    return `
      <div class="stack-grid">
        ${DAILY_SUPPLEMENTS.map(supplementCard).join("")}
      </div>`;
  }
  if (stackTab === "food-spices") {
    return `
      <div class="stack-grid">
        ${FOOD_SPICES.map(foodCard).join("")}
      </div>`;
  }
  if (stackTab === "extras") {
    return `
      <div class="stack-grid">
        ${EXTRAS.map(foodCard).join("")}
      </div>`;
  }
  if (stackTab === "conditional") {
    return `
      <p class="stack-intro">Not core supplements — but evidence-backed options for specific situations. Use case-by-case, not daily by default.</p>
      <div class="stack-grid">
        ${CONDITIONAL_LIST.map(conditionalCard).join("")}
      </div>`;
  }
  return `
    <p class="stack-intro">Marketing favourites with no outcome evidence, or fully redundant on a carnivore diet. Saving your money is part of the protocol.</p>
    <div class="stack-grid">
      ${SKIP_LIST.map(skipCard).join("")}
    </div>`;
}

export function renderStack() {
  const container = document.getElementById("stack-app");
  if (!container) return;

  if (!container.querySelector('.meal-tabs')) {
    container.innerHTML = stackTabsHTML() + '<div class="stack-content"></div>';
  } else {
    container.querySelectorAll('.meal-tab').forEach((btn, i) => {
      btn.classList.toggle('active', ["supplements", "food-spices", "extras", "conditional", "skip"][i] === stackTab);
    });
    container.querySelector('.meal-tab-select').value = stackTab;
  }

  const contentEl = container.querySelector('.stack-content');
  if (!stackTabCache[stackTab]) {
    contentEl.innerHTML = renderStackContent();
    stackTabCache[stackTab] = contentEl.innerHTML;
  } else {
    contentEl.innerHTML = stackTabCache[stackTab];
  }
  window.scrollTo(0, 0);
}

export function renderAvoidPage() {
  const container = document.getElementById("avoid-app");
  if (!container) return;
  container.innerHTML = `
    <p class="stack-intro">The strict elimination list. These are not 'sometimes foods' — they are the ingredients this diet is built to avoid. If it's not on this list and it's an animal food, it's fair game.</p>
    <div class="stack-grid stack-grid-single">
      ${AVOID_INGREDIENTS.map(a => `
        <article class="avoid-card">
          <div class="avoid-card-head">
            <h3 class="avoid-card-name">${a.icon} ${a.name}</h3>
          </div>
          <p class="avoid-where"><span class="stack-line-label">Where it hides</span> ${a.where}</p>
          <p class="avoid-why"><span class="stack-line-label">Why</span> ${a.why}</p>
          <p class="avoid-replace"><span class="stack-line-label">Replace with</span> ${a.replace}</p>
        </article>
      `).join("")}
    </div>`;
}

export function renderFoodProtocol() {
  const container = document.getElementById("stack-summary-app");
  if (!container) return;
  const all = [...DAILY_SUPPLEMENTS, ...FOOD_SPICES, ...EXTRAS];
  container.innerHTML = `
    <div class="stack-table">
      <div class="stack-table-row stack-table-header">
        <span>What</span><span>How much</span><span>When</span>
      </div>
      ${all.map(s => `
        <div class="stack-table-row">
          <span class="stack-table-name">${s.icon} ${s.name}</span>
          <span>${s.dose || s.serving}</span>
          <span>${s.timing}</span>
        </div>
      `).join("")}
    </div>
    <p class="stack-table-note">Full details, risks and the skip list → <a href="/pages/stack.html">Daily Stack</a></p>`;
}

Object.assign(window, { selectStackTab });

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('stack-app')) renderStack();
  if (document.getElementById('stack-summary-app')) renderFoodProtocol();
  if (document.getElementById('avoid-app')) renderAvoidPage();
});
