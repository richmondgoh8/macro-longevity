// sticky-pin.js — shared section rail for long-form routes.

const PAGE_CONFIG = {
  '/pages/stack.html': {
    entries: [
      { label: 'Daily plan', href: '#planner-title' },
      { label: 'Coverage & gaps', href: '#planner-coverage' },
      { label: 'Deep library', href: '#stack-library' },
    ],
  },
  '/pages/avoid.html': {
    entries: [
      { label: 'Label screens', href: '#avoid-label-guide' },
      { label: 'High-ROI avoid list', href: '#avoid-high-roi' },
      { label: 'UPF guide', href: '#avoid-upf-guide' },
    ],
  },
  '/pages/blood.html': {
    entries: [
      { label: 'Before you draw', href: '#blood-prep' },
      { label: 'Annual panel', href: '#blood-annual' },
      { label: 'One-time checks', href: '#blood-one-time' },
      { label: 'Periodic checks', href: '#blood-periodic' },
      { label: 'ApoB options', href: '#blood-apob' },
      { label: 'Beyond the blood panel', href: '#blood-beyond' },
      { label: 'Low-value tests', href: '#blood-low-value' },
    ],
  },
  '/pages/protocol.html': {
    entries: [
      { label: '80/20 protocol', href: '#protocol-8020' },
      { label: 'Screening', href: '#protocol-screening' },
      { label: 'Biology', href: '#biology' },
      { label: 'Recovery', href: '#protocol-social' },
      { label: 'Frontier science', href: '#protocol-frontier' },
      { label: 'Singapore strategy', href: '#protocol-singapore' },
    ],
  },
  '/pages/workout.html': {
    entries: [
      { label: 'Zone 2', source: '[data-pillar-tab="zone2"]', target: '#section-zone2' },
      { label: 'VO₂ max', source: '[data-pillar-tab="vo2max"]', target: '#section-vo2max' },
      { label: 'Strength', source: '[data-pillar-tab="strength"]', target: '#section-strength' },
      { label: 'Mobility', source: '[data-pillar-tab="mobility"]', target: '#section-mobility' },
    ],
  },
  '/pages/finance.html': {
    entries: [
      { label: 'Investments', source: '[data-finance-tab="investments"]', target: '#financeInvestments' },
      { label: 'FIRE calculator', source: '[data-finance-tab="fire"]', target: '#financeFire' },
      { label: 'Income tracker', source: '[data-finance-tab="income"]', target: '#financeIncome' },
    ],
  },
};

