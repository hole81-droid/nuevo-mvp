import Link from 'next/link';
import { mockPosts } from '@/lib/mock-data';
import FeedClient from '@/components/feed/FeedClient';
import BottomNav from '@/components/layout/BottomNav';
import OnboardingBanner from '@/components/feed/OnboardingBanner';
import { createClient } from '@/lib/supabase/server';
import { DbPostWithAuthor, mapDbPostToPost } from '@/lib/post-mapper';
import NuevoGlyph from '@/components/ui/NuevoGlyph';
import { applyExperienceMetrics, getExperienceMetrics } from '@/lib/experience-metrics';
import { applySocialMetrics, getSocialMetrics } from '@/lib/social-metrics';
import { BOTTOM_NAV_SCROLL_PADDING_CLASS } from '@/lib/bottom-nav-layout';

export const dynamic = 'force-dynamic';

async function getFeedPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(*)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    // 실 DB가 에러를 반환했을 때만 디자인 데모용 mock으로 fallback.
    // 환경변수 누락·연결 실패 같은 진짜 문제를 숨기지 않도록 로깅.
    console.error('[home/getFeedPosts] supabase error → mock fallback:', error);
    return mockPosts;
  }
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

export default async function FeedPage() {
  const posts = await getFeedPosts();

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-[53px]">
          <Link href="/profile/me">
            <NuevoGlyph kind="profile" size={34} />
          </Link>
          <span className="text-[21px] font-black tracking-[-0.07em] uppercase">
            NUEVO
          </span>
          <Link href="/explore" className="w-8 h-8 flex items-center justify-center text-gray-500 rounded-full hover:bg-gray-100" aria-label="검색">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
        </div>

      </header>

      {/* Feed */}
      <main className={`flex-1 overflow-y-auto ${BOTTOM_NAV_SCROLL_PADDING_CLASS} scrollbar-hide`}>
        <OnboardingBanner />
        {posts.length ? (
          <FeedClient posts={posts} />
        ) : (
          <div className="px-6 py-16 text-center">
            <NuevoGlyph kind="spark" size={64} />
            <div className="mt-3 text-[20px] font-black tracking-[-0.05em] text-gray-900">아직 올라온 앱이 없어요</div>
            <p className="mt-2 text-[14px] text-gray-500 leading-relaxed">
              첫 번째 AI 앱 URL을 올리고 바로 놀아보는 피드를 시작해보세요.
            </p>
            <Link href="/upload" className="mt-5 inline-flex px-6 py-3 rounded-full bg-black text-white text-[14px] font-black tracking-[-0.04em] shadow-[0_18px_28px_rgba(0,0,0,0.16)]">
              첫 앱 올리기
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
