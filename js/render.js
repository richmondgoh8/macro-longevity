import { BIOMARKERS, VACCINES, SUPPLEMENTS } from './data/health.js';
import { MEAL_CATEGORIES, MEAL_LABELS, FASTING_PROTOCOLS, FASTING_GROUPS, FASTING_GROUP_ORDER, TIER_ORDER, TIER_LABELS, TIER_DESCRIPTIONS, DIET_LABELS, DIET_LABELS_PLAIN, PRICE_DISCLAIMER, SUGAR_OFFSET_TIPS, RECIPE_CATEGORIES, RECIPE_LABELS } from './data/common.js';
import { MEALS, MARINADES, PANTRY, FOOD_LISTS, AVOID_LIST } from './data/food.js';
import { RECIPES } from './data/recipes.js';
import { EXERCISES } from './data/workout.js';
import { INVESTMENTS } from './data/finance.js';
import { CardSwipe } from './components/card-swipe.js';

function safeRender(fn, container, fallback) {
  try { fn(); }
  catch (err) {
    console.error('Render error:', err);
    if (container) {
      container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--color-text-secondary)">
        <p style="font-size:18px;margin-bottom:8px">Something went wrong.</p>
        <p style="font-size:14px;color:var(--color-text-muted)">${fallback || 'Please refresh the page.'}</p>
      </div>`;
    }
  }
}

let healthTab = "biomarkers";

function selectHealthTab(tab) {
  healthTab = tab;
  renderHealth();
}

const healthTabCache = {};

function renderHealth() {
  const container = document.getElementById("health-app");
  if (!container) return;

  const healthTabs = ["biomarkers", "fasting", "vaccinations", "supplements", "damage-control"];
  const tabLabels = {
    biomarkers: "🔬 Biomarkers",
    fasting: "⏳ Fasting",
    vaccinations: "💉 Vaccinations",
    supplements: "💊 Supplements",
    "damage-control": "⚡ Damage Control",
  };

  const tabs = `
    <div class="meal-tabs">
      ${healthTabs.map(t =>
        `<button class="meal-tab ${healthTab === t ? "active" : ""}" onclick="selectHealthTab('${t}')">${tabLabels[t]}</button>`
      ).join("")}
      <select class="meal-tab-select" onchange="selectHealthTab(this.value)">
        ${healthTabs.map(t =>
          `<option value="${t}" ${healthTab === t ? "selected" : ""}>${tabLabels[t].replace(/^[^\s]+\s/, "")}</option>`
        ).join("")}
      </select>
    </div>`;

  if (!container.querySelector('.meal-tabs')) {
    container.innerHTML = tabs + '<div class="health-content"></div>';
  } else {
    container.querySelectorAll('.meal-tab').forEach((btn, i) => {
      btn.classList.toggle('active', healthTabs[i] === healthTab);
    });
    container.querySelector('.meal-tab-select').value = healthTab;
  }

  const contentEl = container.querySelector('.health-content');

  if (!healthTabCache[healthTab]) {
    if (healthTab === "biomarkers") {
      const bioGrid = document.createElement("div");
      bioGrid.id = "biomarker-grid";
      contentEl.innerHTML = '';
      contentEl.appendChild(bioGrid);
      renderBiomarkers("biomarker-grid");
      healthTabCache[healthTab] = contentEl.innerHTML;
    } else if (healthTab === "fasting") {
      const fastGrid = document.createElement("div");
      fastGrid.id = "fasting-grid";
      contentEl.innerHTML = '';
      contentEl.appendChild(fastGrid);
      renderFasting("fasting-grid");
      healthTabCache[healthTab] = contentEl.innerHTML;
    } else if (healthTab === "vaccinations") {
      const vacGrid = document.createElement("div");
      vacGrid.id = "vaccine-grid";
      contentEl.innerHTML = '';
      contentEl.appendChild(vacGrid);
      renderVaccines("vaccine-grid");
      healthTabCache[healthTab] = contentEl.innerHTML;
    } else if (healthTab === "supplements") {
      contentEl.innerHTML = '<div id="supplement-app"></div>';
      renderSupplements("supplement-app");
      healthTabCache[healthTab] = contentEl.innerHTML;
    } else {
      contentEl.innerHTML = renderDamageControl();
      healthTabCache[healthTab] = contentEl.innerHTML;
    }
  } else {
    contentEl.innerHTML = healthTabCache[healthTab];
  }

  if (healthTab !== "supplements") {
    window.scrollTo(0, 0);
  }
}

function biomarkerCardFace(b) {
  return `
    <div class="biomarker-header">
      <span class="biomarker-icon">${b.icon}</span>
      <div class="biomarker-title-group">
        <span style="font-size:11px;color:var(--color-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${b.category}</span>
        <h3 class="biomarker-name">${b.name}</h3>
      </div>
      <span class="biomarker-risk biomarker-risk-${b.riskLevel}">${b.riskLevel}</span>
    </div>
    <p class="biomarker-desc" style="font-size:14px;line-height:1.6;margin-bottom:12px;">${b.description}</p>
    <div class="biomarker-ranges" style="margin-bottom:0;">
      <div class="range-item">
        <span class="range-label">Optimal Range</span>
        <span class="range-value">${b.optimalRange}</span>
      </div>
      <div class="range-item">
        <span class="range-label">Optimal Level</span>
        <span class="range-value range-optimal">${b.optimalLevel}</span>
      </div>
    </div>
  `;
}

function biomarkerCardDetail(b) {
  return `
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
  `;
}

function renderBiomarkers(targetId) {
  const grid = document.getElementById(targetId || "biomarker-grid");
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

  // Desktop grid
  const desktopHTML = cats.map(cat => {
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

  // Mobile swipe: flatten all biomarkers into one swipe, sorted by category then risk
  const allSorted = [];
  cats.forEach(cat => {
    const items = BIOMARKERS.filter(b => b.category === cat);
    items.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
    allSorted.push(...items);
  });

  const swipeSlides = allSorted.map(b => `
    <div class="card-face">${biomarkerCardFace(b)}</div>
    <button class="card-swipe-expand-btn" aria-expanded="false">Show Details</button>
    <div class="card-detail">${biomarkerCardDetail(b)}</div>
  `);

  grid.innerHTML = `
    <div class="biomarker-grid">${desktopHTML}</div>
    <div id="biomarker-swipe-wrap"></div>
  `;

  if (typeof CardSwipe !== 'undefined') {
    CardSwipe.init('biomarker-swipe-wrap', swipeSlides, {
      onSlideChange: (idx) => {}
    });
  }
}

function fastingCardFace(p) {
  return `
    <div class="fasting-header">
      <span class="fasting-icon" style="font-size:32px;">${p.icon}</span>
      <div>
        <h3 class="fasting-name" style="font-size:20px;margin-bottom:2px;">${p.name}</h3>
        <span class="fasting-meta">${p.duration} · ${p.difficulty}</span>
      </div>
    </div>
    <p class="fasting-desc" style="font-size:14px;line-height:1.6;margin-bottom:12px;">${p.description}</p>
    ${p.biomarkers && p.biomarkers.length ? `
    <div style="margin-top:auto;">
      <span style="font-size:12px;color:var(--color-text-muted);font-weight:600;">Improves ${p.biomarkers.length} biomarker${p.biomarkers.length > 1 ? 's' : ''}</span>
      <div class="tag-group" style="margin-top:6px;">${p.biomarkers.slice(0, 4).map(b => `<span class="tag tag-biomarker">${b}</span>`).join(' ')}${p.biomarkers.length > 4 ? ' ...' : ''}</div>
    </div>` : ""}
  `;
}

function fastingCardDetail(p) {
  return `
    <div class="biomarker-importance">
      <h4>🔬 What Happens in the Body</h4>
      <ul class="checklist">${p.whatHappens.map(h => `<li>${h}</li>`).join("")}</ul>
    </div>
    <div class="biomarker-importance">
      <h4>🚪 How to Enter the Fast</h4>
      <ul class="checklist">${p.howToEnter.map(h => `<li>${h}</li>`).join("")}</ul>
    </div>
    <div class="biomarker-importance">
      <h4>💧 What to Do During the Fast</h4>
      <ul class="checklist">${p.duringFast.map(d => `<li>${d}</li>`).join("")}</ul>
    </div>
    <div class="biomarker-importance">
      <h4>🍽️ How to Break the Fast</h4>
      <ul class="checklist">${p.howToBreak.map(h => `<li>${h}</li>`).join("")}</ul>
    </div>
    <div class="biomarker-importance">
      <h4>💡 Tips</h4>
      <ul class="checklist">${p.tips.map(t => `<li>${t}</li>`).join("")}</ul>
    </div>
    ${p.biomarkers && p.biomarkers.length ? `
    <div class="meal-targets" style="margin-top:12px">
      <h5>Biomarkers Improved</h5>
      <div class="tag-group">${p.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}</div>
    </div>` : ""}
  `;
}

function renderFasting(targetId) {
  const grid = document.getElementById(targetId || "fasting-grid");
  if (!grid) return;

  function renderProtocolCard(p) {
    return `
      <article class="fasting-card" id="fast-${p.id}">
        <div class="fasting-header">
          <span class="fasting-icon">${p.icon}</span>
          <div>
            <h3 class="fasting-name">${p.name}</h3>
            <span class="fasting-meta">${p.duration} · ${p.difficulty}</span>
          </div>
        </div>
        <p class="fasting-desc">${p.description}</p>
        <details class="meal-details"><summary>🔬 What Happens in the Body</summary>
          <ul class="checklist">${p.whatHappens.map(h => `<li>${h}</li>`).join("")}</ul>
        </details>
        <details class="meal-details"><summary>🚪 How to Enter the Fast</summary>
          <ul class="checklist">${p.howToEnter.map(h => `<li>${h}</li>`).join("")}</ul>
        </details>
        <details class="meal-details"><summary>💧 What to Do During the Fast</summary>
          <ul class="checklist">${p.duringFast.map(d => `<li>${d}</li>`).join("")}</ul>
        </details>
        <details class="meal-details"><summary>🍽️ How to Break the Fast</summary>
          <ul class="checklist">${p.howToBreak.map(h => `<li>${h}</li>`).join("")}</ul>
        </details>
        <details class="meal-details"><summary>💡 Tips</summary>
          <ul class="checklist">${p.tips.map(t => `<li>${t}</li>`).join("")}</ul>
        </details>
        ${p.biomarkers && p.biomarkers.length ? `
        <div class="meal-targets" style="margin-top:12px"><h5>Biomarkers Improved</h5>
          <div class="tag-group">${p.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}</div>
        </div>` : ""}
      </article>`;
  }

  function renderGroup(groupKey) {
    const label = FASTING_GROUPS[groupKey];
    const protocols = FASTING_PROTOCOLS.filter(p => p.group === groupKey);
    if (!protocols.length) return "";
    return `
      <div class="fasting-group">
        <h3 class="fasting-group-title">${label}</h3>
        <div class="fasting-grid">
          ${protocols.map(renderProtocolCard).join("")}
        </div>
      </div>`;
  }

  const desktopHTML = `
    <div class="fasting-intro">
      <h3>Choose Your Fasting Protocol</h3>
      <p>Fasting triggers autophagy, improves insulin sensitivity, reduces inflammation, and activates cellular repair pathways. Start where you're comfortable and progress slowly. Always listen to your body.</p>
    </div>
    ${FASTING_GROUP_ORDER.map(renderGroup).join("")}`;

  const swipeSlides = FASTING_GROUP_ORDER.flatMap(groupKey => {
    const label = FASTING_GROUPS[groupKey];
    const protocols = FASTING_PROTOCOLS.filter(p => p.group === groupKey);
    const groupHeader = `<div class="fasting-swipe-group-header"><h3>${label}</h3></div>`;
    const protocolSlides = protocols.map(p => `
      <div class="card-face">${fastingCardFace(p)}</div>
      <button class="card-swipe-expand-btn" aria-expanded="false">Show Details</button>
      <div class="card-detail">${fastingCardDetail(p)}</div>
    `);
    return [groupHeader, ...protocolSlides];
  });

  grid.innerHTML = `
    <div class="fasting-desktop">${desktopHTML}</div>
    <div class="fasting-mobile-intro" style="display:none;">
      <div class="page-header" style="padding:32px 24px 24px;">
        <div class="section-inner">
          <h1 class="page-title" style="font-size:28px;">Fasting Protocols</h1>
          <p class="page-desc" style="font-size:14px;">Trigger autophagy, improve insulin sensitivity, and activate cellular repair.</p>
        </div>
      </div>
    </div>
    <div id="fasting-swipe-wrap"></div>
  `;

  if (typeof CardSwipe !== 'undefined' && swipeSlides.length > 0) {
    CardSwipe.init('fasting-swipe-wrap', swipeSlides);
  }
}

function renderVaccines(targetId) {
  const grid = document.getElementById(targetId || "vaccine-grid");
  if (!grid) return;

  const groups = [
    { key: "one-time", label: "🛡️ One-Time", desc: "Take once (usually a short series), then protected for years or life." },
    { key: "periodic", label: "🔄 Periodic", desc: "Requires a booster every few years to maintain protection." },
    { key: "annual", label: "📆 Annual", desc: "Needed every year — strains change or immunity wanes." },
  ];

  function scheduleLabel(s) {
    if (s.includes("every 10")) return s + " (meaning: one dose now, next dose 10 years later)";
    if (s.includes("every year")) return s;
    if (s.includes("Annually")) return s;
    if (s.includes("3 doses:")) return s + " — first dose today, second in 2 months, third in 6 months";
    if (s.includes("2 doses:")) return s + " — first dose today, second 2–6 months later";
    if (s.includes("Single dose")) return s + " (one dose only, no follow-up needed)";
    return s;
  }

  const vaccineCard = (v) => `
    <article class="vaccine-card" id="vac-${v.id}">
      <div class="vaccine-header">
        <h2 class="vaccine-name">${v.name}</h2>
        <span class="tag tag-schedule tag-schedule-${v.scheduleType}">${v.scheduleType}</span>
      </div>
      <p class="vaccine-desc">${v.description}</p>
      <div class="vaccine-detail"><strong>👤 Who needs it:</strong> ${v.whoNeedsIt}</div>
      <div class="vaccine-detail"><strong>📅 Schedule:</strong> ${scheduleLabel(v.schedule)}</div>
      <div class="vaccine-detail"><strong>✅ Efficacy:</strong> ${v.efficacy}</div>
      <div class="vaccine-detail vaccine-cost"><strong>💰 Cost in Singapore:</strong> ${v.costSGD}</div>
      <details class="meal-details">
        <summary>🎯 Why It Matters for Longevity</summary>
        <p class="vaccine-body-text">${v.longevityBenefit}</p>
      </details>
      <details class="meal-details">
        <summary>⚠️ Side Effects</summary>
        <p class="vaccine-body-text">${v.sideEffects}</p>
      </details>
    </article>`;

  function vaccineCardFace(v) {
    return `
      <div class="vaccine-header" style="margin-bottom:10px;">
        <h2 class="vaccine-name" style="font-size:20px;">${v.name}</h2>
        <span class="tag tag-schedule tag-schedule-${v.scheduleType}">${v.scheduleType}</span>
      </div>
      <p class="vaccine-desc" style="font-size:14px;line-height:1.6;margin-bottom:12px;">${v.description}</p>
      <div class="vaccine-detail" style="font-size:13px;margin-bottom:6px;"><strong>👤</strong> ${v.whoNeedsIt}</div>
      <div class="vaccine-detail" style="font-size:13px;margin-bottom:6px;"><strong>📅</strong> ${scheduleLabel(v.schedule)}</div>
      <div class="vaccine-detail" style="font-size:13px;margin-bottom:6px;"><strong>✅</strong> ${v.efficacy}</div>
      <div class="vaccine-detail vaccine-cost" style="font-size:13px;margin-bottom:0;"><strong>💰</strong> ${v.costSGD}</div>
    `;
  }

  function vaccineCardDetail(v) {
    return `
      <div class="biomarker-importance">
        <h4>🎯 Why It Matters for Longevity</h4>
        <p class="vaccine-body-text">${v.longevityBenefit}</p>
      </div>
      <div class="biomarker-importance">
        <h4>⚠️ Side Effects</h4>
        <p class="vaccine-body-text">${v.sideEffects}</p>
      </div>
    `;
  }

  const intro = `<div class="page-header">
    <div class="section-inner">
      <h1 class="page-title">Essential Vaccinations for Longevity</h1>
      <p class="page-desc">Vaccinations prevent infectious diseases that accelerate biological aging, trigger chronic inflammation, and reduce quality of life. These are the most important vaccines for adults in Singapore.</p>
    </div>
  </div>`;

  const body = groups.map(g => {
    const items = VACCINES.filter(v => v.scheduleType === g.key);
    if (!items.length) return "";
    return `<div class="vaccine-group">
      <h2 class="vaccine-group-title">${g.label}</h2>
      <p class="vaccine-group-desc">${g.desc}</p>
      <div class="vaccine-grid" style="margin-top:12px">${items.map(vaccineCard).join("")}</div>
    </div>`;
  }).join("");

  const desktopHTML = intro + `<div class="section"><div class="section-inner">${body}</div></div>`;

  // Mobile swipe: flatten all vaccines into one list
  const allVaccines = groups.flatMap(g => VACCINES.filter(v => v.scheduleType === g.key));
  const swipeSlides = allVaccines.map(v => `
    <div class="card-face">${vaccineCardFace(v)}</div>
    <button class="card-swipe-expand-btn" aria-expanded="false">Show Details</button>
    <div class="card-detail">${vaccineCardDetail(v)}</div>
  `);

  grid.innerHTML = `
    <div class="vaccine-desktop">${desktopHTML}</div>
    <div class="vaccine-mobile-intro" style="display:none;">
      <div class="page-header" style="padding:32px 24px 24px;">
        <div class="section-inner">
          <h1 class="page-title" style="font-size:28px;">Essential Vaccinations</h1>
          <p class="page-desc" style="font-size:14px;">Prevent infectious diseases that accelerate biological aging.</p>
        </div>
      </div>
    </div>
    <div id="vaccine-swipe-wrap"></div>
  `;

  if (typeof CardSwipe !== 'undefined' && swipeSlides.length > 0) {
    CardSwipe.init('vaccine-swipe-wrap', swipeSlides);
  }
}

let budgetInvestments = 0;

function renderInvestments() {
  return `<div class="page-header">
    <div class="section-inner">
      <h1 class="page-title">Investment Combos (Singapore Edition)</h1>
      <p class="page-desc">Pre-built portfolio combos based on r/singaporefi wisdom. Each combo shows how different instruments work together, why they synergize, and exactly how to execute. Pick the one that matches your goal and risk tolerance.</p>
    </div>
  </div>
  <div class="section">
    <div class="section-inner invest-combo-grid">
      <p class="invest-disclaimer">Not financial advice. Information sourced from MAS, CPF Board, r/singaporefi, and HardwareZone for educational purposes. Consult a licensed adviser.</p>

      <div class="budget-tool" id="budgetTool">
        <h3 class="budget-title">💵 Your Budget at a Glance</h3>
        <p class="budget-desc">Enter your monthly take-home salary. The 50/30/20 rule splits it into Expenses, Investments, and Savings. Drag the sliders to adjust.</p>
        <div class="budget-input-row">
          <div class="budget-field">
            <label>Monthly Take-Home Salary</label>
            <input type="number" id="budgetSalary" value="" min="0" step="500" placeholder="e.g. 5000" data-budget-input>
          </div>
        </div>
        <div id="budgetResults"></div>
        <div class="budget-sliders" id="budgetSliders" style="display:none">
          <div class="budget-slider-row">
            <div class="budget-slider-label">
              <span class="budget-slider-name" style="color:#2563eb;font-weight:700">Expenses</span>
              <span class="budget-slider-name" style="color:#2563eb;font-weight:700">Investments</span>
              <span class="budget-slider-name" style="color:var(--color-text-muted)">Savings</span>
            </div>
          </div>
          <div class="budget-slider-row">
            <label>Expenses <span id="budgetPctExpenses">50</span>%</label>
            <input type="range" id="sliderExpenses" min="0" max="100" value="50" data-budget-input>
            <span class="budget-slider-val" id="budgetValExpenses">SGD 0</span>
          </div>
          <div class="budget-slider-row">
            <label>Investments <span id="budgetPctInvestments">30</span>%</label>
            <input type="range" id="sliderInvestments" min="0" max="100" value="30" data-budget-input>
            <span class="budget-slider-val" id="budgetValInvestments">SGD 0</span>
          </div>
          <p class="budget-slider-hint">Savings auto-calculates as the remainder. Total always sums to 100%.</p>
        </div>
      </div>

      ${INVESTMENTS.map(c => `
        <article class="invest-card" id="inv-${c.id}">
          <div class="invest-card-top">
            <span class="invest-icon">${c.icon}</span>
            <div>
              <h2 class="invest-name">${c.name}</h2>
              <span class="invest-goal">${c.goal}</span>
            </div>
          </div>
          <div class="invest-meta-bar">
            <span>📈 ${c.totalReturn}</span>
            <span>⚠️ ${c.riskLevel}</span>
          </div>
          <div class="invest-table ${budgetInvestments > 0 ? '' : 'invest-table-hide-mo'}">
            <div class="invest-table-header"><span>Asset</span><span>Allocation</span><span>Monthly</span><span>Why</span></div>
            ${c.portfolio.map(a => {
              const pct = parseFloat(a.pct);
              const monthly = budgetInvestments > 0 && pct ? 'SGD ' + Math.round(budgetInvestments * pct / 100).toLocaleString() + '/mo' : '';
              return `
              <div class="invest-table-row">
                <span class="invest-asset">${a.asset}</span>
                <span class="invest-pct">${a.pct}</span>
                <span class="invest-monthly">${monthly}</span>
                <span class="invest-why">${a.why}</span>
              </div>`;
            }).join("")}
          </div>
          <details class="meal-details">
            <summary>🧩 Why These Work Together</summary>
            <p class="invest-body-text">${c.synergy}</p>
          </details>
          <details class="meal-details">
            <summary>📋 Step-by-Step Execution</summary>
            <p class="invest-body-text">${c.howToExecute}</p>
          </details>
          <details class="meal-details">
            <summary>💡 Tips from r/singaporefi</summary>
            <ul class="checklist">
              ${c.tips.map(t => `<li>${t}</li>`).join("")}
            </ul>
          </details>
        </article>
      `).join("")}
    </div>
  </div>`;
}
document.addEventListener('input', function(e) {
    if (e.target.closest('[data-budget-input]')) updateBudget();
});

function updateBudget() {
  const salary = parseFloat(document.getElementById('budgetSalary').value) || 0;
  const results = document.getElementById('budgetResults');
  const sliders = document.getElementById('budgetSliders');

  if (salary <= 0) {
    results.innerHTML = '';
    sliders.style.display = 'none';
    if (budgetInvestments > 0) {
      budgetInvestments = 0;
      document.querySelectorAll('.invest-table').forEach(t => t.classList.add('invest-table-hide-mo'));
    }
    return;
  }
  sliders.style.display = 'block';

  let vE = parseFloat(document.getElementById('sliderExpenses').value);
  let vI = parseFloat(document.getElementById('sliderInvestments').value);
  let vS = Math.max(0, 100 - vE - vI);

  if (vE + vI > 100) {
    const active = document.activeElement;
    if (active && active.id === 'sliderExpenses') {
      vE = 100 - vI;
    } else {
      vI = 100 - vE;
    }
    vS = 0;
    document.getElementById('sliderExpenses').value = vE;
    document.getElementById('sliderInvestments').value = vI;
  }

  const prevInvestments = budgetInvestments;
  budgetInvestments = Math.round(salary * vI / 100);

  document.getElementById('budgetPctExpenses').textContent = vE;
  document.getElementById('budgetPctInvestments').textContent = vI;

  document.getElementById('budgetValExpenses').textContent = 'SGD ' + Math.round(salary * vE / 100).toLocaleString();
  document.getElementById('budgetValInvestments').textContent = 'SGD ' + budgetInvestments.toLocaleString();

  results.innerHTML = `
    <div class="budget-breakdown">
      <div class="budget-card" style="background:#f0f6ff">
        <div class="budget-card-label" style="color:#2563eb">Expenses</div>
        <div class="budget-card-amt" style="color:#2563eb">SGD ${Math.round(salary * vE / 100).toLocaleString()}</div>
        <div class="budget-card-pct" style="color:#2563eb">${vE}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">Housing, food, transport, bills, insurance</div>
      </div>
      <div class="budget-card" style="background:#e8f5e9">
        <div class="budget-card-label" style="color:#2e7d32">Investments</div>
        <div class="budget-card-amt" style="color:#2e7d32">SGD ${budgetInvestments.toLocaleString()}</div>
        <div class="budget-card-pct" style="color:#2e7d32">${vI}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">Stocks, ETFs, CPF top-ups, robos</div>
      </div>
      <div class="budget-card" style="background:#fef3e7">
        <div class="budget-card-label" style="color:#e8993a">Savings</div>
        <div class="budget-card-amt" style="color:#e8993a">SGD ${Math.round(salary * vS / 100).toLocaleString()}</div>
        <div class="budget-card-pct" style="color:#e8993a">${vS}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">High-yield savings account (UOB One / OCBC 360)</div>
      </div>
    </div>
  `;

  document.querySelectorAll('.invest-table').forEach(t => {
    if (budgetInvestments > 0) {
      t.classList.remove('invest-table-hide-mo');
    } else if (prevInvestments > 0) {
      t.classList.add('invest-table-hide-mo');
    }
  });

  document.querySelectorAll('.invest-table-row').forEach(row => {
    const cells = row.querySelectorAll('span');
    if (cells.length >= 3) {
      const pctText = cells[1].textContent;
      const pct = parseFloat(pctText);
      cells[2].textContent = budgetInvestments > 0 && pct ? 'SGD ' + Math.round(budgetInvestments * pct / 100).toLocaleString() + '/mo' : '';
    }
  });
}

function renderDamageControl() {
  return `<div class="dc-section">
    <h3 class="dc-section-title">🍬 Too Much Sugar</h3>
    <p class="dc-desc">Your body can handle an occasional glucose spike. These interventions help clear it faster and reduce metabolic damage. Pick what's available to you now:</p>
    <div class="dc-tip-list">
      ${SUGAR_OFFSET_TIPS.map(t => `
        <div class="dc-tip-card">
          <div class="dc-tip-action">${t.action}</div>
          <div class="dc-tip-why">${t.why}</div>
          <div class="dc-tip-timing">⏰ ${t.timing}</div>
        </div>
      `).join("")}
    </div>
  </div>`;
}

let foodTab = "breakfast";
const foodTabCache = {};

function renderFoods() {
  const container = document.getElementById("food-app");
  if (!container) return;

  const foodTabsHTML = `
    <div class="meal-controls">
      <div class="meal-tabs">
        ${MEAL_CATEGORIES.map(c =>
          `<button class="meal-tab ${foodTab === c ? "active" : ""}" onclick="selectMealTab('${c}')">${MEAL_LABELS[c]} (${MEALS.filter(m => m.category === c).length})</button>`
        ).join("")}
        <button class="meal-tab meal-tab-marinade ${foodTab === "marinade" ? "active" : ""}" onclick="selectMealTab('marinade')">🧂 Marinades & Sauces (${MARINADES.length})</button>
        <button class="meal-tab ${foodTab === "pantry" ? "active" : ""}" onclick="selectMealTab('pantry')">📦 Pantry (${PANTRY.length})</button>
        <button class="meal-tab ${foodTab === "foodlists" ? "active" : ""}" onclick="selectMealTab('foodlists')">📊 Food Lists (3)</button>
        <button class="meal-tab ${foodTab === "avoid" ? "active" : ""}" onclick="selectMealTab('avoid')">🚫 Avoid (${AVOID_LIST.length})</button>
        <button class="meal-tab ${foodTab === "recipes" ? "active" : ""}" onclick="selectMealTab('recipes')">🌐 Recipes (${RECIPES.length})</button>
      </div>
      <select class="meal-tab-select" onchange="selectMealTab(this.value)">
        ${MEAL_CATEGORIES.map(c =>
          `<option value="${c}" ${foodTab === c ? "selected" : ""}>${MEAL_LABELS[c]} (${MEALS.filter(m => m.category === c).length})</option>`
        ).join("")}
        <option value="marinade" ${foodTab === "marinade" ? "selected" : ""}>🧂 Marinades & Sauces (${MARINADES.length})</option>
        <option value="pantry" ${foodTab === "pantry" ? "selected" : ""}>📦 Pantry (${PANTRY.length})</option>
        <option value="foodlists" ${foodTab === "foodlists" ? "selected" : ""}>📊 Food Lists (3)</option>
        <option value="avoid" ${foodTab === "avoid" ? "selected" : ""}>🚫 Avoid (${AVOID_LIST.length})</option>
        <option value="recipes" ${foodTab === "recipes" ? "selected" : ""}>🌐 Recipes (${RECIPES.length})</option>
      </select>
      ${["breakfast", "lunch", "marinade", "recipes"].includes(foodTab) ? `<button class="meal-surprise" onclick="surpriseMe()">🎲 Surprise Me</button>` : ""}
    </div>`;

  if (!container.querySelector('.meal-controls')) {
    container.innerHTML = foodTabsHTML + '<div class="food-content"></div>';
  } else {
    container.querySelectorAll('.meal-tab').forEach(btn => {
      const tabName = btn.getAttribute('onclick')?.match(/selectMealTab\('([^']+)'\)/)?.[1];
      if (tabName) btn.classList.toggle('active', tabName === foodTab);
    });
    container.querySelector('.meal-tab-select').value = foodTab;
  }

  const contentEl = container.querySelector('.food-content');
  if (!foodTabCache[foodTab]) {
    foodTabCache[foodTab] = renderFoodContent(foodTab);
  }
  contentEl.innerHTML = foodTabCache[foodTab];
}

function pantryHTML() {
  return `<div class="pantry-grid">
    ${PANTRY.map(p => `
      <div class="pantry-card">
        <h3 class="pantry-name">${p.name}${p.daily ? `<span class="daily-badge">Daily</span>` : ""}</h3>
        <p class="pantry-desc">${p.description}</p>
        <div class="pantry-detail"><strong>💰 FairPrice:</strong> ${p.fairPrice}</div>
        <div class="pantry-detail"><strong>🎯 Benefit:</strong> ${p.benefit}</div>
        <div class="pantry-detail"><strong>💡 Use:</strong> ${p.servingTip}</div>
      </div>
    `).join("")}
  </div>`;
}

function foodListHTML(list) {
    const hasFiber = list.id === "fiber-rich";
    const hasPotassium = list.id === "potassium-rich";
    const extraCol = hasFiber ? { label: "Fiber", val: f => f.fiberG + "g" }
                  : hasPotassium ? { label: "Potassium", val: f => f.potassiumMg + " mg" }
                  : null;

    const dailyNote = hasFiber ? `<p class="foodlist-note">Daily target: <strong>25-30g</strong> (women) · <strong>30-38g</strong> (men)</p>`
                   : hasPotassium ? `<p class="foodlist-note">Daily target: <strong>2,600mg</strong> (women) · <strong>3,400mg</strong> (men)</p>`
                   : "";

    return `
      <div class="foodlist-header">
        <h3>${list.name}</h3>
        <p class="foodlist-desc">${list.description}</p>
        ${dailyNote}
      </div>
      <table class="foodlist-table">
        <thead>
          <tr><th>Food</th>${extraCol ? `<th class="foodlist-num">${extraCol.label}</th>` : ""}<th>Why It Helps</th><th>Targets</th></tr>
        </thead>
        <tbody>
          ${list.foods.map(f => `
            <tr>
              <td><strong>${f.name}</strong></td>
              ${extraCol ? `<td class="foodlist-num">${extraCol.val(f)}</td>` : ""}
              <td>${f.why}</td>
              <td>${f.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join(" ")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  }

  function avoidHTML() {
    return AVOID_LIST.map(cat => `
      <div class="avoid-card">
        <h3 class="avoid-name">${cat.name}</h3>
        <p class="avoid-desc">${cat.description}</p>
        ${cat.items.map(item => `
          <div class="avoid-item">
            <div class="avoid-item-header">
              <strong class="avoid-item-name">${item.item}</strong>
              <span class="avoid-watch">🕵️ ${item.watchFor}</span>
            </div>
            <p class="avoid-why">❌ ${item.why}</p>
            <p class="avoid-instead">✅ Instead: ${item.instead}</p>
          </div>
        `).join("")}
      </div>
    `).join("");
  }

  function recipeTabHTML() {
    const tagClass = tag => `recipe-tag recipe-tag--${tag}`;
    return RECIPE_CATEGORIES.map(cat => {
      const items = RECIPES.filter(r => r.category === cat);
      if (!items.length) return "";
      return `
        <div class="meal-group">
          <h3 class="meal-group-title">${RECIPE_LABELS[cat]} (${items.length})</h3>
          <div class="meal-grid">
            ${items.map(r => `
              <article class="meal-card recipe-card">
                <div class="meal-card-top">
                  <h3 class="meal-name">${r.name}</h3>
                  <span class="meal-time">${r.prepTime} · ${r.cookTime}</span>
                </div>
                <p class="meal-desc">${r.description}</p>
                <div class="meal-meta">
                  <span>🥩 ${r.protein}</span>
                  <span>🔥 ${r.calories}</span>
                  ${r.fiber ? `<span>🌾 ${r.fiber} fiber</span>` : ""}
                </div>
                <div class="recipe-tags">
                  ${r.tags.map(t => `<span class="${tagClass(t)}">${t}</span>`).join("")}
                </div>
                ${r.biomarkers && r.biomarkers.length ? `
                <div class="meal-targets">
                  <div class="tag-group">
                    ${r.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}
                  </div>
                </div>` : ""}
                <a href="${r.url}" target="_blank" rel="noopener" class="recipe-link">📖 View recipe on ${r.source}</a>
              </article>
            `).join("")}
          </div>
        </div>`;
    }).join("");
  }

  function renderFoodContent(tab) {
    switch (tab) {
      case "pantry": return pantryHTML();
      case "foodlists": return FOOD_LISTS.map(list => foodListHTML(list)).join("<hr class='foodlist-divider'>");
      case "avoid": return avoidHTML();
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
      case "recipes": return recipeTabHTML();
      default: {
        const items = MEALS.filter(m => m.category === tab);
        const groups = {};
        items.forEach(m => {
          const g = m.group || "Other";
          if (!groups[g]) groups[g] = [];
          groups[g].push(m);
        });
        const groupOrder = ["Quick & Easy", "Prep Ahead", "Eggs", "Poultry", "Fish & Seafood", "Beef & Lamb", "Vegetarian", "Soups & Stews", "Sides", "Other"];
        const sortedGroups = Object.keys(groups).sort((a, b) => {
          const ai = groupOrder.indexOf(a);
          const bi = groupOrder.indexOf(b);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        return `
          <p class="meal-count">${items.length} meals · ${items.reduce((s, m) => s + (m.variations ? m.variations.length : 0), 0)}+ variations</p>
          ${sortedGroups.map(g => `
            <div class="meal-group">
              <h3 class="meal-group-title">${g}</h3>
              <div class="meal-grid">${mealHTML(groups[g])}</div>
            </div>
          `).join("")}`;
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
                ${mt.instructions.map(s => `<li>${s}</li>`).join("")}
              </ol>
            </div>
            ${mt.supplementPairing ? `
            <div class="meal-supplement">
              <h5>💊 Supplement Pairing</h5>
              <p>${mt.supplementPairing}</p>
            </div>` : ""}
          </details>
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
            ${m.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}
          </div>
        </div>` : ""}
      </article>`;
    }).join("");
  }

function surpriseMe() {
  const validTabs = ["breakfast", "lunch", "marinade"];
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
    // method switch handled by class toggles above
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

function supplementCardFace(s) {
  const tier = effectiveTier(s, selectedDiet);
  return `
    <div class="supp-item-top" style="margin-bottom:8px;">
      <h4 class="supp-item-name" style="font-size:18px;">${s.name}</h4>
      <span class="supp-item-tier supp-tier-${tier}">${tier}</span>
      <span class="supp-item-cost">${s.costPerMonth}/mo</span>
    </div>
    <p class="supp-item-desc" style="font-size:14px;line-height:1.6;margin-bottom:12px;">${s.description}</p>
    <div class="supp-item-detail" style="font-size:13px;margin-bottom:4px;"><strong>Dosage:</strong> ${s.dosage}</div>
    <div class="supp-item-detail" style="font-size:13px;margin-bottom:4px;"><strong>When:</strong> ${s.timingDetail}</div>
    <div class="supp-item-detail" style="font-size:13px;color:var(--color-text-muted);"><strong>Timing:</strong> ${s.timing === 'am' ? '☀️ AM' : '🌙 PM'}</div>
  `;
}

function supplementCardDetail(s) {
  const dietEmoji = selectedDiet === "carnivore" ? "🥩" : selectedDiet === "vegetarian" ? "🥬" : "🍽️";
  return `
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
      <h5>${dietEmoji} Why ${DIET_LABELS_PLAIN[selectedDiet]} Need It</h5>
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
        ${s.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join(" ")}
      </div>
    </div>` : ""}
  `;
}

function renderSupplements(targetId) {
  const container = document.getElementById(targetId || "supplement-app");
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

  // Desktop timing blocks
  let desktopHTML = "";
  for (const t of timingOrder) {
    const items = grouped[t];
    if (!items.length) continue;

    desktopHTML += `
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
                  ${s.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}
                </div>
              </div>` : ""}
            </div>
          `).join("")}
        </div>
      </div>`;
  }

  // Mobile swipe: flatten all filtered supplements
  const swipeSlides = filtered.map(s => `
    <div class="card-face">${supplementCardFace(s)}</div>
    <button class="card-swipe-expand-btn" aria-expanded="false">Show Details</button>
    <div class="card-detail">${supplementCardDetail(s)}</div>
  `);

  container.innerHTML = `
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

    <div class="supplement-grid-desktop">${desktopHTML}</div>
    <div id="supplement-swipe-wrap"></div>
  `;

  if (typeof CardSwipe !== 'undefined' && swipeSlides.length > 0) {
    CardSwipe.init('supplement-swipe-wrap', swipeSlides, {
      onSlideChange: (idx) => {
        // history.replaceState(null, null, '#' + filtered[idx].id);
      }
    });
    // Scroll swipe container into view on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const wrap = document.getElementById('supplement-swipe-wrap');
        if (wrap) {
          const top = wrap.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ left: 0, top, behavior: 'auto' });
        }
      }, 0);
    }
  }
}

