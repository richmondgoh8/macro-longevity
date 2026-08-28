const HOVER_DELAY = 300;
const VIEWPORT_INSET = 8;
const tooltipStates = new WeakMap();
let tooltipSequence = 0;
let activeTooltip = null;
let initialized = false;

function triggerPair(target) {
  const element = target instanceof Element ? target : target?.parentElement;
  const trigger = element?.closest?.('[data-tooltip-trigger]');
  if (!trigger) return null;
  const tooltip = trigger.querySelector('.ui-tooltip');
  if (!tooltip || !tooltip.textContent.trim()) return null;
  return { trigger, tooltip };
}

function stateFor(trigger) {
  let state = tooltipStates.get(trigger);
  if (!state) {
    state = { pointerInside: false, focusInside: false, suppressed: false, timer: null, tooltipId: null, ownsTooltipId: false };
    tooltipStates.set(trigger, state);
  }
  return state;
}

function supportsFinePointer() {
  return window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? true;
}

function clearTimer(state) {
  if (state.timer) window.clearTimeout(state.timer);
  state.timer = null;
}

function addDescription(trigger, tooltip, state) {
  if (!tooltip.id) tooltip.id = `ui-tooltip-${++tooltipSequence}`;
  state.tooltipId = tooltip.id;
  const ids = new Set((trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  state.ownsTooltipId = !ids.has(tooltip.id);
  ids.add(tooltip.id);
  trigger.setAttribute('aria-describedby', [...ids].join(' '));
}

function removeDescription(trigger, state) {
  if (!state.tooltipId || !state.ownsTooltipId) {
    state.tooltipId = null;
    state.ownsTooltipId = false;
    return;
  }
  const ids = (trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== state.tooltipId);
  if (ids.length) trigger.setAttribute('aria-describedby', ids.join(' '));
  else trigger.removeAttribute('aria-describedby');
  state.tooltipId = null;
  state.ownsTooltipId = false;
}

function positionTooltip(trigger, tooltip) {
  const triggerRect = trigger.getBoundingClientRect();
  tooltip.dataset.tooltipPlacement = 'top';
  tooltip.dataset.tooltipAlign = 'end';
  const tooltipRect = tooltip.getBoundingClientRect();
  if (tooltipRect.top < VIEWPORT_INSET && triggerRect.bottom + tooltipRect.height + VIEWPORT_INSET <= window.innerHeight) {
    tooltip.dataset.tooltipPlacement = 'bottom';
  }
  if (tooltipRect.left < VIEWPORT_INSET) tooltip.dataset.tooltipAlign = 'start';
  else if (tooltipRect.right > window.innerWidth - VIEWPORT_INSET) tooltip.dataset.tooltipAlign = 'end';
}

function hideTooltip(trigger, { suppress = false } = {}) {
  const state = tooltipStates.get(trigger);
  if (!state) return;
  clearTimer(state);
  state.suppressed = suppress;
  const tooltip = trigger.querySelector('.ui-tooltip');
  if (tooltip) tooltip.removeAttribute('data-tooltip-open');
  removeDescription(trigger, state);
  if (activeTooltip?.trigger === trigger) activeTooltip = null;
}

function showTooltip(trigger) {
  const pair = triggerPair(trigger);
  if (!pair) return;
  const { tooltip } = pair;
  const state = stateFor(trigger);
  clearTimer(state);
  state.suppressed = false;
  if (activeTooltip && activeTooltip.trigger !== trigger) hideTooltip(activeTooltip.trigger);
  addDescription(trigger, tooltip, state);
  tooltip.dataset.tooltipOpen = 'true';
  activeTooltip = { trigger, tooltip };
  requestAnimationFrame(() => {
    if (activeTooltip?.trigger === trigger && tooltip.dataset.tooltipOpen === 'true') positionTooltip(trigger, tooltip);
  });
}

function scheduleTooltip(trigger, immediate = false, delay = HOVER_DELAY) {
  const state = stateFor(trigger);
  clearTimer(state);
  if (state.suppressed) return;
  if (immediate) {
    showTooltip(trigger);
    return;
  }
  state.timer = window.setTimeout(() => {
    state.timer = null;
    if (state.pointerInside && !state.suppressed) showTooltip(trigger);
  }, delay);
}

function handlePointerOver(event) {
  if (event.pointerType === 'touch' || !supportsFinePointer()) return;
  const pair = triggerPair(event.target);
  if (!pair || (event.relatedTarget && pair.trigger.contains(event.relatedTarget))) return;
  const state = stateFor(pair.trigger);
  state.pointerInside = true;
  state.suppressed = false;
  scheduleTooltip(pair.trigger);
}

function handlePointerOut(event) {
  const pair = triggerPair(event.target);
  if (!pair || (event.relatedTarget && pair.trigger.contains(event.relatedTarget))) return;
  const state = stateFor(pair.trigger);
  state.pointerInside = false;
  state.suppressed = false;
  clearTimer(state);
  if (!state.focusInside) hideTooltip(pair.trigger);
}

function handleFocusIn(event) {
  const pair = triggerPair(event.target);
  if (!pair) return;
  const state = stateFor(pair.trigger);
  state.focusInside = true;
  state.suppressed = false;
  scheduleTooltip(pair.trigger, true);
}

function handleFocusOut(event) {
  const pair = triggerPair(event.target);
  if (!pair || (event.relatedTarget && pair.trigger.contains(event.relatedTarget))) return;
  const state = stateFor(pair.trigger);
  state.focusInside = false;
  if (!state.pointerInside) hideTooltip(pair.trigger);
}

function handleKeydown(event) {
  if (event.key !== 'Escape' || !activeTooltip) return;
  hideTooltip(activeTooltip.trigger, { suppress: true });
  event.preventDefault();
  event.stopPropagation();
}

function repositionActiveTooltip() {
  if (activeTooltip) positionTooltip(activeTooltip.trigger, activeTooltip.tooltip);
}

export function initTooltips(initial = {}) {
  if (initialized) return;
  initialized = true;
  document.documentElement.dataset.tooltipReady = '';
  document.addEventListener('pointerover', handlePointerOver);
  document.addEventListener('pointerout', handlePointerOut);
  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', handleFocusOut);
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', repositionActiveTooltip, { passive: true });

  const initialPair = triggerPair(initial.target);
  if (initialPair && initial.target?.isConnected) {
    const state = stateFor(initialPair.trigger);
    if (initial.type === 'pointer') {
      state.pointerInside = true;
      scheduleTooltip(initialPair.trigger, false, Math.max(0, HOVER_DELAY - (performance.now() - (initial.at || performance.now()))));
    } else if (document.activeElement === initialPair.trigger) {
      state.focusInside = true;
      scheduleTooltip(initialPair.trigger, true);
    }
  }
}
