const TRUE_VALUES = new Set(['true', '1']);

/**
 * @param {URLSearchParams | Record<string, string | string[] | undefined>} searchParams
 * @returns {boolean}
 */
export function isAutoplayRequested(searchParams) {
  const value = searchParams instanceof URLSearchParams
    ? searchParams.get('autoplay')
    : searchParams.autoplay;

  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === 'string' && TRUE_VALUES.has(normalized.toLowerCase());
}

/**
 * @param {string} postId
 * @param {{ origin?: string; autoplay?: boolean; source?: string }} [options]
 * @returns {string}
 */
export function buildPostDeepLink(postId, options = {}) {
  const origin = options.origin?.replace(/\/$/, '') ?? '';
  const path = `${origin}/post/${encodeURIComponent(postId)}`;
  const params = new URLSearchParams();

  if (options.autoplay) params.set('autoplay', 'true');
  if (options.source) params.set('utm_source', options.source);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
