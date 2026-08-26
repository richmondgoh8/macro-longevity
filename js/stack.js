// stack.js — Daily Stack rendering (supplements, food & spices, extras, skip list)
import {
  DAILY_SUPPLEMENTS,
  FOOD_SPICES,
  EXTRAS,
  AVOID_INGREDIENTS,
  UPF_GUIDE,
  SKIP_LIST,
  CONDITIONAL_LIST,
  TIMING_GUIDE,
  AVOID_LABEL_GUIDE,
} from './data/stack.js';
import { CORE_OUTCOMES } from './data/core.js';
import {
  NUTRIENT_TARGETS,
  NUTRIENT_GROUPS,
  NUTRIENT_REFERENCES,
  COMPOUND_TARGETS,
  BUILDER_ITEMS,
  FOUNDATION_STACK,
  MEAL_PLANS,
  HIGH_ROI_FOODS,
  MITOCHONDRIAL_SUPPORT,
  BREATHING_PROTOCOLS,
  EFFICIENCY_PRACTICES,
  FOOD_TRAPS,
  SUPPLEMENT_GUIDANCE,
  NUTRITION_SOURCES,
} from './data/nutrition.js';
import { icon } from './icons.js';

let stackTab = "supplements";
let selectedBuilderItems = ["eggs", "broccoli", "chia", "salmon"];
let activeBuilderCategory = "all";
let bodyWeightKg = 75;
const STACK_STORAGE_KEY = "ml-daily-stacks";
const MEALS_STORAGE_KEY = "ml-daily-meals";
const CURRENT_DAY_STORAGE_KEY = "ml-daily-current";
let quickSelectedItemIds = [];
let quickItemQuantities = {};
let selectedMealIds = ["chia-protein-oatmeal"];
let selectedMealQuantities = {};
let activeQuickCategory = "all";
let plannerMode = "meals";
let mealComposerMode = null;
let mealComposerMealId = null;
let mealComposerItems = [];
let mealComposerName = "";

function removeLegacyDailyPlans() {
  try { localStorage.removeItem("ml-daily-plans"); } catch {}
}

function restoreCurrentDay() {
  try {
    const current = JSON.parse(localStorage.getItem(CURRENT_DAY_STORAGE_KEY) || "null");
    if (!current || typeof current !== "object") return;
    if (Array.isArray(current.quickItemIds)) quickSelectedItemIds = [...new Set(current.quickItemIds.filter((id) => BUILDER_ITEMS.some((item) => item.id === id)))];
    if (Array.isArray(current.mealIds)) selectedMealIds = [...new Set(current.mealIds.filter((id) => MEAL_PLANS.some((meal) => meal.id === id) || getSavedMeals().some((meal) => meal.id === id)))];
    if (current.quickItemQuantities && typeof current.quickItemQuantities === "object") quickItemQuantities = current.quickItemQuantities;
    if (current.mealQuantities && typeof current.mealQuantities === "object") selectedMealQuantities = current.mealQuantities;
    if (Number.isFinite(Number(current.bodyWeightKg))) bodyWeightKg = Math.min(250, Math.max(35, Number(current.bodyWeightKg)));
  } catch {}
}

function persistCurrentDay() {
  try { localStorage.setItem(CURRENT_DAY_STORAGE_KEY, JSON.stringify({ mealIds: selectedMealIds, quickItemIds: quickSelectedItemIds, mealQuantities: selectedMealQuantities, quickItemQuantities, bodyWeightKg })); } catch {}
}

function normalizePortion(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(20, Math.max(.25, Math.round(number * 4) / 4));
}

function formatPortion(value) {
  const portion = normalizePortion(value);
  return Number.isInteger(portion) ? String(portion) : portion.toFixed(2).replace(/0$/, "");
}

function itemPortion(id) {
  return normalizePortion(quickItemQuantities[id]);
}

function mealPortion(id) {
  return normalizePortion(selectedMealQuantities[id]);
}

function selectedPortionTotal(values, ids) {
  return ids.reduce((total, id) => total + normalizePortion(values[id]), 0);
}

function addQuantity(target, id, amount) {
  target[id] = (target[id] || 0) + amount;
}

function selectStackTab(tab) {
  stackTab = tab;
  renderLegacyProtocol();
}

const EVIDENCE_ICON = {
  core: 'check', conditional: 'info', optional: 'sparkles',
  experimental: 'flask', skip: 'x',
  strong: 'check', moderate: 'info', weak: 'sparkles',
};

function evidenceBadge(level) {
  if (!level) return "";
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const ic = EVIDENCE_ICON[level] ? icon(EVIDENCE_ICON[level], { size: 14 }) : "";
  return `<span class="evidence-badge evidence-badge-${level}">${ic}${label}</span>`;
}

function synergyHTML(items) {
  if (!items || !items.length) return "";
  return `<div class="stack-line stack-synergy"><span class="stack-line-label">Practical pairing</span><span>${items.map(item => typeof item === "string" ? item : `${item.label}: ${item.note}`).join(" · ")}</span></div>`;
}

function timingGuideHTML() {
  return `
    <details class="stack-timing-guide" open>
      <summary><span><span class="eyebrow">Use the protocol</span><strong>Timing &amp; pairing map</strong></span><span class="stack-timing-toggle">Hide</span></summary>
      <div class="stack-timing-grid">
        ${TIMING_GUIDE.map(slot => `
          <article class="stack-timing-slot">
            <h3>${slot.label}</h3>
            <ul>${slot.items.map(item => `<li>${item}</li>`).join("")}</ul>
            <p>${slot.note}</p>
          </article>`).join("")}
      </div>
    </details>`;
}

const stackTabCache = {};

function stackTabsHTML() {
  const tabs = ["supplements", "food-spices", "extras", "conditional", "skip"];
  const labels = {
    supplements: "💊 Core Protocol",
    "food-spices": "🍖 Food & Spices",
    extras: "☕ Extras",
    conditional: "⚠️ Conditional",
    skip: "⛔ Skip List",
  };
  return `
    <div class="meal-controls">
      <div class="meal-tabs" role="tablist" aria-label="Daily Stack views">
        ${tabs.map(t =>
          `<button type="button" class="meal-tab ${stackTab === t ? "active" : ""}" data-stack-tab="${t}" role="tab" aria-selected="${stackTab === t}">${labels[t]}</button>`
        ).join("")}
        <label class="sr-only" for="stackTabSelect">Stack view</label>
        <select id="stackTabSelect" class="meal-tab-select" data-stack-select>
          ${tabs.map(t =>
            `<option value="${t}" ${stackTab === t ? "selected" : ""}>${labels[t].replace(/^[^\s]+\s/, "")}</option>`
          ).join("")}
        </select>
      </div>
    </div>`;
}

function coreCoverageHTML() {
  return `
    <section class="core-coverage" aria-labelledby="core-coverage-title">
      <div class="core-coverage-head">
        <p class="eyebrow">Core coverage</p>
        <h2 id="core-coverage-title">One protocol, six outcomes</h2>
        <p>Start with the foundation for each domain. Add a targeted supplement only when the problem, measurement or context gives it a clear job.</p>
      </div>
      <div class="core-coverage-grid">
        ${CORE_OUTCOMES.map(outcome => `
          <article class="core-coverage-card">
            <h3>${outcome.icon} ${outcome.name}</h3>
            <p><span class="core-line-label">Core</span> ${outcome.core}</p>
            <p><span class="core-line-label">Targeted</span> ${outcome.targeted}</p>
            <p class="core-measure"><span class="core-line-label">Track</span> ${outcome.measure}</p>
          </article>
        `).join("")}
      </div>
    </section>`;
}

