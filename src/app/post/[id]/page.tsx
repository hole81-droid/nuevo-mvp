import Link from 'next/link';
import { mockPosts } from '@/lib/mock-data';
import BottomNav from '@/components/layout/BottomNav';
import { notFound } from 'next/navigation';
import PostDetailClient from '@/components/post/PostDetailClient';
import { createClient } from '@/lib/supabase/server';
import { DbPostWithAuthor, mapDbPostToPost } from '@/lib/post-mapper';
import { applyExperienceMetrics, getExperienceMetrics } from '@/lib/experience-metrics';
import { applySocialMetrics, getSocialMetrics } from '@/lib/social-metrics';
import { isUuid } from '@/lib/social';
import type { Post } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

async function getPost(id: string): Promise<Post | null> {
  const mockPost = mockPosts.find((p) => p.id === id);
  if (mockPost) return mockPost;
  if (!isUuid(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  const { count: remixCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('remix_of', id);

  const post = mapDbPostToPost(data as DbPostWithAuthor, { remixCount: remixCount ?? 0 });
  const [experienceMetrics, socialMetrics] = await Promise.all([
    getExperienceMetrics(supabase, [post.id]),
    getSocialMetrics(supabase, [post.id]),
  ]);

  return applySocialMetrics(applyExperienceMetrics([post], experienceMetrics), socialMetrics)[0] ?? post;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-[17px] font-bold text-gray-900">작품</span>
      </header>

      <PostDetailClient post={post} />

      <BottomNav />
    </div>
  );
}
