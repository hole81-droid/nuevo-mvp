import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';
import type { Post } from './types';
import type { ReactionKey } from './social';
import { EMPTY_REACTION_COUNTS } from './social';

export type SocialMetric = {
  replies: number;
  reactions: Record<ReactionKey, number>;
};

type CommentLike = {
  post_id: string;
};

type ReactionLike = {
  post_id: string;
  reaction: ReactionKey;
};

export async function getSocialMetrics(
  supabase: SupabaseClient<Database>,
  postIds: string[],
): Promise<Map<string, SocialMetric>> {
  const ids = [...new Set(postIds.filter(Boolean))];
  const metrics = new Map<string, SocialMetric>();
  if (!ids.length) return metrics;

  const ensureMetric = (postId: string) => {
    const current = metrics.get(postId);
    if (current) return current;

    const next: SocialMetric = {
      replies: 0,
      reactions: { ...EMPTY_REACTION_COUNTS },
    };
    metrics.set(postId, next);
    return next;
  };

  const [{ data: comments }, { data: reactions }] = await Promise.all([
    supabase
      .from('comments')
      .select('post_id')
      .in('post_id', ids),
    supabase
      .from('post_reactions')
      .select('post_id,reaction')
      .in('post_id', ids),
  ]);

  ((comments ?? []) as CommentLike[]).forEach((row) => {
    ensureMetric(row.post_id).replies += 1;
  });

  ((reactions ?? []) as ReactionLike[]).forEach((row) => {
    ensureMetric(row.post_id).reactions[row.reaction] += 1;
  });

  return metrics;
}

export function applySocialMetrics<T extends Post>(
  posts: T[],
  metrics: Map<string, SocialMetric>,
): T[] {
  return posts.map((post) => {
    const metric = metrics.get(post.id);
    if (!metric) return post;

    return {
      ...post,
      stats: {
        ...post.stats,
        replies: Math.max(post.stats.replies, metric.replies),
      },
      reactions: {
        ...post.reactions,
        ...metric.reactions,
      },
    };
  });
}