function supplementCard(s) {
  const carnivore = s.carnivoreNote
    ? `<div class="carnivore-note">🥩 ${s.carnivoreNote}</div>` : "";
  return `
    <article class="stack-card">
      <div class="stack-card-head">
        <span class="stack-card-icon" aria-hidden="true">${s.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
          <span class="stack-card-dose">${s.dose}</span>
        </div>
        ${evidenceBadge(s.evidence)}
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">⏰ Timing</span> ${s.timing}</div>
        <div class="stack-line"><span class="stack-line-label">🍽 Pairing</span> ${s.pairing}</div>
        ${synergyHTML(s.synergy)}
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
        <span class="stack-card-icon" aria-hidden="true">${f.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${f.name}</h3>
          <span class="stack-card-dose">${f.serving}</span>
        </div>
        ${evidenceBadge(f.evidence)}
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">⏰ When</span> ${f.timing}</div>
        ${f.pairing ? `<div class="stack-line"><span class="stack-line-label">🍽 Pairing</span> ${f.pairing}</div>` : ""}
        ${synergyHTML(f.synergy)}
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
        <span class="stack-card-icon" aria-hidden="true">${s.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
        </div>
        ${evidenceBadge(s.evidence || 'weak')}
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">👤 Who</span> ${s.who}</div>
        <div class="stack-line"><span class="stack-line-label">💊 Dose</span> ${s.dose}</div>
        ${s.timing ? `<div class="stack-line"><span class="stack-line-label">⏰ Timing</span> ${s.timing}</div>` : ""}
        ${s.pairing ? `<div class="stack-line"><span class="stack-line-label">🍽 Pairing</span> ${s.pairing}</div>` : ""}
        ${synergyHTML(s.synergy)}
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
        <span class="stack-card-icon" aria-hidden="true">${s.icon}</span>
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
        </div>
        <span class="evidence-badge evidence-badge-skip">Skip</span>
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

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function getSavedStacks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STACK_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((stack) => stack && typeof stack.name === "string" && Array.isArray(stack.items)) : [];
  } catch { return []; }
}

function setSavedStacks(stacks) {
  try { localStorage.setItem(STACK_STORAGE_KEY, JSON.stringify(stacks.slice(0, 8))); } catch {}
}

function builderItemsForCategory() {
  return BUILDER_ITEMS.filter((item) => activeBuilderCategory === "all" || item.category === activeBuilderCategory);
}

function builderTotals({ excludeSupplements = false } = {}) {
  const ids = activeDailyItemIds();
  return dailyTotals(excludeSupplements ? ids.filter((id) => quickItem(id)?.category !== "supplement") : ids);
}

function compoundTotals() {
  return dailyCompoundTotals();
}

function selectedItem(id) {
  return activeDailyItemIds().includes(id);
}

function selectedSupplementTotal(nutrient) {
  const quantities = activeDailyItemQuantities();
  return BUILDER_ITEMS.filter((item) => activeDailyItemIds().includes(item.id) && item.category === "supplement" && item.includeInDailyCoverage !== false)
    .reduce((total, item) => total + Number(item.nutrients?.[nutrient] || 0) * (quantities[item.id] || 1), 0);
}

function foodCompoundPresent(compound) {
  return BUILDER_ITEMS.some((item) => activeDailyItemIds().includes(item.id) && item.category !== "supplement" && (item.compoundSources || []).includes(compound));
}

function targetGoal(target) {
  return target.dynamic === "protein" ? Math.round(bodyWeightKg * 1.2) : target.goal;
}

function formatAmount(value, unit) {
  if (!value) return `0 ${unit}`;
  return `${value < 10 ? value.toFixed(1).replace(/\.0$/, "") : Math.round(value).toLocaleString()} ${unit}`;
}

function minimalStatus(target, nutrients, compounds) {
  if (target.statusMode === "selected-dose") {
    const amount = compounds[target.id] || 0;
    const supplement = BUILDER_ITEMS.some((item) => selectedItem(item.id) && item.category === "supplement" && item.compounds?.[target.id]);
    if (!amount) return { tone: "neutral", label: "Not selected", detail: "Optional; add only if it has a clear job." };
    return { tone: supplement ? "covered" : "partial", label: `${formatAmount(amount, "g")} selected`, detail: supplement ? "Supplement dose shown; use a short, outcome-based trial where appropriate." : "Food contribution selected; amount is a planning estimate, not a required daily target." };
  }
  if (target.statusMode === "fish-or-supplement") {
    const fish = (nutrients.epaDha || 0) >= .5;
    const supplement = (compounds.epaDha || 0) >= 1;
    if (fish) return { tone: "covered", label: "Food covered", detail: "Fatty fish selected; think in weekly servings rather than a forced daily capsule." };
    if (supplement) return { tone: "covered", label: "~1 g supplement selected", detail: "Use when fatty fish is not consistent; higher-dose use needs a reason." };
    return { tone: "gap", label: "Food or supplement gap", detail: "Choose oily fish 2–3×/week or add an EPA+DHA option if fish is impractical." };
  }
  if (target.statusMode === "status-guided") {
    const supplement = selectedItem("vitamin-d");
    return supplement
      ? { tone: "conditional", label: "D3 selected", detail: "Confirm the dose and 25(OH)D status rather than treating this as an automatic need." }
      : { tone: "conditional", label: "Status guided", detail: nutrients.vitaminD ? "Food contribution present; sun exposure and blood status decide the next step." : "Food is usually limited; use sun exposure and a 25(OH)D test to guide decisions." };
  }
  if (target.statusMode === "gap") {
    const food = nutrients.magnesium || 0;
    const supplement = selectedSupplementTotal("magnesium");
    const gap = Math.max(0, 400 - food);
    if (supplement) return { tone: "covered", label: `${formatAmount(food, "mg")} food + ${formatAmount(supplement, "mg")} supplement`, detail: `Total ${formatAmount(food + supplement, "mg")}; keep supplemental magnesium at or below 350 mg/day unless advised.` };
    return { tone: gap > 0 ? "gap" : "covered", label: gap > 0 ? `Food gap ≈ ${formatAmount(gap, "mg")}` : "Food target reached", detail: "Use seeds, nuts, leafy greens and oats before adding a pill." };
  }
  if (target.statusMode === "nutrient") {
    const amount = nutrients[target.id] || 0;
    const percent = Math.round(amount / 550 * 100);
    return { tone: percent >= 80 ? "covered" : percent >= 40 ? "partial" : "gap", label: `${formatAmount(amount, "mg")} / 550 mg`, detail: "Food-first target; eggs, meat, fish and dairy make this easier." };
  }
  if (target.statusMode === "food-presence-or-dose") {
    const supplement = compounds.taurine || 0;
    if (supplement) return { tone: "conditional", label: `${formatAmount(supplement, "g")} trial selected`, detail: "Optional optimization; no universal daily target or longevity requirement." };
    if (foodCompoundPresent("taurine")) return { tone: "partial", label: "Food source present", detail: "Seafood and meat contribute, but food amounts vary and are not estimated here." };
    return { tone: "neutral", label: "Optional · no RDA", detail: "Consider food first; only trial a supplement if you have a specific outcome to observe." };
  }
  return { tone: "neutral", label: "Review context", detail: "No universal daily target." };
}

function minimalStackCardsHTML() {
  const nutrients = builderTotals();
  const compounds = compoundTotals();
  const layerLabels = {
    core: "Core · strongest practical case",
    "food-or-supplement": "Food or supplement",
    "core-conditional": "Core · conditional",
    "food-first": "Food first",
    "optional-optimization": "Optional optimization",
  };
  return COMPOUND_TARGETS.map((target) => {
    const status = minimalStatus(target, nutrients, compounds);
    return `<article class="minimal-stack-card minimal-stack-card-${target.layer}">
      <div class="minimal-stack-card-top"><span class="minimal-stack-layer">${layerLabels[target.layer] || target.layer}</span><span class="minimal-stack-evidence">${target.evidence}</span></div>
      <h3>${target.name}</h3><strong class="minimal-stack-target">${target.target}</strong>
      <div class="minimal-stack-status minimal-stack-status-${status.tone}"><strong>${status.label}</strong><span>${status.detail}</span></div>
      <p><strong>Food first</strong> ${target.food}</p><p>${target.why}</p>
    </article>`;
  }).join("");
}

function minimalStackHTML() {
  return `<section class="minimal-stack-section" aria-labelledby="minimal-stack-title">
    <div class="nutrition-section-head"><div><p class="eyebrow">Minimal evidence-first stack</p><h2 id="minimal-stack-title">Know what is covered before adding a pill</h2><p>This group sits beside the nutrient baseline. It combines food presence, nutrient coverage and selected doses, so optional compounds do not pretend to have an RDA.</p></div><span class="checklist-key">Core → conditional → optional</span></div>
    <div class="minimal-stack-grid" data-minimal-stack>${minimalStackCardsHTML()}</div>
  </section>`;
}

function coverageHTML() {
  const totals = builderTotals();
  const selected = BUILDER_ITEMS.filter((item) => selectedBuilderItems.includes(item.id));
  const trackedTargets = NUTRIENT_TARGETS.filter((target) => target.track !== false);
  const covered = trackedTargets.filter((target) => (totals[target.id] || 0) >= targetGoal(target) * 0.8).length;
  const gaps = trackedTargets.filter((target) => (totals[target.id] || 0) < targetGoal(target) * 0.8);
  const excessRules = { vitaminD: { limit: 100, label: "vitamin D" }, iodine: { limit: 1100, label: "iodine" }, magnesium: { limit: 350, label: "supplemental magnesium" }, zinc: { limit: 40, label: "zinc" }, vitaminA: { limit: 3000, label: "preformed vitamin A" } };
  const excessAmounts = { ...totals, magnesium: selectedSupplementTotal("magnesium") };
  const excesses = Object.entries(excessRules).filter(([nutrient, rule]) => (excessAmounts[nutrient] || 0) > rule.limit);

  return `
    <div class="coverage-summary">
      <div class="coverage-score"><strong>${covered}/${trackedTargets.length}</strong><span>near target</span></div>
      <div class="coverage-copy"><strong>${selected.length} choices selected</strong><span>Adult male baseline · ${bodyWeightKg} kg protein reference. Planning aid, not a lab result.</span></div>
    </div>
    <div class="coverage-list">
      ${trackedTargets.map((target) => {
        const amount = totals[target.id] || 0;
        const goal = targetGoal(target);
        const percent = Math.min(100, Math.round(amount / goal * 100));
        const state = percent >= 80 ? "covered" : percent >= 40 ? "partial" : "gap";
        return `<div class="coverage-row">
          <div class="coverage-label"><span>${target.name}</span><span>${formatAmount(amount, target.unit)} <small>/ ${target.dynamic === "protein" ? `${goal} g` : target.shortTarget}</small></span></div>
          <div class="coverage-track"><span class="coverage-fill coverage-${state}" style="width:${Math.max(3, percent)}%"></span></div>
        </div>`;
      }).join("")}
    </div>
    <div class="coverage-callouts">
      <div class="coverage-callout ${gaps.length ? "is-gap" : "is-good"}"><strong>${gaps.length ? "Gaps to solve" : "Good foundation"}</strong><span>${gaps.length ? gaps.map((gap) => gap.name).join(" · ") : "Most reference targets are covered. Check portions and your actual diet."}</span></div>
      ${excesses.length ? `<div class="coverage-callout is-watch"><strong>Watch overlap</strong><span>${excesses.map(([key, rule]) => `${rule.label}: ${formatAmount(excessAmounts[key], NUTRIENT_TARGETS.find((item) => item.id === key)?.unit || "mg")}`).join(" · ")}</span></div>` : ""}
    </div>`;
}

function builderItemHTML(item) {
  const selected = selectedBuilderItems.includes(item.id);
  const qualifier = item.frequency === "weekly" ? " · weekly" : item.conditional ? " · conditional" : "";
  const watch = item.watch ? " · ⚠ safety note" : "";
  return `<button type="button" class="builder-item ${selected ? "selected" : ""}" data-builder-item="${item.id}" aria-pressed="${selected}"${item.watch ? ` title="${escapeHTML(item.watch)}"` : ""}>
    <span class="builder-item-top"><span class="builder-item-icon">${item.icon}</span><span class="builder-item-check">${selected ? "✓" : "+"}</span></span>
    <strong>${item.name}</strong><span class="builder-serving">${item.serving}</span><small>${item.note}${qualifier}${watch}</small>
  </button>`;
}

function builderHTML() {
  const categories = [
    ["all", "All"], ["protein", "Protein"], ["volume", "Volume + fibre"], ["fat", "Healthy fat"], ["functional", "Functional"], ["supplement", "Supplements"],
  ];
  return `
    <section class="stack-builder" aria-labelledby="builder-title">
      <div class="builder-head">
        <div><p class="eyebrow">Build my daily stack</p><h2 id="builder-title">Choose a few foods. See what is still missing.</h2><p>Start with meals, then use a supplement only when it solves a defined gap or goal. Your selections stay on this device.</p></div>
        <div class="builder-actions"><span class="stack-count" data-stack-count>${selectedBuilderItems.length} selected</span><button class="button button-secondary" type="button" data-load-foundation>Try foundation</button><button class="button button-secondary" type="button" data-clear-stack>Clear</button></div>
      </div>
      <div class="builder-profile"><label for="body-weight">Protein reference body weight</label><div><input id="body-weight" type="number" min="35" max="250" step="1" value="${bodyWeightKg}" data-body-weight><span>kg · uses 1.2 g/kg floor; adjust to your context</span></div></div>
      <div class="builder-layout">
        <div class="builder-pick-panel">
          <div class="builder-filters" role="tablist" aria-label="Daily Stack item types">
            ${categories.map(([id, label]) => `<button type="button" class="builder-filter ${activeBuilderCategory === id ? "active" : ""}" data-builder-category="${id}" role="tab" aria-selected="${activeBuilderCategory === id}">${label}</button>`).join("")}
          </div>
          <div class="builder-item-grid">
            ${builderItemsForCategory().map(builderItemHTML).join("")}
          </div>
        </div>
        <aside class="coverage-panel" aria-live="polite"><div class="coverage-panel-head"><p class="eyebrow">Live readout</p><h3>Coverage &amp; gaps</h3></div><div data-coverage>${coverageHTML()}</div></aside>
      </div>
      <div class="save-stack-row">
        <label for="stack-name">Save this stack</label><input id="stack-name" type="text" maxlength="50" placeholder="e.g. Weekday oatmeal" data-stack-name><button class="button button-primary" type="button" data-save-stack>Save stack</button><span class="save-status" data-save-status role="status"></span>
      </div>
      <div class="saved-stacks" data-saved-stacks>${savedStacksHTML()}</div>
    </section>`;
}

function savedStacksHTML() {
  const saved = getSavedStacks();
  if (!saved.length) return `<p class="saved-empty">Saved stacks appear here for quick reuse.</p>`;
  return `<div class="saved-stack-list"><span class="saved-label">Saved stacks</span>${saved.map((stack, index) => `<div class="saved-stack"><button type="button" data-load-stack="${index}"><strong>${escapeHTML(stack.name)}</strong><small>${stack.items.length} items</small></button><button type="button" class="saved-delete" aria-label="Delete ${escapeHTML(stack.name)}" data-delete-stack="${index}">×</button></div>`).join("")}</div>`;
}

function nutrientChecklistHTML() {
  const itemMap = new Map(BUILDER_ITEMS.map((item) => [item.id, item]));
  return `<section class="nutrition-section" aria-labelledby="nutrient-title">
    <div class="nutrition-section-head"><div><p class="eyebrow">Daily nutrient checklist</p><h2 id="nutrient-title">The essentials, in plain language</h2><p>Adult male baseline, age 19–50. Exact needs vary with age, sex, training, pregnancy, health conditions, medicines and dietary pattern.</p></div><span class="checklist-key">Food → meal → supplement if needed</span></div>
    <div class="reference-note"><strong>How to read this:</strong> RDA/AI values come from reference guidance; food amounts are rounded planning estimates from USDA FoodData Central. EPA/DHA is a practical intake pattern, and protein/leucine are performance-oriented planning markers.</div>
    <div class="nutrient-groups">
      ${NUTRIENT_GROUPS.map((group) => `<section class="nutrient-group" aria-labelledby="nutrient-group-${group.id}"><div class="nutrient-group-head"><h3 id="nutrient-group-${group.id}">${group.label}</h3><span>${NUTRIENT_TARGETS.filter((target) => target.group === group.id).length} checks</span></div><div class="nutrient-grid">${NUTRIENT_TARGETS.filter((target) => target.group === group.id).map((target) => {
        const reference = NUTRIENT_REFERENCES[target.source] || NUTRIENT_REFERENCES.food;
        const foods = (target.sources || []).map((id) => itemMap.get(id)?.name).filter(Boolean).join(" · ");
        return `<article class="nutrient-card ${target.track === false ? "nutrient-card-marker" : ""}"><div class="nutrient-card-top"><span class="nutrient-mark">${target.track === false ? "↗" : target.id === "ala" || target.id === "epaDha" || target.id === "la" ? "ω" : "•"}</span><span class="nutrient-target">${target.target}</span></div><h4>${target.name}</h4><p>${target.why}</p>${target.frequency ? `<span class="nutrient-frequency">${target.frequency}</span>` : ""}<div class="nutrient-sources"><strong>Easiest sources</strong><span>${foods || "Varied whole foods"}</span><a href="${reference.url}" target="_blank" rel="noopener">${reference.label} ↗</a></div></article>`;
      }).join("")}</div></section>`).join("")}
    </div>
  </section>`;
}

function nutritionContentHTML() {
  return `
    ${builderHTML()}
    ${minimalStackHTML()}
    ${nutrientChecklistHTML()}
    <section class="mitochondrial-section" aria-labelledby="mitochondrial-title"><div class="nutrition-section-head"><div><p class="eyebrow">Mitochondrial machinery</p><h2 id="mitochondrial-title">Know the cofactors before buying the pill</h2><p>Energy metabolism depends on ordinary nutrients and training signals. The “mitochondrial” label is not itself evidence that a supplement improves outcomes.</p></div></div><div class="mitochondrial-grid">${MITOCHONDRIAL_SUPPORT.map((item) => `<article class="mitochondrial-card"><h3>${item.name}</h3><strong>${item.items}</strong><p>${item.text}</p></article>`).join("")}</div></section>
    <section class="high-roi-section" aria-labelledby="roi-title"><div class="nutrition-section-head"><div><p class="eyebrow">High-ROI foods</p><h2 id="roi-title">Small staples that earn their shelf space</h2></div></div><div class="roi-grid">${HIGH_ROI_FOODS.map((food) => `<article class="roi-card"><span class="roi-icon">${food.icon}</span><div><h3>${food.name}</h3><span class="roi-amount">${food.amount}</span><p>${food.benefit}</p></div></article>`).join("")}</div></section>
    <section class="efficiency-section" aria-labelledby="efficiency-title"><div class="nutrition-section-head"><div><p class="eyebrow">Cellular &amp; cardiovascular efficiency</p><h2 id="efficiency-title">Make the system work better</h2><p>Mitochondria respond to repeated demand. The practical levers are fitness, muscle, sleep, food quality and recovery — not a shelf of “mitochondrial” pills.</p></div></div><div class="practice-grid">${EFFICIENCY_PRACTICES.map((practice) => `<article class="practice-card"><span>${practice.icon}</span><div><h3>${practice.title}</h3><strong>${practice.dose}</strong><p>${practice.body}</p></div></article>`).join("")}</div></section>
    <section class="breathing-section" aria-labelledby="breathing-title"><div class="nutrition-section-head"><div><p class="eyebrow">Breathing &amp; recovery</p><h2 id="breathing-title">Use the exhale as a brake</h2><p>Slow, comfortable breathing can shift attention and autonomic balance toward calm. It is a recovery tool, not a treatment for disease. Stop if light-headed.</p></div></div><div class="breathing-grid">${BREATHING_PROTOCOLS.map((protocol) => `<article class="breathing-card"><span class="breathing-orb" aria-hidden="true"></span><h3>${protocol.name}</h3><strong>${protocol.dose}</strong><p>${protocol.how}</p><small>${protocol.use}</small></article>`).join("")}</div></section>
    <section class="supplement-section" aria-labelledby="supplement-title"><div class="nutrition-section-head"><div><p class="eyebrow">Supplement guidance</p><h2 id="supplement-title">A defined job before a daily dose</h2><p>Food is the default. A supplement earns a place when the food substitution is impractical, a measurement shows a gap, or a short trial has a clear outcome.</p></div></div><div class="supplement-guidance-grid">${SUPPLEMENT_GUIDANCE.map((item) => `<article class="supplement-guidance-card"><div class="supplement-guidance-head"><span>${item.icon}</span><div><h3>${item.name}</h3><span class="guidance-label">${item.label}</span></div></div><p><strong>Use</strong> ${item.dose}</p><p><strong>Why</strong> ${item.benefit}</p><p class="guidance-safety"><strong>Safety</strong> ${item.safety}</p></article>`).join("")}</div></section>
    <section class="traps-section" aria-labelledby="traps-title"><div class="nutrition-section-head"><div><p class="eyebrow">Food traps</p><h2 id="traps-title">“Sugar-free” still needs a label check</h2></div></div><div class="traps-grid">${FOOD_TRAPS.map((trap) => `<article class="trap-card"><span>↗</span><h3>${trap.title}</h3><p>${trap.body}</p></article>`).join("")}</div></section>
    <section class="sources-section"><p><strong>Evidence notes:</strong> Planning estimates are rounded. Read the source material and speak with a clinician for medical conditions, pregnancy, medication use or persistent symptoms.</p><div>${NUTRITION_SOURCES.map((source) => `<a href="${source.url}" target="_blank" rel="noopener">${source.label} ↗</a>`).join("")}</div></section>`;
}

function updateBuilderUI() {
  const container = document.getElementById("stack-app");
  if (!container) return;
  const coverage = container.querySelector("[data-coverage]");
  if (coverage) coverage.innerHTML = coverageHTML();
  const minimal = container.querySelector("[data-minimal-stack]");
  if (minimal) minimal.innerHTML = minimalStackCardsHTML();
  container.querySelectorAll("[data-builder-item]").forEach((button) => {
    const selected = selectedBuilderItems.includes(button.dataset.builderItem);
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    const check = button.querySelector(".builder-item-check");
    if (check) check.textContent = selected ? "✓" : "+";
  });
  const count = container.querySelector("[data-stack-count]");
  if (count) count.textContent = `${selectedBuilderItems.length} selected`;
}

function renderSavedStacks() {
  const target = document.querySelector("[data-saved-stacks]");
  if (target) target.innerHTML = savedStacksHTML();
}

function renderLegacyProtocol() {
  const content = document.querySelector("[data-library-content]");
  if (!content) return;
  content.innerHTML = `<p class="stack-intro">The original evidence-graded protocol library remains available here for deeper reading.</p>${renderStackContent()}`;
  document.querySelectorAll("[data-library-tab]").forEach((button) => {
    const selected = button.dataset.libraryTab === stackTab;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
}

function legacyLibraryHTML() {
  const tabs = ["supplements", "food-spices", "extras", "conditional", "skip"];
  const labels = { supplements: "Core protocol", "food-spices": "Food & spices", extras: "Extras", conditional: "Conditional", skip: "Skip list" };
  return `<details class="stack-library"><summary><span><span class="eyebrow">Deep library</span><strong>Evidence-graded protocol details</strong></span><span class="library-summary-action">Open</span></summary><div class="stack-library-inner"><div class="meal-controls"><div class="meal-tabs" role="tablist" aria-label="Evidence-graded protocol views">${tabs.map((tab) => `<button type="button" class="meal-tab ${tab === stackTab ? "active" : ""}" data-library-tab="${tab}" role="tab" aria-selected="${tab === stackTab}">${labels[tab]}</button>`).join("")}</div></div><div data-library-content role="tabpanel"></div></div></details>`;
}

function getSavedMeals() {
  try {
    const saved = JSON.parse(localStorage.getItem(MEALS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((meal) => meal && typeof meal.id === "string" && typeof meal.name === "string" && Array.isArray(meal.items)) : [];
  } catch { return []; }
}

function setSavedMeals(meals) {
  try { localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(meals.slice(0, 30))); } catch {}
}

function mealLibrary() {
  return [...MEAL_PLANS, ...getSavedMeals()].map((meal) => ({
    ...meal,
    items: meal.items.filter((id) => BUILDER_ITEMS.some((item) => item.id === id)),
  }));
}

function resetMealComposer() {
  mealComposerMode = null;
  mealComposerMealId = null;
  mealComposerItems = [];
  mealComposerName = "";
}

function quickSelectionForDisplay() {
  return mealComposerMode === "edit" ? mealComposerItems : quickSelectedItemIds;
}

function activeDailyItemIds() {
  return Object.keys(activeDailyItemQuantities()).filter((id) => BUILDER_ITEMS.some((item) => item.id === id));
}

function activeDailyItemQuantities() {
  const meals = mealLibrary();
  const quantities = {};
  quickSelectedItemIds.forEach((id) => addQuantity(quantities, id, itemPortion(id)));
  selectedMealIds.forEach((id) => {
    const portion = mealPortion(id);
    (meals.find((meal) => meal.id === id)?.items || []).forEach((itemId) => addQuantity(quantities, itemId, portion));
  });
  return quantities;
}

function dailyTotals(ids = activeDailyItemIds()) {
  const totals = {};
  const quantities = activeDailyItemQuantities();
  BUILDER_ITEMS.filter((item) => ids.includes(item.id) && item.includeInDailyCoverage !== false).forEach((item) => {
    Object.entries(item.nutrients || {}).forEach(([nutrient, value]) => { totals[nutrient] = (totals[nutrient] || 0) + Number(value || 0) * (quantities[item.id] || 1); });
  });
  return totals;
}

function dailyCompoundTotals(ids = activeDailyItemIds()) {
  const totals = {};
  const quantities = activeDailyItemQuantities();
  BUILDER_ITEMS.filter((item) => ids.includes(item.id) && item.includeInDailyCoverage !== false && item.compounds && !Array.isArray(item.compounds)).forEach((item) => {
    Object.entries(item.compounds).forEach(([compound, value]) => { totals[compound] = (totals[compound] || 0) + Number(value || 0) * (quantities[item.id] || 1); });
  });
  return totals;
}

function quickItem(id) {
  return BUILDER_ITEMS.find((item) => item.id === id);
}

function itemIsActive(id) {
  return activeDailyItemIds().includes(id);
}

function actionButtonHTML(label, targetId, type, itemId) {
  const active = itemIsActive(itemId);
  return `<button type="button" class="target-action ${active ? "is-selected" : ""}" data-target-action="${targetId}" data-target-action-type="${type}" data-target-item="${itemId}" aria-pressed="${active}">${active ? "✓ Already selected" : `+ ${label}`}</button>`;
}

function targetStatusV2(target, nutrients, compounds) {
  const amount = nutrients[target.id] || 0;
  if (target.statusMode === "fish-or-supplement") {
    if (amount >= .5) return { tone: "covered", label: "Food covered", detail: "Oily fish is in the selected plan." };
    if ((compounds.epaDha || 0) >= 1) return { tone: "covered", label: "Supplement selected", detail: "Keep the dose and clinical context in view." };
    return { tone: "gap", label: "Food or supplement gap", detail: "Add oily fish, or use the supplement action when fish is impractical." };
  }
  if (target.statusMode === "status-guided") return itemIsActive("vitamin-d") ? { tone: "conditional", label: "D3 selected", detail: "Confirm dose and 25(OH)D status." } : { tone: "conditional", label: "Status guided", detail: amount ? "Food contribution present; status guides the next step." : "Use sun, food and a 25(OH)D test to guide decisions." };
  if (target.statusMode === "gap") {
    const supplemental = BUILDER_ITEMS.find((item) => item.id === "magnesium-glycinate")?.nutrients?.magnesium && itemIsActive("magnesium-glycinate");
    if (supplemental) return { tone: "covered", label: `${formatAmount(amount, "mg")} food + supplement`, detail: "Keep supplemental magnesium at or below 350 mg/day unless advised." };
    return amount >= 400 ? { tone: "covered", label: "Food target reached", detail: "Food sources are carrying the target." } : { tone: "gap", label: `Food gap ≈ ${formatAmount(Math.max(0, 400 - amount), "mg")}`, detail: "Seeds, nuts, greens and oats are practical first choices." };
  }
  if (target.statusMode === "nutrient") {
    const percent = Math.round(amount / 550 * 100);
    return { tone: percent >= 80 ? "covered" : percent >= 40 ? "partial" : "gap", label: `${formatAmount(amount, "mg")} / 550 mg`, detail: "Food-first target; eggs, meat, fish and dairy help." };
  }
  if (target.statusMode === "food-presence-or-dose") return compounds.taurine ? { tone: "conditional", label: `${formatAmount(compounds.taurine, "g")} trial selected`, detail: "Optional optimization; no universal RDA." } : BUILDER_ITEMS.some((item) => itemIsActive(item.id) && (item.compoundSources || []).includes("taurine")) ? { tone: "partial", label: "Food source present", detail: "Seafood and meat contribute, but food amounts vary." } : { tone: "neutral", label: "Optional · no RDA", detail: "Consider food first and track a specific outcome." };
  if (target.statusMode === "selected-dose") return compounds[target.id] ? { tone: "covered", label: `${formatAmount(compounds[target.id], "g")} selected`, detail: "A selected dose or food contribution is shown." } : { tone: "neutral", label: "Not selected", detail: "Optional; add only if it has a clear job." };
  return { tone: "neutral", label: "Review context", detail: "No universal daily target." };
}

function minimalStackCardsHTMLV2() {
  const nutrients = dailyTotals();
  const compounds = dailyCompoundTotals();
  const labels = { core: "Core · practical case", "food-or-supplement": "Food or supplement", "core-conditional": "Core · conditional", "food-first": "Food first", "optional-optimization": "Optional optimization" };
  return COMPOUND_TARGETS.map((target) => {
    const status = targetStatusV2(target, nutrients, compounds);
    const actions = target.actions || {};
    const foodId = Array.isArray(actions.food) ? actions.food[0] : actions.food;
    const food = quickItem(foodId);
    const supplement = quickItem(actions.supplement);
    return `<article class="minimal-stack-card minimal-stack-card-${target.layer}" data-target-card="${target.id}">
      <div class="minimal-stack-card-top"><span class="minimal-stack-layer">${labels[target.layer] || target.layer}</span><span class="minimal-stack-evidence">${target.evidence}</span></div>
      <h3>${target.name}</h3><strong class="minimal-stack-target">${target.target}</strong>
      <div class="minimal-stack-status minimal-stack-status-${status.tone}"><strong>${status.label}</strong><span>${status.detail}</span></div>
      <p><strong>Food first</strong> ${target.food}</p><p>${target.why}</p>
      <div class="target-actions"><span class="target-actions-label">Add to plan</span>${food ? actionButtonHTML(`Food: ${food.name}`, target.id, "food", food.id) : ""}${supplement ? actionButtonHTML(`Supplement: ${supplement.name}`, target.id, "supplement", supplement.id) : ""}</div>
    </article>`;
  }).join("");
}

function coverageAmount(target, nutrients, compounds) {
  if (target.id === "epaDha") return (nutrients.epaDha || 0) + (compounds.epaDha || 0);
  return nutrients[target.id] || 0;
}

function coverageState(percent) {
  if (percent >= 80) return "covered";
  if (percent >= 40) return "partial";
  if (percent > 0) return "gap";
  return "empty";
}

function coverageWarnings(ids, nutrients) {
  const excessRules = {
    vitaminD: [100, "vitamin D", "mcg"],
    iodine: [1100, "iodine", "mcg"],
    magnesium: [350, "supplemental magnesium", "mg"],
    zinc: [40, "zinc", "mg"],
    vitaminA: [3000, "preformed vitamin A", "mcg"],
  };
  const amounts = { ...nutrients, magnesium: selectedSupplementTotal("magnesium") };
  const excesses = Object.entries(excessRules).filter(([id, [limit]]) => (amounts[id] || 0) > limit);
  const watchedItems = ids.map(quickItem).filter((item) => item?.watch).map((item) => item.name);
  return { excesses, watchedItems };
}

function coverageHTMLV2() {
  const ids = activeDailyItemIds();
  const totals = dailyTotals(ids);
  const compounds = dailyCompoundTotals(ids);
  const tracked = NUTRIENT_TARGETS.filter((target) => target.track !== false);
  const covered = tracked.filter((target) => coverageAmount(target, totals, compounds) >= targetGoal(target) * .8).length;
  const gaps = tracked.filter((target) => coverageAmount(target, totals, compounds) < targetGoal(target) * .8);
  const proteinTarget = targetGoal(NUTRIENT_TARGETS.find((target) => target.id === "protein"));
  const epaFood = totals.epaDha || 0;
  const epaSupplement = compounds.epaDha || 0;
  const warnings = coverageWarnings(ids, totals);
  const groupSummaries = NUTRIENT_GROUPS.map((group) => {
    const groupTargets = tracked.filter((target) => target.group === group.id);
    const groupCovered = groupTargets.filter((target) => coverageAmount(target, totals, compounds) >= targetGoal(target) * .8).length;
    const rows = groupTargets.map((target) => {
      const amount = coverageAmount(target, totals, compounds);
      const goal = targetGoal(target);
      const percent = Math.min(100, Math.round(amount / goal * 100));
      const state = coverageState(percent);
      return `<div class="coverage-row coverage-row-${state}"><div class="coverage-label"><span>${target.name}</span><span>${formatAmount(amount, target.unit)} <small>/ ${target.dynamic === "protein" ? `${goal} g` : target.shortTarget}</small></span></div><div class="coverage-track"><span class="coverage-fill coverage-${state}" style="width:${Math.max(3, percent)}%"></span></div></div>`;
    }).join("");
    return `<details class="coverage-group"><summary><span>${group.label}</span><strong>${groupCovered}/${groupTargets.length} near target</strong></summary><div class="coverage-group-rows">${rows}</div></details>`;
  }).join("");
  const warningText = [
    ...warnings.excesses.map(([id, rule]) => `${rule[1]}: ${formatAmount((id === "magnesium" ? amountsForWarnings(ids).magnesium : totals[id]) || 0, rule[2])}`),
    ...warnings.watchedItems.map((name) => `${name} has a safety note`),
  ];
  return `<div class="coverage-summary"><div class="coverage-score"><strong>${covered}/${tracked.length}</strong><span>nutrients near target</span></div><p class="coverage-summary-note">Planning estimate · ${bodyWeightKg} kg protein reference</p></div><div class="coverage-highlights" aria-label="Daily nutrient highlights"><div class="coverage-highlight"><span>Protein</span><strong>${formatAmount(totals.protein || 0, "g")} <small>/ ${proteinTarget} g</small></strong></div><div class="coverage-highlight"><span>Fiber</span><strong>${formatAmount(totals.fiber || 0, "g")} <small>/ 38 g</small></strong></div><div class="coverage-highlight"><span>EPA + DHA</span><strong>${formatAmount(epaFood + epaSupplement, "g")} <small>${epaSupplement ? `(${formatAmount(epaFood, "g")} food + ${formatAmount(epaSupplement, "g")} supplement)` : "food"}</small></strong></div></div><div class="coverage-groups">${groupSummaries}</div><div class="coverage-callouts"><div class="coverage-callout ${gaps.length ? "is-gap" : "is-good"}"><strong>${gaps.length ? `${gaps.length} nutrient gap${gaps.length === 1 ? "" : "s"}` : "Foundation covered"}</strong><span>${gaps.length ? gaps.slice(0, 4).map((gap) => gap.name).join(" · ") : "Most reference targets are near target."}${gaps.length > 4 ? ` + ${gaps.length - 4} more` : ""}</span></div>${warningText.length ? `<div class="coverage-callout is-watch"><strong>Overlap &amp; safety warnings</strong><span>${warningText.join(" · ")}</span></div>` : ""}</div>`;
}

function amountsForWarnings(ids) {
  return { magnesium: selectedSupplementTotal("magnesium") };
}

function mealCardHTML(meal, selected = selectedMealIds.includes(meal.id)) {
  const items = meal.items.map((id) => quickItem(id)).filter(Boolean);
  const saved = getSavedMeals().some((candidate) => candidate.id === meal.id);
  const savedActions = saved ? `<button type="button" class="text-button" data-meal-edit="${meal.id}">Edit</button><button type="button" class="text-button" data-meal-duplicate="${meal.id}">Duplicate</button>` : "";
  return `<article class="meal-card ${selected ? "is-selected" : ""}"><div class="meal-card-head"><span class="meal-card-icon">${meal.icon || "🍽️"}</span><div><h3>${escapeHTML(meal.name)}</h3><p>${escapeHTML(meal.description || "Reusable meal plan")}</p></div><button type="button" class="meal-toggle-icon ${selected ? "is-selected" : ""}" data-meal-toggle="${meal.id}" aria-label="${selected ? "Remove" : "Add"} ${escapeHTML(meal.name)} ${selected ? "from" : "to"} plan" aria-pressed="${selected}" title="${selected ? "Remove from plan" : "Add to plan"}">${selected ? "✓" : "+"}</button></div><div class="meal-ingredients">${items.map((item) => `<span title="${escapeHTML(item.serving)}">${item.icon} ${escapeHTML(item.name)}</span>`).join("")}</div>${savedActions ? `<div class="meal-card-actions">${savedActions}</div>` : ""}</article>`;
}

function plannerControlsHTML() {
  return `<div class="planner-controls" role="tablist" aria-label="Planner input mode">
    <button type="button" class="planner-mode-tab ${plannerMode === "meals" ? "active" : ""}" data-planner-mode="meals" role="tab" aria-selected="${plannerMode === "meals"}" aria-controls="planner-meals">Meals <span data-planner-meal-count>${formatPortion(selectedPortionTotal(selectedMealQuantities, selectedMealIds))}</span></button>
    <button type="button" class="planner-mode-tab ${plannerMode === "quick-add" ? "active" : ""}" data-planner-mode="quick-add" role="tab" aria-selected="${plannerMode === "quick-add"}" aria-controls="planner-quick-add">Quick add <span data-planner-quick-count>${formatPortion(selectedPortionTotal(quickItemQuantities, quickSelectedItemIds))}</span></button>
    <button class="button button-secondary planner-clear" type="button" data-clear-stack>Clear plan</button>
    <span class="save-status planner-status" data-planner-status role="status" aria-live="polite"></span>
  </div>`;
}

function portionControlHTML(scope, id, value, visible = true) {
  return `<div class="portion-control ${visible ? "" : "is-hidden"}" data-portion-control data-portion-scope="${scope}" data-portion-id="${id}" aria-hidden="${visible ? "false" : "true"}"><span>Portion</span><button type="button" data-portion-action="decrease" aria-label="Decrease portion">−</button><input type="number" min="0.25" max="20" step="0.25" value="${formatPortion(value)}" data-portion-input aria-label="Portion size"><button type="button" data-portion-action="increase" aria-label="Increase portion">+</button></div>`;
}

function quickItemHTML(item) {
  const selected = quickSelectionForDisplay().includes(item.id);
  const portion = mealComposerMode === "edit" ? "" : portionControlHTML("quick", item.id, itemPortion(item.id), selected);
  return `<article class="builder-item ${selected ? "selected" : ""}" data-quick-card="${item.id}"><span class="builder-item-top"><span class="builder-item-icon">${item.icon}</span><button type="button" class="builder-item-toggle ${selected ? "is-selected" : ""}" data-quick-item="${item.id}" aria-label="${selected ? "Remove" : "Add"} ${escapeHTML(item.name)} ${selected ? "from" : "to"} plan" aria-pressed="${selected}" title="${selected ? "Remove from plan" : "Add to plan"}">${selected ? "✓" : "+"}</button></span><strong>${escapeHTML(item.name)}</strong><span class="builder-serving">${escapeHTML(item.serving)}</span><small>${escapeHTML(item.note || "")}${item.watch ? " · ⚠ safety note" : ""}</small>${portion}</article>`;
}

function mealComposerDialogHTML() {
  return `<dialog class="meal-save-dialog" data-meal-dialog aria-labelledby="meal-dialog-title"><form class="meal-save-dialog-form" data-meal-dialog-form><div class="meal-dialog-head"><div><p class="eyebrow">Reusable meal</p><h2 id="meal-dialog-title">Save selection as a meal</h2></div><button type="button" class="text-button" data-meal-dialog-cancel aria-label="Close">×</button></div><label for="meal-dialog-name">Meal name</label><input id="meal-dialog-name" type="text" maxlength="80" placeholder="e.g. Weekday salmon plate" data-meal-dialog-name required><p class="meal-dialog-items" data-meal-dialog-items></p><div class="meal-dialog-actions"><button type="button" class="button button-secondary" data-meal-dialog-cancel>Cancel</button><button type="submit" class="button button-primary" data-meal-dialog-confirm>Save meal</button></div><p class="save-status" data-meal-dialog-status role="status"></p></form></dialog>`;
}

function quickAddHTML() {
  const categories = [["all", "All"], ["protein", "Protein"], ["volume", "Volume + fibre"], ["fat", "Healthy fat"], ["functional", "Functional"], ["supplement", "Supplements"]];
  const quickItems = BUILDER_ITEMS.filter((item) => activeQuickCategory === "all" || item.category === activeQuickCategory);
  const editing = mealComposerMode === "edit";
  const quickPortions = selectedPortionTotal(quickItemQuantities, quickSelectedItemIds);
  const composerAction = editing ? `<div class="meal-edit-bar"><span>Editing <strong>${escapeHTML(mealComposerName)}</strong></span><div><button type="button" class="button button-secondary" data-meal-compose-open>Save changes</button><button type="button" class="text-button" data-meal-compose-cancel>Cancel</button></div></div>` : `<div class="quick-add-save"><span><strong data-quick-selection-count>${formatPortion(quickPortions)}</strong> portion${quickPortions === 1 ? "" : "s"} selected</span><button type="button" class="button button-secondary" data-meal-compose-open ${quickSelectedItemIds.length ? "" : "disabled"}>Save to meals</button></div>`;
  return `<section class="quick-add-panel" id="planner-quick-add" aria-labelledby="quick-add-title"><div class="planner-section-head"><div><p class="eyebrow">Quick add</p><h3 id="quick-add-title">Choose foods and supplements</h3><p>Choose a food once per portion; selected items can also become a reusable meal.</p></div></div>${composerAction}<div class="builder-filters" role="tablist" aria-label="Quick-add item types">${categories.map(([id, label]) => `<button type="button" class="builder-filter ${activeQuickCategory === id ? "active" : ""}" data-quick-category="${id}" role="tab" aria-selected="${activeQuickCategory === id}">${label}</button>`).join("")}</div><div class="builder-item-grid quick-item-grid">${quickItems.map(quickItemHTML).join("")}</div></section>`;
}

function selectedMealsHTML(selected) {
  return selected.length ? selected.map((meal) => `<span class="selected-meal-chip" role="listitem"><span aria-hidden="true">${meal.icon || "🍽️"}</span><strong>${escapeHTML(meal.name)}</strong>${portionControlHTML("meal", meal.id, mealPortion(meal.id))}<button type="button" class="selected-meal-remove" data-meal-remove="${meal.id}" aria-label="Remove ${escapeHTML(meal.name)}">×</button></span>`).join("") : `<span class="selected-empty">No meals selected</span>`;
}

function updateQuickAddUI(root) {
  const selected = quickSelectionForDisplay();
  root.querySelectorAll("[data-quick-item]").forEach((button) => {
    const active = selected.includes(button.dataset.quickItem);
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("is-selected", active);
    const card = button.closest("[data-quick-card]");
    card?.classList.toggle("selected", active);
    const check = button;
    if (check) check.textContent = active ? "✓" : "+";
    const portion = card?.querySelector("[data-portion-control]");
    if (portion) { portion.classList.toggle("is-hidden", !active); portion.setAttribute("aria-hidden", String(!active)); }
    const input = portion?.querySelector("[data-portion-input]");
    if (input) input.value = formatPortion(itemPortion(button.dataset.quickItem));
  });
  const count = root.querySelector("[data-quick-selection-count]");
  if (count) count.textContent = formatPortion(mealComposerMode === "edit" ? selected.length : selectedPortionTotal(quickItemQuantities, quickSelectedItemIds));
  const save = root.querySelector("[data-meal-compose-open]");
  if (save && mealComposerMode !== "edit") save.disabled = quickSelectedItemIds.length === 0;
}

function openMealComposer(root) {
  const dialog = root.querySelector("[data-meal-dialog]");
  if (!dialog) return;
  const input = dialog.querySelector("[data-meal-dialog-name]");
  const itemText = dialog.querySelector("[data-meal-dialog-items]");
  const selectedItems = mealComposerItems.map(quickItem).filter(Boolean);
  dialog.querySelector("[data-meal-dialog-status]").textContent = "";
  dialog.querySelector("#meal-dialog-title").textContent = mealComposerMode === "edit" ? "Save meal changes" : "Save selection as a meal";
  if (input) input.value = mealComposerName;
  if (itemText) itemText.textContent = selectedItems.length ? `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"}: ${selectedItems.map((item) => item.name).join(" · ")}` : "Choose at least one item before saving.";
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  input?.focus();
}