/* ============================
   Sound Cues
   ============================ */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
document.addEventListener("click", () => {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}, { once: true });

function playTone(freq, duration, type, startTime, gainVal) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, startTime || ctx.currentTime);
    const g = gainVal || 0.25;
    gain.gain.setValueAtTime(g, startTime || ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, (startTime || ctx.currentTime) + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime || ctx.currentTime);
    osc.stop((startTime || ctx.currentTime) + duration);
  } catch(e) {}
}

function playWhistle(startFreq, endFreq, duration) {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.linearRampToValueAtTime(endFreq, t + duration);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.setValueAtTime(0.15, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch(e) {}
}

function playChime(freq, duration) {
  playTone(freq, duration, "sine", undefined, 0.15);
}

function duckMusic(duration) {
  if (!musicGain) return;
  musicGain.gain.value = 0.001;
  clearTimeout(musicGain._restoreTimer);
  musicGain._restoreTimer = setTimeout(() => { if (musicGain) musicGain.gain.value = 0.2; }, duration * 1000);
}

function playTick() {
  duckMusic(0.15);
  playTone(1500, 0.1, "sine", undefined, 0.9);
}

function playStartWhistle() {
  duckMusic(0.35);
  if (!playSound("start")) playWhistle(500, 1000, 0.25);
}
function playMidpoint() {
  duckMusic(0.4);
  const t = (getAudioCtx() || {}).currentTime || 0;
  playTone(1200, 0.2, "triangle", t, 0.9);
  playTone(1600, 0.2, "triangle", t + 0.12, 0.7);
}
function playCountdownTick() {
  duckMusic(0.15);
  if (!playSound("tick")) playTick();
}
function playWorkEnd() {
  duckMusic(0.45);
  if (!playSound("workend")) playWhistle(800, 400, 0.3);
}
function playRestOver() {
  duckMusic(0.35);
  if (!playSound("restover")) setTimeout(() => playWhistle(400, 660, 0.25), 50);
}
function playAllDone() {
  duckMusic(0.7);
  if (!playSound("alldone")) {
    const t = (getAudioCtx() || {}).currentTime || 0;
    playTone(440, 0.25, "sine", t, 0.3);
    playTone(554, 0.25, "sine", t + 0.2, 0.3);
    playTone(660, 0.35, "sine", t + 0.4, 0.3);
  }
}

/* ============================
   Background Music (CC0 Freesound)
   ============================ */
let musicBuffer = null;
let musicSource = null;
let musicGain = null;
const MUSIC_URL = "https://cdn.freesound.org/previews/569/569920_4819210-lq.mp3";
let musicLoading = null;

let restMusicBuffer = null;
let restMusicLoading = null;
const REST_MUSIC_URL = "https://cdn.freesound.org/previews/858/858311_462105-lq.mp3";
const MUSIC_START_OFFSET = 5;

function loadMusic() {
  if (musicBuffer || musicLoading) return musicLoading;
  musicLoading = (async () => {
    try {
      const ctx = getAudioCtx();
      const resp = await fetch(MUSIC_URL);
      const buf = await resp.arrayBuffer();
      musicBuffer = await ctx.decodeAudioData(buf);
    } catch(e) { musicBuffer = null; }
  })();
  return musicLoading;
}

function loadRestMusic() {
  if (restMusicBuffer || restMusicLoading) return restMusicLoading;
  restMusicLoading = (async () => {
    try {
      const ctx = getAudioCtx();
      const resp = await fetch(REST_MUSIC_URL);
      const buf = await resp.arrayBuffer();
      restMusicBuffer = await ctx.decodeAudioData(buf);
    } catch(e) { restMusicBuffer = null; }
  })();
  return restMusicLoading;
}

async function startMusic(isWork) {
  stopMusic();
  const buf = isWork ? musicBuffer : restMusicBuffer;
  if (!buf) { isWork ? await loadMusic() : await loadRestMusic(); }
  const ctx = getAudioCtx();
  const activeBuf = isWork ? musicBuffer : restMusicBuffer;
  if (!ctx || !activeBuf) return;

  musicSource = ctx.createBufferSource();
  musicSource.buffer = activeBuf;
  musicSource.loop = true;
  musicGain = ctx.createGain();
  musicGain.gain.value = isWork ? 0.2 : 0.4;
  musicSource.connect(musicGain).connect(ctx.destination);
  musicSource.start(0, isWork ? MUSIC_START_OFFSET : 0);
}

function stopMusic() {
  if (musicSource) {
    try { musicSource.stop(); } catch(e) {}
    try { musicSource.disconnect(); } catch(e) {}
    musicSource = null;
  }
  if (musicGain) {
    clearTimeout(musicGain._restoreTimer);
    try { musicGain.disconnect(); } catch(e) {}
    musicGain = null;
  }
}

/* ============================
   FreeSound CC0 Sound Loading
   ============================ */
const SOUND_URLS = {
  start: "https://cdn.freesound.org/previews/538/538422_11966684-lq.mp3",
  restover: "https://cdn.freesound.org/previews/582/582701_5965684-lq.mp3",
  alldone: "https://cdn.freesound.org/previews/607/607207_7724198-lq.mp3",
};

const soundBuffers = {};

async function loadSound(name, url) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    soundBuffers[name] = await ctx.decodeAudioData(buf);
  } catch(e) {
    soundBuffers[name] = null;
  }
}

