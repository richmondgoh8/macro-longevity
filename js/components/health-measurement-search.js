import { searchMeasurements } from './measurement-search.js';
import { measurementIdentity } from '../data/measurement-index.js';
import { escapeHTML } from './ui.js';

export function mountHealthSearch(root, priority, loaders) {
  const input = root.querySelector('[data-health-search]');
  const results = root.querySelector('[data-health-results]');
  const status = root.querySelector('[data-health-search-status]');
  let catalog;
  let task;
  async function getCatalog() {
    if (!task) task = Promise.all([
      import('../data/additional-screening.js'), import('../data/physical-measurements.js'), import('../data/blueprint-markers.js'), import('../data/extended-references.js'),
      import('../data/physical-result-fields.js'),
    ]).then(([additional, physical, library, extended, observations]) => {
      const structured = [...priority, ...additional.ADDITIONAL_MARKERS];
      const owned = new Set(structured.map(item => item.catalogName ? library.normalizeTestName(item.catalogName) : measurementIdentity(item.id).libraryId));
      const fields = [
        ...structured.map(item => ({ ...item, destination: 'structured', target: `sg-${item.id}` })),
        ...observations.PHYSICAL_MEASUREMENTS.map(item => ({ id: item.referenceId, label: item.label || physical.PHYSICAL_REFERENCES.find(reference => reference.id === item.referenceId).label, destination: 'physical', target: `physical-${item.id}` })),
        ...library.BLUEPRINT_MARKERS.filter(item => !owned.has(item.id)).map(item => ({ ...item, label: item.name, destination: 'library', target: `library-${item.id}-result` })),
      ];
      const referenceById = new Map(extended.EXTENDED_REFERENCES.map(item => [item.id, item]));
      fields.forEach(item => { item.aliases = [item.aliases || '', ...(referenceById.get(measurementIdentity(item.id).id)?.aliases || [])]; });
      const recordable = new Set(fields.map(item => measurementIdentity(item.id).id));
      return [...fields, ...extended.EXTENDED_REFERENCES.filter(item => !recordable.has(item.id)).map(item => ({ ...item, destination: 'reference', target: `biomarker-${item.id}` }))];
    }).catch(error => { task = undefined; throw error; });
    return task;
  }
  async function search() {
    const query = input.value;
    if (!query.trim()) { results.innerHTML = ''; status.textContent = ''; return; }
    results.innerHTML = '';
    status.textContent = 'Finding measurements…';
    try {
      catalog = await getCatalog();
      if (input.value !== query) return;
      const matches = searchMeasurements(catalog, query);
      results.innerHTML = matches.slice(0, 8).map(item => `<li><a href="${item.destination === 'reference' ? '../' : ''}#${item.target}"${item.destination === 'reference' ? '' : ` data-health-result="${item.target}"`}>${escapeHTML(item.label)} <small>${item.destination === 'reference' ? 'Reference only · no result entry' : item.destination === 'physical' ? 'Physical measurement' : item.destination === 'library' ? 'Lab library' : 'Result field'}</small></a></li>`).join('');
      status.textContent = matches.length ? `${matches.length} matching measurements.${matches.length > 8 ? ' Showing the first 8; refine your search.' : ' Choose a result.'}` : 'No matching measurements. Try HDL, grip, bone density or a shorter lab name.';
    } catch { status.textContent = 'Search could not load. Type again to retry; reconnect once if these files have not been cached.'; }
  }
  input.addEventListener('input', search);
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); }
    if (event.key === 'Escape') { input.value = ''; search(); }
  });
  input.closest('form').addEventListener('submit', async event => {
    event.preventDefault();
    const query = input.value;
    await search();
    if (input.value === query) results.querySelector('a')?.click();
  });
  results.addEventListener('click', async event => {
    const link = event.target.closest('[data-health-result]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    await reveal(link.dataset.healthResult, true);
  });
  async function reveal(targetId, navigate = false) {
    catalog = await getCatalog();
    const item = catalog.find(item => item.target === targetId);
    if (!item) return;
    if (item.destination === 'physical' && !await loaders.physical()) return;
    if (item.destination === 'structured' && !root.querySelector(`#${targetId}`) && !await loaders.additional()) return;
    if (item.destination === 'library') {
      if (!await loaders.library()) return;
      const filter = root.querySelector('#sg-library-filter');
      filter.value = 'all';
      const librarySearch = root.querySelector('#sg-library-search');
      librarySearch.value = item.label;
      librarySearch.dispatchEvent(new Event('input'));
    }
    const target = root.querySelector(`#${targetId}`);
    if (!target) return;
    for (let parent = target.parentElement; parent && parent !== root; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
    // An existing result might currently show its action back rather than the input.
    const actions = target.closest('[data-marker-card]')?.querySelector('.sg-marker-details');
    if (actions) actions.open = false;
    if (navigate) history.pushState(null, '', `#${targetId}`);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'center', behavior: 'instant' });
    results.innerHTML = '';
    status.textContent = `Opened ${item.label}.`;
  }
  const restore = () => {
    if (/^#(?:sg-|physical-|library-)/.test(location.hash)) reveal(location.hash.slice(1)).catch(() => { status.textContent = 'This result could not load. Try its name in search.'; });
  };
  window.addEventListener('hashchange', restore);
  restore();
}
