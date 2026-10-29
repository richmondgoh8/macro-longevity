import { escapeHTML } from './ui.js';

// Search synonyms are navigation vocabulary, not additional medical claims.
const ALIASES = {
  glucose: 'blood sugar fasting blood glucose', hba1c: 'a1c glycated haemoglobin hemoglobin blood sugar',
  apob: 'apolipoprotein b', lpa: 'lipoprotein a lp(a)', tg: 'triglycerides',
  hscrp: 'high sensitivity c reactive protein inflammation', bp: 'blood pressure',
  vitd: 'vitamin d 25 hydroxy', b12: 'cobalamin', vo2: 'vo2 max fitness',
  egfr: 'kidney filtration', uacr: 'urine albumin creatinine kidney',
  wholebodymri: 'prenuvo ezra whole body mri', colorectal: 'colon bowel cologuard',
};
const normalize = value => value.normalize('NFKD').replace(/₂/g, '2').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function initReferenceNavigation(mount, groups, references, markers) {
  const picker = mount.querySelector('.sg-reference-picker');
  const rail = mount.querySelector('.sg-reference-rail');
  const summary = picker.querySelector('summary');
  const desktop = matchMedia('(min-width: 1280px)');
  const links = [...mount.querySelectorAll('.sg-reference-jumps a')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  const input = mount.querySelector('#reference-search');
  const results = mount.querySelector('[data-reference-results]');
  const status = mount.querySelector('#reference-search-status');
  const feedback = mount.querySelector('[data-reference-feedback]');
  const top = mount.querySelector('.sg-reference-top');
  const searchIndex = groups.flatMap(group => group.ids.map(id => {
    const label = references.get(id).label || markers.get(id).label;
    return { id, label, group: group.short, terms: normalize(`${label} ${id} ${ALIASES[id] || ''}`) };
  }));
  let observer;
  let active = -1;
  let highlightTimer;
  let highlighted;

  function syncCurrent() {
    const clearance = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reference-clearance')) || 80;
    let index = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= clearance + 20) index = i;
    });
    if (index === active) return;
    active = index;
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    mount.querySelector('[data-reference-current]').textContent = index < groups.length
      ? `${groups[index].short} · ${index + 1}/7` : 'Testing schedule';
  }

  function measure() {
    const header = document.querySelector('.nav');
    const headerHeight = header?.getBoundingClientRect().height || 64;
    const pinned = getComputedStyle(rail).position === 'sticky';
    const pickerStyle = getComputedStyle(picker);
    const closedHeight = summary.getBoundingClientRect().height + parseFloat(pickerStyle.paddingTop) + parseFloat(pickerStyle.paddingBottom) + 2;
    const clearance = headerHeight + 12 + (!desktop.matches && pinned ? closedHeight + 12 : 0);
    document.documentElement.style.setProperty('--reference-picker-closed-height', `${closedHeight}px`);
    document.documentElement.style.setProperty('--reference-rail-top', `${headerHeight + 12}px`);
    document.documentElement.style.setProperty('--reference-clearance', `${clearance}px`);
    observer?.disconnect();
    observer = new IntersectionObserver(syncCurrent, {
      rootMargin: `-${clearance}px 0px -${Math.max(0, innerHeight - clearance - 24)}px 0px`,
    });
    sections.forEach(section => observer.observe(section));
    syncCurrent();
  }

  function adapt() {
    picker.open = desktop.matches;
    measure();
  }
  desktop.addEventListener('change', adapt);
  window.addEventListener('resize', measure, { passive: true });
  const resize = new ResizeObserver(measure);
  resize.observe(document.querySelector('.nav'));
  resize.observe(summary);
  adapt();

  // Native scroll markers are a visual enhancement; observer state also supports Safari/Firefox.
  document.addEventListener('scrollend', syncCurrent);
  const topObserver = new IntersectionObserver(([entry]) => { top.hidden = entry.isIntersecting; });
  topObserver.observe(document.querySelector('.sg-reference-intro'));

  function highlight(target) {
    highlighted?.classList.remove('sg-reference-found');
    clearTimeout(highlightTimer);
    highlighted = target;
    target.classList.add('sg-reference-found');
    highlightTimer = setTimeout(() => target.classList.remove('sg-reference-found'), 2500);
  }

  mount.addEventListener('click', async event => {
    const copy = event.target.closest('[data-copy-reference]');
    if (copy) {
      const url = new URL(location.href);
      url.hash = `biomarker-${copy.dataset.copyReference}`;
      try {
        await navigator.clipboard.writeText(url.href);
        feedback.classList.add('sr-only');
        feedback.textContent = `Link copied for ${searchIndex.find(item => item.id === copy.dataset.copyReference).label}.`;
        copy.textContent = 'Copied';
        setTimeout(() => { copy.textContent = 'Copy link'; }, 2000);
      } catch {
        // Keep a selectable link available if clipboard permission is unavailable.
        copy.closest('article').append(feedback);
        feedback.classList.remove('sr-only');
        feedback.textContent = `Copy this link: ${url.href}`;
      }
      return;
    }
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    if (!desktop.matches) picker.open = false;
    if (link.closest('[data-reference-results]')) {
      highlight(target);
      input.value = '';
      search();
    }
    // Retain native fragment history and browser Back behavior.
    requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  });

  function search() {
    const tokens = normalize(input.value).split(' ').filter(Boolean);
    const matches = tokens.length ? searchIndex.filter(item => tokens.every(token => item.terms.includes(token))) : [];
    results.hidden = !matches.length;
    results.innerHTML = matches.slice(0, 5).map(item => `<li><a href="#biomarker-${item.id}">${escapeHTML(item.label)}<small>${escapeHTML(item.group)}</small></a></li>`).join('');
    status.textContent = tokens.length ? (matches.length ? `${matches.length} matches.${matches.length > 5 ? ' Showing the first 5; refine your search.' : ' Choose a result to jump to its card.'}` : 'No matches. Try a marker name, such as ApoB or vitamin D.') : '';
    // Replace the section list while searching, without hiding any reference cards.
    mount.querySelector('.sg-reference-jumps').hidden = Boolean(tokens.length);
  }
  input.addEventListener('input', search);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { input.value = ''; search(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); }
  });
  mount.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    results.querySelector('a')?.click();
  });
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !desktop.matches && event.target !== input) {
      picker.open = false;
      summary.focus();
    }
  });
  // Never let an expanded mobile picker cover focus moving into the page.
  document.addEventListener('focusin', event => {
    if (!desktop.matches && !picker.contains(event.target)) picker.open = false;
  });
  function restoreFragment() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target || !mount.contains(target)) return;
    if (target.matches('[data-reference-card]')) highlight(target);
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  // Module-rendered cards do not exist when the browser first resolves an incoming fragment.
  restoreFragment();
}