function playSound(name) {
  const buf = soundBuffers[name];
  if (!buf) return false;
  try {
    const ctx = getAudioCtx();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    src.connect(gain).connect(ctx.destination);
    src.start();
    return true;
  } catch(e) { return false; }
}

function initExerciseSounds() {
  for (const [name, url] of Object.entries(SOUND_URLS)) {
    loadSound(name, url);
  }
  loadMusic();
  loadRestMusic();
}

/* ============================
   Exercise Timer State
   ============================ */
const timerState = {};

function timerTick(id, ex) {
  const s = timerState[id];
  if (!s || s.status === "idle" || s.status === "paused") return;

  const now = Date.now();
  const elapsed = (now - s.lastTick) / 1000;
  s.timeRemaining = Math.max(0, s.timeRemaining - elapsed);
  s.lastTick = now;

  const total = s.currentSet > s.totalSets ? 0 : s.isWork ? s.v.workSeconds : s.v.restSeconds;
  const pct = total > 0 ? (s.timeRemaining / total) * 100 : 0;

  const mins = Math.floor(s.timeRemaining / 60);
  const secs = Math.floor(s.timeRemaining % 60);
  const timeText = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const labelText = s.isWork ? "⏱️ WORK" : "💤 REST";
  const el = s._el;
  if (el.time) el.time.textContent = timeText;
  if (el.bar) el.bar.style.transform = `scaleX(${pct / 100})`;
  if (el.label) el.label.textContent = labelText;

  // Sound milestones
  const timeLeft = s.timeRemaining;
  const totalTime = total;
  if (totalTime > 0) {
    if (s.isWork) {
      const pctLeft = timeLeft / totalTime;
      if (!s._midpoint && pctLeft <= 0.5 && pctLeft > 0.48) { s._midpoint = true; playMidpoint(); }
    }
    if (timeLeft <= 6 && timeLeft > 0) {
      const sec = Math.ceil(timeLeft);
      if (sec !== s._lastCountdownSec) {
        s._lastCountdownSec = sec;
        playCountdownTick();
        if (!s._musicStoppedForCountdown) {
          s._musicStoppedForCountdown = true;
          stopMusic();
        }
      }
    }
  }

  if (s.timeRemaining <= 0) {
    if (s.isWork) {
      playWorkEnd();
      if (s.currentSet >= s.totalSets) {
        s.status = "done";
        if (el.label) el.label.textContent = "✅ DONE";
        playAllDone();
        updateTimerControls(id, "done");
        if (el.bar) el.bar.style.transform = "scaleX(0)";
        return;
      }
      s.isWork = false;
      s.timeRemaining = s.v.restSeconds;
      s._resetFlags();
      startMusic(false);
      if (el.label) el.label.textContent = "💤 REST";
      if (el.sets) el.sets.textContent = `${s.currentSet}/${s.totalSets}`;
    } else {
      playRestOver();
      s.currentSet++;
      if (s.currentSet > s.totalSets) {
        s.status = "done";
        if (el.label) el.label.textContent = "✅ DONE";
        playAllDone();
        updateTimerControls(id, "done");
        if (el.bar) el.bar.style.transform = "scaleX(0)";
        return;
      }
      s.isWork = true;
  s.timeRemaining = s.v.workSeconds;
      s._resetFlags();
      playStartWhistle();
      startMusic(true);
      if (el.label) el.label.textContent = "⏱️ WORK";
      if (el.sets) el.sets.textContent = `${s.currentSet}/${s.totalSets}`;
    }
    updateSetIndicators(id, s.currentSet, s.totalSets);
  }

  s._raf = requestAnimationFrame(() => timerTick(id, ex));
}

