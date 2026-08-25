// theme.js — dark/light theme toggle, persisted in localStorage.
// Injected into every .nav-inner by the pages that load export.js.
// Respects an explicit [data-theme] choice; otherwise follows prefers-color-scheme.
import { icon } from './icons.js';

const STORAGE_KEY = 'ml-theme';

function currentTheme() {
  return document.documentElement.getAttribute('data-theme');
}

function applyTheme(theme) {
  if (theme === 'dark' || theme === 'light') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function injectToggle() {
  // Avoid duplicates
  if (document.querySelector('[data-theme-toggle]')) return;
  const navInner = document.querySelector('.nav-inner');
  if (!navInner) return;
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.setAttribute('data-theme-toggle', '');
  btn.setAttribute('aria-label', 'Toggle dark mode');
  const sync = () => {
    const isDark = currentTheme()
      ? currentTheme() === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    btn.innerHTML = isDark ? icon('sun', { size: 20 }) : icon('moon', { size: 20 });
    btn.setAttribute('aria-pressed', String(isDark));
  };
  btn.addEventListener('click', () => {
    const isDark = currentTheme()
      ? currentTheme() === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    sync();
  });
  // place before the nav links / toggle group, after logo
  navInner.appendChild(btn);
  sync();
}

function replaceLogoGlyph() {
  // '⟁' (U+27C1) is missing from the self-hosted latin font subsets and renders
  // as tofu on most platforms — swap it for the inline SVG mark.
  document.querySelectorAll('.nav-logo-icon, .footer-logo').forEach((el) => {
    if (el.tagName !== 'IMG' && (el.textContent.trim() === '⟁' || !el.querySelector('svg'))) {
      el.innerHTML = icon('dna', { size: 22 });
    }
  });
}

function init() {
  // Restore saved choice
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') applyTheme(saved);
  } catch (e) {}
  injectToggle();
  replaceLogoGlyph();
  // React to OS changes while no explicit choice is set
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!currentTheme()) injectToggle();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