function closeMealComposer(root) {
  const dialog = root.querySelector("[data-meal-dialog]");
  if (dialog?.open) dialog.close();
}

function saveMealComposer(root) {
  const input = root.querySelector("[data-meal-dialog-name]");
  const status = root.querySelector("[data-meal-dialog-status]");
  const name = input?.value.trim() || "";
  const items = [...new Set(mealComposerItems)].filter((id) => BUILDER_ITEMS.some((item) => item.id === id));
  if (!name || !items.length) {
    if (status) status.textContent = !name ? "Add a meal name." : "Choose at least one item.";
    return;
  }
  const now = new Date().toISOString();
  const saved = getSavedMeals();
  const existing = mealComposerMode === "edit" ? saved.find((meal) => meal.id === mealComposerMealId) : null;
  const id = existing?.id || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "meal"}-${Date.now()}`;
  const meal = { id, name, items, createdAt: existing?.createdAt || now, updatedAt: now, icon: existing?.icon || "🍽️", description: existing?.description || "A saved meal made from selected items.", tags: existing?.tags || ["saved"] };
  setSavedMeals([meal, ...saved.filter((candidate) => candidate.id !== id)]);
  if (!existing && !selectedMealIds.includes(id)) { selectedMealIds = [...selectedMealIds, id]; selectedMealQuantities[id] = 1; }
  persistCurrentDay();
  closeMealComposer(root);
  resetMealComposer();
  plannerMode = "meals";
  renderStack();
  setPlannerStatus("[data-planner-status]", `${existing ? "Updated" : "Saved"} meal “${name}”`);
}

function plannerHTML() {
  const meals = mealLibrary();
  const selected = mealLibrary().filter((meal) => selectedMealIds.includes(meal.id));
  const mealPortions = selectedPortionTotal(selectedMealQuantities, selectedMealIds);
  const quickPortions = selectedPortionTotal(quickItemQuantities, quickSelectedItemIds);
  const mealContent = `<section class="meal-library-section" id="planner-meals" aria-labelledby="meal-library-title"><div class="planner-section-head"><div><p class="eyebrow">Meals</p><h3 id="meal-library-title">Choose a reusable meal</h3><p>Presets and saved meals live together. Add portions from the plan summary.</p></div></div><div class="meal-library-grid">${meals.length ? meals.map((meal) => mealCardHTML(meal)).join("") : `<p class="saved-empty meal-empty">No meals yet. Choose items in Quick add to create one.</p>`}</div></section>`;
  const plannerContent = plannerMode === "meals" ? mealContent : quickAddHTML();
  return `<section class="stack-builder meal-planner" aria-labelledby="planner-title"><div class="builder-head"><div><p class="eyebrow">Daily Stack</p><h2 id="planner-title">Build a nutrition plan from reusable meals</h2><p>Select meals, add individual items when needed, and review the combined nutrient picture.</p></div><div class="builder-actions"><span class="stack-count" data-stack-count>${activeDailyItemIds().length} unique items</span><button class="button button-secondary" type="button" data-load-foundation>Try foundation</button></div></div>${plannerControlsHTML()}<div class="planner-workspace"><aside class="coverage-panel plan-readout" aria-live="polite"><div class="coverage-panel-head"><p class="eyebrow">Plan</p><h3>Plan overview</h3><div class="plan-counts"><span><strong data-plan-meals>${formatPortion(mealPortions)}</strong> meal portions</span><span><strong data-plan-quick>${formatPortion(quickPortions)}</strong> quick portions</span><span><strong data-plan-unique>${activeDailyItemIds().length}</strong> unique foods</span></div></div><div data-coverage>${coverageHTMLV2()}</div></aside><div class="planner-main"><div class="builder-profile"><label for="body-weight">Protein reference body weight</label><div><input id="body-weight" type="number" min="35" max="250" step="1" value="${bodyWeightKg}" data-body-weight><span>kg · uses a 1.2 g/kg floor</span></div></div><section class="selected-meals-panel" aria-labelledby="selected-meals-title"><div class="planner-section-head"><div><p class="eyebrow">Selected meals</p><h3 id="selected-meals-title"><span data-selected-meal-count>${formatPortion(mealPortions)}</span> meal portion${mealPortions === 1 ? "" : "s"} in plan</h3></div></div><div class="selected-meal-list" data-selected-meals role="list">${selectedMealsHTML(selected)}</div></section>${plannerContent}<details class="planner-disclosure evidence-actions"><summary><span><span class="eyebrow">Evidence-first actions</span><strong>Review defined food and supplement options</strong></span><span class="disclosure-count">${COMPOUND_TARGETS.length} targets</span></summary><div class="planner-disclosure-body"><p class="disclosure-note">Food is the default; supplement actions stay explicit and separate.</p><div class="minimal-stack-grid" data-minimal-stack>${minimalStackCardsHTMLV2()}</div></div></details></div></div>${mealComposerDialogHTML()}</section>`;
}

function updateMealPlannerUI() {
  const root = document.getElementById("stack-app");
  if (!root) return;
  persistCurrentDay();
  const coverage = root.querySelector("[data-coverage]");
  if (coverage) coverage.innerHTML = coverageHTMLV2();
  const minimal = root.querySelector("[data-minimal-stack]");
  if (minimal) minimal.innerHTML = minimalStackCardsHTMLV2();
  updateQuickAddUI(root);
  root.querySelectorAll("[data-meal-toggle]").forEach((button) => {
    const selected = selectedMealIds.includes(button.dataset.mealToggle);
    const name = button.closest(".meal-card")?.querySelector("h3")?.textContent || "meal";
    button.classList.toggle("is-selected", selected); button.setAttribute("aria-pressed", String(selected)); button.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${name} ${selected ? "from" : "to"} plan`); button.title = selected ? "Remove from plan" : "Add to plan"; button.textContent = selected ? "✓" : "+";
  });
  root.querySelectorAll("[data-meal-toggle]").forEach((button) => { button.closest('.meal-card')?.classList.toggle('is-selected', selectedMealIds.includes(button.dataset.mealToggle)); });
  const count = root.querySelector("[data-stack-count]"); if (count) count.textContent = `${activeDailyItemIds().length} unique items`;
  const plannerMealCount = root.querySelector("[data-planner-meal-count]"); if (plannerMealCount) plannerMealCount.textContent = formatPortion(selectedPortionTotal(selectedMealQuantities, selectedMealIds));
  const plannerQuickCount = root.querySelector("[data-planner-quick-count]"); if (plannerQuickCount) plannerQuickCount.textContent = formatPortion(selectedPortionTotal(quickItemQuantities, quickSelectedItemIds));
  const mealCount = root.querySelector("[data-selected-meal-count]");
  const mealPortions = selectedPortionTotal(selectedMealQuantities, selectedMealIds);
  const quickPortions = selectedPortionTotal(quickItemQuantities, quickSelectedItemIds);
  if (mealCount) mealCount.parentElement.innerHTML = `<span data-selected-meal-count>${formatPortion(mealPortions)}</span> meal portion${mealPortions === 1 ? "" : "s"} in plan`;
  const mealCounts = root.querySelector("[data-plan-meals]"); if (mealCounts) mealCounts.textContent = formatPortion(mealPortions);
  const quickCounts = root.querySelector("[data-plan-quick]"); if (quickCounts) quickCounts.textContent = formatPortion(quickPortions);
  const uniqueCounts = root.querySelector("[data-plan-unique]"); if (uniqueCounts) uniqueCounts.textContent = String(activeDailyItemIds().length);
  const selectedList = root.querySelector("[data-selected-meals]");
  if (selectedList) selectedList.innerHTML = selectedMealsHTML(mealLibrary().filter((meal) => selectedMealIds.includes(meal.id)));
  root.querySelectorAll("[data-target-action]").forEach((button) => { const selected = itemIsActive(button.dataset.targetItem); button.classList.toggle("is-selected", selected); button.setAttribute("aria-pressed", String(selected)); button.textContent = selected ? "✓ Already selected" : `+ ${button.dataset.targetActionType === "supplement" ? "Supplement" : "Food"}: ${quickItem(button.dataset.targetItem)?.name || "Add"}`; });
}

