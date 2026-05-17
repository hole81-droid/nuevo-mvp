const DEFAULT_LIMIT = 5;
const RUNNABLE_TYPES = new Set(['interactive', 'audio']);

function byMetric(metric) {
  return (a, b) => (b.stats?.[metric] ?? 0) - (a.stats?.[metric] ?? 0);
}

function playable(posts) {
  return posts.filter((post) => RUNNABLE_TYPES.has(post.contentType));
}

export function getDailyPlayablePosts(posts, limit = DEFAULT_LIMIT) {
  return [...playable(posts)]
    .sort(byMetric('experienceSessions'))
    .slice(0, limit);
}

export function getMostRemixedPosts(posts, limit = DEFAULT_LIMIT) {
  return [...posts]
    .filter((post) => (post.stats?.reposts ?? 0) > 0)
    .sort(byMetric('reposts'))
    .slice(0, limit);
}

export function getLongestPlayedPosts(posts, limit = DEFAULT_LIMIT) {
  return [...playable(posts)]
    .filter((post) => (post.stats?.experienceMinutes ?? 0) > 0)
    .sort(byMetric('experienceMinutes'))
    .slice(0, limit);
}

export function getSimilarPosts(currentPost, posts, limit = 4) {
  const tags = new Set(currentPost?.tags ?? []);
  if (!tags.size) return [];

  return posts
    .filter((post) => post.id !== currentPost.id)
    .map((post) => ({
      post,
      score: (post.tags ?? []).filter((tag) => tags.has(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (b.post.stats?.experienceSessions ?? 0) - (a.post.stats?.experienceSessions ?? 0))
    .slice(0, limit)
    .map(({ post }) => post);
}
