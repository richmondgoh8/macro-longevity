// stack.js — Daily Stack rendering (supplements, food & spices, extras, skip list)
import { calculateNutrients } from './components/nutrition-totals.js';
import { pinCoverage } from './components/coverage-pin.js';
let cleanupCoveragePin = () => {};

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
let DAILY_SUPPLEMENTS = [];
let FOOD_SPICES = [];
let EXTRAS = [];
let SKIP_LIST = [];
let CONDITIONAL_LIST = [];
let TIMING_GUIDE = [];
let stackLibraryPromise;
let bodyWeightKg = 75;
const MEALS_STORAGE_KEY = "ml-daily-meals";
const MEAL_LIBRARY_STORAGE_KEY = "ml-daily-meal-library";
const CURRENT_DAY_STORAGE_KEY = "ml-daily-current";
let quickSelectedItemIds = [];
let quickItemQuantities = {};
let quickItemGrams = {};
let selectedMealIds = ["chia-protein-oatmeal"];
let selectedMealQuantities = {};
let selectedMealItemQuantities = {};
let selectedMealItemGrams = {};
let activeQuickCategory = "all";
let plannerSearchQuery = "";
let plannerMode = "meals";
let starterExampleActive = true;
let mealComposerMode = null;
let mealComposerMealId = null;
let mealComposerSource = null;
let mealComposerItems = [];
let mealComposerName = "";
let mealComposerSearch = "";
let mealComposerAmounts = {};
let mealComposerOriginal = "";
let savedMealsCache;
let mealLibraryCache;
let storageUnavailable = false;
let nutritionDetailType = null;
let nutritionDetailId = null;
async function ensureStackLibraryData() {
  if (stackLibraryPromise) return stackLibraryPromise;
  stackLibraryPromise = import('./data/stack.js').then((data) => {
    ({ DAILY_SUPPLEMENTS, FOOD_SPICES, EXTRAS, SKIP_LIST, CONDITIONAL_LIST, TIMING_GUIDE } = data);
    return data;
  });
  return stackLibraryPromise;
}

function restoreCurrentDay() {
  try {
    const current = JSON.parse(localStorage.getItem(CURRENT_DAY_STORAGE_KEY) || "null");
    if (!current || typeof current !== "object") return;
    starterExampleActive = false;
    if (Array.isArray(current.quickItemIds)) quickSelectedItemIds = [...new Set(current.quickItemIds.filter((id) => BUILDER_ITEMS.some((item) => item.id === id)))];
    if (Array.isArray(current.mealIds)) selectedMealIds = [...new Set(current.mealIds.filter((id) => mealLibrary().some((meal) => meal.id === id)))];
    if (current.quickItemQuantities && typeof current.quickItemQuantities === "object") quickItemQuantities = current.quickItemQuantities;
    if (current.quickItemGrams && typeof current.quickItemGrams === "object") quickItemGrams = current.quickItemGrams;
    if (current.mealQuantities && typeof current.mealQuantities === "object") selectedMealQuantities = current.mealQuantities;
    if (current.mealItemQuantities && typeof current.mealItemQuantities === "object") selectedMealItemQuantities = current.mealItemQuantities;
    if (current.mealItemGrams && typeof current.mealItemGrams === "object") selectedMealItemGrams = current.mealItemGrams;
    quickSelectedItemIds.forEach((id) => {
      const item = quickItem(id);
      if (item?.quantityMode === "grams" && !Number.isFinite(Number(quickItemGrams[id]))) {
        quickItemGrams[id] = normalizeGrams(Number(quickItemQuantities[id]) * item.servingGrams, item.servingGrams);
      }
    });
    selectedMealIds.forEach((mealId) => {
      const meal = mealLibrary().find((candidate) => candidate.id === mealId);
      (meal?.items || []).forEach((itemId) => {
        const item = quickItem(itemId);
        if (item?.quantityMode !== "grams") return;
        selectedMealItemGrams[mealId] ||= {};
        if (!Number.isFinite(Number(selectedMealItemGrams[mealId][itemId]))) {
          const mealFactor = normalizePortion(selectedMealQuantities[mealId]);
          const oldFactor = normalizePortion(selectedMealItemQuantities[mealId]?.[itemId]);
          selectedMealItemGrams[mealId][itemId] = normalizeGrams(item.servingGrams * mealFactor * oldFactor, item.servingGrams);
        }
      });
    });
    if (Number.isFinite(Number(current.bodyWeightKg))) bodyWeightKg = Math.min(250, Math.max(35, Number(current.bodyWeightKg)));
  } catch {}
}

function persistCurrentDay() {
  writeNutritionStorage(CURRENT_DAY_STORAGE_KEY, { mealIds: selectedMealIds, quickItemIds: quickSelectedItemIds, mealQuantities: selectedMealQuantities, mealItemQuantities: selectedMealItemQuantities, quickItemQuantities, mealItemGrams: selectedMealItemGrams, quickItemGrams, bodyWeightKg });
}

function normalizePortion(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(20, Math.max(.25, Math.round(number * 4) / 4));
}

function normalizeGrams(value, fallback = 100) {
  const number = Number(value);
  const safeFallback = Number.isFinite(Number(fallback)) ? Number(fallback) : 100;
  if (!Number.isFinite(number)) return Math.round(safeFallback);
  return Math.min(2000, Math.max(1, Math.round(number)));
}

function formatGrams(value, fallback = 100) {
  return String(normalizeGrams(value, fallback));
}

function formatPortion(value) {
  if (Number(value) === 0) return "0";
  const portion = normalizePortion(value);
  return Number.isInteger(portion) ? String(portion) : portion.toFixed(2).replace(/0$/, "");
}

function itemPortion(id) {
  return normalizePortion(quickItemQuantities[id]);
}

function mealItemPortion(mealId, itemId) {
  return normalizePortion(selectedMealItemQuantities[mealId]?.[itemId]);
}

function itemUsesGrams(itemOrId) {
  const item = typeof itemOrId === "string" ? quickItem(itemOrId) : itemOrId;
  return item?.quantityMode === "grams" && Number.isFinite(Number(item.servingGrams));
}

function quickItemAmount(id) {
  const item = quickItem(id);
  return itemUsesGrams(item)
    ? normalizeGrams(quickItemGrams[id], item.servingGrams)
    : itemPortion(id);
}

function mealItemAmount(mealId, itemId) {
  const item = quickItem(itemId);
  return itemUsesGrams(item)
    ? normalizeGrams(selectedMealItemGrams[mealId]?.[itemId], item.servingGrams)
    : mealItemPortion(mealId, itemId);
}

