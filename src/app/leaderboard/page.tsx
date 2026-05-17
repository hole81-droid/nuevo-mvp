import { mockAuthors, mockPosts } from '@/lib/mock-data';
import BottomNav from '@/components/layout/BottomNav';
import BackButton from '@/components/ui/BackButton';
import LeaderboardClient from './LeaderboardClient';
import { createClient } from '@/lib/supabase/server';
import { monthKey, monthLabel, MONTHLY_POOL } from '@/lib/wes';
import type { CreatorMonthlyWesRow, PostMonthlyWesRow, UserRow, PostRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const WES_W = { sessions: 1.0, minutes: 0.8, reactions: 1.5, comments: 2.0, remixes: 5.0 };

function calcWesLocal(sessions: number, minutes: number, reactions: number, comments: number, remixes: number) {
  return sessions * WES_W.sessions + minutes * WES_W.minutes + reactions * WES_W.reactions
       + comments * WES_W.comments + remixes * WES_W.remixes;
}

// ── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK_CREATOR_WES = Object.values(mockAuthors).map((author) => {
  const posts = mockPosts.filter((p) => p.author.id === author.id);
  const sessions = posts.reduce((s, p) => s + p.stats.experienceSessions, 0);
  const minutes  = posts.reduce((s, p) => s + p.stats.experienceMinutes,  0);
  const reactions = posts.reduce((s, p) => s + Object.values(p.reactions).reduce((a, b) => a + b, 0), 0);
  const comments = posts.reduce((s, p) => s + p.stats.replies, 0);
  const remixes  = posts.reduce((s, p) => s + p.stats.reposts, 0);
  const wes = calcWesLocal(sessions, minutes, reactions, comments, remixes);
  return { author, sessions, wes };
}).sort((a, b) => b.wes - a.wes);

const MOCK_TOTAL_WES = Math.max(1, MOCK_CREATOR_WES.reduce((s, c) => s + c.wes, 0));

const MOCK_POST_WES = mockPosts.map((post) => {
  const reactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
  const wes = calcWesLocal(post.stats.experienceSessions, post.stats.experienceMinutes, reactions, post.stats.replies, post.stats.reposts);
  return { post, wes };
}).sort((a, b) => b.wes - a.wes);

// ── Real data ─────────────────────────────────────────────────────────────────
type CreatorEntry = {
  authorId: string; authorEmoji: string; authorBg: string;
  displayName: string; handle: string; partnerTier?: string;
  wes: number; sessions: number; estimatedRevenue: number;
};

type PostEntry = {
  postId: string; emoji: string; bgGradient: string;
  title: string; handle: string; contentType: string;
  wes: number; sessions: number; rank: number;
};