const TARGET_FALLBACKS = {
  '/pages/stack.html': {
    'planner-coverage': '.plan-readout',
    'stack-library': '.stack-library',
  },
  '/pages/avoid.html': {
    'avoid-label-guide': '.avoid-label-guide',
    'avoid-high-roi': '.stack-grid-single',
    'avoid-upf-guide': '.upf-guide',
  },
  '/pages/blood.html': {
    'blood-prep': '.blood-prep',
    'blood-annual': '#blood-app > .blood-tier:nth-of-type(2)',
    'blood-one-time': '#blood-app > .blood-tier:nth-of-type(3)',
    'blood-periodic': '#blood-app > .blood-tier:nth-of-type(4)',
    'blood-apob': '#blood-app > .blood-tier:nth-of-type(5)',
    'blood-beyond': '#blood-app > .blood-tier:nth-of-type(6)',
    'blood-low-value': '#blood-app > .blood-tier:nth-of-type(7)',
  },
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setAnchorActive(rail, key) {
  rail.querySelectorAll('[data-sticky-pin-link]').forEach((link) => {
    const active = link.dataset.stickyPinKey === key;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function syncControlState(rail, root) {
  rail.querySelectorAll('[data-sticky-pin-control]').forEach((button) => {
    const source = root.querySelector(button.dataset.stickyPinSource);
    const active = source?.getAttribute('aria-selected') === 'true';
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function makeRail(config, root) {
  const aside = root.createElement('aside');
  aside.className = 'sticky-pin-rail';
  aside.dataset.stickyPinRail = '';

  const nav = root.createElement('nav');
  nav.className = 'sticky-pin-nav';
  // Keep the accessible name distinct from the shell/context navigation labels.
  nav.setAttribute('aria-label', 'On this page');

  const heading = root.createElement('p');
  heading.className = 'sticky-pin-label';
  heading.textContent = 'On this page';
  nav.append(heading);

  const list = root.createElement('ol');
  list.className = 'sticky-pin-list';

  config.entries.forEach((entry, index) => {
    const item = root.createElement('li');
    item.className = 'sticky-pin-item';
    const control = entry.source ? root.createElement('button') : root.createElement('a');
    control.className = 'sticky-pin-link';
    control.dataset.stickyPinKey = entry.href || entry.target;
    control.textContent = entry.label;

    if (entry.source) {
      control.type = 'button';
      control.dataset.stickyPinControl = '';
      control.dataset.stickyPinSource = entry.source;
      control.dataset.stickyPinTarget = entry.target;
      control.setAttribute('aria-controls', entry.target.slice(1));
      control.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    } else {
      control.href = entry.href;
      control.dataset.stickyPinLink = '';
      if (index === 0) control.setAttribute('aria-current', 'location');
    }

    item.append(control);
    list.append(item);
  });

  nav.append(list);
  aside.append(nav);
  return aside;
}

function ensureTargets(pathname, root) {
  const fallbacks = TARGET_FALLBACKS[pathname];
  if (!fallbacks) return;
  Object.entries(fallbacks).forEach(([id, selector]) => {
    if (root.getElementById(id)) return;
    const target = root.querySelector(selector);
    if (target) target.id = id;
  });
}

function wrapMainContent(main, root) {
  if (main.querySelector(':scope > [data-sticky-pin-layout]')) return null;

  const reserved = new Set([...main.children].filter((node) =>
    node.classList.contains('page-header') || node.classList.contains('context-nav')));
  const contentNodes = [...main.children].filter((node) => !reserved.has(node));
  if (!contentNodes.length) return null;

  const layout = root.createElement('div');
  layout.className = 'sticky-pin-layout';
  layout.dataset.stickyPinLayout = '';
  const content = root.createElement('div');
  content.className = 'sticky-pin-content';

  main.insertBefore(layout, contentNodes[0]);
  layout.append(content);
  contentNodes.forEach((node) => content.append(node));
  return { layout, content };
}

function observeAnchors(rail, entries, root) {
  rail.addEventListener('click', (event) => {
    const link = event.target.closest('[data-sticky-pin-link]');
    if (link) setAnchorActive(rail, link.dataset.stickyPinKey);
  });

  const anchorEntries = entries
    .filter((entry) => !entry.source)
    .map((entry) => ({ entry, target: root.querySelector(entry.href) }))
    .filter(({ target }) => target);
  if (!anchorEntries.length || typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver((records) => {
    const current = records
      .filter((record) => record.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    const match = current && anchorEntries.find(({ target }) => target === current.target);
    if (match) setAnchorActive(rail, match.entry.href);
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  anchorEntries.forEach(({ target }) => observer.observe(target));
}

function wireControls(rail, config, root) {
  const controls = config.entries.filter((entry) => entry.source);
  if (!controls.length) return;

  const sync = () => syncControlState(rail, root);
  rail.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sticky-pin-control]');
    if (!button) return;
    const source = root.querySelector(button.dataset.stickyPinSource);
    const target = root.querySelector(button.dataset.stickyPinTarget);
    if (!source) return;
    source.click();
    sync();
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      }));
    }
  });

  const observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(sync);
  controls.forEach((entry) => {
    const source = root.querySelector(entry.source);
    if (source && observer) observer.observe(source, { attributes: true, attributeFilter: ['aria-selected'] });
  });
  sync();
}

export function initStickyPin({ documentRoot = document } = {}) {
  const pathname = window.location.pathname;
  const config = PAGE_CONFIG[pathname];
  const main = documentRoot.querySelector('main#main');
  if (!config || !main || main.querySelector('[data-sticky-pin-layout]')) return;

  ensureTargets(pathname, documentRoot);
  const ready = config.entries.every((entry) =>
    entry.source ? documentRoot.querySelector(entry.source) : documentRoot.querySelector(entry.href));
  if (!ready) {
    if (!main.dataset.stickyPinPending) {
      main.dataset.stickyPinPending = 'true';
      setTimeout(() => {
        delete main.dataset.stickyPinPending;
        initStickyPin({ documentRoot });
      }, 0);
    }
    return;
  }

  const wrapped = wrapMainContent(main, documentRoot);
  if (!wrapped) return;

  const rail = makeRail(config, documentRoot);
  wrapped.layout.insertBefore(rail, wrapped.content);
  observeAnchors(rail, config.entries, documentRoot);
  wireControls(rail, config, documentRoot);
}
