import type { Post } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

export type ExperienceMetric = {
  sessions: number;
  minutes: number;
};

type ExperienceEventLike = {
  post_id: string;
  duration_seconds: number | null;
};

export async function getExperienceMetrics(
  supabase: SupabaseClient<Database>,
  postIds: string[],
): Promise<Map<string, ExperienceMetric>> {
  const ids = [...new Set(postIds.filter(Boolean))];
  const metrics = new Map<string, ExperienceMetric>();
  if (!ids.length) return metrics;

  const { data, error }: { data: ExperienceEventLike[] | null; error: unknown } = await supabase
    .from('experience_events')
    .select('post_id,duration_seconds')
    .in('post_id', ids);

  if (error || !data) return metrics;

  for (const row of data) {
    const current = metrics.get(row.post_id) ?? { sessions: 0, minutes: 0 };
    current.sessions += 1;
    current.minutes += Math.max(0, Math.ceil((row.duration_seconds ?? 0) / 60));
    metrics.set(row.post_id, current);
  }

  return metrics;
}

export function applyExperienceMetrics<T extends Post>(
  posts: T[],
  metrics: Map<string, ExperienceMetric>,
): T[] {
  return posts.map((post) => {
    const metric = metrics.get(post.id);
    if (!metric) return post;

    return {
      ...post,
      stats: {
        ...post.stats,
        experienceSessions: metric.sessions,
        experienceMinutes: metric.minutes,
        views: Math.max(post.stats.views, metric.sessions),
      },
    };
  });
}