function setPlannerStatus(selector, text) { const status = document.querySelector(selector); if (status) { status.textContent = text; setTimeout(() => { if (status.textContent === text) status.textContent = ""; }, 3500); } }

export function renderStack() {
  const container = document.getElementById("stack-app");
  if (!container) return;
  container.innerHTML = plannerHTML() + `<details class="nutrient-reference"><summary><span><span class="eyebrow">Reference</span><strong>Full nutrient reference and sources</strong></span><span class="library-summary-action">Open</span></summary>${nutrientChecklistHTML()}</details>${legacyLibraryHTML()}`;
  renderLegacyProtocol();
}

export function renderAvoidPage() {
  const container = document.getElementById("avoid-app");
  if (!container) return;
  container.innerHTML = `
    <p class="stack-intro">The high-ROI avoid list: added sugar, alcohol, processed meat as a staple, industrial trans fats, ultra-processed food and appetite-driving refined foods. This is a practical carnivore-first filter, not a claim that every food outside it is dangerous.</p>
    <div class="stack-grid stack-grid-single">
      ${AVOID_INGREDIENTS.map(a => `
        <article class="avoid-card">
          <div class="avoid-card-head">
            <h3 class="avoid-card-name"><span aria-hidden="true">${a.icon}</span> ${a.name}</h3>
            ${a.evidence ? evidenceBadge(a.evidence) : ""}
          </div>
          <p class="avoid-where"><span class="stack-line-label">Where it hides</span> ${a.where}</p>
          <p class="avoid-why"><span class="stack-line-label">Why</span> ${a.why}</p>
          <p class="avoid-replace"><span class="stack-line-label">Replace with</span> ${a.replace}</p>
        </article>
      `).join("")}
    </div>
    <section class="upf-guide" aria-labelledby="upf-guide-title">
      <div class="upf-guide-head">
        <p class="eyebrow">Label literacy</p>
        <h2 id="upf-guide-title">How to spot ultra-processed food</h2>
        <p>${UPF_GUIDE.intro}</p>
      </div>
      <ol class="upf-steps">
        ${UPF_GUIDE.steps.map(step => `<li>${step}</li>`).join("")}
      </ol>
       <div class="upf-guide-grid">
        <div class="upf-guide-box upf-guide-box-red">
          <h3>Red-flag markers</h3>
          <ul>${UPF_GUIDE.redFlags.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div class="upf-guide-box upf-guide-box-green">
          <h3>Not automatically UPF</h3>
          <ul>${UPF_GUIDE.notAutomatic.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
         </div>
       </section>`;

  container.insertAdjacentHTML('beforeend', `
    <section class="avoid-label-guide" aria-labelledby="avoid-label-title">
      <div class="avoid-label-head">
        <p class="eyebrow">Exact label screen</p>
        <h2 id="avoid-label-title">What to scan for on the label</h2>
        <p>Search a product ingredient or browse the five practical screens below. These are decision rules, not a claim that every isolated additive is dangerous.</p>
        <label class="avoid-search-label" for="avoid-label-search">Search ingredients</label>
        <input id="avoid-label-search" class="avoid-label-search" type="search" placeholder="e.g. maltodextrin, nitrite, flavour" data-avoid-search>
      </div>
      <div class="avoid-label-grid">
        ${AVOID_LABEL_GUIDE.map((group, index) => `
          <article class="avoid-label-group" data-avoid-label-card data-search-text="${[group.name, group.priority, ...group.markers, group.rule, group.context].join(" ").toLowerCase()}">
            <div class="avoid-label-group-head">
              <span class="avoid-label-number">0${index + 1}</span>
              <div><span class="avoid-label-priority">${group.priority}</span><h3>${group.name}</h3></div>
            </div>
            <div class="avoid-marker-list">${group.markers.map(marker => `<code>${marker}</code>`).join("")}</div>
            <p><strong>Rule</strong> ${group.rule}</p>
            <p class="avoid-label-context"><strong>Context</strong> ${group.context}</p>
          </article>`).join("")}
      </div>
      <p class="avoid-label-empty" data-avoid-empty hidden>No matching label markers. Try a shorter ingredient or browse the full guide.</p>
    </section>`);

  const search = container.querySelector('[data-avoid-search]');
  const cards = [...container.querySelectorAll('[data-avoid-label-card]')];
  const empty = container.querySelector('[data-avoid-empty]');
  search?.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matches = !query || card.dataset.searchText.includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });
    if (empty) empty.hidden = visible > 0;
  });
}

