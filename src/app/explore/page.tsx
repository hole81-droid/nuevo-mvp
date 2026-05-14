import BottomNav from '@/components/layout/BottomNav';
import ExploreClient from '@/components/explore/ExploreClient';
import { createClient } from '@/lib/supabase/server';
import { mockPosts } from '@/lib/mock-data';
import { DbPostWithAuthor, mapDbPostToPost } from '@/lib/post-mapper';
import { applyExperienceMetrics, getExperienceMetrics } from '@/lib/experience-metrics';
import { applySocialMetrics, getSocialMetrics } from '@/lib/social-metrics';

export const dynamic = 'force-dynamic';

async function getExplorePosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(*)')
    .order('created_at', { ascending: false })
    .limit(80);

  if (error) return mockPosts;
  if (!data?.length) return [];

  const rows = data as DbPostWithAuthor[];
  const ids = rows.map((post) => post.id);
  const { data: remixRows } = await supabase
    .from('posts')
    .select('remix_of')
    .in('remix_of', ids);
  const remixCounts = new Map<string, number>();
  ((remixRows ?? []) as Array<{ remix_of: string | null }>).forEach((row) => {
    if (!row.remix_of) return;
    remixCounts.set(row.remix_of, (remixCounts.get(row.remix_of) ?? 0) + 1);
  });

  const posts = rows.map((post) => mapDbPostToPost(post, { remixCount: remixCounts.get(post.id) ?? 0 }));
  const postIds = posts.map((post) => post.id);
  const [experienceMetrics, socialMetrics] = await Promise.all([
    getExperienceMetrics(supabase, postIds),
    getSocialMetrics(supabase, postIds),
  ]);
  return applySocialMetrics(applyExperienceMetrics(posts, experienceMetrics), socialMetrics);
}

export default async function ExplorePage() {
  const posts = await getExplorePosts();

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <ExploreClient posts={posts} />
      <BottomNav />
    </div>
  );
}
