const RUNNABLE_TYPES = new Set(['interactive', 'audio']);
const FALLBACK_LINKS = [
  { href: '/', label: '피드로 돌아가기' },
  { href: '/explore', label: '탐색에서 더 보기' },
];

export function isPlayModeRequested(searchParams = {}) {
  const mode = firstValue(searchParams.mode);
  const autoplay = firstValue(searchParams.autoplay);
  return mode === 'play' || autoplay === 'true';
}

export function buildPlayModePath(postId, options = {}) {
  const params = new URLSearchParams();
  params.set('mode', 'play');
  params.set('autoplay', 'true');

  if (options.source) {
    params.set('utm_source', options.source);
  }

  return `/post/${encodeURIComponent(postId)}?${params.toString()}`;
}

export function getNextPlayablePost(currentPost, posts = []) {
  return posts.find((post) => (
    post.id !== currentPost?.id
    && RUNNABLE_TYPES.has(post.contentType)
  )) ?? null;
}

export function getPlayModeContinuation(currentPost, posts = []) {
  const nextPost = getNextPlayablePost(currentPost, posts);

  if (nextPost) {
    return {
      kind: 'next',
      post: nextPost,
      links: [],
    };
  }

  return {
    kind: 'fallback',
    post: null,
    links: FALLBACK_LINKS,
  };
}

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}
