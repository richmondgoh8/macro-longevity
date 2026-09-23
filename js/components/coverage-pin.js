// Pin the single coverage surface to the viewport, never a short grid ancestor.
export function pinCoverage(root) {
  const slot = root.querySelector('[data-coverage-slot]');
  const bar = slot?.querySelector('[data-coverage-bar]');
  const header = document.querySelector('.nav');
  if (!bar || !header) return () => {};
  let observer;
  const measure = () => {
    const headerHeight = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    bar.style.setProperty('--coverage-left', `${slot.getBoundingClientRect().left}px`);
    bar.style.setProperty('--coverage-width', `${slot.clientWidth}px`);
    bar.classList.remove('is-compact');
    const expandedHeight = bar.scrollHeight;
    bar.classList.toggle('is-compact', headerHeight + expandedHeight > window.innerHeight * .4);
    bar.classList.toggle('is-pinned', slot.getBoundingClientRect().top < headerHeight);
    slot.style.minHeight = `${bar.getBoundingClientRect().height}px`;
    document.documentElement.style.setProperty('--coverage-height', `${bar.getBoundingClientRect().height}px`);
    observer?.disconnect();
    observer = new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-pinned', !entry.isIntersecting && entry.boundingClientRect.top < headerHeight);
    }, { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 });
    observer.observe(slot.querySelector('[data-coverage-sentinel]'));
  };
  const resize = new ResizeObserver(measure);
  resize.observe(slot);
  resize.observe(header);
  measure();
  window.addEventListener('resize', measure);
  return () => {
    observer?.disconnect();
    resize.disconnect();
    window.removeEventListener('resize', measure);
    document.documentElement.style.removeProperty('--coverage-height');
  };
}