function itemMultiplier(item, amount) {
  if (itemUsesGrams(item)) return normalizeGrams(amount, item.servingGrams) / item.servingGrams;
  return normalizePortion(amount);
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

function selectedSupplementTotal(nutrient) {
  const quantities = activeDailyItemQuantities();
  return BUILDER_ITEMS.filter((item) => activeDailyItemIds().includes(item.id) && item.category === "supplement" && item.includeInDailyCoverage !== false)
    .reduce((total, item) => total + Number(item.nutrients?.[nutrient] || 0) * (quantities[item.id] || 1), 0);
}

function targetGoal(target) {
  return target.dynamic === "protein" ? Math.round(bodyWeightKg * 1.2) : target.goal;
}

function formatAmount(value, unit) {
  if (!value) return `0 ${unit}`;
  return `${value < 10 ? value.toFixed(1).replace(/\.0$/, "") : Math.round(value).toLocaleString()} ${unit}`;
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
  return `<section class="deep-library-panel" id="planner-library" aria-labelledby="planner-library-title"><div class="planner-section-head"><div><p class="eyebrow">Deep library</p><h3 id="deep-library-title">Evidence-graded protocol details</h3><p>Open a topic only when you want the supporting detail.</p></div></div><div class="meal-controls"><div class="meal-tabs" role="tablist" aria-label="Evidence-graded protocol views">${tabs.map((tab) => `<button type="button" class="meal-tab ${tab === stackTab ? "active" : ""}" data-library-tab="${tab}" role="tab" aria-selected="${tab === stackTab}">${labels[tab]}</button>`).join("")}</div></div><div data-library-content role="tabpanel"></div></section>`;
}

function getSavedMeals() {
  if (savedMealsCache) return savedMealsCache;
  try {
    const saved = JSON.parse(localStorage.getItem(MEALS_STORAGE_KEY) || "[]");
    return savedMealsCache = Array.isArray(saved) ? saved.filter((meal) => meal && typeof meal.id === "string" && typeof meal.name === "string" && Array.isArray(meal.items)) : [];
  } catch { return []; }
}

function setSavedMeals(meals) {
  savedMealsCache = meals.slice(0, 30);
  writeNutritionStorage(MEALS_STORAGE_KEY, savedMealsCache);
}

function getMealLibraryState() {
  if (mealLibraryCache) return mealLibraryCache;
  try {
    const state = JSON.parse(localStorage.getItem(MEAL_LIBRARY_STORAGE_KEY) || "{}");
    return mealLibraryCache = {
      overrides: state && typeof state.overrides === "object" && !Array.isArray(state.overrides) ? state.overrides : {},
      hidden: Array.isArray(state?.hidden) ? [...new Set(state.hidden.filter((id) => typeof id === "string"))] : [],
      pinned: Array.isArray(state?.pinned) ? [...new Set(state.pinned.filter((id) => typeof id === "string"))] : [],
    };
  } catch { return { overrides: {}, hidden: [], pinned: [] }; }
}

function setMealLibraryState(state) {
  mealLibraryCache = { ...getMealLibraryState(), ...state };
  writeNutritionStorage(MEAL_LIBRARY_STORAGE_KEY, mealLibraryCache);
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
  mealComposerSearch = "";
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
  quickSelectedItemIds.forEach((id) => {
    const item = quickItem(id);
    addQuantity(quantities, id, itemMultiplier(item, quickItemAmount(id)));
  });
  selectedMealIds.forEach((id) => {
    const meal = meals.find((candidate) => candidate.id === id);
    (meal?.items || []).forEach((itemId) => {
      const item = quickItem(itemId);
      addQuantity(quantities, itemId, itemMultiplier(item, mealItemAmount(id, itemId)));
    });
  });
  return quantities;
}

function dailyTotals(ids = activeDailyItemIds()) {
  const quantities = activeDailyItemQuantities();
  return calculateNutrients(BUILDER_ITEMS
    .filter((item) => ids.includes(item.id) && item.includeInDailyCoverage !== false)
    .map((item) => ({ item, multiplier: quantities[item.id] ?? 0 }))).totals;
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
  if (plannerMode === "library") return;
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
  const activeItems = activeDailyItemIds().map(quickItem).filter(item => item.includeInDailyCoverage !== false);
  const incomplete = activeItems.some(item => item.nutrients?.[target.id] == null && item.compounds?.[target.id] == null);
  const known = !activeItems.length || activeItems.some(item => Number.isFinite(item.nutrients?.[target.id]) || Number.isFinite(item.compounds?.[target.id]));
  const amountLabel = known ? formatAmount(amount, target.unit) : "Unknown";
  const label = incomplete ? "Recorded amount · incomplete food data" : ({ covered: "Reference coverage reached (80%+)", partial: "Below reference", gap: "Below reference", empty: "Not started" })[state];
  return `<div class="coverage-row coverage-row-${state}"><div class="coverage-label"><span>${escapeHTML(target.name)}</span><span>${amountLabel} <small>/ ${target.dynamic === "protein" ? `${goal} g` : target.shortTarget}</small></span></div><div class="coverage-track"><span class="coverage-fill coverage-${state}" style="width:${Math.max(0, percent)}%"></span></div><p class="coverage-row-status">${label}</p></div>`;
}

function coverageSourceNames(target) {
  const sources = (target.sources || []).map((id) => quickItem(id)?.name).filter(Boolean).slice(0, 3);
  return sources.length ? sources.join(" · ") : "Check the food pattern";
}

function priorityGapHTML(target, totals, compounds) {
  const amount = coverageAmount(target, totals, compounds);
  const goal = targetGoal(target);
  const percent = Math.min(100, Math.round(amount / goal * 100));
  const state = coverageState(percent);
  return `<button type="button" class="coverage-priority-item coverage-row-${state}" data-coverage-open="gap" data-nutrient-id="${target.id}"><div class="coverage-priority-head"><strong>${escapeHTML(target.name)}</strong><span>${formatAmount(amount, target.unit)} <small>/ ${target.dynamic === "protein" ? `${goal} g` : target.shortTarget}</small></span></div><div class="coverage-track"><span class="coverage-fill coverage-${state}" style="width:${Math.max(3, percent)}%"></span></div><p>Food-first: ${escapeHTML(coverageSourceNames(target))}</p></button>`;
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

function macroCardHTML(key, label, value, reference, lower, upper) {
  const state = value ? value < lower ? "gap" : value > upper ? "over" : "ready" : "empty";
  const status = { gap: "Below reference", over: "Above reference", ready: "Reference reached", empty: "Not started" }[state];
  return `<div class="macro-card is-${state}" data-macro="${key}" data-macro-state="${state}"><span>${label}</span><strong>${formatAmount(value, "g")} <small>${reference}</small></strong><div class="macro-meter" aria-hidden="true"><span style="width:${Math.min(100, value / lower * 100)}%"></span></div><span class="macro-status">${status}</span></div>`;
}
function macroHTML(totals) { const proteinGoal = Math.round(bodyWeightKg * 1.2); return `<div class="macro-progress-strip" aria-label="Core macro totals">${macroCardHTML("protein", "Protein", totals.protein || 0, `/ ${proteinGoal} g`, proteinGoal, Infinity)}${macroCardHTML("carbs", "Carbs", totals.carbs || 0, "225–325 g", 225, 325)}${macroCardHTML("fat", "Fats", totals.fat || 0, "44–78 g", 44, 78)}</div>`; }

function coverageHTMLV2(idPrefix = 'coverage', includeAll = false) {
  const ids = activeDailyItemIds();
  const totals = dailyTotals(ids);
  const compounds = dailyCompoundTotals(ids);
  const tracked = NUTRIENT_TARGETS.filter((target) => target.track !== false);
  const covered = tracked.filter((target) => coverageAmount(target, totals, compounds) >= targetGoal(target) * .795).length;
  const gaps = tracked.filter((target) => coverageAmount(target, totals, compounds) < targetGoal(target) * .795);
  const warnings = coverageWarnings(ids, totals);
  const groupSummaries = includeAll ? NUTRIENT_GROUPS.map((group) => {
    const groupTargets = tracked.filter((target) => target.group === group.id);
    const groupCovered = groupTargets.filter((target) => coverageAmount(target, totals, compounds) >= targetGoal(target) * .795).length;
    const rows = groupTargets.map((target) => coverageRowHTML(target, totals, compounds)).join("");
    return `<details class="coverage-group"><summary><span>${escapeHTML(group.label)}</span><strong>${groupCovered}/${groupTargets.length} covered</strong></summary><div class="coverage-group-rows">${rows}</div></details>`;
  }).join("") : "";
  const priorityGaps = includeAll ? gaps : gaps.slice(0, 3);
  const warningText = [
    ...warnings.excesses.map(([id, rule]) => `${rule[1]}: ${formatAmount((id === "magnesium" ? amountsForWarnings(ids).magnesium : totals[id]) || 0, rule[2])}`),
    ...warnings.watchedItems.map((name) => `${name} has a safety note`),
  ];
  const allSummary = `<summary><span>All nutrient coverage</span><strong>${covered}/${tracked.length} covered${gaps.length > priorityGaps.length ? ` · ${gaps.length - priorityGaps.length} more gaps` : ""}</strong></summary>`;
  return `<div class="coverage-summary"><div class="coverage-score"><strong>${covered}/${tracked.length}</strong><span>covered</span></div><p class="coverage-summary-note">Singapore · <a href="${NUTRIENT_REF_URL}">HealthHub RDA</a> where available · DRI/AI or planning targets · ${bodyWeightKg} kg · 1.2 g/kg protein floor</p></div>${macroHTML(totals)}<section class="coverage-priority ${gaps.length ? "is-gap" : "is-good"}" aria-labelledby="${idPrefix}-priority-title"><div class="coverage-block-head"><strong id="${idPrefix}-priority-title">${gaps.length ? "Priority gaps" : "Foundation covered"}</strong><span>${gaps.length ? `${gaps.length} unresolved` : "All reference targets are covered"}</span></div>${gaps.length ? `<div class="coverage-priority-list">${priorityGaps.map((gap) => priorityGapHTML(gap, totals, compounds)).join("")}</div>` : `<p class="coverage-priority-empty">Most reference targets are covered. Check portions and your actual diet.</p>`}</section><button type="button" class="coverage-action" data-coverage-open="all">View all nutrients</button><details class="coverage-all"${includeAll ? " open" : ""}>${allSummary}${includeAll ? `<div class="coverage-groups">${groupSummaries}</div>` : ""}</details>${warningText.length ? `<div class="coverage-callouts"><div class="coverage-callout is-watch"><strong>Overlap &amp; safety warnings</strong><span>${warningText.join(" · ")}</span></div></div>` : ""}`;
}

function amountsForWarnings(ids) {
  return { magnesium: selectedSupplementTotal("magnesium") };
}

function mealPreviewIngredients(items) { return escapeHTML(items.slice(0, 2).map((item) => item.name).join(" · ") + (items.length > 2 ? ` · +${items.length - 2} more` : "")); }

function mealMacroSummary(meal) {
  const selected = selectedMealIds.includes(meal.id);
  const { totals } = calculateNutrients(meal.items.map((id) => {
    const item = quickItem(id);
    if (!item) return { item: null, multiplier: 0 };
    const amount = selected ? mealItemAmount(meal.id, id) : itemUsesGrams(item) ? (meal.ingredientGrams?.[id] || item.servingGrams) : (meal.ingredientServings?.[id] || 1);
    return { item, multiplier: itemMultiplier(item, amount) };
  }));
  return `Protein ${formatAmount(totals.protein || 0, "g")} · Carbs ${formatAmount(totals.carbs || 0, "g")} · Fats ${formatAmount(totals.fat || 0, "g")}`;
}

function mealCardHTML(meal, selected = selectedMealIds.includes(meal.id)) {
  const items = meal.items.map((id) => quickItem(id)).filter(Boolean);
  const actions = `<div class="meal-card-actions" role="group" aria-label="${escapeHTML(meal.name)} actions">${iconButton({ iconName: selected ? 'check' : 'add', label: `${selected ? 'Remove' : 'Add'} ${meal.name} ${selected ? 'from' : 'to'} plan`, pressed: selected, tooltip: selected ? 'Remove from plan' : 'Add to plan', data: { 'meal-toggle': meal.id } })}<button type="button" class="planner-card-detail text-button" data-nutrition-detail-open data-detail-type="meal" data-detail-id="${escapeHTML(meal.id)}">View details</button><button type="button" class="text-button" data-meal-edit="${escapeHTML(meal.id)}">Edit meal</button></div>`;
  return `<article class="meal-card ${selected ? "is-selected" : ""}" data-meal-card="${escapeHTML(meal.id)}"><div class="meal-card-body-detail" data-nutrition-detail-open data-detail-type="meal" data-detail-id="${escapeHTML(meal.id)}" role="button" tabindex="0" aria-label="View details for ${escapeHTML(meal.name)}"><div class="meal-card-head"><div><h3>${escapeHTML(meal.name)}</h3><p class="meal-card-meta">${items.length} ingredient${items.length === 1 ? "" : "s"}</p></div>${meal.pinned ? `<span class="planner-card-state">Pinned</span>` : ""}</div><p class="meal-card-description">${escapeHTML(meal.description || "A repeatable meal built from the foods in your library.")}</p><div class="meal-ingredients">${mealPreviewIngredients(items)}</div><p class="meal-macros" data-meal-macros="${escapeHTML(meal.id)}">${mealMacroSummary(meal)}</p></div>${actions}</article>`;
}

function plannerControlsHTML() {
  return `<div class="planner-controls"><div class="planner-mode-tabs" role="tablist" aria-label="Planner input mode" data-segmented-control data-segmented-active="${plannerMode}">
    <button type="button" class="planner-mode-tab ${plannerMode === "meals" ? "active" : ""}" data-planner-mode="meals" role="tab" aria-selected="${plannerMode === "meals"}" tabindex="${plannerMode === "meals" ? "0" : "-1"}" aria-controls="planner-input-panel">Meals <span data-planner-meal-count>${selectedMealIds.length}</span></button>
    <button type="button" class="planner-mode-tab ${plannerMode === "quick-add" ? "active" : ""}" data-planner-mode="quick-add" role="tab" aria-selected="${plannerMode === "quick-add"}" tabindex="${plannerMode === "quick-add" ? "0" : "-1"}" aria-controls="planner-input-panel">Quick add <span data-planner-quick-count>${quickSelectedItemIds.length}</span></button>
    </div>
    <button class="button button-secondary planner-clear" type="button" data-clear-stack>Clear</button>
  </div>`;
}

function portionControlHTML(scope, id, value, visible = true, label = "Portion", attributes = "") {
  return `<div class="portion-control ${visible ? "" : "is-hidden"}" data-portion-control data-portion-scope="${scope}" data-portion-id="${id}" ${attributes} aria-hidden="${visible ? "false" : "true"}"><span>${label}</span><button type="button" data-portion-action="decrease" aria-label="Decrease ${label.toLowerCase()}">${icon('minus')}</button><input type="number" min="0.25" max="20" step="0.25" value="${formatPortion(value)}" data-portion-input aria-label="${label} size"><button type="button" data-portion-action="increase" aria-label="Increase ${label.toLowerCase()}">${icon('add')}</button></div>`;
}

function gramControlHTML(scope, id, item, value, attributes = "") {
  const label = `${item.name} amount in grams`;
  return `<div class="gram-control" data-gram-control data-gram-scope="${scope}" data-gram-id="${escapeHTML(id)}" ${attributes}><label for="gram-${scope}-${escapeHTML(id)}">Amount (g)</label><button type="button" data-gram-action="decrease" aria-label="Decrease ${escapeHTML(item.name)} amount">${icon('minus')}</button><input id="gram-${scope}-${escapeHTML(id)}" type="number" min="1" max="2000" step="1" inputmode="numeric" value="${formatGrams(value, item.servingGrams)}" required data-gram-input aria-label="${escapeHTML(label)}"><span aria-hidden="true">g</span><button type="button" data-gram-action="increase" aria-label="Increase ${escapeHTML(item.name)} amount">${icon('add')}</button><small>Reference: ${escapeHTML(item.serving)}</small></div>`;
}

function itemQuantityControlHTML(scope, id, item, value, attributes = "") {
  return itemUsesGrams(item)
    ? gramControlHTML(scope, id, item, value, attributes)
    : portionControlHTML(scope, id, value, true, "Servings", attributes);
}

function quickItemHTML(item) {
  const selected = quickSelectionForDisplay().includes(item.id);
  const id = escapeHTML(item.id);
  const target = mealComposerMode === 'edit' ? 'meal' : 'plan';
  const toggle = iconButton({ iconName: selected ? 'check' : 'add', label: `${selected ? 'Remove' : 'Add'} ${item.name} ${selected ? 'from' : 'to'} ${target}`, pressed: selected, tooltip: selected ? `Remove from ${target}` : `Add to ${target}`, data: { 'quick-item': item.id } });
  return `<article class="builder-item ${selected ? "selected" : ""}" data-quick-card="${id}"><div class="builder-item-top">${toggle}</div><button type="button" class="planner-card-detail" data-nutrition-detail-open data-detail-type="quick" data-detail-id="${id}"><strong>${escapeHTML(item.name)}</strong><span class="builder-serving">${escapeHTML(item.serving)}</span><small>${escapeHTML(item.note || "")}${item.watch ? " · safety note" : ""}</small><span class="planner-card-detail-label">View details</span></button><div data-quick-amount>${selected ? itemQuantityControlHTML("quick-card", item.id, item, quickItemAmount(item.id)) : ""}</div></article>`;
}

function detailNutrientsHTML(item, amount) {
  const scale = itemMultiplier(item, amount);
  const n = item.nutrients || {};
  const rows = [["Protein", n.protein, "g"], ["Total carbohydrate", n.carbs, "g"], ["Total fat", n.fat, "g"], ...NUTRIENT_TARGETS.filter((target) => target.track !== false && n[target.id] != null && !["protein", "carbs", "fat"].includes(target.id)).map((target) => [target.name, n[target.id], target.unit])]
    .map(([name, value, unit]) => `<div><dt>${escapeHTML(name)}</dt><dd>${formatAmount(Number(value || 0) * scale, unit)}</dd></div>`).join("");
  const heading = itemUsesGrams(item) ? `Nutrition at ${formatGrams(amount, item.servingGrams)} g` : "Nutrition per serving";
  return `<section class="nutrition-detail-section"><h3>${heading}</h3><dl class="nutrition-detail-nutrients">${rows}</dl></section>`;
}

function nutritionDetailShell(kicker, title, description, closeLabel, body) {
  return `<div class="nutrition-detail-form"><div class="ui-modal-head"><div><p class="eyebrow">${kicker}</p><h2 id="nutrition-detail-title">${escapeHTML(title)}</h2></div>${iconButton({ iconName: 'close', label: closeLabel, tooltip: null, data: { 'nutrition-detail-close': '' } })}</div><p id="nutrition-detail-summary">${escapeHTML(description)}</p>${body}</div>`;
}

function mealDetailHTML(meal) {
  const items = meal.items.map((id) => quickItem(id)).filter(Boolean);
  const selected = selectedMealIds.includes(meal.id);
  const id = escapeHTML(meal.id);
  const tags = (meal.tags || []).map((tag) => `<span class="planner-card-tag">${escapeHTML(tag)}</span>`).join("");
  const ingredients = items.map((item) => `<li><strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.quantityMode === "grams" ? `${item.serving} reference` : item.serving)}</span><small>${escapeHTML(item.note || "")}</small>${selected ? itemQuantityControlHTML("meal-item", item.id, item, mealItemAmount(meal.id, item.id), `data-gram-meal-id="${id}" data-portion-meal-id="${id}"`) : ""}</li>`).join("");
  const body = `${tags ? `<div>${tags}</div>` : ""}<section class="nutrition-detail-section"><h3>Ingredients</h3><ul class="nutrition-detail-ingredients">${ingredients || "<li>No ingredients available.</li>"}</ul></section>${selected ? `<p class="nutrition-detail-help">Set the grams for each food; supplements keep their serving unit.</p>` : ""}<div class="ui-modal-actions"><button type="button" class="button button-primary" data-detail-toggle="meal" data-detail-id="${id}">${selected ? "Remove from plan" : "Add to plan"}</button><button type="button" class="button button-secondary" data-meal-pin="${id}">${meal.pinned ? "Unpin meal" : "Pin meal"}</button><button type="button" class="button button-secondary" data-meal-edit="${id}">Edit meal</button><button type="button" class="button button-outline ui-button-danger" data-meal-delete="${id}">Delete meal</button></div>`;
  return nutritionDetailShell("Meal details", meal.name, meal.description || "A repeatable meal built from the foods in your library.", "Close meal details", body);
}

function quickDetailHTML(item) {
  const selected = quickSelectionForDisplay().includes(item.id);
  const target = mealComposerMode === 'edit' ? 'meal' : 'plan';
  const amount = quickItemAmount(item.id);
  const body = `<div class="nutrition-detail-meta"><span>${itemUsesGrams(item) ? "Reference amount" : "Serving"}</span><strong>${escapeHTML(item.serving)}</strong></div>${detailNutrientsHTML(item, amount)}${item.watch ? `<div class="coverage-callout is-watch"><strong>Safety note</strong><span>${escapeHTML(item.watch)}</span></div>` : ""}${selected ? `<section class="nutrition-detail-section"><h3>Adjust amount</h3>${itemQuantityControlHTML("quick", item.id, item, amount)}</section>` : `<p class="nutrition-detail-help">Add it to the plan to adjust the amount.</p>`}<div class="ui-modal-actions"><button type="button" class="button button-primary" data-detail-toggle="quick" data-detail-id="${escapeHTML(item.id)}">${selected ? `Remove from ${target}` : `Add to ${target}`}</button></div>`;
  return nutritionDetailShell("Quick add details", item.name, item.note || "A food or supplement available for quick planning.", "Close food details", body);
}

function refreshNutritionDetail() {
  const dialog = document.querySelector("[data-nutrition-detail-dialog]");
  const content = dialog?.querySelector("[data-nutrition-detail-content]");
  if (!dialog || !content || !nutritionDetailType || !nutritionDetailId) return;
  const detail = nutritionDetailType === "meal"
    ? mealLibrary().find((meal) => meal.id === nutritionDetailId)
    : quickItem(nutritionDetailId);
  if (!detail) return;
  content.innerHTML = nutritionDetailType === "meal" ? mealDetailHTML(detail) : quickDetailHTML(detail);
}

function openNutritionDetail(type, id, returnFocus) {
  const root = document.getElementById("stack-app");
  const dialog = root?.querySelector("[data-nutrition-detail-dialog]");
  if (!dialog) return;
  nutritionDetailType = type;
  nutritionDetailId = id;
  refreshNutritionDetail();
  openModalDialog(dialog, { initialFocus: dialog.querySelector("[data-detail-toggle]") || dialog.querySelector("[data-nutrition-detail-close]"), returnFocus, lightDismiss: true });
}

async function closeNutritionDetail() {
  const dialog = document.querySelector("[data-nutrition-detail-dialog]");
  await closeModalDialog(dialog);
  nutritionDetailType = null;
  nutritionDetailId = null;
}

function toggleMealSelection(id) {
  if (selectedMealIds.includes(id)) {
    selectedMealIds = selectedMealIds.filter((mealId) => mealId !== id);
    delete selectedMealQuantities[id];
    delete selectedMealItemQuantities[id];
    delete selectedMealItemGrams[id];
  } else {
    selectedMealIds = [...selectedMealIds, id];
    selectedMealQuantities[id] = 1;
    selectedMealItemQuantities[id] = {};
    selectedMealItemGrams[id] = {};
    const meal = mealLibrary().find((candidate) => candidate.id === id);
    (meal?.items || []).forEach((itemId) => {
      const item = quickItem(itemId);
      if (itemUsesGrams(item)) selectedMealItemGrams[id][itemId] = meal.ingredientGrams?.[itemId] || item.servingGrams;
      else selectedMealItemQuantities[id][itemId] = meal.ingredientServings?.[itemId] || 1;
    });
  }
}

function toggleQuickSelection(id) {
  if (mealComposerMode === "edit") {
    mealComposerItems = mealComposerItems.includes(id) ? mealComposerItems.filter((itemId) => itemId !== id) : [...mealComposerItems, id];
    return;
  }
  if (quickSelectedItemIds.includes(id)) {
    quickSelectedItemIds = quickSelectedItemIds.filter((itemId) => itemId !== id);
    delete quickItemQuantities[id];
    delete quickItemGrams[id];
  } else {
    quickSelectedItemIds = [...quickSelectedItemIds, id];
    const item = quickItem(id);
    if (itemUsesGrams(item)) quickItemGrams[id] = item.servingGrams;
    else quickItemQuantities[id] = 1;
  }
}

function mealComposerDialogHTML() {
  return `<dialog class="ui-modal meal-save-dialog" data-meal-dialog aria-labelledby="meal-dialog-title" aria-describedby="meal-dialog-help meal-dialog-status"><form class="ui-modal-form meal-save-dialog-form" data-meal-dialog-form><div class="ui-modal-head meal-dialog-head"><div><p class="eyebrow">Reusable meal</p><h2 id="meal-dialog-title">Save selection as a meal</h2></div>${iconButton({ iconName: 'close', label: 'Close', tooltip: 'Close', data: { 'meal-dialog-cancel': '' } })}</div><div class="meal-dialog-body"><label for="meal-dialog-name">Meal name</label><input id="meal-dialog-name" type="text" maxlength="80" placeholder="e.g. Weekday salmon plate" data-meal-dialog-name required><p id="meal-dialog-help" class="meal-dialog-help">Edit ingredients and amounts here. Saving updates this reusable meal and its amounts in today’s plan, if selected.</p><fieldset class="meal-dialog-ingredients"><legend>Ingredients <span data-meal-dialog-count></span></legend><div id="meal-dialog-items" class="meal-dialog-items" data-meal-dialog-items></div><section class="meal-dialog-add"><h3>Add ingredients</h3><label for="meal-dialog-search">Find a food or supplement</label><input id="meal-dialog-search" type="search" placeholder="Search ingredients" data-meal-dialog-search autocomplete="off"><div class="meal-dialog-add-list" data-meal-dialog-add-list></div></section></fieldset><div class="meal-dialog-preview" data-meal-preview></div><details class="meal-editor-options" data-meal-editor-options hidden><summary>More actions</summary><button type="button" class="text-button" data-meal-pin>Pin meal</button><button type="button" class="text-button" data-meal-editor-delete>Delete meal</button><div data-meal-delete-confirm hidden><p>This removes the meal from today’s plan and discards any unsaved edits.</p><button type="button" class="button button-secondary" data-meal-delete-cancel>Keep meal</button><button type="button" class="button button-primary" data-meal-delete-commit>Confirm removal</button></div></details></div><div class="meal-discard" data-meal-discard hidden><p>Discard your unsaved changes?</p><button type="button" class="button button-secondary" data-meal-keep>Keep editing</button><button type="button" class="button button-primary" data-meal-discard-confirm>Discard changes</button></div><div class="ui-modal-actions meal-dialog-actions"><button type="button" class="button button-secondary" data-meal-dialog-cancel>Cancel</button><button type="submit" class="button button-primary" data-meal-dialog-confirm>Save meal</button></div><p id="meal-dialog-status" class="save-status" data-meal-dialog-status role="status"></p></form></dialog>`;
}

function quickAddHTML() {
  const categories = [["all", "All"], ["protein", "Protein"], ["volume", "Volume + fibre"], ["fat", "Healthy fat"], ["functional", "Functional"], ["supplement", "Supplements"]];
  const quickItems = filteredQuickItems();
  const quickItemsCount = quickSelectedItemIds.length;
  const composerAction = `<div class="quick-add-save"><span><strong data-quick-selection-count>${quickItemsCount}</strong> item${quickItemsCount === 1 ? "" : "s"} selected</span><button type="button" class="button button-secondary" data-meal-compose-open ${quickSelectedItemIds.length ? "" : "disabled"}>Save to meals</button></div>`;
  return `<section class="quick-add-panel" id="planner-quick-add" aria-labelledby="quick-add-title"><div class="planner-section-head"><div><p class="eyebrow">Quick add</p><h3 id="quick-add-title">Choose foods and supplements</h3><p>Choose foods, then set their amounts in grams.</p></div></div>${composerAction}<div class="builder-filters" aria-label="Filter quick-add items">${categories.map(([id, label]) => `<button type="button" class="builder-filter ${activeQuickCategory === id ? "active" : ""}" data-quick-category="${id}" aria-pressed="${activeQuickCategory === id}">${label}</button>`).join("")}</div><div class="builder-item-grid planner-card-grid quick-item-grid">${quickItems.length ? quickItems.map(quickItemHTML).join("") : quickSearchEmptyHTML()}</div></section>`;
}

function updateQuickAddUI(root) {
  const selected = quickSelectionForDisplay();
  root.querySelectorAll("[data-quick-item]").forEach((button) => {
    const active = selected.includes(button.dataset.quickItem);
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("is-selected", active);
    const card = button.closest("[data-quick-card]");
    card?.classList.toggle("selected", active);
    const amountSlot = card?.querySelector("[data-quick-amount]");
    if (amountSlot && !amountSlot.contains(document.activeElement)) amountSlot.innerHTML = active ? itemQuantityControlHTML("quick-card", button.dataset.quickItem, quickItem(button.dataset.quickItem), quickItemAmount(button.dataset.quickItem)) : "";
    const target = mealComposerMode === 'edit' ? 'meal' : 'plan';
    button.setAttribute('data-tooltip-trigger', '');
    button.innerHTML = `${icon(active ? 'check' : 'add')}<span class="ui-tooltip" role="tooltip">${active ? `Remove from ${target}` : `Add to ${target}`}</span>`;
    button.setAttribute('aria-label', `${active ? 'Remove' : 'Add'} ${card?.querySelector('strong')?.textContent || 'item'} ${active ? 'from' : 'to'} ${target}`);
  });
  const count = root.querySelector("[data-quick-selection-count]");
  if (count) count.textContent = String(mealComposerMode === "edit" ? selected.length : quickSelectedItemIds.length);
  const save = root.querySelector("[data-meal-compose-open]");
  if (save && mealComposerMode !== "edit") save.disabled = quickSelectedItemIds.length === 0;
}

function renderMealDialogItems(root) {
  const dialog = root?.querySelector('[data-meal-dialog]');
  if (!dialog) return;
  const selectedIds = [...new Set(mealComposerItems)];
  const selected = selectedIds.map(quickItem).filter(Boolean);
  const selectedList = dialog.querySelector('[data-meal-dialog-items]');
  const count = dialog.querySelector('[data-meal-dialog-count]');
  const addList = dialog.querySelector('[data-meal-dialog-add-list]');
  const search = dialog.querySelector('[data-meal-dialog-search]');
  const query = search?.value || mealComposerSearch;
  mealComposerSearch = query;
  if (count) count.textContent = `(${selected.length})`;
  if (selectedList) {
    selectedList.innerHTML = selected.length
      ? `<ul class="meal-dialog-selected-list">${selected.map((item) => `<li><label for="draft-${escapeHTML(item.id)}">${escapeHTML(item.name)}<small>${itemUsesGrams(item) ? " · grams" : " · servings"}</small></label><input id="draft-${escapeHTML(item.id)}" aria-label="${escapeHTML(item.name)} ${itemUsesGrams(item) ? "grams" : "servings"}" type="number" min="${itemUsesGrams(item) ? 1 : .25}" max="${itemUsesGrams(item) ? 2000 : 20}" step="${itemUsesGrams(item) ? 1 : .25}" value="${mealComposerAmounts[item.id] ?? (itemUsesGrams(item) ? item.servingGrams : 1)}" required data-meal-draft-amount="${escapeHTML(item.id)}"><button type="button" class="meal-dialog-remove" data-meal-dialog-remove="${escapeHTML(item.id)}" aria-label="Remove ${escapeHTML(item.name)}">${icon('close')}</button></li>`).join('')}</ul>`
      : '<p class="meal-dialog-empty">No ingredients selected yet. Add at least one to save this meal.</p>';
  }
  updateMealDraftPreview(dialog);
  if (addList) {
    const selectedSet = new Set(selectedIds);
    const matches = query.trim() ? BUILDER_ITEMS.filter((item) => !selectedSet.has(item.id) && matchesPlannerSearch(query, [item.name, item.serving, item.note, item.category])) : [];
    addList.innerHTML = matches.length
      ? matches.map((item) => `<button type="button" class="meal-dialog-add-item" data-meal-dialog-add-item="${escapeHTML(item.id)}"><span>${escapeHTML(item.name)}</span><small>${escapeHTML(item.serving)}</small></button>`).join('')
      : `<p class="meal-dialog-empty">${query.trim() ? 'No matching ingredients.' : 'Search to add another ingredient.'}</p>`;
  }
}

async function openMealComposer(root, returnFocus = document.activeElement) {
  const dialog = root.querySelector("[data-meal-dialog]");
  if (!dialog) return;
  if (!dialog.dataset.modalCleanupBound) {
    dialog.dataset.modalCleanupBound = "true";
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); event.stopImmediatePropagation(); closeMealComposer(root); });
    dialog.addEventListener('close', () => {
      resetMealComposer();
    });
  }
  const sourceMeal = mealLibrary().find((meal) => meal.id === mealComposerMealId);
  mealComposerAmounts = Object.fromEntries(mealComposerItems.map((id) => [id, itemUsesGrams(id) ? (selectedMealItemGrams[mealComposerMealId]?.[id] || sourceMeal?.ingredientGrams?.[id] || quickItemGrams[id] || quickItem(id).servingGrams) : (selectedMealItemQuantities[mealComposerMealId]?.[id] || sourceMeal?.ingredientServings?.[id] || quickItemQuantities[id] || 1)]));
  const options = dialog.querySelector("[data-meal-editor-options]");
  options.hidden = mealComposerMode !== "edit";
  options.open = false;
  options.querySelector("[data-meal-delete-confirm]").hidden = true;
  options.querySelector("[data-meal-pin]").dataset.mealPin = mealComposerMealId || "";
  options.querySelector("[data-meal-pin]").textContent = sourceMeal?.pinned ? "Unpin meal" : "Pin meal";
  options.querySelector("[data-meal-editor-delete]").textContent = sourceMeal?.source === "preset" ? "Remove preset" : "Delete meal";
  const input = dialog.querySelector("[data-meal-dialog-name]");
  dialog.querySelector("[data-meal-dialog-status]").textContent = "";
  dialog.querySelector("#meal-dialog-title").textContent = mealComposerMode === "edit" ? "Save meal changes" : "Save selection as a meal";
  dialog.querySelector("[data-meal-dialog-confirm]").textContent = mealComposerMode === "edit" ? "Save changes" : "Save meal";
  if (input) input.value = mealComposerName;
  mealComposerSearch = "";
  const search = dialog.querySelector('[data-meal-dialog-search]');
  if (search) search.value = '';
  renderMealDialogItems(root);
  mealComposerOriginal = JSON.stringify([mealComposerName, mealComposerItems, mealComposerAmounts]);
  dialog.querySelector("[data-meal-discard]").hidden = true;
  openModalDialog(dialog, { initialFocus: input, returnFocus, lightDismiss: false });
}

