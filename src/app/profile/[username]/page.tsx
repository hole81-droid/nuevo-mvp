import { mockAuthors, mockPosts } from '@/lib/mock-data';
import BackButton from '@/components/ui/BackButton';
import { PartnerTier, Post, Author } from '@/lib/types';
import ProfileTabsClient from '@/components/profile/ProfileTabsClient';
import BottomNav from '@/components/layout/BottomNav';
import FollowButton from '@/components/profile/FollowButton';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DbPostWithAuthor, mapDbAuthorToAuthor, mapDbPostToPost } from '@/lib/post-mapper';
import NuevoGlyph from '@/components/ui/NuevoGlyph';
import { applyExperienceMetrics, getExperienceMetrics } from '@/lib/experience-metrics';
import { applySocialMetrics, getSocialMetrics } from '@/lib/social-metrics';
import type { UserRow } from '@/lib/supabase/types';

interface Props {
  params: Promise<{ username: string }>;
}

const PARTNER_CONFIG: Record<PartnerTier, { label: string; badge: string; color: string; bg: string }> = {
  seedling:  { label: '새싹 파트너',  badge: '✦',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  growth:    { label: '성장 파트너',  badge: '✦✦',   color: 'text-blue-600',    bg: 'bg-blue-50'    },
  pro:       { label: '프로 파트너',  badge: '✦✦✦',  color: 'text-purple-600',  bg: 'bg-purple-50'  },
  champion:  { label: '챔피언 파트너', badge: '✦✦✦✦', color: 'text-amber-600',   bg: 'bg-amber-50'   },
};

export const dynamic = 'force-dynamic';

async function mapPostsWithRemixCounts(supabase: Awaited<ReturnType<typeof createClient>>, posts: DbPostWithAuthor[] | null) {
  if (!posts?.length) return [];

  const ids = posts.map((post) => post.id);
  const { data: remixRows } = await supabase
    .from('posts')
    .select('remix_of')
    .in('remix_of', ids);
  const remixCounts = new Map<string, number>();
  ((remixRows ?? []) as Array<{ remix_of: string | null }>).forEach((row) => {
    if (!row.remix_of) return;
    remixCounts.set(row.remix_of, (remixCounts.get(row.remix_of) ?? 0) + 1);
  });

  const mappedPosts = posts.map((post) => mapDbPostToPost(post, { remixCount: remixCounts.get(post.id) ?? 0 }));
  const postIds = mappedPosts.map((post) => post.id);
  const [experienceMetrics, socialMetrics] = await Promise.all([
    getExperienceMetrics(supabase, postIds),
    getSocialMetrics(supabase, postIds),
  ]);
  return applySocialMetrics(applyExperienceMetrics(mappedPosts, experienceMetrics), socialMetrics);
}

type FollowStats = { followerCount: number; followingCount: number };

async function getFollowStats(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<FollowStats> {
  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followerCount: followerCount ?? 0, followingCount: followingCount ?? 0 };
}

async function getLikedPosts(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<Post[]> {
  const { data } = await supabase
    .from('post_reactions')
    .select('post_id, posts:posts(*, author:users(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!data?.length) return [];
  const posts = (data as Array<{ post_id: string; posts: DbPostWithAuthor | null }>)
    .map((row) => row.posts ? mapDbPostToPost(row.posts) : null)
    .filter((p): p is Post => p !== null);
  return posts;
}

async function getProfileData(username: string): Promise<{ author: Author; authorPosts: Post[]; likedPosts: Post[]; handle: string; followStats: FollowStats }> {
  const supabase = await createClient();

  if (username === 'me') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login?next=/profile/me');
    }
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      const profileRow = profile as UserRow;
      const [posts, followStats, likedPosts] = await Promise.all([
        supabase.from('posts').select('*, author:users(*)').eq('author_id', user.id).order('created_at', { ascending: false }),
        getFollowStats(supabase, user.id),
        getLikedPosts(supabase, user.id),
      ]);

      return {
        author: mapDbAuthorToAuthor(profileRow),
        authorPosts: await mapPostsWithRemixCounts(supabase, posts.data as DbPostWithAuthor[] | null),
        likedPosts,
        handle: profileRow.handle,
        followStats,
      };
    }
    redirect('/setup?next=/profile/me');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('handle', username)
    .maybeSingle();

  if (profile) {
    const profileRow = profile as UserRow;
    const [posts, followStats] = await Promise.all([
      supabase.from('posts').select('*, author:users(*)').eq('author_id', profileRow.id).order('created_at', { ascending: false }),
      getFollowStats(supabase, profileRow.id),
    ]);

    return {
      author: mapDbAuthorToAuthor(profileRow),
      authorPosts: await mapPostsWithRemixCounts(supabase, posts.data as DbPostWithAuthor[] | null),
      likedPosts: [],
      handle: profileRow.handle,
      followStats,
    };
  }

  const mockAuthor = Object.values(mockAuthors).find((a) => a.handle === username);
  if (mockAuthor) {
    return {
      author: mockAuthor,
      authorPosts: mockPosts.filter((p) => p.author.handle === username),
      likedPosts: mockPosts.filter((p) => p.stats.likes > 1000).slice(0, 4),
      handle: username,
      followStats: { followerCount: mockAuthor.followerCount, followingCount: 0 },
    };
  }

  notFound();
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const { author, authorPosts, likedPosts, handle, followStats } = await getProfileData(username);
  const isMe = username === 'me';
  const ownOriginalPosts = authorPosts.filter((post) => !post.remixOf);
  const ownRemixedPosts = authorPosts.filter((post) => post.remixOf);

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <BackButton />
        <div>
          <div className="font-bold text-[17px] text-gray-900">{author.displayName}</div>
          <div className="text-[12px] text-gray-500">{ownOriginalPosts.length}개 작품</div>
        </div>
        {isMe ? (
          <Link href="/settings" className="ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Link>
        ) : (
          <button className="ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">
        {/* Cover */}
        <div className="h-[110px] bg-[#EFEFE8] border-b border-[#D8D8D0] flex items-center justify-center">
          <NuevoGlyph kind="spark" size={58} />
        </div>

        {/* Profile info */}
        <div className="px-4 pb-3">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-7 mb-3">
            <div
              className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-3xl border-4 border-white"
              style={{ backgroundColor: author.avatarBg }}
            >
              {author.avatarEmoji}
            </div>
            <div className="flex items-center gap-2">
              {isMe && (
                <Link href="/studio" className="px-4 py-1.5 rounded-full border-2 border-black bg-black text-white text-[14px] font-black tracking-[-0.04em] flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                  </svg>
                  스튜디오
                </Link>
              )}
              {isMe ? (
                <Link href="/setup?next=/profile/me" className="px-4 py-1.5 rounded-full border-2 border-[#D8D8D0] text-[14px] font-black text-gray-900 hover:bg-[#EFEFE8]">
                  프로필 편집
                </Link>
              ) : (
                <FollowButton authorId={author.id} />
              )}
            </div>
          </div>

          {/* Name / handle */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[20px] text-gray-900">{author.displayName}</span>
            {author.partnerTier && (() => {
              const p = PARTNER_CONFIG[author.partnerTier!];
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-bold ${p.color} ${p.bg}`}>
                  {p.badge} {p.label}
                </span>
              );
            })()}
          </div>
          <div className="text-[14px] text-gray-500">@{author.handle}</div>

          {/* Bio */}
          {author.bio && (
            <p className="mt-2 text-[15px] text-gray-800 leading-normal">{author.bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-5 mt-3 text-[14px]">
            <span>
              <strong className="font-bold text-gray-900">{ownOriginalPosts.length}</strong>
              <span className="text-gray-500"> 작품</span>
            </span>
            <span>
              <strong className="font-bold text-gray-900">{followStats.followerCount.toLocaleString()}</strong>
              <span className="text-gray-500"> 팔로워</span>
            </span>
            <span>
              <strong className="font-bold text-gray-900">{followStats.followingCount.toLocaleString()}</strong>
              <span className="text-gray-500"> 팔로잉</span>
            </span>
          </div>

          {/* Monthly revenue shortcut (my profile only) */}
          {isMe && (
            <Link href="/studio" className="mt-3 flex items-center justify-between p-3 rounded-[24px] bg-[#F7F7F2] border-2 border-[#D8D8D0] hover:bg-[#EFEFE8] transition-colors">
              <div>
                <div className="text-[12px] text-gray-500">수익 & WES 대시보드</div>
                <div className="text-[15px] font-bold text-gray-900 mt-0.5">크리에이터 스튜디오 →</div>
              </div>
              {author.partnerTier && (() => {
                const p = PARTNER_CONFIG[author.partnerTier!];
                return (
                  <span className={`text-[13px] font-bold ${p.color}`}>{p.badge}</span>
                );
              })()}
            </Link>
          )}

          {/* Partner CTA (non-partner, my profile) */}
          {isMe && !author.partnerTier && (
            <Link href="/studio" className="mt-3 block w-full py-2.5 rounded-full border-2 border-dashed border-black text-black text-[14px] font-black hover:bg-[#EFEFE8] transition-colors text-center">
              수익화 신청하기
            </Link>
          )}
        </div>

        {/* Tabs */}
        <ProfileTabsClient
          posts={ownOriginalPosts}
          remixedPosts={ownRemixedPosts}
          likedPosts={likedPosts}
          isMe={isMe}
        />
      </main>

      <BottomNav />
    </div>
  );
}
