const TRUE_VALUES = new Set(['true', '1']);
const SHARE_COPY = {
  instagram: ({ title, handle }) => `@${handle}의 "${title}" 앱을 바로 실행해보세요. nuevo 링크에서 탭하면 열려요.`,
  tiktok: ({ title, handle }) => `TikTok에서 본 @${handle}의 "${title}" 앱, nuevo에서 바로 플레이해보세요.`,
  youtube: ({ title, handle }) => `YouTube 설명란에서 바로 실행: @${handle}의 "${title}" nuevo 앱`,
  reddit: ({ title, handle }) => `I found @${handle}'s "${title}" interactive app on nuevo. Try it and remix it.`,
};

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
  const path = options.path
    ? `${origin}${options.path.startsWith('/') ? options.path : `/${options.path}`}`
    : `${origin}/post/${encodeURIComponent(postId)}`;
  const params = new URLSearchParams();

  if (options.autoplay) params.set('autoplay', 'true');
  if (options.source) params.set('utm_source', options.source);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function slugifyTitle(title) {
  const normalized = String(title ?? '')
    .toLowerCase()
    .replace(/서울/g, 'seoul')
    .replace(/2호선/g, '2')
    .replace(/역/g, '')
    .replace(/판타지/g, 'fantasy')
    .replace(/세계/g, '')
    .replace(/배치/g, '')
    .replace(/퀴즈/g, 'quiz')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized
    .split('-')
    .filter(Boolean)
    .slice(0, 4)
    .join('-') || 'app';
}

/**
 * @param {{ postId: string; handle: string; title: string }} post
 */
export function buildCreatorPostPath(post) {
  const handle = String(post.handle ?? '').replace(/^@/, '');
  return `/@${encodeURIComponent(handle)}/${slugifyTitle(post.title)}--${encodeURIComponent(post.postId)}`;
}

export function extractPostIdFromCreatorSlug(slug) {
  const text = String(slug ?? '');
  if (text.includes('--')) {
    return decodeURIComponent(text.split('--').pop() ?? '');
  }
  const parts = text.split('-').filter(Boolean);
  if (parts.length >= 2) {
    const maybeUuid = parts.slice(-5).join('-');
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(maybeUuid)) {
      return decodeURIComponent(maybeUuid);
    }
  }
  return decodeURIComponent(parts.at(-1) ?? '');
}

export function getShareCopy(channel, post) {
  const key = String(channel ?? '').toLowerCase();
  const copy = SHARE_COPY[key] ?? SHARE_COPY.instagram;
  return copy(post);
}