function timerStateReset(id, ex) {
  if (!timerState[id]) timerState[id] = {};
  const s = timerState[id];
  s.v = getVariation(ex).variation;
  s.status = "idle";
  s.currentSet = 1;
  s.totalSets = s.v.sets;
  s.isWork = true;
      s.timeRemaining = s.v.workSeconds;
  s.lastTick = Date.now();
  s._raf = null;
  s._el = {
    time: document.getElementById("time-" + id),
    bar: document.getElementById("bar-" + id),
    label: document.getElementById("label-" + id),
    sets: document.getElementById("sets-" + id),
  };
  s._resetFlags = function() { this._midpoint = false; this._lastCountdownSec = null; this._musicStoppedForCountdown = false; };
  s._resetFlags();
}

function updateTimerControls(id, state) {
  document.querySelectorAll(`.timer-start[data-exercise="${id}"]`).forEach(start => {
    const pause = start.closest('.timer-controls').querySelector('.timer-pause');
    const stop = start.closest('.timer-controls').querySelector('.timer-stop');
    if (state === "idle") { start.style.display = ""; start.textContent = "▶ Start"; pause.style.display = "none"; stop.style.display = "none"; }
    else if (state === "running") { start.style.display = "none"; pause.style.display = ""; pause.textContent = "⏸ Pause"; stop.style.display = ""; }
    else if (state === "paused") { start.style.display = ""; start.textContent = "▶ Resume"; pause.style.display = "none"; stop.style.display = ""; }
    else if (state === "done") { start.style.display = ""; start.textContent = "↻ Restart"; pause.style.display = "none"; stop.style.display = "none"; }
  });
}

