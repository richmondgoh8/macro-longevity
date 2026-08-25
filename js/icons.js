// icons.js — inline SVG icon system (zero dependency, Lucide-style, 24px, 2px stroke)
// Replaces emoji used as structural/nav/system icons. Food-item emojis remain as content.
// Usage: import { icon } from '/js/icons.js'; el.innerHTML = icon('shield', { size: 20 });

const PATHS = {
  // 4 Pillars
  shield: '<path d="M12 3l7 3v5c0 4.4-3 8.2-7 10-4-1.8-7-5.6-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  dna: '<path d="M5 3c0 6 14 6 14 12M19 3c0 6-14 6-14 12M7 5h10M7 19h10M9 8h6M9 16h6"/>',
  dumbbell: '<path d="M6.5 6.5l11 11M4 9l3-3 3 3-3 3-3-3zM20 15l-3 3-3-3 3-3 3 3zM9 4l3 3M15 20l-3-3"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-4 16-9 16z"/><path d="M4 20c4-6 7-8 12-9"/>',
  // UI / nav
  home: '<path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 14h10"/>',
  scale: '<path d="M12 3v18M5 7h14M5 7l-3 6a3 3 0 0 0 6 0L5 7zM19 7l-3 6a3 3 0 0 0 6 0l-3-6z"/>',
  heart: '<path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4 6 4c2 0 3.5 1.5 6 4 2.5-2.5 4-4 6-4 3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z"/>',
  activity: '<path d="M3 12h4l3 7 4-14 3 7h4"/>',
  pill: '<path d="M10.5 3.5l10 10a4.5 4.5 0 0 1-6.4 6.4l-10-10A4.5 4.5 0 0 1 10.5 3.5z"/><path d="M8 8l8 8"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 5 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-2 4 3 3 0 0 1-5 1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  fire: '<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3 .5 2 2 2 2 0 0-3 1-4 1-5z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-9"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  thermometer: '<path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/>',
  beaker: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  sparkles: '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14z"/>',
};

let injected = false;
function injectSprite() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  let defs = '<defs>';
  for (const [name, d] of Object.entries(PATHS)) {
    defs += `<symbol id="ic-${name}" viewBox="0 0 24 24">${d}</symbol>`;
  }
  defs += '</defs>';
  svg.innerHTML = defs;
  document.body.appendChild(svg);
}

export function icon(name, opts = {}) {
  injectSprite();
  const size = opts.size || 24;
  const cls = opts.cls ? ` ${opts.cls}` : '';
  const label = opts.label ? ` role="img" aria-label="${opts.label}"` : ' aria-hidden="true"';
  return `<svg class="icon icon-${name}${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${label}><use href="#ic-${name}"></use></svg>`;
}

export const ICON_NAMES = Object.keys(PATHS);
