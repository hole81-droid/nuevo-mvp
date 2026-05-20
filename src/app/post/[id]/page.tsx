import type { Metadata } from 'next';
import { mockPosts } from '@/lib/mock-data';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/layout/BottomNav';
import { notFound, redirect } from 'next/navigation';
import PostDetailClient from '@/components/post/PostDetailClient';
import { createClient } from '@/lib/supabase/server';
import { DbPostWithAuthor, mapDbPostToPost } from '@/lib/post-mapper';
import { applyExperienceMetrics, getExperienceMetrics } from '@/lib/experience-metrics';
import { applySocialMetrics, getSocialMetrics } from '@/lib/social-metrics';
import { isUuid } from '@/lib/social';
import { isAutoplayRequested } from '@/lib/deep-link';
import { getSimilarPosts } from '@/lib/play-retention';
import { isPlayModeRequested } from '@/lib/play-mode';
import { buildPlayShellPath } from '@/lib/play-shell';
import type { Post } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) {
    return {
      title: 'nuevo',
      description: 'AI 앱을 바로 실행하고 리믹스하는 피드',
    };
  }

  const title = `${post.title} | nuevo`;
  const description = post.text || `${post.author.displayName}의 AI 앱을 바로 실행해보세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{
        url: '/nuevo-og.svg',
        width: 1200,
        height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/nuevo-og.svg'],
    },
  };
}

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

async function getRelatedPosts(post: Post): Promise<Post[]> {
  const tags = post.tags ?? [];
  if (!tags.length) return [];

  const mockRelated = mockPosts
    .filter((candidate) => candidate.id !== post.id);

  if (!isUuid(post.id)) return getSimilarPosts(post, mockRelated);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(*)')
    .overlaps('tags', tags)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error || !data?.length) return getSimilarPosts(post, mockRelated);

  return getSimilarPosts(post, (data as DbPostWithAuthor[]).map((row) => mapDbPostToPost(row)));
}

async function getRemixPosts(post: Post): Promise<Post[]> {
  const mockRemixes = mockPosts
    .filter((candidate) => candidate.remixOf === post.id)
    .slice(0, 6);

  if (!isUuid(post.id)) return mockRemixes;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(*)')
    .eq('remix_of', post.id)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !data?.length) return mockRemixes;

  return (data as DbPostWithAuthor[]).map((row) => mapDbPostToPost(row));
}

export default async function PostDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const post = await getPost(id);
  if (!post) notFound();
  const autoplay = isAutoplayRequested(resolvedSearchParams);

  // External autoplay entries use the full-screen Play Shell
  if (autoplay && post.contentType === 'interactive') {
    const source = typeof resolvedSearchParams.utm_source === 'string'
      ? resolvedSearchParams.utm_source
      : typeof resolvedSearchParams.source === 'string'
        ? resolvedSearchParams.source
        : undefined;
    redirect(buildPlayShellPath(id, { source }));
  }

  const playMode = isPlayModeRequested(resolvedSearchParams);
  const [relatedPosts, remixPosts] = await Promise.all([
    getRelatedPosts(post),
    getRemixPosts(post),
  ]);

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <BackButton />
        <span className="text-[17px] font-bold text-gray-900">{playMode ? '바로 체험' : '작품'}</span>
      </header>

      <PostDetailClient
        post={post}
        autoplay={autoplay}
        playMode={playMode}
        relatedPosts={relatedPosts}
        remixPosts={remixPosts}
      />

      {!playMode && <BottomNav />}
    </div>
  );
}