function closeMealComposer(root, returnValue = "cancel") {
  const dialog = root.querySelector("[data-meal-dialog]");
  if (returnValue === "cancel" && JSON.stringify([mealComposerName, mealComposerItems, mealComposerAmounts]) !== mealComposerOriginal) {
    dialog.querySelector("[data-meal-discard]").hidden = false;
    dialog.querySelector("[data-meal-keep]").focus();
    return Promise.resolve();
  }
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
  if (!root.querySelector("[data-meal-dialog-form]").reportValidity()) return false;
  const now = new Date().toISOString();
  const saved = getSavedMeals();
  const existing = mealComposerMode === "edit" ? mealLibrary().find((meal) => meal.id === mealComposerMealId) : null;
  const id = existing?.id || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "meal"}-${Date.now()}`;
  const ingredientGrams = Object.fromEntries(items.filter((id) => itemUsesGrams(id)).map((id) => [id, mealComposerAmounts[id] || quickItem(id).servingGrams]));
  const ingredientServings = Object.fromEntries(items.filter((id) => !itemUsesGrams(id)).map((id) => [id, mealComposerAmounts[id] || 1]));
  const meal = { ...existing, id, name, items, ingredientGrams, ingredientServings, createdAt: existing?.createdAt || now, updatedAt: now, tags: existing?.tags || ["saved"] };
  if (existing?.source === "preset" || mealComposerSource === "preset") {
    const state = getMealLibraryState();
    setMealLibraryState({ ...state, overrides: { ...state.overrides, [id]: meal } });
  } else {
    setSavedMeals([meal, ...saved.filter((candidate) => candidate.id !== id)]);
  }
  if (!existing && !selectedMealIds.includes(id)) { selectedMealIds = [...selectedMealIds, id]; selectedMealQuantities[id] = 1; selectedMealItemQuantities[id] = {}; selectedMealItemGrams[id] = {}; const savedMeal = meal.items.map(quickItem).filter(Boolean); savedMeal.forEach((item) => { if (itemUsesGrams(item)) selectedMealItemGrams[id][item.id] = item.servingGrams; else selectedMealItemQuantities[id][item.id] = 1; }); }
  if (selectedMealIds.includes(id)) { selectedMealItemGrams[id] = { ...ingredientGrams }; selectedMealItemQuantities[id] = { ...ingredientServings }; }
  if (!existing) { quickSelectedItemIds = []; quickItemQuantities = {}; quickItemGrams = {}; }
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
  delete selectedMealItemGrams[meal.id];
  persistCurrentDay();
}

function compactCoverageHTML() {
  const summary = coverageSummaryData();
  return `<div class="coverage-compact-content">${macroHTML(dailyTotals())}<div class="coverage-summary-actions"><button type="button" data-coverage-open="gaps">Gaps · ${summary.total - summary.covered}</button><button type="button" data-coverage-open="all">All nutrients</button><button type="button" data-coverage-open="settings">Settings</button><button type="button" class="coverage-compact-open" data-coverage-open="all">Coverage</button></div></div>`;
}

function coverageDockHTML() {
  return `<div class="coverage-slot" data-coverage-slot><span data-coverage-sentinel aria-hidden="true"></span><aside class="coverage-panel coverage-gap-dock plan-readout" id="planner-coverage" aria-label="Coverage and gaps" data-coverage-bar><div data-coverage>${compactCoverageHTML()}</div></aside></div>`;
}

function plannerHTML() {
  const meals = filteredMeals();
  const libraryState = getMealLibraryState();
  const restore = Object.keys(libraryState.overrides).length || libraryState.hidden.length
    ? `<button type="button" class="text-button meal-restore" data-meal-restore>Restore preset meals</button>` : "";
  const mealContent = `<section class="meal-library-section" id="planner-meals" aria-labelledby="meal-library-title"><div class="planner-section-head"><div><p class="eyebrow">Meals</p><h3 id="meal-library-title">Choose a reusable meal</h3></div>${restore}</div><div class="meal-library-grid planner-card-grid">${meals.length ? meals.map((meal) => mealCardHTML(meal)).join("") : mealSearchEmptyHTML()}</div></section>`;
  const plannerContent = plannerMode === "quick-add" ? quickAddHTML() : mealContent;
  const plannerClass = plannerMode === "quick-add" ? "is-quick-add" : "is-meals";
  return `<section class="stack-builder meal-planner ${plannerClass}" aria-labelledby="planner-title">
    <div class="builder-head"><div><p class="eyebrow">Daily Stack</p><h2 id="planner-title">Build a nutrition plan from reusable meals</h2><p>Select meals, set food amounts in grams, then use the nutrient readout to solve meaningful gaps.</p></div></div>
    ${starterExampleActive ? `<div class="starter-example" data-starter-example><div><strong>Starter example loaded</strong><span>Chia protein oatmeal is selected to demonstrate how coverage changes.</span></div><button type="button" class="text-button" data-start-blank>Start blank</button></div>` : ''}
    ${plannerControlsHTML()}
    <div class="planner-search-row">${plannerSearchHTML()}</div>

    <div class="planner-workspace">
      <div class="planner-main" id="planner-input-panel">
        ${plannerContent}
      </div>
    </div>
    ${mealComposerDialogHTML()}
    <dialog id="nutrition-detail-dialog" class="ui-modal nutrition-detail-dialog" data-nutrition-detail-dialog aria-labelledby="nutrition-detail-title" aria-describedby="nutrition-detail-summary"><div data-nutrition-detail-content></div></dialog>
  </section>`;
}

function deepLibraryPageHTML() {
  return `<section class="stack-builder meal-planner is-library" aria-labelledby="deep-library-title"><div class="builder-head"><div><p class="eyebrow">Deep library</p><h2 id="planner-library-title">Evidence-graded protocol details</h2><p>Open a topic only when you want the supporting detail.</p></div></div><div class="planner-main" id="planner-input-panel">${legacyLibraryHTML()}</div></section>`;
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
  } else if (plannerMode === 'quick-add') {
    main.innerHTML = quickAddHTML();
  }
  planner.classList.toggle('is-meals', plannerMode === 'meals');
  planner.classList.toggle('is-quick-add', plannerMode === 'quick-add');
  root.querySelector('[data-segmented-control]')?.setAttribute('data-segmented-active', plannerMode);
  root.querySelectorAll('[data-planner-mode]').forEach((button) => {
    const active = button.dataset.plannerMode === plannerMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.setAttribute('tabindex', active ? '0' : '-1');
  });
  syncNutritionContext(plannerMode);
  updateMealPlannerUI({ customized: false });
}

function updateMealPlannerUI({ customized = true } = {}) {
  const root = document.getElementById("stack-app");
  if (!root) return;
  if(!customized)return;
  if (customized) {
    starterExampleActive = false;
    root.querySelector('[data-starter-example]')?.remove();
  }
  if (!starterExampleActive) persistCurrentDay();
  const coverage = root.querySelector("[data-coverage]");
  if (coverage) coverage.innerHTML = compactCoverageHTML();
  updateQuickAddUI(root);
  root.querySelectorAll("[data-meal-toggle]").forEach((button) => {
    const selected = selectedMealIds.includes(button.dataset.mealToggle);
    const name = button.closest(".meal-card")?.querySelector("h3")?.textContent || "meal";
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${name} ${selected ? "from" : "to"} plan`);
    button.setAttribute('data-tooltip-trigger', '');
    button.innerHTML = `${icon(selected ? 'check' : 'add')}<span class="ui-tooltip" role="tooltip">${selected ? 'Remove from plan' : 'Add to plan'}</span>`;
    const mealCard = button.closest('.meal-card');
    mealCard?.classList.toggle('is-selected', selected);
  });
  root.querySelectorAll("[data-meal-macros]").forEach(node => { const meal = mealLibrary().find(meal => meal.id === node.dataset.mealMacros); if (meal) node.textContent = mealMacroSummary(meal); });
  const plannerMealCount = root.querySelector("[data-planner-meal-count]"); if (plannerMealCount) plannerMealCount.textContent = String(selectedMealIds.length);
  const plannerQuickCount = root.querySelector("[data-planner-quick-count]"); if (plannerQuickCount) plannerQuickCount.textContent = String(quickSelectedItemIds.length);
  const mealCounts = root.querySelector("[data-plan-meals]"); if (mealCounts) mealCounts.textContent = String(selectedMealIds.length);
  const quickCounts = root.querySelector("[data-plan-quick]"); if (quickCounts) quickCounts.textContent = String(quickSelectedItemIds.length);
}

