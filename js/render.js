function renderBiomarkers() {
  const grid = document.getElementById("biomarker-grid");
  if (!grid) return;

  const riskOrder = { high: 0, moderate: 1, low: 2 };
  const catOrder = [
    "Blood Sugar & Metabolic",
    "Inflammation",
    "Lipids & Cardiovascular",
    "Cardiovascular Health",
    "Hormones",
    "Physical Function",
    "Body Composition",
    "Metabolic Health",
    "Organ Health",
    "Cardiovascular & Cognitive",
    "Micronutrients",
  ];

  const cats = [...new Set(BIOMARKERS.map(b => b.category))];
  cats.sort((a, b) => catOrder.indexOf(a) - catOrder.indexOf(b));

  grid.innerHTML = cats.map(cat => {
    const items = BIOMARKERS.filter(b => b.category === cat);
    items.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
    return `
      <div class="biomarker-group">
        <h2 class="biomarker-group-title">${items[0].icon} ${cat}</h2>
        ${items.map(b => `
          <article class="biomarker-card" id="${b.id}">
            <div class="biomarker-header">
              <span class="biomarker-icon">${b.icon}</span>
              <div class="biomarker-title-group">
                <h3 class="biomarker-name">${b.name}</h3>
              </div>
              <span class="biomarker-risk biomarker-risk-${b.riskLevel}">${b.riskLevel}</span>
            </div>
            <p class="biomarker-desc">${b.description}</p>
            <div class="biomarker-ranges">
              <div class="range-item">
                <span class="range-label">Optimal Range</span>
                <span class="range-value">${b.optimalRange}</span>
              </div>
              <div class="range-item">
                <span class="range-label">Optimal Level</span>
                <span class="range-value range-optimal">${b.optimalLevel}</span>
              </div>
            </div>
            <div class="biomarker-importance">
              <h4>Why It Matters</h4>
              <p>${b.importance}</p>
            </div>
            <div class="biomarker-how-to">
              <h4>How to Improve</h4>
              <ul class="checklist">
                ${b.howToImprove.map(t => `<li>${t}</li>`).join("")}
              </ul>
            </div>
            ${b.budgetTips && b.budgetTips.length ? `
            <div class="biomarker-budget">
              <h4>💡 Budget Tips</h4>
              <ul class="checklist checklist-budget">
                ${b.budgetTips.map(t => `<li>${t}</li>`).join("")}
              </ul>
            </div>` : ""}
          </article>
        `).join("")}
      </div>`;
  }).join("");
}

let foodTab = "breakfast";

