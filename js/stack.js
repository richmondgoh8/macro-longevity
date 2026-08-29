// stack.js — Daily Stack rendering (supplements, food & spices, extras, skip list)
import {
  DAILY_SUPPLEMENTS,
  FOOD_SPICES,
  EXTRAS,
  SKIP_LIST,
  CONDITIONAL_LIST,
  TIMING_GUIDE,
} from './data/stack.js';
import { CORE_OUTCOMES } from './data/core.js';
import {
  NUTRIENT_TARGETS,
  NUTRIENT_GROUPS,
  NUTRIENT_REF_URL,
  BUILDER_ITEMS,
  MEAL_PLANS,
  HIGH_ROI_FOODS,
  MITOCHONDRIAL_SUPPORT,
  BREATHING_PROTOCOLS,
  EFFICIENCY_PRACTICES,
  FOOD_TRAPS,
  SUPPLEMENT_GUIDANCE,
} from './data/nutrition.js';
import { closeModalDialog, confirmAction, escapeHTML, icon, iconButton, openModalDialog, showToast } from './components/ui.js';

let stackTab = "supplements";
let selectedBuilderItems = ["eggs", "broccoli", "chia", "salmon"];
let activeBuilderCategory = "all";
let bodyWeightKg = 75;
const STACK_STORAGE_KEY = "ml-daily-stacks";
const MEALS_STORAGE_KEY = "ml-daily-meals";
const MEAL_LIBRARY_STORAGE_KEY = "ml-daily-meal-library";
const CURRENT_DAY_STORAGE_KEY = "ml-daily-current";
let quickSelectedItemIds = [];
let quickItemQuantities = {};
let selectedMealIds = ["chia-protein-oatmeal"];
let selectedMealQuantities = {};
let selectedMealItemQuantities = {};
let expandedQuickServings = new Set();
let expandedMealServings = new Set();
let activeQuickCategory = "all";
let plannerSearchQuery = "";
let plannerMode = "meals";
let starterExampleActive = true;
let mealComposerMode = null;
let mealComposerMealId = null;
let mealComposerSource = null;
let mealComposerItems = [];
let mealComposerName = "";

function removeLegacyDailyPlans() {
  try { localStorage.removeItem("ml-daily-plans"); } catch {}
}

function restoreCurrentDay() {
  try {
    const current = JSON.parse(localStorage.getItem(CURRENT_DAY_STORAGE_KEY) || "null");
    if (!current || typeof current !== "object") return;
    starterExampleActive = false;
    if (Array.isArray(current.quickItemIds)) quickSelectedItemIds = [...new Set(current.quickItemIds.filter((id) => BUILDER_ITEMS.some((item) => item.id === id)))];
    if (Array.isArray(current.mealIds)) selectedMealIds = [...new Set(current.mealIds.filter((id) => mealLibrary().some((meal) => meal.id === id)))];
    if (current.quickItemQuantities && typeof current.quickItemQuantities === "object") quickItemQuantities = current.quickItemQuantities;
    if (current.mealQuantities && typeof current.mealQuantities === "object") selectedMealQuantities = current.mealQuantities;
    if (current.mealItemQuantities && typeof current.mealItemQuantities === "object") selectedMealItemQuantities = current.mealItemQuantities;
    if (Number.isFinite(Number(current.bodyWeightKg))) bodyWeightKg = Math.min(250, Math.max(35, Number(current.bodyWeightKg)));
  } catch {}
}

function persistCurrentDay() {
  try { localStorage.setItem(CURRENT_DAY_STORAGE_KEY, JSON.stringify({ mealIds: selectedMealIds, quickItemIds: quickSelectedItemIds, mealQuantities: selectedMealQuantities, mealItemQuantities: selectedMealItemQuantities, quickItemQuantities, bodyWeightKg })); } catch {}
}

function normalizePortion(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(20, Math.max(.25, Math.round(number * 4) / 4));
}

function formatPortion(value) {
  if (Number(value) === 0) return "0";
  const portion = normalizePortion(value);
  return Number.isInteger(portion) ? String(portion) : portion.toFixed(2).replace(/0$/, "");
}

function itemPortion(id) {
  return normalizePortion(quickItemQuantities[id]);
}

function mealPortion(id) {
  return normalizePortion(selectedMealQuantities[id]);
}