function syncNutritionContext(mode = plannerMode) {
  if (window.location.pathname !== '/pages/stack.html') return;
  const libraryActive = mode === 'library';
  document.querySelectorAll('[data-context-planner-mode]').forEach((link) => {
    const active = link.dataset.contextPlannerMode === (libraryActive ? 'library' : 'meals');
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function setPlannerStatus(_selector, text) { showToast(storageUnavailable ? `${text} for this session only; browser storage is unavailable.` : text, { type: storageUnavailable ? "warning" : "success" }); }

function setGramValue(input) {
  const control = input?.closest('[data-gram-control]');
  const id = control?.dataset.gramId;
  const scope = control?.dataset.gramScope;
  const mealId = control?.dataset.gramMealId;
  const item = quickItem(id);
  if (!control || !id || !item || !itemUsesGrams(item)) return false;
  if (!input.value || !input.validity.valid) { input.setAttribute("aria-invalid", "true"); input.reportValidity(); return false; }
  input.removeAttribute("aria-invalid");
  const value = Number(input.value);
  if (scope === 'meal-item' && mealId) {
    selectedMealItemGrams[mealId] ||= {};
    selectedMealItemGrams[mealId][id] = value;
  } else {
    quickItemGrams[id] = value;
  }
  input.value = String(value);
  updateMealPlannerUI();
  refreshNutritionDetail();
  return true;
}

export function renderStack() {
  const container = document.getElementById("stack-app");
  if (!container) return;
  const content = plannerMode === 'library' ? deepLibraryPageHTML() : plannerHTML();
  cleanupCoveragePin();
  container.innerHTML = `<div class="nutrition-page-layout">${plannerMode === "library" ? "" : coverageDockHTML()}${content}</div>`;
  if (plannerMode !== "library") cleanupCoveragePin = pinCoverage(container);
  container.setAttribute("aria-busy", "false");
  container.dataset.plannerReady = "true";
  if (plannerMode === "library") renderLegacyProtocol();
  syncNutritionContext(plannerMode);
}

async function initStackPage() {
  restoreCurrentDay();
  if (document.getElementById('stack-app')) {
    if (window.location.hash === '#deep-library') plannerMode = 'library';
    if (plannerMode === 'library') await ensureStackLibraryData();
    renderStack();
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStackPage, { once: true });
else initStackPage();

document.addEventListener('click', async (event) => {
  const root = document.getElementById('stack-app');
  if (!root) return;

  if (event.target.closest("[data-meal-editor-delete]")) { root.querySelector("[data-meal-delete-confirm]").hidden = false; root.querySelector("[data-meal-delete-cancel]").focus(); return; }
  if (event.target.closest("[data-meal-delete-cancel]")) { root.querySelector("[data-meal-delete-confirm]").hidden = true; return; }
  if (event.target.closest("[data-meal-delete-commit]")) {
    const meal = mealLibrary().find(meal => meal.id === mealComposerMealId);
    if (meal) deleteMeal(meal);
    await closeMealComposer(root, "deleted");
    renderStack();
    document.getElementById("meal-library-title")?.focus();
    setPlannerStatus("", "Meal removed");
    return;
  }
  if (event.target.closest("[data-meal-keep]")) { root.querySelector("[data-meal-discard]").hidden = true; root.querySelector("[data-meal-dialog-name]").focus(); return; }
  if (event.target.closest("[data-meal-discard-confirm]")) { await closeMealComposer(root, "discard"); return; }

  const contextMode = event.target.closest('[data-context-planner-mode]');
  if (contextMode && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0 && window.location.pathname === '/pages/stack.html') {
    event.preventDefault();
    const nextMode = contextMode.dataset.contextPlannerMode === 'library' ? 'library' : 'meals';
    plannerMode = nextMode;
    plannerSearchQuery = '';
    if (nextMode === 'library') window.history.pushState(null, '', '#deep-library');
    else window.history.pushState(null, '', window.location.pathname + window.location.search);
    if (nextMode === 'library') await ensureStackLibraryData();
    renderStack();
    requestAnimationFrame(() => document.getElementById(nextMode === 'library' ? 'planner-library' : 'planner-title')?.scrollIntoView({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    return;
  }

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

  const action = event.target.closest('[data-coverage-open],[data-coverage-dialog-close]');
  if (action?.hasAttribute('data-coverage-dialog-close')) { await closeModalDialog(root.querySelector('[data-coverage-dialog]')); return; }
  if (action) {
    import("./components/coverage-dialog.js").then(({ open }) => open({ root, trigger: action, bodyWeightKg, returnFocus: action, renderAll: () => coverageHTMLV2('coverage-modal', true) }));
    return;
  }

  const detailTrigger = event.target.closest('[data-nutrition-detail-open]');
  if (detailTrigger) {
      openNutritionDetail(detailTrigger.dataset.detailType, detailTrigger.dataset.detailId, detailTrigger);
    return;
  }

  const detailClose = event.target.closest('[data-nutrition-detail-close]');
  if (detailClose) {
    await closeNutritionDetail();
    return;
  }

  const detailToggle = event.target.closest('[data-detail-toggle]');
  if (detailToggle) {
    if (detailToggle.dataset.detailToggle === 'meal') toggleMealSelection(detailToggle.dataset.detailId);
    else toggleQuickSelection(detailToggle.dataset.detailId);
    updateMealPlannerUI();
    refreshNutritionDetail();
    return;
  }

  const quick = event.target.closest('[data-quick-item]');
  if (quick) {
    const id = quick.dataset.quickItem;
    toggleQuickSelection(id);
    if (mealComposerMode === "edit") { updateQuickAddUI(root); return; }
    updateMealPlannerUI();
    return;
  }

  const gramAction = event.target.closest('[data-gram-action]');
  if (gramAction) {
    const control = gramAction.closest('[data-gram-control]');
    const id = control?.dataset.gramId;
    const scope = control?.dataset.gramScope;
    const mealId = control?.dataset.gramMealId;
    const item = quickItem(id);
    if (!item || !id) return;
    const delta = gramAction.dataset.gramAction === 'increase' ? 5 : -5;
    if (scope === 'meal-item' && mealId) {
      selectedMealItemGrams[mealId] ||= {};
      selectedMealItemGrams[mealId][id] = normalizeGrams(mealItemAmount(mealId, id) + delta, item.servingGrams);
      updateMealPlannerUI();
      refreshNutritionDetail();
      return;
    }
    quickItemGrams[id] = normalizeGrams(quickItemAmount(id) + delta, item.servingGrams);
    updateMealPlannerUI();
    refreshNutritionDetail();
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
        const input = control?.querySelector('[data-portion-input]');
        if (input) input.value = formatPortion(selectedMealItemQuantities[mealId][id]);
      }
      return;
    }
    const quantities = scope === "meal" ? selectedMealQuantities : quickItemQuantities;
    if (id && quantities) {
      quantities[id] = normalizePortion(normalizePortion(quantities[id]) + increment);
      updateMealPlannerUI();
      const input = control?.querySelector('[data-portion-input]');
      if (input) input.value = formatPortion(quantities[id]);
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
    toggleMealSelection(mealToggle.dataset.mealToggle);
    updateMealPlannerUI();
    return;
  }

  const mealRemove = event.target.closest('[data-meal-remove]');
  if (mealRemove) { toggleMealSelection(mealRemove.dataset.mealRemove); updateMealPlannerUI(); return; }

  const mealComposeOpen = event.target.closest('[data-meal-compose-open]');
  if (mealComposeOpen) {
    if (mealComposerMode !== "edit") {
      mealComposerMode = "create";
      mealComposerMealId = null;
      mealComposerSource = "saved";
      mealComposerItems = [...quickSelectedItemIds];
      mealComposerName = "";
    }
    await openMealComposer(root, mealComposeOpen);
    return;
  }

  const mealDialogRemove = event.target.closest('[data-meal-dialog-remove]');
  if (mealDialogRemove) {
    mealComposerItems = mealComposerItems.filter((id) => id !== mealDialogRemove.dataset.mealDialogRemove);
    renderMealDialogItems(root);
    return;
  }

  const mealDialogAdd = event.target.closest('[data-meal-dialog-add-item]');
  if (mealDialogAdd) {
    const id = mealDialogAdd.dataset.mealDialogAddItem;
    if (id && !mealComposerItems.includes(id)) mealComposerItems = [...mealComposerItems, id];
    renderMealDialogItems(root);
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
    if (mealPin.closest('[data-meal-dialog]')) { mealPin.textContent = pinned ? 'Unpin meal' : 'Pin meal'; return; }
    if (mealPin.closest('[data-nutrition-detail-dialog]')) {
      renderPlannerSearchResults(root);
      refreshNutritionDetail();
      root.querySelector(`[data-nutrition-detail-dialog] [data-meal-pin="${id}"]`)?.focus();
      return;
    }
    renderStack();
    root.querySelector(`[data-meal-pin="${id}"]`)?.focus();
    return;
  }

  const mealEdit = event.target.closest('[data-meal-edit]');
  if (mealEdit) {
    const meal = mealLibrary().find((candidate) => candidate.id === mealEdit.dataset.mealEdit);
    if (meal) {
      const returnFocus = root.querySelector(`[data-meal-card="${CSS.escape(meal.id)}"] [data-nutrition-detail-open]`) || mealEdit;
      mealComposerMode = "edit";
      mealComposerMealId = meal.id;
      mealComposerSource = meal.source;
      mealComposerItems = [...meal.items];
      mealComposerName = meal.name;
      if (mealEdit.closest('[data-nutrition-detail-dialog]')) await closeNutritionDetail();
      await openMealComposer(root, returnFocus);
    }
    return;
  }

  const mealDelete = event.target.closest('[data-meal-delete]');
  if (mealDelete) {
    const meal = mealLibrary().find((candidate) => candidate.id === mealDelete.dataset.mealDelete);
    if (meal) {
      const detailReturnFocus = mealDelete.closest('[data-nutrition-detail-dialog]')
        ? root.querySelector(`[data-meal-card="${CSS.escape(meal.id)}"] [data-nutrition-detail-open]`)
        : mealDelete;
      if (mealDelete.closest('[data-nutrition-detail-dialog]')) await closeNutritionDetail();
      const items = meal.items.map(quickItem).filter(Boolean).map((item) => item.name);
      const selected = selectedMealIds.includes(meal.id);
          const confirmed = await confirmAction({
        title: `${meal.source === 'preset' ? 'Remove' : 'Delete'} “${meal.name}”?`,
        summary: meal.source === 'preset'
          ? 'This preset will be hidden and any edits to it will be reset. You can restore it later.'
          : 'This permanently removes the meal from your saved meals.',
        details: `${items.length} ingredient${items.length === 1 ? '' : 's'}: ${items.join(' · ')}${selected ? ' · It will also be removed from today’s plan.' : ''}`,
        confirmLabel: meal.source === 'preset' ? 'Remove preset' : 'Delete meal',
        returnFocus: detailReturnFocus || mealDelete,
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
    selectedMealItemGrams = {};
    quickItemQuantities = {};
    quickItemGrams = {};
    updateMealPlannerUI();
    setPlannerStatus('[data-planner-status]', 'Started a blank plan');
    return;
  }

  const clearPlan = event.target.closest('[data-clear-stack]');
  if (clearPlan) {
    if (!selectedMealIds.length && !quickSelectedItemIds.length) return;
      const confirmed = await confirmAction({ title: 'Clear today’s plan?', summary: 'This removes every selected meal and Quick Add item from today. Saved meals are not deleted.', confirmLabel: 'Clear', returnFocus: clearPlan });
    if (!confirmed) return;
    const clearTop = clearPlan.getBoundingClientRect().top;
    selectedMealIds = []; quickSelectedItemIds = []; selectedMealQuantities = {}; selectedMealItemQuantities = {}; selectedMealItemGrams = {}; quickItemQuantities = {}; quickItemGrams = {}; resetMealComposer(); updateMealPlannerUI();
    const nextClearTop = clearPlan.getBoundingClientRect().top;
    if (nextClearTop !== clearTop) window.scrollBy({ top: nextClearTop - clearTop, left: 0, behavior: 'instant' });
    setPlannerStatus('[data-planner-status]', 'Today’s plan cleared');
    return;
  }
});

document.addEventListener('input', (event) => {
  const gramInput = event.target.closest('[data-gram-input]');
  if (gramInput && document.getElementById('stack-app')) {
    const control = gramInput.closest('[data-gram-control]');
    const item = quickItem(control?.dataset.gramId);
    const next = Number(gramInput.value);
    if (item && gramInput.value && gramInput.validity.valid && Number.isFinite(next)) {
      if (control.dataset.gramScope === 'meal-item' && control.dataset.gramMealId) {
        selectedMealItemGrams[control.dataset.gramMealId] ||= {};
        selectedMealItemGrams[control.dataset.gramMealId][control.dataset.gramId] = Math.min(2000, Math.max(1, Math.round(next)));
      } else {
        quickItemGrams[control.dataset.gramId] = Math.min(2000, Math.max(1, Math.round(next)));
      }
      updateMealPlannerUI();
      refreshNutritionDetail();
    }
    return;
  }
  const plannerSearch = event.target.closest('[data-planner-search]');
  if (plannerSearch && document.getElementById('stack-app')) {
    plannerSearchQuery = plannerSearch.value;
    renderPlannerSearchResults(document.getElementById('stack-app'));
    return;
  }
  const mealDialogSearch = event.target.closest('[data-meal-dialog-search]');
  if (mealDialogSearch && document.getElementById('stack-app')) {
    mealComposerSearch = mealDialogSearch.value;
    renderMealDialogItems(document.getElementById('stack-app'));
    return;
  }
  const mealName = event.target.closest('[data-meal-dialog-name]');
  if (mealName && document.getElementById('stack-app')) { mealComposerName = mealName.value; return; }
  const weight = event.target.closest('[data-body-weight]');
  if (!weight || !document.getElementById('stack-app')) return;
  const next = Number(weight.value);
  if (Number.isFinite(next) && next >= 35 && next <= 250) { bodyWeightKg = next; updateMealPlannerUI(); }
});

document.addEventListener('change', (event) => {
  const gramInput = event.target.closest('[data-gram-input]');
  if (gramInput && document.getElementById('stack-app')) {
    setGramValue(gramInput);
    return;
  }
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
  if (option && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    const options = [...option.closest('[data-segmented-control]').querySelectorAll('[data-planner-mode]')];
    let index = options.indexOf(option);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = options.length - 1;
    else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    event.preventDefault();
    options[index].focus();
    options[index].click();
    return;
  }

  const detail = event.target.closest('[data-nutrition-detail-open][role="button"]');
  if (!detail || !['Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  openNutritionDetail(detail.dataset.detailType, detail.dataset.detailId, detail);
});

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-meal-dialog-form]');
  const root = document.getElementById('stack-app');
  if (!form || !root) return;
  event.preventDefault();
  await saveMealComposer(root);
});

function updateMealDraftPreview(dialog) {
  const { totals } = calculateNutrients(mealComposerItems.map((id) => {
    const item = quickItem(id);
    return { item, multiplier: itemMultiplier(item, mealComposerAmounts[id] ?? (itemUsesGrams(item) ? item.servingGrams : 1)) };
  }));
  const preview = dialog?.querySelector("[data-meal-preview]");
  if (preview) preview.textContent = `Meal total · Protein ${formatAmount(totals.protein || 0, "g")} · Carbs ${formatAmount(totals.carbs || 0, "g")} · Fats ${formatAmount(totals.fat || 0, "g")}`;
}
document.addEventListener("input", (event) => {
  const id = event.target.dataset.mealDraftAmount;
  if (!id || !event.target.validity.valid || !event.target.value) return;
  mealComposerAmounts[id] = Number(event.target.value);
  updateMealDraftPreview(event.target.closest("dialog"));
});
window.addEventListener("popstate", async () => {
  if (!document.getElementById("stack-app")) return;
  plannerMode = location.hash === "#deep-library" ? "library" : "meals";
  if (plannerMode === "library") await ensureStackLibraryData();
  renderStack();
});

function writeNutritionStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    storageUnavailable = false;
    return true;
  } catch {
    if (!storageUnavailable) showToast("Changes are available for this session only. Browser storage is unavailable.", { type: "warning" });
    storageUnavailable = true;
    return false;
  }
}
