export const DEFAULT_EXPLORE_CATEGORIES = [
  { slug: 'games', label: '게임', keywords: ['게임', 'game', 'play'] },
  { slug: 'quizzes', label: '퀴즈', keywords: ['퀴즈', 'quiz', 'test'] },
  { slug: 'filters', label: '필터', keywords: ['필터', 'filter', 'camera'] },
  { slug: 'music', label: '음악', keywords: ['음악', 'music', '재즈', 'audio', 'udio'], contentTypes: ['audio'] },
  { slug: 'productivity', label: '생산성', keywords: ['생산성', 'productivity', '업무', 'focus'] },
  { slug: 'weird', label: '이상한 앱', keywords: ['이상한 앱', '이상함', 'weird', 'wtf', '기괴'] },
];

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

function postSearchText(post) {
  return [
    post.title,
    post.text,
    post.author?.handle,
    post.author?.displayName,
    post.detailDescription,
    post.tool,
    ...(post.tags ?? []),
    ...(post.externalLinks ?? []).map((link) => link.label),
  ].map(normalize).join(' ');
}

export function searchPosts(posts, query) {
  const q = normalize(query);
  if (!q) return [];

  return posts.filter((post) => postSearchText(post).includes(q));
}

export function filterPostsByCategory(posts, slug) {
  const category = DEFAULT_EXPLORE_CATEGORIES.find((item) => item.slug === slug);
  if (!category) return [];

  const keywords = category.keywords.map(normalize);
  return posts.filter((post) => {
    if (category.contentTypes?.includes(post.contentType)) return true;
    const text = postSearchText(post);
    return keywords.some((keyword) => text.includes(keyword));
  });
}
