// Resolve app routes against either a domain root or a GitHub Pages project path.
const inPagesDirectory = window.location.pathname.includes('/pages/');
export const SITE_ROOT = new URL(inPagesDirectory ? '../' : './', document.baseURI).pathname.replace(/\/?$/, '/');

export function siteHref(relativePath) {
  const url = new URL(relativePath.replace(/^\/+/, ''), new URL(SITE_ROOT, window.location.origin));
  return `${url.pathname}${url.search}${url.hash}`;
}

export function appPath(pathname = window.location.pathname) {
  const root = SITE_ROOT === '/' ? '' : SITE_ROOT.slice(0, -1);
  const relative = root && pathname.startsWith(root) ? pathname.slice(root.length) : pathname;
  return `/${relative.replace(/^\/+/, '')}` || '/';
}