function renderFoods() {
  const container = document.getElementById("food-app");
  if (!container) return;

  function pantryHTML() {
    return `<div class="pantry-grid">
      ${PANTRY.map(p => `
        <div class="pantry-card">
          <h3 class="pantry-name">${p.name}</h3>
          <p class="pantry-desc">${p.description}</p>
          <div class="pantry-detail"><strong>💰 FairPrice:</strong> ${p.fairPrice}</div>
          <div class="pantry-detail"><strong>🎯 Benefit:</strong> ${p.benefit}</div>
          <div class="pantry-detail"><strong>💡 Use:</strong> ${p.servingTip}</div>
        </div>
      `).join("")}
    </div>`;
  }

  function foodListHTML(list) {
    return `
      <div class="foodlist-header">
        <h3>${list.name}</h3>
        <p class="foodlist-desc">${list.description}</p>
      </div>
      <table class="foodlist-table">
        <thead>
          <tr><th>Food</th><th>Why It Helps</th><th>Targets</th></tr>
        </thead>
        <tbody>
          ${list.foods.map(f => `
            <tr>
              <td><strong>${f.name}</strong></td>
              <td>${f.why}</td>
              <td>${f.biomarkers.map(b => `<a href="/biomarkers.html#${b}" class="tag tag-biomarker">${b}</a>`).join(" ")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  }

  function renderFoodContent(tab) {
    switch (tab) {
      case "pantry": return pantryHTML();
      case "foodlists": return FOOD_LISTS.map(list => foodListHTML(list)).join("<hr class='foodlist-divider'>");
      case "marinade": return `<div class="marinade-grid">
        ${MARINADES.map(m => `
          <div class="marinade-card" id="mar-${m.id}">
            <h3 class="marinade-name">${m.name}</h3>
            <p class="marinade-pairs"><strong>Pairs with:</strong> ${m.pairsWith}</p>
            <details class="meal-details">
              <summary>Recipe</summary>
              <ul class="checklist">
                ${m.ingredients.map(i => `<li>${i}</li>`).join("")}
              </ul>
              <p class="marinade-instruct">${m.instructions}</p>
              <p class="marinade-storage">📦 ${m.storageTip}</p>
            </details>
            <span class="marinade-time">${m.prepTime}</span>
          </div>
        `).join("")}
      </div>`;
      default: {
        const items = MEALS.filter(m => m.category === tab);
        return `
          <p class="meal-count">${items.length} meals · ${items.reduce((s, m) => s + (m.variations ? m.variations.length : 0), 0)}+ variations</p>
          <div class="meal-grid">${mealHTML(items)}</div>`;
      }
    }
  }

  function mealHTML(items) {
    return items.map(m => {
      const hasMethods = m.methods && m.methods.length > 1;
      const method = hasMethods ? m.methods[0] : null;
      return `
      <article class="meal-card" id="${m.id}">
        <div class="meal-card-top">
          <h3 class="meal-name">${m.name}</h3>
          <span class="meal-time">${m.prepTime} · ${method ? method.cookTime : m.cookTime}</span>
        </div>
        <p class="meal-desc">${m.description}</p>
        <div class="meal-meta">
          <span>💰 ${method ? method.costPerServing : m.costPerServing}</span>
          <span>🥩 ${m.protein}</span>
          <span>🔥 ${m.calories}</span>
        </div>
        ${hasMethods ? `
        <div class="method-selector">
          ${m.methods.map((mt, i) =>
            `<button class="method-btn ${i === 0 ? "active" : ""}" onclick="selectMethod('${m.id}', ${i})">${mt.name}</button>`
          ).join("")}
        </div>` : ""}
        ${hasMethods ? m.methods.map((mt, i) => `
        <div class="method-content${i === 0 ? "" : " hidden"}" data-method="${m.id}-${i}">
          <div class="meal-section">
            <h5>Ingredients</h5>
            <ul class="checklist">
              ${m.ingredients.map(i => `<li>${i}</li>`).join("")}
            </ul>
          </div>
          <div class="meal-section">
            <h5>Instructions</h5>
            <ol class="meal-steps">
              ${mt.instructions.map(s => `<li>${s}</li>`).join("")}
            </ol>
          </div>
          ${mt.supplementPairing ? `
          <div class="meal-supplement">
            <h5>💊 Supplement Pairing</h5>
            <p>${mt.supplementPairing}</p>
          </div>` : ""}
        </div>`).join("") : `
        <details class="meal-details">
          <summary>Ingredients & Instructions</summary>
          <div class="meal-section">
            <h5>Ingredients</h5>
            <ul class="checklist">
              ${m.ingredients.map(i => `<li>${i}</li>`).join("")}
            </ul>
          </div>
          <div class="meal-section">
            <h5>Instructions</h5>
            <ol class="meal-steps">
              ${m.instructions.map(s => `<li>${s}</li>`).join("")}
            </ol>
          </div>
        </details>
        ${m.supplementPairing ? `
        <div class="meal-supplement">
          <h5>💊 Supplement Pairing</h5>
          <p>${m.supplementPairing}</p>
        </div>` : ""}`}
        ${m.variations && m.variations.length ? `
        <details class="meal-details">
          <summary>Variations (${m.variations.length})</summary>
          <ul class="checklist">
            ${m.variations.map(v => `<li>${v}</li>`).join("")}
          </ul>
        </details>` : ""}
        ${m.biomarkers && m.biomarkers.length ? `
        <div class="meal-targets">
          <h5>Targets</h5>
          <div class="tag-group">
            ${m.biomarkers.map(b => `<a href="/biomarkers.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}
          </div>
        </div>` : ""}
      </article>`;
    }).join("");
  }

  let html = `
    <div class="meal-controls">
      <div class="meal-tabs">
        ${MEAL_CATEGORIES.map(c =>
          `<button class="meal-tab ${foodTab === c ? "active" : ""}" onclick="selectMealTab('${c}')">${MEAL_LABELS[c]} (${MEALS.filter(m => m.category === c).length})</button>`
        ).join("")}
        <button class="meal-tab meal-tab-marinade ${foodTab === "marinade" ? "active" : ""}" onclick="selectMealTab('marinade')">🧂 Marinades & Sauces (${MARINADES.length})</button>
        <button class="meal-tab ${foodTab === "pantry" ? "active" : ""}" onclick="selectMealTab('pantry')">📦 Pantry (${PANTRY.length})</button>
        <button class="meal-tab ${foodTab === "foodlists" ? "active" : ""}" onclick="selectMealTab('foodlists')">📊 Food Lists (3)</button>
      </div>
      ${["breakfast", "lunch", "dinner", "marinade"].includes(foodTab) ? `<button class="meal-surprise" onclick="surpriseMe()">🎲 Surprise Me</button>` : ""}
    </div>

    ${renderFoodContent(foodTab)}`;

  container.innerHTML = html;
}

function surpriseMe() {
  const validTabs = ["breakfast", "lunch", "dinner", "marinade"];
  if (!validTabs.includes(foodTab)) return;

  let pick;
  if (foodTab === "marinade") {
    pick = MARINADES[Math.floor(Math.random() * MARINADES.length)];
    const el = document.getElementById("mar-" + pick.id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-flash");
      setTimeout(() => el.classList.remove("highlight-flash"), 2500);
    }
    return;
  }

  const all = MEALS.filter(m => m.category === foodTab);
  if (!all.length) return;
  pick = all[Math.floor(Math.random() * all.length)];
  const el = document.getElementById(pick.id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight-flash");
    setTimeout(() => el.classList.remove("highlight-flash"), 2500);
  }
}

function selectMealTab(tab) {
  foodTab = tab;
  renderFoods();
}

function selectMethod(mealId, idx) {
  const card = document.getElementById(mealId);
  if (!card) return;

  const btns = card.querySelectorAll(".method-btn");
  btns.forEach((b, i) => b.classList.toggle("active", i === idx));

  const contents = card.querySelectorAll(".method-content");
  contents.forEach((c, i) => c.classList.toggle("hidden", i !== idx));

  const firstContent = contents[idx];
  if (firstContent) {
    const supp = firstContent.querySelector(".meal-supplement p");
    const time = firstContent.closest(".meal-card")?.querySelector(".meal-time");
    const cost = firstContent.closest(".meal-card")?.querySelector(".meal-meta span:first-child");
  }
}

let selectedDiet = "carnivore";
let selectedTier = "critical";

function effectiveTier(s, diet) {
  return (s.dietTier && s.dietTier[diet]) || s.tier;
}

function filteredSupplements(diet, tier) {
  const tierIndex = TIER_ORDER.indexOf(tier);
  const includedTiers = TIER_ORDER.slice(0, tierIndex + 1);
  return SUPPLEMENTS.filter(s =>
    s.diets.includes(diet) && includedTiers.includes(effectiveTier(s, diet))
  );
}

function renderSupplements() {
  const container = document.getElementById("supplement-app");
  if (!container) return;

  const filtered = filteredSupplements(selectedDiet, selectedTier);

  const totalCost = filtered.reduce((sum, s) => {
    return sum + parseFloat(s.costPerMonth.replace("SGD ", ""));
  }, 0);

  const timingOrder = ["am", "pm"];
  const timingLabels = {
    am: "☀️ AM — with breakfast",
    pm: "🌙 PM — with dinner or before bed",
  };
  const timingAdvice = {
    am: "Set aside your AM pill box after breakfast. Keep on the kitchen counter as a visual cue.",
    pm: "Fill your PM pill box each morning alongside your AM box. Pair with toothbrushing as a trigger.",
  };

  const grouped = {};
  for (const t of timingOrder) {
    grouped[t] = filtered.filter(s => s.timing === t);
  }

  const pillCountAm = grouped.am ? grouped.am.reduce((sum, s) => {
    if (s.id === "creatine") return sum;
    if (s.id === "nac") return sum + 1;
    return sum + 1;
  }, 0) : 0;
  const pillCountPm = grouped.pm ? grouped.pm.reduce((sum, s) => {
    if (s.id === "omega-3") return sum + 3;
    if (s.id === "magnesium") return sum + 3;
    return sum + 1;
  }, 0) : 0;

  let html = `
    <div class="supp-controls">
      <div class="supp-selector-group">
        <label class="supp-label">Diet</label>
        <div class="supp-toggle">
          ${["carnivore", "omnivore", "vegetarian"].map(d =>
            `<button class="supp-btn ${selectedDiet === d ? "active" : ""}" onclick="selectDiet('${d}')">${DIET_LABELS[d]}</button>`
          ).join("")}
        </div>
      </div>
      <div class="supp-selector-group">
        <label class="supp-label">Stack</label>
        <div class="supp-toggle">
          ${TIER_ORDER.map(t =>
            `<button class="supp-btn ${selectedTier === t ? "active" : ""}" onclick="selectTier('${t}')">${TIER_LABELS[t]}</button>`
          ).join("")}
        </div>
      </div>
    </div>

    <div class="supp-stack-summary">
      <div class="supp-tier-info">
        <h3 class="supp-tier-name">${TIER_LABELS[selectedTier]}</h3>
        <p class="supp-tier-desc">${TIER_DESCRIPTIONS[selectedTier]}</p>
      </div>
      <div class="supp-cost-card">
        <span class="supp-cost-label">Monthly Total</span>
        <span class="supp-cost-value">SGD ${totalCost.toFixed(0)}</span>
        <span class="supp-cost-note">Budget-friendly brands</span>
      </div>
    </div>

    <div class="supp-count">
      ${filtered.length} supplements · ${filtered.length > 0 ? `AM: ~${pillCountAm} pills${grouped.am ? "" : " —"} · PM: ~${pillCountPm} pills` : ""} · fits a 2-box system
    </div>

    <p class="supp-price-disclaimer">${PRICE_DISCLAIMER}</p>
  `;

  for (const t of timingOrder) {
    const items = grouped[t];
    if (!items.length) continue;

    html += `
      <div class="supp-timing-block">
        <div class="supp-timing-header">
          <h3 class="supp-timing-label">${timingLabels[t]}</h3>
          <span class="supp-timing-count">${items.length} supplement${items.length > 1 ? "s" : ""}</span>
        </div>
        <p class="supp-timing-advice">💡 ${timingAdvice[t]}</p>
        <div class="supp-timing-grid">
          ${items.map(s => `
            <div class="supp-item" id="supp-${s.id}">
              <div class="supp-item-top">
                <h4 class="supp-item-name">${s.name}</h4>
                <span class="supp-item-tier supp-tier-${effectiveTier(s, selectedDiet)}">${effectiveTier(s, selectedDiet)}</span>
                <span class="supp-item-cost">${s.costPerMonth}/mo</span>
              </div>
              <p class="supp-item-desc">${s.description}</p>
              <div class="supp-item-detail">
                <strong>Dosage:</strong> ${s.dosage}
              </div>
              <div class="supp-item-detail">
                <strong>When:</strong> ${s.timingDetail}
              </div>
              <div class="supp-item-section">
                <h5>💊 Product & Pricing</h5>
                <p class="supp-product-text">${s.product}</p>
                <p class="supp-cost-serving">${s.costPerServing}</p>
              </div>
              <div class="supp-item-section">
                <h5>🎯 Why You Need It</h5>
                <p class="supp-why-text">${s.whyGeneral}</p>
              </div>
              <div class="supp-item-section">
                <h5>${selectedDiet === "carnivore" ? "🥩" : selectedDiet === "vegetarian" ? "🥬" : "🍽️"} Why ${DIET_LABELS_PLAIN[selectedDiet]} Need It</h5>
                <p class="supp-diet-why-text">${s.whyDiet[selectedDiet]}</p>
              </div>
              <div class="supp-item-section">
                <h5>Benefits</h5>
                <ul class="checklist">
                  ${s.benefits.map(b => `<li>${b}</li>`).join("")}
                </ul>
              </div>
              <div class="supp-item-section">
                <h5>⚠️ Conflict Check</h5>
                <p class="supp-conflicts-text">${s.conflicts}</p>
              </div>
              ${s.biomarkers && s.biomarkers.length ? `
              <div class="supp-item-section">
                <h5>Targets</h5>
                <div class="tag-group">
                  ${s.biomarkers.map(b => `<a href="/biomarkers.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}
                </div>
              </div>` : ""}
            </div>
          `).join("")}
        </div>
      </div>`;
  }

  container.innerHTML = html;
}

function selectDiet(diet) {
  selectedDiet = diet;
  renderSupplements();
}

function selectTier(tier) {
  selectedTier = tier;
  renderSupplements();
}
