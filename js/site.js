let tooltipImport;
let pendingTooltip;
const loadTooltips = (target, type = 'focus') => {
  pendingTooltip = { target, type, at: performance.now() };
  tooltipImport ||= import('./components/tooltip.js').then(({ initTooltips }) => initTooltips(pendingTooltip));
};
document.addEventListener('pointerover', (event) => {
  const trigger = event.target.closest?.('[data-tooltip-trigger]');
  if (trigger && !(event.relatedTarget && trigger.contains(event.relatedTarget))) loadTooltips(trigger, 'pointer');
}, true);
document.addEventListener('focusin', (event) => {
  const trigger = event.target.closest?.('[data-tooltip-trigger]');
  if (trigger) loadTooltips(trigger);
}, true);

const CONTEXT_NAV = {
  '/pages/stack.html': { label: 'Nutrition', links: [['/pages/stack.html', 'Daily plan'], ['/pages/avoid.html', 'Ingredient guide']] },
  '/pages/avoid.html': { label: 'Nutrition', links: [['/pages/stack.html', 'Daily plan'], ['/pages/avoid.html', 'Ingredient guide']] },
  '/pages/blood.html': { label: 'Health', links: [['/pages/blood.html', 'Blood tests'], ['/pages/protocol.html', 'Blueprint']] },
  '/pages/protocol.html': { label: 'Health', links: [['/pages/blood.html', 'Blood tests'], ['/pages/protocol.html', 'Blueprint']] },
};

function renderContextNavigation() {
  const config = CONTEXT_NAV[window.location.pathname];
  const anchor = document.querySelector('main > .page-header');
  if (!config || !anchor || document.querySelector('.context-nav')) return;
  const links = config.links.map(([href, label]) => {
    const current = href === window.location.pathname;
    return `<a href="${href}" class="context-nav-link${current ? ' is-active' : ''}" data-context-link${current ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
  anchor.insertAdjacentHTML('afterend', `<nav class="context-nav" aria-label="${config.label}"><div class="section-inner context-nav-inner"><span>${config.label}</span><div>${links}</div></div></nav>`);
}

renderContextNavigation();
document.querySelectorAll('.bottom-nav').forEach((nav) => nav.setAttribute('aria-label', 'Mobile primary navigation'));
document.querySelectorAll('.bottom-nav-item.active').forEach((item) => {
  if (!item.hasAttribute('aria-current')) item.setAttribute('aria-current', new URL(item.href).pathname === window.location.pathname ? 'page' : 'location');
});

const LONG_PAGE_ROUTES = new Set(['/pages/stack.html', '/pages/avoid.html', '/pages/blood.html', '/pages/protocol.html', '/pages/workout.html', '/pages/finance.html']);
const initLongPageNavigation = () => {
  if (!LONG_PAGE_ROUTES.has(window.location.pathname)) return;
  const loadStickyPin = () => import('./components/sticky-pin.js').then(({ initStickyPin }) => queueMicrotask(() => initStickyPin()));
  // Keep the optional rail out of the critical route payload while retaining a fast first interaction.
  if (document.readyState === 'complete') setTimeout(loadStickyPin, 0);
  else window.addEventListener('load', () => setTimeout(loadStickyPin, 0), { once: true });
};
initLongPageNavigation();

document.addEventListener('click', async (event) => {
  const menuButton = event.target.closest('[data-nav-toggle]');
  if (menuButton) {
    const nav = document.querySelector('.nav');
    const open = nav.classList.toggle('nav-open');
    document.body.classList.toggle('nav-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    return;
  }
  if (!event.target.closest('.nav')) {
    const nav = document.querySelector('.nav.nav-open');
    if (nav) {
      nav.classList.remove('nav-open');
      document.body.classList.remove('nav-open');
      document.querySelector('[data-nav-toggle]')?.setAttribute('aria-expanded', 'false');
    }
  }
  const exportButton = event.target.closest('[data-export]');
  if (exportButton) {
    exportButton.disabled = true;
    try {
      const { exportData } = await import('./export.js');
      await exportData();
    } finally {
      exportButton.disabled = false;
    }
  }
});
