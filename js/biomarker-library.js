import { BLUEPRINT_MARKERS, BLUEPRINT_REFERENCE, biomarkerUnits } from './data/blueprint-markers.js';
import { escapeHTML as escape } from './components/ui.js';

const KEY = 'blueprint-marker-results-v1';
const PAGE_SIZE = 20;

export function mountBiomarkerLibrary(root) {
  let results = {};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) results = saved;
  } catch { /* Storage may be unavailable; keep session-only results. */ }
  root.innerHTML = `<p>All 140 baseline measurements plus 3 male-panel and 1 female-panel measurements from Bryan Johnson’s published blood-and-urine testing list. Includes the 86 follow-up entries, with naming aliases matched rather than counted twice.</p>
    <p>This is a reference, not a 144-test shopping list. It includes calculated ratios, qualitative findings and reflex tests. Singapore availability varies. Use your own lab’s reference interval and clinical context, not Bryan’s personal results. More testing can produce false positives; his unpublished or lifetime tests are not covered.</p>
    <p><a href="${BLUEPRINT_REFERENCE.source}" target="_blank" rel="noreferrer">Official published panel ↗</a> · Checked ${BLUEPRINT_REFERENCE.checked}</p>
    <p>Units start with common Singapore conventions where established. Choose a suggestion or type the units on your report. Values and lab reference intervals are never automatically converted; specialty and qualitative results remain report-specific.</p>
    <div class="sg-library-controls"><div><label for="sg-library-search">Search all biomarkers</label><input id="sg-library-search" type="search" placeholder="ApoB, thyroid, vitamin, urine…" maxlength="120"></div><div><label for="sg-library-filter">Panel or specimen</label><select id="sg-library-filter"><option value="all">All measurements</option><option value="Blood">Blood</option><option value="Urine">Urine</option><option value="male">Male additions</option><option value="female">Female additions</option><option value="followup">Follow-up panel</option><option value="saved">Results recorded</option></select></div></div>
    <p data-library-count role="status"></p><div data-library-results></div><button type="button" data-library-more>Show more measurements</button><p data-library-storage role="status">Results stay in this browser. They are separate from the main tracker. Do not enter identifying information on a shared device.</p>`;
  const list = root.querySelector('[data-library-results]');
  const search = root.querySelector('#sg-library-search');
  const filter = root.querySelector('#sg-library-filter');
  let limit = PAGE_SIZE;
  function render() {
    const query = search.value.toLowerCase().trim();
    const matches = BLUEPRINT_MARKERS.filter(marker => `${marker.name} ${marker.aliases}`.toLowerCase().includes(query)
      && (filter.value === 'all' || marker.specimen === filter.value || marker.panel === filter.value || (filter.value === 'followup' && marker.followup) || (filter.value === 'saved' && results[marker.id]?.result)));
    root.querySelector('[data-library-count]').textContent = `${matches.length} matching measurements · ${BLUEPRINT_MARKERS.filter(marker => results[marker.id]?.result).length} results recorded`;
    list.innerHTML = matches.slice(0, limit).map(marker => {
      const saved = { ...results[marker.id] };
      const units = biomarkerUnits(marker.name);
      if (saved.unit === undefined && !saved.result) saved.unit = units[0] || '';
      return `<details class="sg-library-result" data-library-marker="${marker.id}"><summary>${escape(marker.name)} <span>${marker.specimen}${marker.panel !== 'baseline' ? ' · ' + marker.panel + ' addition' : ''}${saved.result ? ' · recorded' : ''}</span></summary><p>Copy your report exactly, including units and reference interval. “Positive”, “negative” and blood groups are valid results; not every measurement has a numerical target. Do not try to improve inherited blood groups or suppress normal cell counts. Abnormal or symptomatic results need clinical review.</p><div class="sg-library-fields">${[['result', 'Result', 'e.g. 0.85 or negative'], ['unit', 'Units on report', 'e.g. g/L'], ['range', 'Lab reference interval', 'Copy from your report'], ['date', 'Collection date', 'YYYY-MM-DD']].map(([key, label, placeholder]) => `<div><label for="library-${marker.id}-${key}">${label}</label><input id="library-${marker.id}-${key}" data-library-field="${key}" type="${key === 'date' ? 'date' : 'text'}" maxlength="120" value="${escape(String(saved[key] || ''))}" placeholder="${placeholder}" autocomplete="off"${key === 'unit' ? ` list="library-${marker.id}-units"` : ''}>${key === 'unit' ? `<datalist id="library-${marker.id}-units">${units.map(unit => `<option value="${escape(unit)}"></option>`).join('')}</datalist>` : ''}</div>`).join('')}</div><button type="button" data-library-clear>Clear this result</button></details>`;
    }).join('') || '<p>No matching biomarkers. Try a shorter test name or another filter.</p>';
    root.querySelector('[data-library-more]').hidden = matches.length <= limit;
  }
  function persist() {
    const status = root.querySelector('[data-library-storage]');
    try { localStorage.setItem(KEY, JSON.stringify(results)); status.textContent = 'Results saved on this device only. Not synced with the priority cards.'; }
    catch { status.textContent = 'Storage unavailable or full. Results are kept for this page session only.'; }
  }
  search.addEventListener('input', () => { limit = PAGE_SIZE; render(); });
  filter.addEventListener('change', () => { limit = PAGE_SIZE; render(); });
  root.querySelector('[data-library-more]').addEventListener('click', () => { limit += PAGE_SIZE; render(); });
  list.addEventListener('input', event => {
    const field = event.target.closest('[data-library-field]');
    if (!field) return;
    const row = field.closest('[data-library-marker]');
    const id = row.dataset.libraryMarker;
    results[id] = Object.fromEntries([...row.querySelectorAll('[data-library-field]')].map(input => [input.dataset.libraryField, input.value.slice(0, 120)]));
    persist();
    const marker = BLUEPRINT_MARKERS.find(item => item.id === id);
    row.querySelector('summary span').textContent = `${marker.specimen}${marker.panel !== 'baseline' ? ' · ' + marker.panel + ' addition' : ''}${results[id].result ? ' · recorded' : ''}`;
    root.querySelector('[data-library-count]').textContent = root.querySelector('[data-library-count]').textContent.replace(/\d+ results recorded$/, `${BLUEPRINT_MARKERS.filter(item => results[item.id]?.result).length} results recorded`);
  });
  list.addEventListener('click', event => {
    const clear = event.target.closest('[data-library-clear]');
    if (!clear) return;
    const row = clear.closest('[data-library-marker]');
    delete results[row.dataset.libraryMarker];
    persist();
    row.querySelectorAll('input').forEach(input => { input.value = ''; });
    row.querySelector('input').dispatchEvent(new Event('input', { bubbles: true }));
  });
  render();
}
