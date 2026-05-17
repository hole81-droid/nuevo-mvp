/**
 * @param {string} pathname
 * @param {string} [search]
 * @param {string} [hash]
 * @returns {string}
 */
export function buildLoginNextPath(pathname, search = '', hash = '') {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return '/';

  const safeSearch = search && search.startsWith('?') ? search : '';
  const safeHash = hash && hash.startsWith('#') ? hash : '';
  return `${pathname}${safeSearch}${safeHash}`;
}

/**
 * @param {string} nextPath
 * @returns {string}
 */
export function buildLoginRedirect(nextPath) {
  const safeNext = buildLoginNextPath(nextPath);
  return `/login?next=${encodeURIComponent(safeNext)}`;
}

/**
 * @param {Location} location
 * @returns {string}
 */
export function buildLoginRedirectFromLocation(location) {
  const nextPath = buildLoginNextPath(location.pathname, location.search, location.hash);
  return buildLoginRedirect(nextPath);
}
