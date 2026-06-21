/**
 * CardSwipe — viewport-filling swipeable card stack
 * Zero-dependency, native scroll-snap, isolated state
 */
const CardSwipe = (function () {
  'use strict';

  const instances = new Map();

  function init(containerId, slides, options) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const opts = Object.assign({
      dotSize: 8,
      activeDotColor: 'var(--color-primary)',
      inactiveDotColor: 'var(--color-border)',
      expandLabel: 'Show Details',
      collapseLabel: 'Hide Details',
    }, options);

    const trackId = containerId + '-track';
    const dotsId = containerId + '-dots';

    container.innerHTML = `
      <div class="card-swipe" id="${containerId}-swipe">
        <div class="card-swipe-track" id="${trackId}">
          ${slides.map((slide, i) => `
            <div class="card-swipe-slide" data-index="${i}">
              <div class="card-swipe-inner">
                ${slide}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="card-swipe-dots" id="${dotsId}">
          ${slides.map((_, i) => `
            <button class="card-swipe-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>
          `).join('')}
        </div>
      </div>
    `;

    const track = document.getElementById(trackId);
    const dotsContainer = document.getElementById(dotsId);
    let currentIndex = 0;
    let raf = null;

    function updateDots(index) {
      if (index === currentIndex) return;
      currentIndex = index;
      const dots = dotsContainer.querySelectorAll('.card-swipe-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      if (opts.onSlideChange) opts.onSlideChange(index);
    }

    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slideWidth = track.scrollWidth / slides.length;
        const index = Math.round(track.scrollLeft / slideWidth);
        updateDots(Math.min(index, slides.length - 1));
      });
    }

    track.addEventListener('scroll', onScroll, { passive: true });

    dotsContainer.addEventListener('click', (e) => {
      const dot = e.target.closest('.card-swipe-dot');
      if (!dot) return;
      const idx = parseInt(dot.dataset.index, 10);
      const slideWidth = track.scrollWidth / slides.length;
      track.scrollTo({ left: slideWidth * idx, behavior: 'smooth' });
    });

    // Expand/collapse handlers (event delegation)
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.card-swipe-expand-btn');
      if (!btn) return;
      const slide = btn.closest('.card-swipe-slide');
      if (!slide) return;
      const isExpanded = slide.classList.toggle('is-expanded');
      btn.textContent = isExpanded ? opts.collapseLabel : opts.expandLabel;
      btn.setAttribute('aria-expanded', String(isExpanded));
    });

    const instance = {
      container,
      track,
      goTo(index) {
        const slideWidth = track.scrollWidth / slides.length;
        track.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
      },
      destroy() {
        track.removeEventListener('scroll', onScroll);
        if (raf) cancelAnimationFrame(raf);
        instances.delete(containerId);
      }
    };

    instances.set(containerId, instance);
    return instance;
  }

  return { init };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardSwipe;
}