function mealItemPortion(mealId, itemId) {
  return normalizePortion(selectedMealItemQuantities[mealId]?.[itemId]);
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

function evidenceBadge(level) {
  if (!level) return "";
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return `<span class="evidence-badge evidence-badge-${level}">${label}</span>`;
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
    supplements: "Core Protocol",
    "food-spices": "Food & Spices",
    extras: "Extras",
    conditional: "Conditional",
    skip: "Skip List",
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
            <h3>${outcome.name}</h3>
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
    ? `<div class="carnivore-note">${s.carnivoreNote}</div>` : "";
  return `
    <article class="stack-card">
      <div class="stack-card-head">
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
          <span class="stack-card-dose">${s.dose}</span>
        </div>
        ${evidenceBadge(s.evidence)}
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">Timing</span> ${s.timing}</div>
        <div class="stack-line"><span class="stack-line-label">Pairing</span> ${s.pairing}</div>
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
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${f.name}</h3>
          <span class="stack-card-dose">${f.serving}</span>
        </div>
        ${evidenceBadge(f.evidence)}
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">When</span> ${f.timing}</div>
        ${f.pairing ? `<div class="stack-line"><span class="stack-line-label">Pairing</span> ${f.pairing}</div>` : ""}
        ${synergyHTML(f.synergy)}
      </div>
      <details class="meal-details stack-why">
        <summary>Why</summary>
        <p class="stack-why-text">${f.why}</p>
      </details>
      ${f.risk ? `<div class="stack-risk">${f.risk}</div>` : ""}
    </article>`;
}

function conditionalCard(s) {
  return `
    <article class="stack-card stack-card-conditional">
      <div class="stack-card-head">
        <div class="stack-card-title-group">
          <h3 class="stack-card-name">${s.name}</h3>
        </div>
        ${evidenceBadge(s.evidence || 'weak')}
      </div>
      <div class="stack-lines">
        <div class="stack-line"><span class="stack-line-label">Who</span> ${s.who}</div>
        <div class="stack-line"><span class="stack-line-label">Dose</span> ${s.dose}</div>
        ${s.timing ? `<div class="stack-line"><span class="stack-line-label">Timing</span> ${s.timing}</div>` : ""}
        ${s.pairing ? `<div class="stack-line"><span class="stack-line-label">Pairing</span> ${s.pairing}</div>` : ""}
        ${synergyHTML(s.synergy)}
      </div>
      <details class="meal-details stack-why">
        <summary>Why</summary>
        <p class="stack-why-text">${s.why}</p>
      </details>
      <div class="stack-risk">${s.caution}</div>
    </article>`;
}

function skipCard(s) {
  return `
    <article class="stack-card stack-card-skip">
      <div class="stack-card-head">
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

function coverageHTML() {
  const totals = builderTotals();
  const selected = BUILDER_ITEMS.filter((item) => selectedBuilderItems.includes(item.id));
  const trackedTargets = NUTRIENT_TARGETS.filter((target) => target.track !== false);
  const covered = trackedTargets.filter((target) => (totals[target.id] || 0) >= targetGoal(target) * .795).length;
  const gaps = trackedTargets.filter((target) => (totals[target.id] || 0) < targetGoal(target) * .795);
  const excessRules = { vitaminD: { limit: 100, label: "vitamin D" }, iodine: { limit: 1100, label: "iodine" }, magnesium: { limit: 350, label: "supplemental magnesium" }, zinc: { limit: 40, label: "zinc" }, vitaminA: { limit: 3000, label: "preformed vitamin A" } };
  const excessAmounts = { ...totals, magnesium: selectedSupplementTotal("magnesium") };
  const excesses = Object.entries(excessRules).filter(([nutrient, rule]) => (excessAmounts[nutrient] || 0) > rule.limit);

  return `
    <div class="coverage-summary">
      <div class="coverage-score"><strong>${covered}/${trackedTargets.length}</strong><span>covered</span></div>
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
  const watch = item.watch ? " · safety note" : "";
  return `<button type="button" class="builder-item ${selected ? "selected" : ""}" data-builder-item="${item.id}" aria-pressed="${selected}"${item.watch ? ` title="${escapeHTML(item.watch)}"` : ""}>
    <span class="builder-item-top"><span class="builder-item-check">${selected ? "✓" : "+"}</span></span>
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
        <div class="builder-actions"><span class="stack-count" data-stack-count>${selectedBuilderItems.length} selected</span><button class="button button-secondary" type="button" data-clear-stack>Clear</button></div>
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
        const foods = (target.sources || []).map((id) => itemMap.get(id)?.name).filter(Boolean).join(" · ");
        return `<article class="nutrient-card"><div class="nutrient-card-top"><span class="nutrient-target">${target.target}</span></div><h4>${target.name}</h4><p>${target.why}</p>${target.frequency ? `<span class="nutrient-frequency">${target.frequency}</span>` : ""}<div class="nutrient-sources"><strong>Easiest sources</strong><span>${foods || "Varied whole foods"}</span></div></article>`;
      }).join("")}</div></section>`).join("")}
    </div>
  </section>`;
}

function updateBuilderUI() {
  const container = document.getElementById("stack-app");
  if (!container) return;
  const coverage = container.querySelector("[data-coverage]");
  if (coverage) coverage.innerHTML = coverageHTML();
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
  return `<details class="stack-library" id="stack-library"><summary><span><span class="eyebrow">Deep library</span><strong>Evidence-graded protocol details</strong></span><span class="library-summary-action">Open</span></summary><div class="stack-library-inner"><div class="meal-controls"><div class="meal-tabs" role="tablist" aria-label="Evidence-graded protocol views">${tabs.map((tab) => `<button type="button" class="meal-tab ${tab === stackTab ? "active" : ""}" data-library-tab="${tab}" role="tab" aria-selected="${tab === stackTab}">${labels[tab]}</button>`).join("")}</div></div><div data-library-content role="tabpanel"></div></div></details>`;
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

function getMealLibraryState() {
  try {
    const state = JSON.parse(localStorage.getItem(MEAL_LIBRARY_STORAGE_KEY) || "{}");
    return {
      overrides: state && typeof state.overrides === "object" && !Array.isArray(state.overrides) ? state.overrides : {},
      hidden: Array.isArray(state?.hidden) ? [...new Set(state.hidden.filter((id) => typeof id === "string"))] : [],
      pinned: Array.isArray(state?.pinned) ? [...new Set(state.pinned.filter((id) => typeof id === "string"))] : [],
    };
  } catch { return { overrides: {}, hidden: [], pinned: [] }; }
}

function setMealLibraryState(state) {
  try { localStorage.setItem(MEAL_LIBRARY_STORAGE_KEY, JSON.stringify({ overrides: state.overrides || {}, hidden: state.hidden || [], pinned: state.pinned || [] })); } catch {}
}

function mealLibrary() {
  const state = getMealLibraryState();
  const presets = MEAL_PLANS
    .filter((meal) => !state.hidden.includes(meal.id))
    .map((meal) => ({ ...meal, ...(state.overrides[meal.id] || {}), source: "preset", presetId: meal.id }));
  const saved = getSavedMeals().map((meal) => ({ ...meal, source: "saved" }));
  const pinned = new Set([...state.pinned, ...saved.filter((meal) => meal.pinned === true).map((meal) => meal.id)]);
  return [...presets, ...saved].map((meal) => ({
    ...meal,
    pinned: pinned.has(meal.id),
    items: meal.items.filter((id) => BUILDER_ITEMS.some((item) => item.id === id)),
  })).sort((a, b) => (b.pinned == true) - (a.pinned == true));
}

function resetMealComposer() {
  mealComposerMode = null;
  mealComposerMealId = null;
  mealComposerSource = null;
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
    const meal = meals.find((candidate) => candidate.id === id);
    const portion = mealPortion(id);
    (meal?.items || []).forEach((itemId) => addQuantity(quantities, itemId, portion * mealItemPortion(id, itemId)));
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

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function fuzzyTokenMatch(token, word) {
  if (!token || !word) return false;
  if (word.includes(token)) return true;
  if (token.length < 3) return false;
  let cursor = 0;
  for (const character of token) {
    cursor = word.indexOf(character, cursor);
    if (cursor === -1) return false;
    cursor += 1;
  }
  return true;
}

function matchesPlannerSearch(query, fields) {
  const tokens = normalizeSearchText(query).trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const words = normalizeSearchText(fields.join(" ")).split(/[^a-z0-9]+/).filter(Boolean);
  return tokens.every((token) => words.some((word) => fuzzyTokenMatch(token, word)));
}

function filteredQuickItems() {
  return BUILDER_ITEMS.filter((item) => {
    const categoryMatches = activeQuickCategory === "all" || item.category === activeQuickCategory;
    const searchMatches = matchesPlannerSearch(plannerSearchQuery, [item.name, item.serving, item.note, item.category]);
    return categoryMatches && searchMatches;
  });
}

function filteredMeals() {
  return mealLibrary().filter((meal) => matchesPlannerSearch(plannerSearchQuery, [meal.name, meal.description, ...(meal.tags || []), ...meal.items.map((id) => quickItem(id)?.name || "")]));
}

function plannerSearchHTML() {
  return `<label class="planner-search"><span class="planner-search-label">Fast find</span><input type="search" value="${escapeHTML(plannerSearchQuery)}" placeholder="Search foods or preset meals" aria-label="Fast find foods or preset meals" autocomplete="off" data-planner-search></label>`;
}

function quickSearchEmptyHTML() {
  return `<p class="saved-empty planner-search-empty">No foods or supplements match “${escapeHTML(plannerSearchQuery.trim())}”. Try fewer letters.</p>`;
}

function mealSearchEmptyHTML() {
  return plannerSearchQuery.trim()
    ? `<p class="saved-empty meal-empty planner-search-empty">No meals match “${escapeHTML(plannerSearchQuery.trim())}”. Try fewer letters.</p>`
    : `<p class="saved-empty meal-empty">No meals available. Restore preset meals or create one in Quick Add.</p>`;
}

function renderPlannerSearchResults(root) {
  if (plannerMode === "meals") {
    const grid = root?.querySelector(".meal-library-grid");
    if (!grid) return;
    const meals = filteredMeals();
    grid.innerHTML = meals.length ? meals.map((meal) => mealCardHTML(meal)).join("") : mealSearchEmptyHTML();
  } else {
    const grid = root?.querySelector(".quick-item-grid");
    if (!grid) return;
    const items = filteredQuickItems();
    grid.innerHTML = items.length ? items.map(quickItemHTML).join("") : quickSearchEmptyHTML();
  }
  updateMealPlannerUI();
}

function itemIsActive(id) {
  return activeDailyItemIds().includes(id);
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

function coverageRowHTML(target, totals, compounds) {
  const amount = coverageAmount(target, totals, compounds);
  const goal = targetGoal(target);
  const percent = Math.min(100, Math.round(amount / goal * 100));
  const state = coverageState(percent);
  return `<div class="coverage-row coverage-row-${state}"><div class="coverage-label"><span>${escapeHTML(target.name)}</span><span>${formatAmount(amount, target.unit)} <small>/ ${target.dynamic === "protein" ? `${goal} g` : target.shortTarget}</small></span></div><div class="coverage-track"><span class="coverage-fill coverage-${state}" style="width:${Math.max(3, percent)}%"></span></div></div>`;
}

function coverageSourceNames(target) {
  const sources = (target.sources || []).map((id) => quickItem(id)?.name).filter(Boolean).slice(0, 3);
  return sources.length ? sources.join(" · ") : "Review the food pattern";
}

function priorityGapHTML(target, totals, compounds) {
  const amount = coverageAmount(target, totals, compounds);
  const goal = targetGoal(target);
  const percent = Math.min(100, Math.round(amount / goal * 100));
  const state = coverageState(percent);
  return `<article class="coverage-priority-item coverage-row-${state}"><div class="coverage-priority-head"><strong>${escapeHTML(target.name)}</strong><span>${formatAmount(amount, target.unit)} <small>/ ${target.dynamic === "protein" ? `${goal} g` : target.shortTarget}</small></span></div><div class="coverage-track"><span class="coverage-fill coverage-${state}" style="width:${Math.max(3, percent)}%"></span></div><p>Food-first: ${escapeHTML(coverageSourceNames(target))}</p></article>`;
}

function coverageSummaryData() {
  const ids = activeDailyItemIds();
  const totals = dailyTotals(ids);
  const compounds = dailyCompoundTotals(ids);
  const tracked = NUTRIENT_TARGETS.filter((target) => target.track !== false);
  const gaps = tracked.filter((target) => coverageAmount(target, totals, compounds) < targetGoal(target) * .795);
  const covered = tracked.length - gaps.length;
  return { covered, total: tracked.length, topGap: gaps[0]?.name || 'No priority gaps' };
}

function mobileCoverageHTML() {
  const summary = coverageSummaryData();
  return `<details class="mobile-coverage-summary" data-mobile-coverage-panel><summary><span><span class="eyebrow">Plan review</span><strong data-mobile-coverage-score>${summary.covered}/${summary.total} covered</strong></span><span data-mobile-top-gap>${summary.topGap === 'No priority gaps' ? summary.topGap : `Top gap · ${escapeHTML(summary.topGap)}`}</span></summary><div class="mobile-coverage-body" data-mobile-coverage>${coverageHTMLV2('mobile-coverage')}</div></details>`;
}

function coverageHTMLV2(idPrefix = 'coverage') {
  const ids = activeDailyItemIds();
  const totals = dailyTotals(ids);
  const compounds = dailyCompoundTotals(ids);
  const tracked = NUTRIENT_TARGETS.filter((target) => target.track !== false);
  const covered = tracked.filter((target) => coverageAmount(target, totals, compounds) >= targetGoal(target) * .795).length;
  const gaps = tracked.filter((target) => coverageAmount(target, totals, compounds) < targetGoal(target) * .795);
  const proteinTarget = targetGoal(NUTRIENT_TARGETS.find((target) => target.id === "protein"));
  const epaFood = totals.epaDha || 0;
  const epaSupplement = compounds.epaDha || 0;
  const warnings = coverageWarnings(ids, totals);
  const groupSummaries = NUTRIENT_GROUPS.map((group) => {
    const groupTargets = tracked.filter((target) => target.group === group.id);
    const groupCovered = groupTargets.filter((target) => coverageAmount(target, totals, compounds) >= targetGoal(target) * .795).length;
    const rows = groupTargets.map((target) => coverageRowHTML(target, totals, compounds)).join("");
    return `<details class="coverage-group"><summary><span>${escapeHTML(group.label)}</span><strong>${groupCovered}/${groupTargets.length} covered</strong></summary><div class="coverage-group-rows">${rows}</div></details>`;
  }).join("");
  const priorityGaps = gaps.slice(0, 3);
  const warningText = [
    ...warnings.excesses.map(([id, rule]) => `${rule[1]}: ${formatAmount((id === "magnesium" ? amountsForWarnings(ids).magnesium : totals[id]) || 0, rule[2])}`),
    ...warnings.watchedItems.map((name) => `${name} has a safety note`),
  ];
  return `<div class="coverage-summary"><div class="coverage-score"><strong>${covered}/${tracked.length}</strong><span>covered</span></div><p class="coverage-summary-note">Singapore · <a href="${NUTRIENT_REF_URL}">HealthHub RDA</a> where available · DRI/AI or planning targets · ${bodyWeightKg} kg protein ref</p></div><div class="coverage-highlights" aria-label="Daily nutrient highlights"><div class="coverage-highlight"><span>Protein</span><strong>${formatAmount(totals.protein || 0, "g")} <small>/ ${proteinTarget} g</small></strong></div><div class="coverage-highlight"><span>Fiber</span><strong>${formatAmount(totals.fiber || 0, "g")} <small>/ 38 g</small></strong></div><div class="coverage-highlight"><span>EPA + DHA</span><strong>${formatAmount(epaFood + epaSupplement, "g")} <small>${epaSupplement ? `(${formatAmount(epaFood, "g")} food + ${formatAmount(epaSupplement, "g")} supplement)` : "food"}</small></strong></div></div><section class="coverage-priority ${gaps.length ? "is-gap" : "is-good"}" aria-labelledby="${idPrefix}-priority-title"><div class="coverage-block-head"><strong id="${idPrefix}-priority-title">${gaps.length ? "Priority gaps" : "Foundation covered"}</strong><span>${gaps.length ? `${gaps.length} unresolved` : "All reference targets are covered"}</span></div>${gaps.length ? `<div class="coverage-priority-list">${priorityGaps.map((gap) => priorityGapHTML(gap, totals, compounds)).join("")}</div>` : `<p class="coverage-priority-empty">Most reference targets are covered. Check portions and your actual diet.</p>`}</section><details class="coverage-all"><summary><span>All nutrient coverage</span><strong>${covered}/${tracked.length} covered${gaps.length > priorityGaps.length ? ` · ${gaps.length - priorityGaps.length} more gaps` : ""}</strong></summary><div class="coverage-groups">${groupSummaries}</div></details>${warningText.length ? `<div class="coverage-callouts"><div class="coverage-callout is-watch"><strong>Overlap &amp; safety warnings</strong><span>${warningText.join(" · ")}</span></div></div>` : ""}`;
}

function amountsForWarnings(ids) {
  return { magnesium: selectedSupplementTotal("magnesium") };
}

function mealCardHTML(meal, selected = selectedMealIds.includes(meal.id)) {
  const items = meal.items.map((id) => quickItem(id)).filter(Boolean);
  const servingsOpen = selected && expandedMealServings.has(meal.id);
  const actions = `<div class="meal-card-actions" role="group" aria-label="${escapeHTML(meal.name)} actions">${iconButton({ iconName: selected ? 'check' : 'add', label: `${selected ? 'Remove' : 'Add'} ${meal.name} ${selected ? 'from' : 'to'} plan`, pressed: selected, tooltip: selected ? 'Remove from plan' : 'Add to plan', data: { 'meal-toggle': meal.id } })}${iconButton({ iconName: 'pin', label: `${meal.pinned ? 'Unpin' : 'Pin'} ${meal.name}`, pressed: meal.pinned, tooltip: meal.pinned ? 'Unpin meal' : 'Pin meal', data: { 'meal-pin': meal.id } })}${iconButton({ iconName: 'edit', label: `Edit ${meal.name}`, tooltip: 'Edit meal', data: { 'meal-edit': meal.id } })}${iconButton({ iconName: 'delete', label: `Delete ${meal.name}`, tone: 'danger', tooltip: 'Delete meal', data: { 'meal-delete': meal.id } })}</div>`;
  const servingToggle = `<button type="button" class="text-button serving-editor-toggle" data-meal-serving-toggle="${escapeHTML(meal.id)}" aria-label="Adjust serving sizes" aria-expanded="${servingsOpen}" aria-controls="meal-serving-${escapeHTML(meal.id)}"${selected ? "" : " hidden disabled"}>${servingsOpen ? "Hide serving controls" : "Adjust servings"}</button>`;
  return `<article class="meal-card ${selected ? "is-selected" : ""}" data-meal-card="${meal.id}">${actions}<div class="meal-card-head"><div><h3>${escapeHTML(meal.name)}</h3><p class="meal-card-meta">${items.length} ingredient${items.length === 1 ? "" : "s"}</p></div></div><ul class="meal-ingredients ${servingsOpen ? "has-ingredient-portions" : ""}" id="meal-serving-${escapeHTML(meal.id)}" aria-label="Ingredients">${items.map((item) => `<li title="${escapeHTML(item.serving)}"><span class="meal-ingredient-name">${escapeHTML(item.name)}</span>${portionControlHTML("meal-item", item.id, mealItemPortion(meal.id, item.id), servingsOpen, "Serving", `data-portion-meal-id="${escapeHTML(meal.id)}"`)}</li>`).join("")}</ul>${servingToggle}${portionControlHTML("meal", meal.id, mealPortion(meal.id), servingsOpen, "Meal portions")}</article>`;
}

function plannerControlsHTML() {
  return `<div class="planner-controls"><div class="segmented-control planner-mode-tabs" role="group" aria-label="Planner input mode" data-segmented-control data-segmented-active="${plannerMode}">
    <button type="button" class="segmented-control-option planner-mode-tab ${plannerMode === "meals" ? "active" : ""}" data-planner-mode="meals" data-segmented-option="meals" aria-pressed="${plannerMode === "meals"}" aria-controls="planner-input-panel">Meals <span data-planner-meal-count>${formatPortion(selectedPortionTotal(selectedMealQuantities, selectedMealIds))}</span></button>
    <button type="button" class="segmented-control-option planner-mode-tab ${plannerMode === "quick-add" ? "active" : ""}" data-planner-mode="quick-add" data-segmented-option="quick-add" aria-pressed="${plannerMode === "quick-add"}" aria-controls="planner-input-panel">Quick add <span data-planner-quick-count>${formatPortion(selectedPortionTotal(quickItemQuantities, quickSelectedItemIds))}</span></button>
    </div>
    <button class="button button-secondary planner-clear" type="button" data-clear-stack>Clear plan</button>
  </div>`;
}

function portionControlHTML(scope, id, value, visible = true, label = "Portion", attributes = "") {
  return `<div class="portion-control ${visible ? "" : "is-hidden"}" data-portion-control data-portion-scope="${scope}" data-portion-id="${id}" ${attributes} aria-hidden="${visible ? "false" : "true"}"><span>${label}</span><button type="button" data-portion-action="decrease" aria-label="Decrease ${label.toLowerCase()}">${icon('minus')}</button><input type="number" min="0.25" max="20" step="0.25" value="${formatPortion(value)}" data-portion-input aria-label="${label} size"><button type="button" data-portion-action="increase" aria-label="Increase ${label.toLowerCase()}">${icon('add')}</button></div>`;
}

function quickItemHTML(item) {
  const selected = quickSelectionForDisplay().includes(item.id);
  const servingsOpen = selected && expandedQuickServings.has(item.id);
  const portion = mealComposerMode === "edit" ? "" : portionControlHTML("quick", item.id, itemPortion(item.id), servingsOpen, "Serving", `id="quick-serving-${escapeHTML(item.id)}"`);
  const target = mealComposerMode === 'edit' ? 'meal' : 'plan';
  const toggle = iconButton({ iconName: selected ? 'check' : 'add', label: `${selected ? 'Remove' : 'Add'} ${item.name} ${selected ? 'from' : 'to'} ${target}`, pressed: selected, tooltip: selected ? `Remove from ${target}` : `Add to ${target}`, data: { 'quick-item': item.id } });
  const servingToggle = mealComposerMode === "edit" ? "" : `<button type="button" class="text-button serving-editor-toggle" data-quick-serving-toggle="${escapeHTML(item.id)}" aria-label="Adjust serving sizes" aria-expanded="${servingsOpen}" aria-controls="quick-serving-${escapeHTML(item.id)}"${selected ? "" : " hidden disabled"}>${servingsOpen ? "Hide serving controls" : "Adjust servings"}</button>`;
  return `<article class="builder-item ${selected ? "selected" : ""}" data-quick-card="${item.id}"><span class="builder-item-top">${toggle}</span><strong>${escapeHTML(item.name)}</strong><span class="builder-serving">${escapeHTML(item.serving)}</span><small>${escapeHTML(item.note || "")}${item.watch ? " · safety note" : ""}</small>${servingToggle}${portion}</article>`;
}

function mealComposerDialogHTML() {
  return `<dialog class="ui-modal meal-save-dialog" data-meal-dialog aria-labelledby="meal-dialog-title" aria-describedby="meal-dialog-items meal-dialog-status"><form class="ui-modal-form meal-save-dialog-form" data-meal-dialog-form><div class="ui-modal-head meal-dialog-head"><div><p class="eyebrow">Reusable meal</p><h2 id="meal-dialog-title">Save selection as a meal</h2></div>${iconButton({ iconName: 'close', label: 'Close', tooltip: 'Close', data: { 'meal-dialog-cancel': '' } })}</div><label for="meal-dialog-name">Meal name</label><input id="meal-dialog-name" type="text" maxlength="80" placeholder="e.g. Weekday salmon plate" data-meal-dialog-name required><p id="meal-dialog-items" class="meal-dialog-items" data-meal-dialog-items></p><div class="ui-modal-actions meal-dialog-actions"><button type="button" class="button button-secondary" data-meal-dialog-cancel>Cancel</button><button type="submit" class="button button-primary" data-meal-dialog-confirm>Save meal</button></div><p id="meal-dialog-status" class="save-status" data-meal-dialog-status role="status"></p></form></dialog>`;
}

function quickAddHTML() {
  const categories = [["all", "All"], ["protein", "Protein"], ["volume", "Volume + fibre"], ["fat", "Healthy fat"], ["functional", "Functional"], ["supplement", "Supplements"]];
  const quickItems = filteredQuickItems();
  const editing = mealComposerMode === "edit";
  const quickPortions = selectedPortionTotal(quickItemQuantities, quickSelectedItemIds);
  const composerAction = editing ? `<div class="meal-edit-bar"><label for="meal-edit-name">Editing meal</label><input id="meal-edit-name" type="text" maxlength="80" value="${escapeHTML(mealComposerName)}" data-meal-edit-name><span><strong data-quick-selection-count>${mealComposerItems.length}</strong> ingredients selected</span><div><button type="button" class="button button-primary" data-meal-edit-save>Save changes</button><button type="button" class="button button-secondary" data-meal-compose-cancel>Cancel</button></div><p class="save-status" data-meal-edit-status role="status"></p></div>` : `<div class="quick-add-save"><span><strong data-quick-selection-count>${formatPortion(quickPortions)}</strong> portion${quickPortions === 1 ? "" : "s"} selected</span><button type="button" class="button button-secondary" data-meal-compose-open ${quickSelectedItemIds.length ? "" : "disabled"}>Save to meals</button></div>`;
  return `<section class="quick-add-panel" id="planner-quick-add" aria-labelledby="quick-add-title"><div class="planner-section-head"><div><p class="eyebrow">Quick add</p><h3 id="quick-add-title">Choose foods and supplements</h3><p>Choose a food once per portion; selected items can also become a reusable meal.</p></div></div>${composerAction}<div class="builder-filters" aria-label="Filter quick-add items">${categories.map(([id, label]) => `<button type="button" class="builder-filter ${activeQuickCategory === id ? "active" : ""}" data-quick-category="${id}" aria-pressed="${activeQuickCategory === id}">${label}</button>`).join("")}</div><div class="builder-item-grid planner-card-grid quick-item-grid">${quickItems.length ? quickItems.map(quickItemHTML).join("") : quickSearchEmptyHTML()}</div></section>`;
}

function updateQuickAddUI(root) {
  const selected = quickSelectionForDisplay();
  root.querySelectorAll("[data-quick-item]").forEach((button) => {
    const active = selected.includes(button.dataset.quickItem);
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("is-selected", active);
    const card = button.closest("[data-quick-card]");
    card?.classList.toggle("selected", active);
    const target = mealComposerMode === 'edit' ? 'meal' : 'plan';
    button.setAttribute('data-tooltip-trigger', '');
    button.innerHTML = `${icon(active ? 'check' : 'add')}<span class="ui-tooltip" role="tooltip">${active ? `Remove from ${target}` : `Add to ${target}`}</span>`;
    button.setAttribute('aria-label', `${active ? 'Remove' : 'Add'} ${card?.querySelector('strong')?.textContent || 'item'} ${active ? 'from' : 'to'} ${target}`);
    const servingsOpen = active && expandedQuickServings.has(button.dataset.quickItem);
    const servingToggle = card?.querySelector('[data-quick-serving-toggle]');
    if (servingToggle) {
      servingToggle.disabled = !active;
      servingToggle.hidden = !active;
      servingToggle.setAttribute('aria-expanded', String(servingsOpen));
      servingToggle.setAttribute('aria-label', 'Adjust serving sizes');
      servingToggle.textContent = servingsOpen ? 'Hide serving controls' : 'Adjust servings';
    }
    const portion = card?.querySelector("[data-portion-control]");
    if (portion) { portion.classList.toggle("is-hidden", !servingsOpen); portion.setAttribute("aria-hidden", String(!servingsOpen)); }
    const input = portion?.querySelector("[data-portion-input]");
    if (input) input.value = formatPortion(itemPortion(button.dataset.quickItem));
  });
  const count = root.querySelector("[data-quick-selection-count]");
  if (count) count.textContent = formatPortion(mealComposerMode === "edit" ? selected.length : selectedPortionTotal(quickItemQuantities, quickSelectedItemIds));
  const save = root.querySelector("[data-meal-compose-open]");
  if (save && mealComposerMode !== "edit") save.disabled = quickSelectedItemIds.length === 0;
}

function openMealComposer(root, returnFocus = document.activeElement) {
  const dialog = root.querySelector("[data-meal-dialog]");
  if (!dialog) return;
  if (!dialog.dataset.modalCleanupBound) {
    dialog.dataset.modalCleanupBound = "true";
    dialog.addEventListener('close', () => {
      if (mealComposerMode === "create") resetMealComposer();
    });
  }
  const input = dialog.querySelector("[data-meal-dialog-name]");
  const itemText = dialog.querySelector("[data-meal-dialog-items]");
  const selectedItems = mealComposerItems.map(quickItem).filter(Boolean);
  dialog.querySelector("[data-meal-dialog-status]").textContent = "";
  dialog.querySelector("#meal-dialog-title").textContent = mealComposerMode === "edit" ? "Save meal changes" : "Save selection as a meal";
  if (input) input.value = mealComposerName;
  if (itemText) itemText.textContent = selectedItems.length ? `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"}: ${selectedItems.map((item) => item.name).join(" · ")}` : "Choose at least one item before saving.";
  openModalDialog(dialog, { initialFocus: input, returnFocus, lightDismiss: true });
}

