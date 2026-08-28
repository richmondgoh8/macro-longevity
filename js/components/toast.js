import { icon } from './ui.js';

const TOAST_TYPES = new Set(['success', 'info', 'warning', 'error']);
const TOAST_ICON_NAMES = { success: 'check', info: 'info', warning: 'warning', error: 'error' };
const TOAST_LIMIT = 3;
const TOAST_DEFAULT_DURATION = 4500;
const TOAST_ACTION_DURATION = 9000;
let toastSequence = 0;
let toastRegion;
const toastQueue = [];
let toastStylesPromise;

function supportsPopover() {
  return typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;
}

function readTimeToken(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = value.match(/^([\d.]+)(ms|s)$/);
  if (!match) return fallback;
  const number = Number(match[1]);
  return Number.isFinite(number) ? number * (match[2] === 's' ? 1000 : 1) : fallback;
}

function ensureToastStyles() {
  if (document.querySelector('[data-ui-toast-styles]')) return Promise.resolve();
  toastStylesPromise ||= new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/toast.css';
    link.dataset.uiToastStyles = '';
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', resolve, { once: true });
    document.head.append(link);
  });
  return toastStylesPromise;
}

function ensureToastRegion() {
  if (toastRegion?.isConnected) return toastRegion;
  toastRegion = document.querySelector('[data-ui-toast]');
  if (toastRegion) return toastRegion;
  toastRegion = document.createElement('div');
  toastRegion.className = 'ui-toast';
  toastRegion.dataset.uiToast = '';
  toastRegion.setAttribute('role', 'region');
  toastRegion.setAttribute('aria-label', 'Notifications');
  toastRegion.setAttribute('aria-live', 'polite');
  toastRegion.setAttribute('aria-atomic', 'false');
  document.body.append(toastRegion);
  return toastRegion;
}

function scheduleToast(toast) {
  if (toast.persistent || toast.remaining <= 0) return;
  toast.deadline = Date.now() + toast.remaining;
  toast.timer = window.setTimeout(() => dismissToast(toast), toast.remaining);
}

function pauseToast(toast) {
  if (toast.persistent || toast.paused) return;
  toast.paused = true;
  window.clearTimeout(toast.timer);
  toast.remaining = Math.max(0, toast.deadline - Date.now());
}

function resumeToast(toast) {
  if (toast.persistent || !toast.paused) return;
  toast.paused = false;
  if (toast.remaining <= 0) dismissToast(toast);
  else scheduleToast(toast);
}

function removeToast(toast) {
  const element = toast.element;
  const focusWasInside = Boolean(element?.contains(document.activeElement));
  toast.status = 'dismissed';
  window.clearTimeout(toast.timer);
  if (!element) {
    const index = toastQueue.indexOf(toast);
    if (index >= 0) toastQueue.splice(index, 1);
    renderToastQueue();
    return;
  }
  element.classList.remove('is-visible');
  element.classList.add('is-closing');
  if (supportsPopover() && typeof element.hidePopover === 'function' && element.matches(':popover-open')) element.hidePopover();
  window.setTimeout(() => {
    element.remove();
    toast.element = null;
    const index = toastQueue.indexOf(toast);
    if (index >= 0) toastQueue.splice(index, 1);
    renderToastQueue();
    if (focusWasInside) toastRegion?.querySelector('.ui-toast-item.is-visible button')?.focus({ preventScroll: true });
  }, readTimeToken('--toast-exit-duration', 120));
}

function dismissToast(toast) {
  if (!toast || toast.status === 'dismissed' || toast.status === 'closing') return;
  if (!toast.element) {
    removeToast(toast);
    return;
  }
  toast.status = 'closing';
  removeToast(toast);
}

