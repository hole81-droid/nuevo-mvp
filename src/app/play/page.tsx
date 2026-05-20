import { redirect } from 'next/navigation';
import { mockPosts } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { DbPostWithAuthor, mapDbPostToPost } from '@/lib/post-mapper';

export const dynamic = 'force-dynamic';

export default async function PlayPage() {
  // Try DB first: most recent interactive post
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('posts')
      .select('*, author:users(*)')
      .eq('content_type', 'interactive')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const post = mapDbPostToPost(data as DbPostWithAuthor);
      redirect(`/play/${post.id}?autoplay=true`);
    }
  } catch {
    // Supabase not configured — fall through to mock
  }

  // Fallback: first interactive mock post
  const first = mockPosts.find((p) => p.contentType === 'interactive');
  if (first) redirect(`/play/${first.id}?autoplay=true`);

  // No playable posts at all
  redirect('/');
}
