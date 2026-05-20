import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { mockPosts } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { DbPostWithAuthor, mapDbPostToPost } from '@/lib/post-mapper';
import { applyExperienceMetrics, getExperienceMetrics } from '@/lib/experience-metrics';
import { applySocialMetrics, getSocialMetrics } from '@/lib/social-metrics';
import { isUuid } from '@/lib/social';
import { getSimilarPosts } from '@/lib/play-retention';
import type { Post } from '@/lib/types';
import PlayShell from '@/components/play/PlayShell';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: 'nuevo' };
  const title = `${post.title} | nuevo`;
  const description = post.text || `${post.author.displayName}의 앱을 바로 체험해보세요.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', images: [{ url: '/nuevo-og.svg', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/nuevo-og.svg'] },
  };
}

async function getPost(id: string): Promise<Post | null> {
  const mock = mockPosts.find((p) => p.id === id);
  if (mock) return mock;
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

async function getNextPost(post: Post): Promise<Post | null> {
  const tags = post.tags ?? [];
  const mockCandidates = mockPosts.filter((p) => p.id !== post.id && p.contentType === 'interactive');

  if (!isUuid(post.id)) {
    return getSimilarPosts(post, mockCandidates)[0] ?? null;
  }

  const supabase = await createClient();
  let candidates: Post[] = [];

  if (tags.length) {
    const { data } = await supabase
      .from('posts')
      .select('*, author:users(*)')
      .overlaps('tags', tags)
      .neq('id', post.id)
      .eq('content_type', 'interactive')
      .order('created_at', { ascending: false })
      .limit(4);

    if (data?.length) {
      candidates = (data as DbPostWithAuthor[]).map((row) => mapDbPostToPost(row));
    }
  }

  if (!candidates.length) {
    const { data } = await supabase
      .from('posts')
      .select('*, author:users(*)')
      .neq('id', post.id)
      .eq('content_type', 'interactive')
      .order('created_at', { ascending: false })
      .limit(8);

    if (data?.length) {
      candidates = (data as DbPostWithAuthor[]).map((row) => mapDbPostToPost(row));
    }
  }

  return getSimilarPosts(post, candidates.length ? candidates : mockCandidates)[0] ?? null;
}

export default async function PlayIdPage({ params }: Props) {
  const { id } = await params;

  // Non-interactive posts fall back to standard detail
  const post = await getPost(id);
  if (!post) notFound();
  if (post.contentType !== 'interactive') redirect(`/post/${id}`);

  const nextPost = await getNextPost(post);

  return <PlayShell post={post} nextPost={nextPost} />;
}
