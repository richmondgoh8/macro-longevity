import { LOW_VALUE_TESTS } from './data/blood.js';
import { escapeHTML } from './components/ui.js';
import { mountHealthDashboard } from './health-dashboard.js';

function renderLowValueTests() {
  return `<details class="progressive-section blood-tier progressive-section-muted" id="blood-low-value">
    <summary><span class="progressive-section-heading"><span class="blood-tier-title" role="heading" aria-level="2">Tests that rarely help without a clinical question</span><span class="blood-tier-desc">Check whether a result would change a decision before ordering an additional test.</span></span><span class="progressive-section-count">${LOW_VALUE_TESTS.length} examples</span></summary>
    <div class="progressive-section-body"><div class="blood-grid">${LOW_VALUE_TESTS.map(test => `<article class="blood-card blood-card-low"><h3 class="blood-card-name">${escapeHTML(test.name)}</h3><p class="blood-card-why">${escapeHTML(test.why)}</p></article>`).join('')}</div></div>
  </details>`;
}

export function renderBlood() {
  mountHealthDashboard(document.getElementById('sg-health-dashboard'), { compact: true });
  const container = document.getElementById('blood-app');
  if (!container) return;

  container.innerHTML = `
    <details class="blood-prep" id="blood-prep" data-blood-prep open>
      <summary><span><span class="blood-prep-title">Before a blood test</span><span class="blood-prep-summary">Follow the instructions for the specific test.</span></span></summary>
      <div class="blood-prep-body">
        <p class="blood-prep-text">Fasting and other preparation are needed only for some tests. Follow your lab or clinician’s instructions, tell them if you could not follow them, and do not stop medicines unless they tell you to.</p>
        <p class="blood-prep-text"><a href="https://medlineplus.gov/lab-tests/how-to-prepare-for-a-lab-test/" target="_blank" rel="noreferrer">How to prepare for a lab test ↗</a></p>
      </div>
    </details>
    <p class="blood-reference-link"><a href="../#testing-schedule">Reference guide: test context and screening schedule →</a></p>
    ${renderLowValueTests()}`;

  if (window.matchMedia('(max-width: 767px)').matches) {
    const prep = container.querySelector('[data-blood-prep]');
    if (prep) prep.open = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blood-app')) renderBlood();
});