function updateSetIndicators(id, current, total) {
  const dots = document.querySelectorAll(`.set-dot[data-exercise="${id}"]`);
  dots.forEach((d, i) => {
    d.className = "set-dot" + (i < current - 1 ? " done" : i === current - 1 ? " active" : "");
    d.dataset.exercise = id;
  });
}

function handleTimerAction(id, action, ex) {
  if (!timerState[id]) timerStateReset(id, ex);
  let s = timerState[id];

  if (action === "start") {
    for (const [tid, ts] of Object.entries(timerState)) {
      if (tid !== id && (ts.status === "running" || ts.status === "paused")) {
        handleTimerAction(tid, "stop", EXERCISES.find(e => e.id === tid));
      }
    }
    if (s.status === "done") { timerStateReset(id, ex); s = timerState[id]; }
    s.status = "running";
    s.lastTick = Date.now();
    updateTimerControls(id, "running");
    playStartWhistle();
    startMusic(true);
    timerTick(id, ex);
  } else if (action === "pause") {
    s.status = "paused";
    if (s._raf) { cancelAnimationFrame(s._raf); s._raf = null; }
    stopMusic();
    updateTimerControls(id, "paused");
  } else if (action === "stop") {
    s.status = "idle";
    if (s._raf) { cancelAnimationFrame(s._raf); s._raf = null; }
    stopMusic();
    timerStateReset(id, ex);
    const sv = timerState[id].v;
    const el2 = timerState[id]._el;
    updateTimerControls(id, "idle");
    const m = Math.floor(sv.workSeconds / 60);
    const sec = sv.workSeconds % 60;
    const resetTime = `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    if (el2.time) el2.time.textContent = resetTime;
    if (el2.bar) el2.bar.style.transform = "scaleX(1)";
    if (el2.label) el2.label.textContent = "Ready";
    if (el2.sets) el2.sets.textContent = `1/${sv.sets}`;
    updateSetIndicators(id, 1, sv.sets);
  }
}

function getVariation(ex) {
  return { variation: ex.variations[1] || ex.variations[0], index: 1 };
}

function initExerciseTimers() {
  const container = document.querySelector("#workout-app");
  if (!container) return;
  container.addEventListener("click", (e) => {
    const start = e.target.closest(".timer-start");
    const pause = e.target.closest(".timer-pause");
    const stop = e.target.closest(".timer-stop");
    const exId = (start || pause || stop)?.dataset?.exercise;
    if (!exId) return;
    const ex = EXERCISES.find(e => e.id === exId);
    if (!ex) return;
    if (start) handleTimerAction(exId, "start", ex);
    else if (pause) handleTimerAction(exId, "pause", ex);
    else if (stop) handleTimerAction(exId, "stop", ex);
  });

}

/* ============================
   Exercise Card Render
   ============================ */
function exerciseCardFace(e) {
  const def = e.variations[1] || e.variations[0];
  return `
    <div class="exercise-header">
      <div class="exercise-name">${e.name}</div>
    </div>
    <div class="exercise-target" id="target-${e.id}">🎯 ${def.target}</div>
    <p class="exercise-desc">${e.description}</p>
    <div class="exercise-timer" id="timer-${e.id}">
      <div class="timer-config">
        <span id="config-${e.id}">${def.sets} × ${def.workSeconds}s work · ${def.restSeconds}s rest</span>
        <span class="set-indicators">
          ${Array.from({length: def.sets}, (_, i) => `<span class="set-dot${i === 0 ? " active" : ""}" data-exercise="${e.id}"></span>`).join("")}
        </span>
      </div>
      <div class="timer-display">
        <span class="timer-time" id="time-${e.id}">${String(Math.floor(def.workSeconds/60)).padStart(2,"0")}:${String(def.workSeconds%60).padStart(2,"0")}</span>
        <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${e.id}" style="width:100%"></div></div>
      </div>
      <div class="timer-controls">
        <button class="timer-btn timer-start" data-exercise="${e.id}">▶ Start</button>
        <button class="timer-btn timer-pause" data-exercise="${e.id}" style="display:none">⏸ Pause</button>
        <button class="timer-btn timer-stop" data-exercise="${e.id}" style="display:none">⏹ Stop</button>
      </div>
      <div class="timer-label" id="label-${e.id}">Ready</div>
    </div>
    <div class="exercise-set-counter">Set <span id="sets-${e.id}">1/${def.sets}</span></div>`;
}

function exerciseCardDetail(e) {
  return `
    <div class="exercise-detail-section">
      <h5>🎯 Why This Exercise</h5>
      <p class="exercise-detail-text">${e.whyLongevity}</p>
    </div>
    <div class="exercise-detail-section">
      <h5>📋 Step-by-Step</h5>
      <ol class="checklist">${e.instructions.map(i => `<li>${i}</li>`).join("")}</ol>
    </div>
    ${e.biomarkers.length ? `
    <div class="exercise-detail-section">
      <h5>🎯 Targets</h5>
      <div class="tag-group">${e.biomarkers.map(b => `<a href="/pages/health.html#${b}" class="tag tag-biomarker">${b}</a>`).join("")}</div>
    </div>` : ""}
  `;
}

function renderExercises(targetId) {
  const container = document.getElementById(targetId || "workout-app");
  if (!container) return;

  initExerciseSounds();

  const intro = `
    <div class="exercise-intro">
      <h3>Your Daily Movement Practice</h3>
      <p>No equipment. No gym. No excuses. Pick 3-5 exercises and do them anywhere — takes 5-10 minutes daily. Use the built-in timer with sound cues.</p>
    </div>`;

  const desktopHTML = intro + `
    <div class="exercise-grid">
      ${EXERCISES.map(e => `
        <div class="exercise-card" id="ex-${e.id}">
          ${exerciseCardFace(e)}
          <details class="exercise-details">
            <summary>📖 Show Guide</summary>
            <div class="exercise-detail-content">${exerciseCardDetail(e)}</div>
          </details>
        </div>
      `).join("")}
    </div>`;

  const swipeSlides = EXERCISES.map(e => `
    <div class="card-face">${exerciseCardFace(e)}</div>
    <button class="card-swipe-expand-btn" aria-expanded="false">Show Guide</button>
    <div class="card-detail">${exerciseCardDetail(e)}</div>
  `);

  container.innerHTML = `
    <div class="exercise-desktop">${desktopHTML}</div>
    <div class="exercise-mobile">
      <div class="exercise-mobile-intro">${intro}</div>
      <div id="exercise-swipe-wrap"></div>
    </div>
  `;

  if (typeof CardSwipe !== 'undefined' && swipeSlides.length > 0) {
    CardSwipe.init('exercise-swipe-wrap', swipeSlides);
  }

  initExerciseTimers();
}

function selectDiet(diet) {
  selectedDiet = diet;
  renderSupplements();
}

function selectTier(tier) {
  selectedTier = tier;
  renderSupplements();
}

// Expose functions to global scope for inline onclick handlers
Object.assign(window, {
  selectHealthTab,
  selectMealTab,
  selectMethod,
  surpriseMe,
  selectDiet,
  selectTier,
  exportData: typeof exportData !== 'undefined' ? exportData : undefined,
});

// Auto-initialize based on which page we're on
document.addEventListener('DOMContentLoaded', () => {
  const healthApp = document.getElementById('health-app');
  const foodApp = document.getElementById('food-app');
  const workoutApp = document.getElementById('workout-app');
  const investmentsApp = document.getElementById('investments-app');
  if (healthApp) safeRender(renderHealth, healthApp);
  if (foodApp) safeRender(renderFoods, foodApp);
  if (workoutApp) safeRender(() => renderExercises('workout-app'), workoutApp);
  if (investmentsApp) safeRender(() => {
    investmentsApp.innerHTML = renderInvestments();
    if (typeof calcFire === 'function') calcFire();
    if (typeof renderPiTable === 'function') renderPiTable();
  }, investmentsApp);
});
