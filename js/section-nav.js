const shortcuts = [...document.querySelectorAll('.section-links a[href^="#"]')]
  .map((link) => ({
    link,
    target: document.getElementById(link.hash.slice(1)),
  }))
  .filter(({ target }) => target);
const root = document.documentElement;
let positions = [];
let scrollPadding = 0;
let scrollLimit = 0;
let current;
let frame;
let pendingLink;
let pendingTimer;

function setCurrent(next) {
  if (next === current) return;
  current?.removeAttribute("aria-current");
  next?.setAttribute("aria-current", "location");
  current = next;
}

function clearPending() {
  if (!pendingLink) return;
  pendingLink = undefined;
  clearTimeout(pendingTimer);
  pendingTimer = undefined;
}

function targetScrollY(link) {
  const match = positions.find((entry) => entry.link === link);
  return match
    ? Math.min(Math.max(0, match.top - scrollPadding), scrollLimit)
    : null;
}

function updateCurrent() {
  frame = undefined;
  const y = window.scrollY;
  if (pendingLink) {
    const dest = targetScrollY(pendingLink);
    if (dest !== null && Math.abs(y - dest) <= 4) clearPending();
    else return;
  }
  const readingLine = y + Math.min(160, window.innerHeight / 4);
  // Prefer the anchor when multiple sections share a row or a jump is clamped at the bottom.
  const anchored = positions.find(
    ({ link, top }) =>
      link.hash === location.hash &&
      Math.abs(y - Math.min(Math.max(0, top - scrollPadding), scrollLimit)) <=
        4,
  );
  const visible =
    scrollLimit > 0 && y >= scrollLimit - 2
      ? positions.at(-1)
      : positions.findLast(({ top }) => top <= readingLine);
  setCurrent((anchored ?? visible)?.link);
}

function queueUpdate() {
  if (pendingLink) {
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
      clearPending();
      queueUpdate();
    }, 250);
  }
  frame ??= requestAnimationFrame(updateCurrent);
}

function measure() {
  const y = window.scrollY;
  positions = shortcuts
    .map(({ target, link }) => ({
      link,
      top: target.getBoundingClientRect().top + y,
    }))
    .sort((first, second) => first.top - second.top);
  scrollPadding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  scrollLimit = root.scrollHeight - root.clientHeight;
  queueUpdate();
}

const layout = new ResizeObserver(measure);
layout.observe(document.querySelector("main"));
for (const { link, target } of shortcuts) {
  if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
  layout.observe(target.closest("section, article") ?? target);
  link.addEventListener("click", () => {
    clearPending();
    pendingLink = link;
    setCurrent(link);
    pendingTimer = setTimeout(() => {
      clearPending();
      queueUpdate();
    }, 1000);
  });
}
const cancelPending = () => {
  if (!pendingLink) return;
  clearPending();
  queueUpdate();
};
window.addEventListener("scrollend", cancelPending, { passive: true });
window.addEventListener("wheel", cancelPending, { passive: true });
window.addEventListener("touchstart", cancelPending, { passive: true });
window.addEventListener("resize", measure);
window.addEventListener("scroll", queueUpdate, { passive: true });
window.addEventListener("hashchange", queueUpdate);