export function renderFoodProtocol() {
  const container = document.getElementById("stack-summary-app");
  if (!container) return;
  // Home preview: keep the core protocol glanceable; foods/extras are summarised.
  const visible = DAILY_SUPPLEMENTS;
  container.innerHTML = `
    <div class="stack-table">
      <div class="stack-table-row stack-table-header">
        <span>What</span><span>How much</span><span>When</span>
      </div>
      ${visible.map(s => `
        <div class="stack-table-row">
          <span class="stack-table-name"><span aria-hidden="true">${s.icon}</span> ${s.name}</span>
          <span>${s.dose || s.serving}</span>
          <span>${s.timing}</span>
        </div>
      `).join("")}
      <div class="stack-table-row" style="background:var(--evidence-skip-bg);font-weight:600;">
        <span class="stack-table-name">+ ${FOOD_SPICES.length} foods &amp; ${EXTRAS.length} extras</span>
        <span style="color:var(--color-text-muted);grid-column: 2 / -1">See Daily Stack →</span>
      </div>
    </div>
    <p class="stack-table-note">Full details, risks and the ${SKIP_LIST.length}-item skip list → <a href="/pages/stack.html">Daily Stack</a></p>`;
}

document.addEventListener('DOMContentLoaded', () => {
  removeLegacyDailyPlans();
  restoreCurrentDay();
  if (document.getElementById('stack-app')) renderStack();
  if (document.getElementById('stack-summary-app')) renderFoodProtocol();
  if (document.getElementById('avoid-app')) renderAvoidPage();
});

