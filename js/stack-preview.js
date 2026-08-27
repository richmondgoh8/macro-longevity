import { DAILY_SUPPLEMENTS, EXTRAS, FOOD_SPICES, SKIP_LIST } from './data/stack.js';

function renderFoodProtocol() {
  const container = document.getElementById('stack-summary-app');
  if (!container) return;
  container.innerHTML = `<div class="stack-table"><div class="stack-table-row stack-table-header"><span>What</span><span>How much</span><span>When</span></div>${DAILY_SUPPLEMENTS.map((item) => `<div class="stack-table-row"><span class="stack-table-name">${item.name}</span><span>${item.dose || item.serving}</span><span>${item.timing}</span></div>`).join('')}<div class="stack-table-row stack-table-more"><span class="stack-table-name">+ ${FOOD_SPICES.length} foods &amp; ${EXTRAS.length} extras</span><span>See Daily Stack →</span></div></div><p class="stack-table-note">Full details, risks and the ${SKIP_LIST.length}-item skip list → <a href="/pages/stack.html">Daily Stack</a></p>`;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderFoodProtocol);
else renderFoodProtocol();
