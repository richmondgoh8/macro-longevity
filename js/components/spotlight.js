// Pointer-only spotlight enhancement for dark cards.
// The card remains fully readable without this optional visual layer.

const clampPercent = (value) => Math.min(100, Math.max(0, value));

export function initSpotlightCards(root = document) {
  const cards = [...root.querySelectorAll('[data-spotlight-card]')];
  if (!cards.length || !window.matchMedia('(pointer: fine)').matches) return () => {};

  const rects = new Map();
  let refreshFrame = 0;

  const refreshRects = () => {
    cards.forEach((card) => rects.set(card, card.getBoundingClientRect()));
  };

  const scheduleRefresh = () => {
    if (refreshFrame) return;
    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = 0;
      refreshRects();
    });
  };

  const updatePosition = (event) => {
    if (event.pointerType === 'touch') return;
    const card = event.currentTarget;
    const rect = rects.get(card);
    if (!rect || !rect.width || !rect.height) return;
    const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);
    card.style.setProperty('--spotlight-x', `${x}%`);
    card.style.setProperty('--spotlight-y', `${y}%`);
  };

  const activate = (event) => {
    if (event.pointerType === 'touch') return;
    event.currentTarget.dataset.spotlightActive = 'true';
    updatePosition(event);
  };

  const deactivate = (event) => {
    event.currentTarget.dataset.spotlightActive = 'false';
  };

  refreshRects();
  cards.forEach((card) => {
    card.addEventListener('pointerenter', activate);
    card.addEventListener('pointermove', updatePosition);
    card.addEventListener('pointerleave', deactivate);
  });

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(refreshRects)
    : null;
  cards.forEach((card) => resizeObserver?.observe(card));
  window.addEventListener('resize', scheduleRefresh, { passive: true });
  window.addEventListener('scroll', scheduleRefresh, { passive: true });

  return () => {
    cards.forEach((card) => {
      card.removeEventListener('pointerenter', activate);
      card.removeEventListener('pointermove', updatePosition);
      card.removeEventListener('pointerleave', deactivate);
      card.removeAttribute('data-spotlight-active');
      card.style.removeProperty('--spotlight-x');
      card.style.removeProperty('--spotlight-y');
    });
    resizeObserver?.disconnect();
    window.removeEventListener('resize', scheduleRefresh);
    window.removeEventListener('scroll', scheduleRefresh);
    if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
  };
}