document.addEventListener('click', (event) => {
  const root = document.getElementById('stack-app');
  if (!root) return;

  const libraryTab = event.target.closest('[data-library-tab]');
  if (libraryTab) { selectStackTab(libraryTab.dataset.libraryTab); return; }

  const plannerModeTab = event.target.closest('[data-planner-mode]');
  if (plannerModeTab) {
    plannerMode = plannerModeTab.dataset.plannerMode;
    renderStack();
    return;
  }

  const quick = event.target.closest('[data-quick-item]');
  if (quick) {
    const id = quick.dataset.quickItem;
    if (mealComposerMode === "edit") {
      mealComposerItems = mealComposerItems.includes(id) ? mealComposerItems.filter((itemId) => itemId !== id) : [...mealComposerItems, id];
      updateQuickAddUI(root);
      return;
    }
    if (quickSelectedItemIds.includes(id)) {
      quickSelectedItemIds = quickSelectedItemIds.filter((itemId) => itemId !== id);
      delete quickItemQuantities[id];
    } else {
      quickSelectedItemIds = [...quickSelectedItemIds, id];
      quickItemQuantities[id] = 1;
    }
    updateMealPlannerUI();
    return;
  }

  const portionAction = event.target.closest('[data-portion-action]');
  if (portionAction) {
    const control = portionAction.closest('[data-portion-control]');
    const id = control?.dataset.portionId;
    const scope = control?.dataset.portionScope;
    const quantities = scope === "meal" ? selectedMealQuantities : quickItemQuantities;
    if (id && quantities) {
      const current = normalizePortion(quantities[id]);
      quantities[id] = normalizePortion(current + (portionAction.dataset.portionAction === "increase" ? .25 : -.25));
      updateMealPlannerUI();
    }
    return;
  }

  const quickCategory = event.target.closest('[data-quick-category]');
  if (quickCategory) {
    activeQuickCategory = quickCategory.dataset.quickCategory;
    root.querySelectorAll('[data-quick-category]').forEach((button) => { const active = button.dataset.quickCategory === activeQuickCategory; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
    const grid = root.querySelector('.quick-item-grid');
    if (grid) grid.innerHTML = BUILDER_ITEMS.filter((item) => activeQuickCategory === 'all' || item.category === activeQuickCategory).map(quickItemHTML).join('');
    return;
  }

  const mealToggle = event.target.closest('[data-meal-toggle]');
  if (mealToggle) {
    const id = mealToggle.dataset.mealToggle;
    if (selectedMealIds.includes(id)) {
      selectedMealIds = selectedMealIds.filter((mealId) => mealId !== id);
      delete selectedMealQuantities[id];
    } else {
      selectedMealIds = [...selectedMealIds, id];
      selectedMealQuantities[id] = 1;
    }
    updateMealPlannerUI();
    return;
  }

  const mealRemove = event.target.closest('[data-meal-remove]');
  if (mealRemove) { selectedMealIds = selectedMealIds.filter((id) => id !== mealRemove.dataset.mealRemove); delete selectedMealQuantities[mealRemove.dataset.mealRemove]; updateMealPlannerUI(); return; }

  const targetAction = event.target.closest('[data-target-action]');
  if (targetAction) {
    const id = targetAction.dataset.targetItem;
    if (quickSelectedItemIds.includes(id)) {
      quickSelectedItemIds = quickSelectedItemIds.filter((itemId) => itemId !== id);
      delete quickItemQuantities[id];
    } else {
      quickSelectedItemIds = [...quickSelectedItemIds, id];
      quickItemQuantities[id] = 1;
    }
    updateMealPlannerUI();
    return;
  }

  if (event.target.closest('[data-meal-compose-open]')) {
    if (mealComposerMode !== "edit") {
      mealComposerMode = "create";
      mealComposerMealId = null;
      mealComposerItems = [...quickSelectedItemIds];
      mealComposerName = "";
    }
    openMealComposer(root);
    return;
  }

  if (event.target.closest('[data-meal-compose-cancel]')) {
    resetMealComposer();
    plannerMode = "quick-add";
    renderStack();
    return;
  }

  const mealEdit = event.target.closest('[data-meal-edit]');
  if (mealEdit) {
    const meal = getSavedMeals().find((candidate) => candidate.id === mealEdit.dataset.mealEdit);
    if (meal) {
      mealComposerMode = "edit";
      mealComposerMealId = meal.id;
      mealComposerItems = [...meal.items];
      mealComposerName = meal.name;
      plannerMode = "quick-add";
      renderStack();
    }
    return;
  }

  const mealDuplicate = event.target.closest('[data-meal-duplicate]');
  if (mealDuplicate) {
    const meal = mealLibrary().find((candidate) => candidate.id === mealDuplicate.dataset.mealDuplicate);
    if (meal) {
      const now = new Date().toISOString();
      const copy = { ...meal, id: `${meal.id}-copy-${Date.now()}`, name: `${meal.name} copy`, items: [...meal.items], createdAt: now, updatedAt: now };
      setSavedMeals([copy, ...getSavedMeals()]);
      plannerMode = "meals";
      renderStack();
      setPlannerStatus('[data-planner-status]', `Duplicated “${copy.name}”`);
    }
    return;
  }

  if (event.target.closest('[data-meal-dialog-cancel]')) {
    closeMealComposer(root);
    if (mealComposerMode === "create") resetMealComposer();
    return;
  }

  if (event.target.closest('[data-load-foundation]')) { selectedMealIds = []; selectedMealQuantities = {}; quickSelectedItemIds = FOUNDATION_STACK.items.filter((id) => BUILDER_ITEMS.some((item) => item.id === id)); quickItemQuantities = Object.fromEntries(quickSelectedItemIds.map((id) => [id, 1])); updateMealPlannerUI(); setPlannerStatus('[data-planner-status]', FOUNDATION_STACK.note); return; }
  if (event.target.closest('[data-clear-stack]')) { selectedMealIds = []; quickSelectedItemIds = []; selectedMealQuantities = {}; quickItemQuantities = {}; resetMealComposer(); updateMealPlannerUI(); return; }
});

document.addEventListener('input', (event) => {
  const mealName = event.target.closest('[data-meal-dialog-name]');
  if (mealName && document.getElementById('stack-app')) { mealComposerName = mealName.value; return; }
  const weight = event.target.closest('[data-body-weight]');
  if (!weight || !document.getElementById('stack-app')) return;
  const next = Number(weight.value);
  if (Number.isFinite(next) && next >= 35 && next <= 250) { bodyWeightKg = next; updateMealPlannerUI(); }
});

document.addEventListener('change', (event) => {
  const portionInput = event.target.closest('[data-portion-input]');
  if (!portionInput || !document.getElementById('stack-app')) return;
  const control = portionInput.closest('[data-portion-control]');
  const id = control?.dataset.portionId;
  const quantities = control?.dataset.portionScope === "meal" ? selectedMealQuantities : quickItemQuantities;
  if (id && quantities) { quantities[id] = normalizePortion(portionInput.value); updateMealPlannerUI(); }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-meal-dialog-form]');
  const root = document.getElementById('stack-app');
  if (!form || !root) return;
  event.preventDefault();
  saveMealComposer(root);
});

document.addEventListener('cancel', (event) => {
  const dialog = event.target.closest?.('[data-meal-dialog]');
  if (dialog && mealComposerMode === 'create') resetMealComposer();
}, true);

document.addEventListener('click', (event) => {
  if (document.getElementById('stack-app')) return;
  const tab = event.target.closest('[data-library-tab]');
  if (tab) {
    selectStackTab(tab.dataset.libraryTab);
    return;
  }
  const item = event.target.closest('[data-builder-item]');
  if (item) {
    const id = item.dataset.builderItem;
    selectedBuilderItems = selectedBuilderItems.includes(id)
      ? selectedBuilderItems.filter((selected) => selected !== id)
      : [...selectedBuilderItems, id];
    updateBuilderUI();
    return;
  }
  const category = event.target.closest('[data-builder-category]');
  if (category) {
    activeBuilderCategory = category.dataset.builderCategory;
    const root = document.getElementById('stack-app');
    if (root) {
      root.querySelectorAll('[data-builder-category]').forEach((button) => {
        const selected = button.dataset.builderCategory === activeBuilderCategory;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', String(selected));
      });
      const grid = root.querySelector('.builder-item-grid');
      if (grid) grid.innerHTML = builderItemsForCategory().map(builderItemHTML).join('');
    }
    return;
  }
  if (event.target.closest('[data-load-foundation]')) {
    selectedBuilderItems = FOUNDATION_STACK.items.filter((id) => BUILDER_ITEMS.some((item) => item.id === id));
    updateBuilderUI();
    const status = document.querySelector('[data-save-status]');
    if (status) { status.textContent = FOUNDATION_STACK.note; setTimeout(() => { status.textContent = ''; }, 4000); }
    return;
  }
  if (event.target.closest('[data-clear-stack]')) {
    selectedBuilderItems = [];
    updateBuilderUI();
    return;
  }
  if (event.target.closest('[data-save-stack]')) {
    const nameInput = document.querySelector('[data-stack-name]');
    const status = document.querySelector('[data-save-status]');
    const name = nameInput?.value.trim() || `Stack ${getSavedStacks().length + 1}`;
    const saved = getSavedStacks().filter((stack) => stack.name.toLowerCase() !== name.toLowerCase());
    saved.unshift({ name, items: [...selectedBuilderItems], bodyWeightKg, savedAt: new Date().toISOString() });
    setSavedStacks(saved);
    if (nameInput) nameInput.value = '';
    if (status) { status.textContent = `Saved “${name}”`; setTimeout(() => { status.textContent = ''; }, 2500); }
    renderSavedStacks();
    return;
  }
  const load = event.target.closest('[data-load-stack]');
  if (load) {
    const stack = getSavedStacks()[Number(load.dataset.loadStack)];
    if (stack) {
      selectedBuilderItems = BUILDER_ITEMS.map((item) => item.id).filter((id) => stack.items.includes(id));
      if (Number.isFinite(Number(stack.bodyWeightKg))) bodyWeightKg = Math.min(250, Math.max(35, Number(stack.bodyWeightKg)));
      const weight = document.querySelector('[data-body-weight]');
      if (weight) weight.value = bodyWeightKg;
      updateBuilderUI();
    }
    return;
  }
  const remove = event.target.closest('[data-delete-stack]');
  if (remove) {
    const saved = getSavedStacks();
    saved.splice(Number(remove.dataset.deleteStack), 1);
    setSavedStacks(saved);
    renderSavedStacks();
  }
});

document.addEventListener('input', (event) => {
  if (document.getElementById('stack-app')) return;
  const weight = event.target.closest('[data-body-weight]');
  if (!weight) return;
  const next = Number(weight.value);
  if (Number.isFinite(next) && next >= 35 && next <= 250) {
    bodyWeightKg = next;
    updateBuilderUI();
  }
});