function createToastElement(toast) {
  const element = document.createElement('article');
  element.className = 'ui-toast-item';
  element.dataset.uiToastItem = '';
  element.dataset.uiToastType = toast.type;
  element.id = `ui-toast-${toast.id}`;
  element.setAttribute('role', toast.type === 'error' ? 'alert' : 'status');
  if (supportsPopover()) element.setAttribute('popover', 'manual');

  const iconWrap = document.createElement('span');
  iconWrap.className = 'ui-toast-icon';
  iconWrap.innerHTML = icon(TOAST_ICON_NAMES[toast.type]);
  iconWrap.setAttribute('aria-hidden', 'true');

  const message = document.createElement('p');
  message.className = 'ui-toast-message';
  message.textContent = toast.message;

  const content = document.createElement('div');
  content.className = 'ui-toast-content';
  content.append(message);

  if (toast.action) {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'ui-toast-action';
    action.dataset.uiToastAction = '';
    action.textContent = toast.action.label;
    action.addEventListener('click', () => {
      try { toast.action.onClick(); } finally { dismissToast(toast); }
    });
    content.append(action);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'ui-toast-close';
  close.dataset.uiToastDismiss = '';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.innerHTML = icon('close');
  close.addEventListener('click', () => dismissToast(toast));
  if (supportsPopover()) {
    close.setAttribute('popovertarget', element.id);
    close.setAttribute('popovertargetaction', 'hide');
  }

  element.append(iconWrap, content, close);
  element.addEventListener('pointerenter', () => pauseToast(toast));
  element.addEventListener('pointerleave', () => resumeToast(toast));
  element.addEventListener('focusin', () => pauseToast(toast));
  element.addEventListener('focusout', (event) => {
    if (!element.contains(event.relatedTarget)) resumeToast(toast);
  });
  return element;
}

function positionToastStack() {
  if (!toastRegion || !supportsPopover()) return;
  const items = [...toastRegion.querySelectorAll('.ui-toast-item.is-visible')]
    .filter((item) => item.matches(':popover-open') || item.hasAttribute('data-ui-popover-fallback'));
  if (!items.length) return;
  let offset = 0;
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--toast-stack-gap')) || 8;
  items.forEach((item) => {
    item.style.setProperty('--ui-toast-offset', `${offset}px`);
    offset += item.getBoundingClientRect().height + gap;
  });
}

function renderToastQueue() {
  const region = ensureToastRegion();
  const active = toastQueue.filter((toast) => toast.status !== 'dismissed' && toast.status !== 'closing');
  const visible = active.slice(0, TOAST_LIMIT);
  active.forEach((toast, index) => {
    if (index >= TOAST_LIMIT) {
      toast.status = 'queued';
      window.clearTimeout(toast.timer);
      if (toast.element) {
        if (supportsPopover() && typeof toast.element.hidePopover === 'function' && toast.element.matches(':popover-open')) toast.element.hidePopover();
        toast.element.remove();
        toast.element = null;
      }
      return;
    }
    toast.status = 'visible';
    if (!toast.element) {
      toast.element = createToastElement(toast);
      region.prepend(toast.element);
      requestAnimationFrame(() => {
        if (toast.status !== 'visible') return;
        if (typeof toast.element.showPopover === 'function') {
          try { toast.element.showPopover(); } catch { toast.element.dataset.uiPopoverFallback = ''; }
        }
        toast.element.classList.add('is-visible');
        positionToastStack();
      });
      scheduleToast(toast);
    }
  });
  region.classList.toggle('is-visible', visible.length > 0);
  requestAnimationFrame(positionToastStack);
}

export async function showToast(message, options = {}) {
  await ensureToastStyles();
  const safeOptions = options || {};
  const type = TOAST_TYPES.has(safeOptions.type) ? safeOptions.type : 'info';
  const action = safeOptions.action && typeof safeOptions.action.onClick === 'function' && safeOptions.action.label
    ? { label: String(safeOptions.action.label), onClick: safeOptions.action.onClick }
    : null;
  const persistent = typeof safeOptions.persistent === 'boolean' ? safeOptions.persistent : type === 'error';
  const fallbackDuration = action ? TOAST_ACTION_DURATION : TOAST_DEFAULT_DURATION;
  const duration = Number.isFinite(safeOptions.duration) && safeOptions.duration > 0
    ? safeOptions.duration
    : readTimeToken(action ? '--toast-action-duration' : '--toast-duration', fallbackDuration);
  const toast = {
    id: ++toastSequence,
    message: String(message ?? ''),
    type,
    action,
    persistent,
    remaining: duration,
    deadline: 0,
    timer: null,
    paused: false,
    status: 'queued',
    element: null,
  };
  toastQueue.unshift(toast);
  renderToastQueue();
  return { dismiss: () => dismissToast(toast) };
}
