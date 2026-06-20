function renderBiomarkers() {
  const grid = document.getElementById("biomarker-grid");
  if (!grid) return;

  grid.innerHTML = BIOMARKERS.map(b => `
    <article class="biomarker-card" id="${b.id}">
      <div class="biomarker-header">
        <span class="biomarker-icon">${b.icon}</span>
        <div class="biomarker-title-group">
          <h2 class="biomarker-name">${b.name}</h2>
          <span class="biomarker-category">${b.category}</span>
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
  `).join("");
}

function renderFoods() {
  const container = document.getElementById("food-container");
  if (!container) return;

  let html = "";
  for (const cat of FOOD_CATEGORIES) {
    const items = FOODS.filter(f => f.category === cat);
    if (!items.length) continue;

    html += `<div class="food-category">`;
    html += `<h2 class="category-title">${cat}</h2>`;
    html += `<div class="food-grid">`;

    for (const f of items) {
      html += `
        <article class="food-card" id="${f.id}">
          <div class="food-card-header">
            <h3 class="food-name">${f.name}</h3>
            <span class="food-meta">${f.prepTime}</span>
          </div>
          <p class="food-desc">${f.description}</p>
          <div class="food-benefits">
            <h4>Why It Helps</h4>
            <ul class="checklist">
              ${f.benefits.map(b => `<li>${b}</li>`).join("")}
            </ul>
          </div>
          <div class="food-cook">
            <h4>Cooking Instructions</h4>
            <ul class="checklist checklist-cook">
              ${f.howToCook.map(c => `<li>${c}</li>`).join("")}
            </ul>
            <p class="food-method"><strong>Method:</strong> ${f.cookMethod}</p>
            <p class="food-method"><strong>Servings:</strong> ${f.servingSize}</p>
          </div>
          ${f.recipe ? `
          <div class="food-recipe">
            <h4>📖 Recipe</h4>
            <pre class="recipe-text">${f.recipe}</pre>
          </div>` : ""}
          ${f.budgetTips && f.budgetTips.length ? `
          <div class="food-budget">
            <h4>💰 Budget Tips</h4>
            <ul class="checklist checklist-budget">
              ${f.budgetTips.map(t => `<li>${t}</li>`).join("")}
            </ul>
          </div>` : ""}
          ${f.biomarkers && f.biomarkers.length ? `
          <div class="food-targets">
            <h4>Targets</h4>
            <div class="tag-group">
              ${f.biomarkers.map(b => `<a href="/biomarkers.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}
            </div>
          </div>` : ""}
        </article>`;
    }

    html += `</div></div>`;
  }

  container.innerHTML = html;
}

function renderSupplements() {
  const grid = document.getElementById("supplement-grid");
  if (!grid) return;

  grid.innerHTML = SUPPLEMENTS.map(s => `
    <article class="supplement-card" id="${s.id}">
      <div class="supplement-header">
        <div>
          <h2 class="supplement-name">${s.name}</h2>
          <p class="supplement-desc">${s.description}</p>
        </div>
      </div>
      <div class="supplement-detail-grid">
        <div class="supplement-detail">
          <span class="detail-label">Dosage</span>
          <span class="detail-value">${s.dosage}</span>
        </div>
        <div class="supplement-detail">
          <span class="detail-label">Timing</span>
          <span class="detail-value">${s.timing}</span>
        </div>
      </div>
      <div class="supplement-benefits">
        <h4>Benefits</h4>
        <ul class="checklist">
          ${s.benefits.map(b => `<li>${b}</li>`).join("")}
        </ul>
      </div>
      <div class="supplement-budget">
        <h4>💰 Budget Options</h4>
        <ul class="checklist checklist-budget">
          ${s.budgetOptions.map(o => `<li>${o}</li>`).join("")}
        </ul>
      </div>
      ${s.biomarkers && s.biomarkers.length ? `
      <div class="supplement-targets">
        <h4>Targets</h4>
        <div class="tag-group">
          ${s.biomarkers.map(b => `<a href="/biomarkers.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}
        </div>
      </div>` : ""}
      ${s.notes ? `
      <div class="supplement-notes">
        <h4>Notes</h4>
        <p>${s.notes}</p>
      </div>` : ""}
    </article>
  `).join("");
}