function closeMealComposer(root, returnValue = "cancel") {
  const dialog = root.querySelector("[data-meal-dialog]");
  return closeModalDialog(dialog, returnValue);
}

async function saveMealComposer(root, values = {}) {
  const input = root.querySelector("[data-meal-dialog-name]");
  const status = values.status || root.querySelector("[data-meal-dialog-status]");
  const name = typeof values.name === 'string' ? values.name.trim() : input?.value.trim() || "";
  const items = [...new Set(mealComposerItems)].filter((id) => BUILDER_ITEMS.some((item) => item.id === id));
  if (!name || !items.length) {
    if (status) status.textContent = !name ? "Add a meal name." : "Choose at least one item.";
    return false;
  }
  const now = new Date().toISOString();
  const saved = getSavedMeals();
  const existing = mealComposerMode === "edit" ? mealLibrary().find((meal) => meal.id === mealComposerMealId) : null;
  const id = existing?.id || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "meal"}-${Date.now()}`;
  const meal = { ...existing, id, name, items, createdAt: existing?.createdAt || now, updatedAt: now, tags: existing?.tags || ["saved"] };
  if (existing?.source === "preset" || mealComposerSource === "preset") {
    const state = getMealLibraryState();
    setMealLibraryState({ ...state, overrides: { ...state.overrides, [id]: meal } });
  } else {
    setSavedMeals([meal, ...saved.filter((candidate) => candidate.id !== id)]);
  }
  if (!existing && !selectedMealIds.includes(id)) { selectedMealIds = [...selectedMealIds, id]; selectedMealQuantities[id] = 1; selectedMealItemQuantities[id] = {}; }
  if (!existing) { quickSelectedItemIds = []; quickItemQuantities = {}; }
  persistCurrentDay();
  await closeMealComposer(root, "confirm");
  resetMealComposer();
  renderStack();
  setPlannerStatus("[data-planner-status]", `${existing ? "Updated" : "Saved"} meal “${name}”`);
  return true;
}

function deleteMeal(meal) {
  if (!meal) return;
  if (meal.source === "preset") {
    const state = getMealLibraryState();
    setMealLibraryState({ overrides: Object.fromEntries(Object.entries(state.overrides).filter(([id]) => id !== meal.id)), hidden: [...new Set([...state.hidden, meal.id])] });
  } else {
    setSavedMeals(getSavedMeals().filter((candidate) => candidate.id !== meal.id));
  }
  selectedMealIds = selectedMealIds.filter((id) => id !== meal.id);
  delete selectedMealQuantities[meal.id];
  delete selectedMealItemQuantities[meal.id];
  expandedMealServings.delete(meal.id);
  persistCurrentDay();
}

function plannerHTML() {
  const meals = filteredMeals();
  const mealPortions = selectedPortionTotal(selectedMealQuantities, selectedMealIds);
  const quickPortions = selectedPortionTotal(quickItemQuantities, quickSelectedItemIds);
  const libraryState = getMealLibraryState();
  const restore = Object.keys(libraryState.overrides).length || libraryState.hidden.length
    ? `<button type="button" class="text-button meal-restore" data-meal-restore>Restore preset meals</button>` : "";
  const mealContent = `<section class="meal-library-section" id="planner-meals" aria-labelledby="meal-library-title"><div class="planner-section-head"><div><p class="eyebrow">Meals</p><h3 id="meal-library-title">Choose a reusable meal</h3></div>${restore}</div><div class="meal-library-grid planner-card-grid">${meals.length ? meals.map((meal) => mealCardHTML(meal)).join("") : mealSearchEmptyHTML()}</div></section>`;
  const plannerContent = plannerMode === "meals" ? mealContent : quickAddHTML();
  const plannerClass = plannerMode === "quick-add" ? "is-quick-add" : "is-meals";
  return `<section class="stack-builder meal-planner ${plannerClass}" aria-labelledby="planner-title">
    <div class="builder-head"><div><p class="eyebrow">Daily Stack</p><h2 id="planner-title">Build a nutrition plan from reusable meals</h2><p>Select meals, adjust portions, then use the nutrient readout to solve meaningful gaps.</p></div></div>
    ${starterExampleActive ? `<div class="starter-example" data-starter-example><div><strong>Starter example loaded</strong><span>Chia protein oatmeal is selected to demonstrate how coverage changes.</span></div><button type="button" class="text-button" data-start-blank>Start blank</button></div>` : ''}
    ${plannerControlsHTML()}
    <div class="planner-search-row">${plannerSearchHTML()}</div>
    ${window.matchMedia('(max-width: 767px)').matches ? mobileCoverageHTML() : ''}
    <div class="planner-workspace">
      <div class="planner-main" id="planner-input-panel">
        ${plannerContent}
      </div>
      <aside class="coverage-panel plan-readout" aria-live="polite"><div class="coverage-panel-head"><p class="eyebrow">Review</p><h3>Coverage and gaps</h3><div class="plan-counts"><span><strong data-plan-meals>${formatPortion(mealPortions)}</strong> meal portions</span><span><strong data-plan-quick>${formatPortion(quickPortions)}</strong> quick portions</span></div><details class="coverage-settings"><summary>Coverage settings</summary><div class="builder-profile"><label for="body-weight">Protein reference body weight</label><div><input id="body-weight" type="number" min="35" max="250" step="1" value="${bodyWeightKg}" data-body-weight><span>kg · uses a 1.2 g/kg floor</span></div></div></details></div><div data-coverage>${coverageHTMLV2()}</div></aside>
    </div>
    ${mealComposerDialogHTML()}
  </section>`;
}

function renderPlannerMode(root) {
  const main = root?.querySelector('.planner-main');
  const planner = root?.querySelector('.meal-planner');
  if (!main || !planner) return;
  const libraryState = getMealLibraryState();
  const restore = Object.keys(libraryState.overrides).length || libraryState.hidden.length
    ? `<button type="button" class="text-button meal-restore" data-meal-restore>Restore preset meals</button>` : "";
  if (plannerMode === 'meals') {
    const meals = filteredMeals();
    main.innerHTML = `<section class="meal-library-section" id="planner-meals" aria-labelledby="meal-library-title"><div class="planner-section-head"><div><p class="eyebrow">Meals</p><h3 id="meal-library-title">Choose a reusable meal</h3></div>${restore}</div><div class="meal-library-grid planner-card-grid">${meals.length ? meals.map((meal) => mealCardHTML(meal)).join("") : mealSearchEmptyHTML()}</div></section>`;
  } else {
    main.innerHTML = quickAddHTML();
  }
  planner.classList.toggle('is-meals', plannerMode === 'meals');
  planner.classList.toggle('is-quick-add', plannerMode === 'quick-add');
  root.querySelector('[data-segmented-control]')?.setAttribute('data-segmented-active', plannerMode);
  root.querySelectorAll('[data-planner-mode]').forEach((button) => {
    const active = button.dataset.plannerMode === plannerMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateMealPlannerUI({ customized: false });
}

function updateMealPlannerUI({ customized = true } = {}) {
  const root = document.getElementById("stack-app");
  if (!root) return;
  if (customized) {
    starterExampleActive = false;
    root.querySelector('[data-starter-example]')?.remove();
  }
  if (!starterExampleActive) persistCurrentDay();
  const coverage = root.querySelector("[data-coverage]");
  if (coverage) coverage.innerHTML = coverageHTMLV2();
  const mobileCoverage = root.querySelector("[data-mobile-coverage]");
  if (mobileCoverage) mobileCoverage.innerHTML = coverageHTMLV2('mobile-coverage');
  const mobileSummary = coverageSummaryData();
  const mobileScore = root.querySelector('[data-mobile-coverage-score]');
  const mobileGap = root.querySelector('[data-mobile-top-gap]');
  if (mobileScore) mobileScore.textContent = `${mobileSummary.covered}/${mobileSummary.total} covered`;
  if (mobileGap) mobileGap.textContent = mobileSummary.topGap === 'No priority gaps' ? mobileSummary.topGap : `Top gap · ${mobileSummary.topGap}`;
  updateQuickAddUI(root);
  root.querySelectorAll("[data-meal-toggle]").forEach((button) => {
    const selected = selectedMealIds.includes(button.dataset.mealToggle);
    const servingsOpen = selected && expandedMealServings.has(button.dataset.mealToggle);
    const name = button.closest(".meal-card")?.querySelector("h3")?.textContent || "meal";
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${name} ${selected ? "from" : "to"} plan`);
    button.setAttribute('data-tooltip-trigger', '');
    button.innerHTML = `${icon(selected ? 'check' : 'add')}<span class="ui-tooltip" role="tooltip">${selected ? 'Remove from plan' : 'Add to plan'}</span>`;
    const mealCard = button.closest('.meal-card');
    const servingToggle = mealCard?.querySelector('[data-meal-serving-toggle]');
    if (servingToggle) {
      servingToggle.disabled = !selected;
      servingToggle.hidden = !selected;
      servingToggle.setAttribute('aria-expanded', String(servingsOpen));
      servingToggle.setAttribute('aria-label', 'Adjust serving sizes');
      servingToggle.textContent = servingsOpen ? 'Hide serving controls' : 'Adjust servings';
    }
    const portion = mealCard?.querySelector('[data-portion-scope="meal"]');
    if (portion) {
      portion.classList.toggle('is-hidden', !servingsOpen);
      portion.setAttribute('aria-hidden', String(!servingsOpen));
      const mealInput = portion.querySelector('[data-portion-input]');
      if (mealInput) mealInput.value = formatPortion(mealPortion(button.dataset.mealToggle));
    }
    mealCard?.querySelectorAll('[data-portion-scope="meal-item"]').forEach((control) => {
      control.classList.toggle('is-hidden', !servingsOpen);
      control.setAttribute('aria-hidden', String(!servingsOpen));
      const itemInput = control.querySelector('[data-portion-input]');
      if (itemInput) itemInput.value = formatPortion(mealItemPortion(control.dataset.portionMealId, control.dataset.portionId));
    });
  });
  root.querySelectorAll("[data-meal-toggle]").forEach((button) => {
    const card = button.closest('.meal-card');
    const selected = selectedMealIds.includes(button.dataset.mealToggle);
    const servingsOpen = selected && expandedMealServings.has(button.dataset.mealToggle);
    card?.classList.toggle('is-selected', selected);
    card?.querySelector('.meal-ingredients')?.classList.toggle('has-ingredient-portions', servingsOpen);
  });
  const plannerMealCount = root.querySelector("[data-planner-meal-count]"); if (plannerMealCount) plannerMealCount.textContent = formatPortion(selectedPortionTotal(selectedMealQuantities, selectedMealIds));
  const plannerQuickCount = root.querySelector("[data-planner-quick-count]"); if (plannerQuickCount) plannerQuickCount.textContent = formatPortion(selectedPortionTotal(quickItemQuantities, quickSelectedItemIds));
  const mealPortions = selectedPortionTotal(selectedMealQuantities, selectedMealIds);
  const quickPortions = selectedPortionTotal(quickItemQuantities, quickSelectedItemIds);
  const mealCounts = root.querySelector("[data-plan-meals]"); if (mealCounts) mealCounts.textContent = formatPortion(mealPortions);
  const quickCounts = root.querySelector("[data-plan-quick]"); if (quickCounts) quickCounts.textContent = formatPortion(quickPortions);
}