async function getLeaderboardData(): Promise<{ creatorWes: CreatorEntry[]; postWes: PostEntry[]; month: string; isLive: boolean }> {
  const supabase = await createClient();
  const month = monthKey();

  const [{ data: creatorRows }, { data: postRows }] = await Promise.all([
    supabase.from('creator_monthly_wes').select('*').eq('month', month).order('wes', { ascending: false }).limit(20),
    supabase.from('post_monthly_wes').select('*').eq('month', month).order('wes', { ascending: false }).limit(10),
  ]);

  if (!creatorRows?.length) {
    // No live data — use mock
    const POOL = MONTHLY_POOL * 0.7;
    return {
      month: monthLabel(),
      isLive: false,
      creatorWes: MOCK_CREATOR_WES.map((c) => ({
        authorId: c.author.id,
        authorEmoji: c.author.avatarEmoji,
        authorBg: c.author.avatarBg,
        displayName: c.author.displayName,
        handle: c.author.handle,
        partnerTier: c.author.partnerTier,
        wes: c.wes,
        sessions: c.sessions,
        estimatedRevenue: Math.round(POOL * (c.wes / MOCK_TOTAL_WES)),
      })),
      postWes: MOCK_POST_WES.slice(0, 7).map((p, i) => ({
        postId: p.post.id,
        emoji: p.post.media.emoji ?? p.post.media.coverEmoji ?? '🎯',
        bgGradient: p.post.media.bgGradient ?? 'from-gray-100 to-gray-200',
        title: p.post.title,
        handle: p.post.author.handle,
        contentType: p.post.contentType,
        wes: p.wes,
        sessions: p.post.stats.experienceSessions,
        rank: i,
      })),
    };
  }

  // Fetch user profiles for creators
  const authorIds = [...new Set((creatorRows as CreatorMonthlyWesRow[]).map((r) => r.author_id))];
  const postIds = [...new Set((postRows ?? []).map((r: PostMonthlyWesRow) => r.post_id))];

  const [{ data: usersData }, { data: postsData }] = await Promise.all([
    authorIds.length ? supabase.from('users').select('*').in('id', authorIds) : Promise.resolve({ data: [] }),
    postIds.length ? supabase.from('posts').select('id, cover_emoji, bg_gradient').in('id', postIds) : Promise.resolve({ data: [] }),
  ]);

  const userById = new Map<string, UserRow>((usersData as UserRow[] ?? []).map((u) => [u.id, u]));
  const postById = new Map<string, Pick<PostRow, 'id' | 'cover_emoji' | 'bg_gradient'>>((postsData as Pick<PostRow, 'id' | 'cover_emoji' | 'bg_gradient'>[] ?? []).map((p) => [p.id, p]));

  const platformWes = Math.max(1, (creatorRows as CreatorMonthlyWesRow[]).reduce((s, r) => s + Number(r.wes ?? 0), 0));
  const POOL = MONTHLY_POOL * 0.7;

  const creatorWes: CreatorEntry[] = (creatorRows as CreatorMonthlyWesRow[])
    .map((row) => {
      const user = userById.get(row.author_id);
      if (!user) return null;
      return {
        authorId: user.id,
        authorEmoji: user.avatar_emoji,
        authorBg: user.avatar_bg,
        displayName: user.display_name,
        handle: user.handle,
        partnerTier: user.partner_tier ?? undefined,
        wes: Number(row.wes),
        sessions: row.sessions,
        estimatedRevenue: Math.round(POOL * (Number(row.wes) / platformWes)),
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null) as CreatorEntry[];

  const postWes: PostEntry[] = (postRows as PostMonthlyWesRow[] ?? []).map((row, i) => {
    const post = postById.get(row.post_id);
    const user = userById.get(row.author_id);
    return {
      postId: row.post_id,
      emoji: post?.cover_emoji ?? '🎯',
      bgGradient: post?.bg_gradient ?? 'from-gray-100 to-gray-200',
      title: row.title,
      handle: user?.handle ?? 'creator',
      contentType: row.content_type,
      wes: Number(row.wes),
      sessions: row.sessions,
      rank: i,
    };
  });

  return { creatorWes, postWes, month: monthLabel(), isLive: true };
}

export default async function LeaderboardPage() {
  const { creatorWes, postWes, month, isLive } = await getLeaderboardData();

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <BackButton fallbackHref="/explore" />
        <div>
          <div className="font-bold text-[17px] text-gray-900">이달의 리더보드</div>
          <div className="text-[12px] text-gray-500">{month} · WES 기준 {!isLive && '· 데모 데이터'}</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">

        {/* Top 3 podium */}
        <div className="px-4 pt-5 pb-3 bg-gradient-to-b from-amber-50/60 to-transparent">
          <div className="text-[12px] font-bold text-amber-600 uppercase tracking-widest mb-4 text-center">
            🏆 이달의 TOP 3 창작자
          </div>
          <div className="flex items-end justify-center gap-3">
            {/* 2nd */}
            {creatorWes[1] && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[22px]">{creatorWes[1].authorEmoji}</div>
                <div className="text-[12px] font-bold text-gray-700">{creatorWes[1].displayName}</div>
                <div className="w-[80px] h-[56px] rounded-t-2xl bg-gray-200 flex flex-col items-center justify-center shadow-sm">
                  <div className="text-[20px]">🥈</div>
                  <div className="text-[10px] font-bold text-gray-600">{(creatorWes[1].wes / 1000).toFixed(1)}k</div>
                </div>
              </div>
            )}
            {/* 1st */}
            {creatorWes[0] && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[26px]">{creatorWes[0].authorEmoji}</div>
                <div className="text-[13px] font-bold text-gray-900">{creatorWes[0].displayName}</div>
                <div className="w-[90px] h-[76px] rounded-t-2xl bg-amber-400 flex flex-col items-center justify-center shadow-md">
                  <div className="text-[24px]">🥇</div>
                  <div className="text-[11px] font-bold text-amber-900">{(creatorWes[0].wes / 1000).toFixed(1)}k</div>
                </div>
              </div>
            )}
            {/* 3rd */}
            {creatorWes[2] && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[22px]">{creatorWes[2].authorEmoji}</div>
                <div className="text-[12px] font-bold text-gray-700">{creatorWes[2].displayName}</div>
                <div className="w-[80px] h-[44px] rounded-t-2xl bg-amber-700/40 flex flex-col items-center justify-center shadow-sm">
                  <div className="text-[20px]">🥉</div>
                  <div className="text-[10px] font-bold text-amber-800">{(creatorWes[2].wes / 1000).toFixed(1)}k</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <LeaderboardClient creatorWes={creatorWes} postWes={postWes} />

        <div className="px-4 pb-4 text-[12px] text-gray-400 text-center">
          순위는 매일 자정 업데이트 · WES = 체험×1 + 시간×0.8 + 반응×1.5 + 댓글×2 + 리믹스×5
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
