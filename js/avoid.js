import { AVOID_INGREDIENTS, AVOID_LABEL_GUIDE, UPF_GUIDE } from './data/stack.js';
import { escapeHTML } from './components/ui.js';

function evidenceBadge(level) {
  if (!level) return '';
  const safeLevel = escapeHTML(level);
  return `<span class="evidence-badge evidence-badge-${safeLevel}">${escapeHTML(level.charAt(0).toUpperCase() + level.slice(1))}</span>`;
}

function renderAvoidPage() {
  const container = document.getElementById('avoid-app');
  if (!container) return;
  const total = AVOID_LABEL_GUIDE.length;
  container.innerHTML = `
    <section class="avoid-label-guide" aria-labelledby="avoid-label-title" data-avoid-guide>
      <div class="avoid-label-head">
        <p class="eyebrow">Exact label screen</p>
        <h2 id="avoid-label-title">What to scan for on the label</h2>
        <p>Search a product ingredient or browse the five practical screens below. These are decision rules, not a claim that every isolated additive is dangerous.</p>
        <div class="avoid-search-row">
          <div class="avoid-search-field"><label class="avoid-search-label" for="avoid-label-search">Search ingredients</label><input id="avoid-label-search" class="avoid-label-search" type="search" placeholder="e.g. maltodextrin, nitrite, flavour" data-avoid-search></div>
          <button type="button" class="button button-secondary" data-avoid-reset hidden>Clear search</button>
        </div>
        <div class="avoid-search-meta"><span data-avoid-count role="status" aria-live="polite">Showing all ${total} screens</span><span>Browse or search without losing your place.</span></div>
      </div>
      <div class="avoid-label-grid">
        ${AVOID_LABEL_GUIDE.map((group, index) => {
          const searchText = [group.name, group.priority, ...group.markers, group.rule, group.context].join(' ').toLowerCase();
          return `<details class="avoid-label-group" data-avoid-label-card data-search-text="${escapeHTML(searchText)}">
            <summary class="avoid-label-group-head"><span class="avoid-label-number">0${index + 1}</span><div><span class="avoid-label-priority">${escapeHTML(group.priority)}</span><h3>${escapeHTML(group.name)}</h3></div></summary>
            <div class="avoid-label-group-body"><div class="avoid-marker-list">${group.markers.map((marker) => `<code>${escapeHTML(marker)}</code>`).join('')}</div><p><strong>Rule</strong> ${escapeHTML(group.rule)}</p><p class="avoid-label-context"><strong>Context</strong> ${escapeHTML(group.context)}</p></div>
          </details>`;
        }).join('')}
      </div>
      <p class="avoid-label-empty" data-avoid-empty hidden>No matching label markers. Try a shorter ingredient or clear the search.</p>
    </section>
    <p class="stack-intro">The high-ROI avoid list: added sugar, alcohol, processed meat as a staple, industrial trans fats, ultra-processed food and appetite-driving refined foods. This is a practical carnivore-first filter, not a claim that every food outside it is dangerous.</p>
    <div class="stack-grid stack-grid-single">
      ${AVOID_INGREDIENTS.map((item) => `<article class="avoid-card"><div class="avoid-card-head"><h3 class="avoid-card-name">${escapeHTML(item.name)}</h3>${evidenceBadge(item.evidence)}</div><p class="avoid-where"><span class="stack-line-label">Where it hides</span> ${escapeHTML(item.where)}</p><p class="avoid-why"><span class="stack-line-label">Why</span> ${escapeHTML(item.why)}</p><p class="avoid-replace"><span class="stack-line-label">Replace with</span> ${escapeHTML(item.replace)}</p></article>`).join('')}
    </div>
    <details class="progressive-section upf-guide"><summary><span class="progressive-section-heading"><span class="eyebrow">Label literacy</span><span class="section-title">How to spot ultra-processed food</span><span class="blood-tier-desc">${escapeHTML(UPF_GUIDE.intro)}</span></span></summary><div class="progressive-section-body"><ol class="upf-steps">${UPF_GUIDE.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join('')}</ol><div class="upf-guide-grid"><div class="upf-guide-box upf-guide-box-red"><h3>Red-flag markers</h3><ul>${UPF_GUIDE.redFlags.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div><div class="upf-guide-box upf-guide-box-green"><h3>Not automatically UPF</h3><ul>${UPF_GUIDE.notAutomatic.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div></div></div></details>`;

  const search = container.querySelector('[data-avoid-search]');
  const reset = container.querySelector('[data-avoid-reset]');
  const count = container.querySelector('[data-avoid-count]');
  const empty = container.querySelector('[data-avoid-empty]');
  const cards = [...container.querySelectorAll('[data-avoid-label-card]')];
  const filter = () => {
    const query = search.value.trim().toLowerCase();
    let matches = 0;
    cards.forEach((card) => {
      const match = !query || card.dataset.searchText.includes(query);
      card.hidden = !match;
      if (match) matches++;
    });
    count.textContent = query ? `${matches} of ${total} screens match` : `Showing all ${total} screens`;
    reset.hidden = !query;
    empty.hidden = matches > 0;
  };
  search.addEventListener('input', filter);
  reset.addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderAvoidPage);
else renderAvoidPage();