function setPlannerStatus(_selector, text) { showToast(text, { type: 'success' }); }

export function renderStack() {
  const container = document.getElementById("stack-app");
  if (!container) return;
  container.innerHTML = plannerHTML() + legacyLibraryHTML();
  renderLegacyProtocol();
}

document.addEventListener('DOMContentLoaded', () => {
  removeLegacyDailyPlans();
  restoreCurrentDay();
  if (document.getElementById('stack-app')) renderStack();
});

document.addEventListener('click', async (event) => {
  const root = document.getElementById('stack-app');
  if (!root) return;

  const libraryTab = event.target.closest('[data-library-tab]');
  if (libraryTab) { selectStackTab(libraryTab.dataset.libraryTab); return; }

  const plannerModeTab = event.target.closest('[data-planner-mode]');
  if (plannerModeTab) {
    plannerSearchQuery = "";
    const plannerSearch = root.querySelector('[data-planner-search]');
    if (plannerSearch) plannerSearch.value = "";
    plannerMode = plannerModeTab.dataset.plannerMode;
    renderPlannerMode(root);
    return;
  }

  const cardActionExcluded = event.target.closest('button, input, [data-portion-control], .meal-card-actions');
  const mealCard = event.target.closest('[data-meal-card]');
  if (mealCard && !cardActionExcluded) {
    mealCard.querySelector('[data-meal-toggle]')?.click();
    return;
  }

  const quickCard = event.target.closest('[data-quick-card]');
  if (quickCard && !cardActionExcluded) {
    quickCard.querySelector('[data-quick-item]')?.click();
    return;
  }

  const mealServingToggle = event.target.closest('[data-meal-serving-toggle]');
  if (mealServingToggle) {
    const id = mealServingToggle.dataset.mealServingToggle;
    if (mealServingToggle.disabled || !selectedMealIds.includes(id)) return;
    if (expandedMealServings.has(id)) expandedMealServings.delete(id);
    else expandedMealServings.add(id);
    updateMealPlannerUI();
    return;
  }

  const quickServingToggle = event.target.closest('[data-quick-serving-toggle]');
  if (quickServingToggle) {
    const id = quickServingToggle.dataset.quickServingToggle;
    if (quickServingToggle.disabled || !quickSelectedItemIds.includes(id)) return;
    if (expandedQuickServings.has(id)) expandedQuickServings.delete(id);
    else expandedQuickServings.add(id);
    updateMealPlannerUI();
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
      expandedQuickServings.delete(id);
    } else {
      quickSelectedItemIds = [...quickSelectedItemIds, id];
      quickItemQuantities[id] = 1;
      expandedQuickServings.delete(id);
    }
    updateMealPlannerUI();
    return;
  }

  const portionAction = event.target.closest('[data-portion-action]');
  if (portionAction) {
    const control = portionAction.closest('[data-portion-control]');
    const id = control?.dataset.portionId;
    const scope = control?.dataset.portionScope;
    const increment = portionAction.dataset.portionAction === "increase" ? .25 : -.25;
    if (scope === "meal-item") {
      const mealId = control?.dataset.portionMealId;
      if (id && mealId) {
        selectedMealItemQuantities[mealId] ||= {};
        selectedMealItemQuantities[mealId][id] = normalizePortion(mealItemPortion(mealId, id) + increment);
        updateMealPlannerUI();
      }
      return;
    }
    const quantities = scope === "meal" ? selectedMealQuantities : quickItemQuantities;
    if (id && quantities) {
      quantities[id] = normalizePortion(normalizePortion(quantities[id]) + increment);
      updateMealPlannerUI();
    }
    return;
  }

  const quickCategory = event.target.closest('[data-quick-category]');
  if (quickCategory) {
    activeQuickCategory = quickCategory.dataset.quickCategory;
    root.querySelectorAll('[data-quick-category]').forEach((button) => { const active = button.dataset.quickCategory === activeQuickCategory; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    renderPlannerSearchResults(root);
    return;
  }

  const mealToggle = event.target.closest('[data-meal-toggle]');
  if (mealToggle) {
    const id = mealToggle.dataset.mealToggle;
    if (selectedMealIds.includes(id)) {
      selectedMealIds = selectedMealIds.filter((mealId) => mealId !== id);
      delete selectedMealQuantities[id];
      delete selectedMealItemQuantities[id];
      expandedMealServings.delete(id);
    } else {
      selectedMealIds = [...selectedMealIds, id];
      selectedMealQuantities[id] = 1;
      selectedMealItemQuantities[id] = {};
      expandedMealServings.delete(id);
    }
    updateMealPlannerUI();
    return;
  }

  const mealRemove = event.target.closest('[data-meal-remove]');
  if (mealRemove) { selectedMealIds = selectedMealIds.filter((id) => id !== mealRemove.dataset.mealRemove); delete selectedMealQuantities[mealRemove.dataset.mealRemove]; delete selectedMealItemQuantities[mealRemove.dataset.mealRemove]; expandedMealServings.delete(mealRemove.dataset.mealRemove); updateMealPlannerUI(); return; }

  const mealComposeOpen = event.target.closest('[data-meal-compose-open]');
  if (mealComposeOpen) {
    if (mealComposerMode !== "edit") {
      mealComposerMode = "create";
      mealComposerMealId = null;
      mealComposerSource = "saved";
      mealComposerItems = [...quickSelectedItemIds];
      mealComposerName = "";
    }
    openMealComposer(root, mealComposeOpen);
    return;
  }

  if (event.target.closest('[data-meal-compose-cancel]')) {
    resetMealComposer();
    plannerMode = "quick-add";
    renderStack();
    return;
  }

  const mealPin = event.target.closest('[data-meal-pin]');
  if (mealPin) {
    const id = mealPin.dataset.mealPin;
    const meal = mealLibrary().find((candidate) => candidate.id === id);
    if (!meal) return;
    const pinned = !meal.pinned;
    const state = getMealLibraryState();
    const pinnedIds = new Set(state.pinned);
    if (pinned) pinnedIds.add(id);
    else pinnedIds.delete(id);
    if (meal.source === "saved") setSavedMeals(getSavedMeals().map((candidate) => candidate.id === id ? { ...candidate, pinned } : candidate));
    setMealLibraryState({ ...state, pinned: [...pinnedIds] });
    renderStack();
    root.querySelector(`[data-meal-pin="${id}"]`)?.focus();
    return;
  }

  if (event.target.closest('[data-meal-edit-save]')) {
    const name = root.querySelector('[data-meal-edit-name]')?.value || '';
    await saveMealComposer(root, { name, status: root.querySelector('[data-meal-edit-status]') });
    return;
  }

  const mealEdit = event.target.closest('[data-meal-edit]');
  if (mealEdit) {
    const meal = mealLibrary().find((candidate) => candidate.id === mealEdit.dataset.mealEdit);
    if (meal) {
      mealComposerMode = "edit";
      mealComposerMealId = meal.id;
      mealComposerSource = meal.source;
      mealComposerItems = [...meal.items];
      mealComposerName = meal.name;
      plannerMode = "quick-add";
      renderStack();
    }
    return;
  }

  const mealDelete = event.target.closest('[data-meal-delete]');
  if (mealDelete) {
    const meal = mealLibrary().find((candidate) => candidate.id === mealDelete.dataset.mealDelete);
    if (meal) {
      const items = meal.items.map(quickItem).filter(Boolean).map((item) => item.name);
      const selected = selectedMealIds.includes(meal.id);
      const confirmed = await confirmAction({
        title: `${meal.source === 'preset' ? 'Remove' : 'Delete'} “${meal.name}”?`,
        summary: meal.source === 'preset'
          ? 'This preset will be hidden and any edits to it will be reset. You can restore it later.'
          : 'This permanently removes the meal from your saved meals.',
        details: `${items.length} ingredient${items.length === 1 ? '' : 's'}: ${items.join(' · ')}${selected ? ' · It will also be removed from today’s plan.' : ''}`,
        confirmLabel: meal.source === 'preset' ? 'Remove preset' : 'Delete meal',
        returnFocus: mealDelete,
      });
      if (!confirmed) return;
      deleteMeal(meal);
      renderStack();
      setPlannerStatus('[data-planner-status]', `${meal.source === 'preset' ? 'Removed preset' : 'Deleted'} “${meal.name}”`);
    }
    return;
  }

  if (event.target.closest('[data-meal-restore]')) {
    setMealLibraryState({ overrides: {}, hidden: [] });
    renderStack();
    setPlannerStatus('[data-planner-status]', "Preset meals restored");
    return;
  }

  if (event.target.closest('[data-meal-dialog-cancel]')) {
    await closeMealComposer(root);
    if (mealComposerMode === "create") resetMealComposer();
    return;
  }

  if (event.target.closest('[data-start-blank]')) {
    selectedMealIds = [];
    quickSelectedItemIds = [];
    selectedMealQuantities = {};
    selectedMealItemQuantities = {};
    quickItemQuantities = {};
    expandedMealServings.clear();
    expandedQuickServings.clear();
    updateMealPlannerUI();
    setPlannerStatus('[data-planner-status]', 'Started a blank plan');
    return;
  }

  const clearPlan = event.target.closest('[data-clear-stack]');
  if (clearPlan) {
    if (!selectedMealIds.length && !quickSelectedItemIds.length) return;
    const confirmed = await confirmAction({ title: 'Clear today’s plan?', summary: 'This removes every selected meal and Quick Add item from today. Saved meals are not deleted.', confirmLabel: 'Clear plan', returnFocus: clearPlan });
    if (!confirmed) return;
    const clearTop = clearPlan.getBoundingClientRect().top;
    selectedMealIds = []; quickSelectedItemIds = []; selectedMealQuantities = {}; selectedMealItemQuantities = {}; quickItemQuantities = {}; expandedMealServings.clear(); expandedQuickServings.clear(); resetMealComposer(); updateMealPlannerUI();
    const nextClearTop = clearPlan.getBoundingClientRect().top;
    if (nextClearTop !== clearTop) window.scrollBy({ top: nextClearTop - clearTop, left: 0, behavior: 'instant' });
    setPlannerStatus('[data-planner-status]', 'Today’s plan cleared');
    return;
  }
});

document.addEventListener('input', (event) => {
  const plannerSearch = event.target.closest('[data-planner-search]');
  if (plannerSearch && document.getElementById('stack-app')) {
    plannerSearchQuery = plannerSearch.value;
    renderPlannerSearchResults(document.getElementById('stack-app'));
    return;
  }
  const mealName = event.target.closest('[data-meal-dialog-name]');
  if (mealName && document.getElementById('stack-app')) { mealComposerName = mealName.value; return; }
  const editName = event.target.closest('[data-meal-edit-name]');
  if (editName && document.getElementById('stack-app')) { mealComposerName = editName.value; return; }
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
  if (control?.dataset.portionScope === "meal-item") {
    const mealId = control.dataset.portionMealId;
    if (id && mealId) {
      selectedMealItemQuantities[mealId] ||= {};
      selectedMealItemQuantities[mealId][id] = normalizePortion(portionInput.value);
      updateMealPlannerUI();
    }
    return;
  }
  const quantities = control?.dataset.portionScope === "meal" ? selectedMealQuantities : quickItemQuantities;
  if (id && quantities) { quantities[id] = normalizePortion(portionInput.value); updateMealPlannerUI(); }
});

document.addEventListener('keydown', (event) => {
  const option = event.target.closest('[data-planner-mode]');
  if (!option || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const options = [...option.closest('[data-segmented-control]').querySelectorAll('[data-planner-mode]')];
  let index = options.indexOf(option);
  if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = options.length - 1;
  else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
  event.preventDefault();
  options[index].focus();
  options[index].click();
});

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-meal-dialog-form]');
  const root = document.getElementById('stack-app');
  if (!form || !root) return;
  event.preventDefault();
  await saveMealComposer(root);
});
