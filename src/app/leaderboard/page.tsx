import Link from 'next/link';
import { mockAuthors, mockPosts, formatViews } from '@/lib/mock-data';
import BottomNav from '@/components/layout/BottomNav';
import LeaderboardClient from './LeaderboardClient';

const WES_W = { sessions: 1.0, minutes: 0.8, reactions: 1.5, comments: 2.0, remixes: 5.0 };

function calcWes(sessions: number, minutes: number, reactions: number, comments: number, remixes: number) {
  return sessions * WES_W.sessions + minutes * WES_W.minutes + reactions * WES_W.reactions
       + comments * WES_W.comments + remixes * WES_W.remixes;
}

// 창작자별 WES 집계 (mock: 각 작품 stats 합산)
const CREATOR_WES = Object.values(mockAuthors).map((author) => {
  const posts = mockPosts.filter((p) => p.author.id === author.id);
  const sessions = posts.reduce((s, p) => s + p.stats.experienceSessions, 0);
  const minutes  = posts.reduce((s, p) => s + p.stats.experienceMinutes,  0);
  const reactions = posts.reduce((s, p) => s + Object.values(p.reactions).reduce((a, b) => a + b, 0), 0);
  const comments = posts.reduce((s, p) => s + p.stats.replies, 0);
  const remixes  = posts.reduce((s, p) => s + p.stats.reposts, 0);
  const wes = calcWes(sessions, minutes, reactions, comments, remixes);
  return { author, sessions, minutes, reactions, comments, remixes, wes };
}).sort((a, b) => b.wes - a.wes);

// 작품 WES
const POST_WES = mockPosts.map((post) => {
  const reactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
  const wes = calcWes(
    post.stats.experienceSessions,
    post.stats.experienceMinutes,
    reactions,
    post.stats.replies,
    post.stats.reposts,
  );
  return { post, wes, reactions };
}).sort((a, b) => b.wes - a.wes);

const TOTAL_WES = CREATOR_WES.reduce((s, c) => s + c.wes, 0);
const MONTHLY_POOL = 10_000_000 * 0.7;

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_BG = [
  'from-amber-50 to-yellow-50 border-amber-200',
  'from-gray-50 to-slate-50 border-gray-200',
  'from-orange-50 to-amber-50 border-orange-200',
];

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <Link href="/explore" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <div className="font-bold text-[17px] text-gray-900">이달의 리더보드</div>
          <div className="text-[12px] text-gray-500">2026년 5월 · WES 기준</div>
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
            {CREATOR_WES[1] && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[22px]">{CREATOR_WES[1].author.avatarEmoji}</div>
                <div className="text-[12px] font-bold text-gray-700">{CREATOR_WES[1].author.displayName}</div>
                <div className="w-[80px] h-[56px] rounded-t-2xl bg-gray-200 flex flex-col items-center justify-center shadow-sm">
                  <div className="text-[20px]">🥈</div>
                  <div className="text-[10px] font-bold text-gray-600">{Math.round(CREATOR_WES[1].wes / 1000)}k</div>
                </div>
              </div>
            )}
            {/* 1st */}
            {CREATOR_WES[0] && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[26px]">{CREATOR_WES[0].author.avatarEmoji}</div>
                <div className="text-[13px] font-bold text-gray-900">{CREATOR_WES[0].author.displayName}</div>
                <div className="w-[90px] h-[76px] rounded-t-2xl bg-amber-400 flex flex-col items-center justify-center shadow-md">
                  <div className="text-[24px]">🥇</div>
                  <div className="text-[11px] font-bold text-amber-900">{Math.round(CREATOR_WES[0].wes / 1000)}k</div>
                </div>
              </div>
            )}
            {/* 3rd */}
            {CREATOR_WES[2] && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[22px]">{CREATOR_WES[2].author.avatarEmoji}</div>
                <div className="text-[12px] font-bold text-gray-700">{CREATOR_WES[2].author.displayName}</div>
                <div className="w-[80px] h-[44px] rounded-t-2xl bg-amber-700/40 flex flex-col items-center justify-center shadow-sm">
                  <div className="text-[20px]">🥉</div>
                  <div className="text-[10px] font-bold text-amber-800">{Math.round(CREATOR_WES[2].wes / 1000)}k</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full creator ranking */}
        <LeaderboardClient
          creatorWes={CREATOR_WES.map((c) => ({
            authorId: c.author.id,
            authorEmoji: c.author.avatarEmoji,
            authorBg: c.author.avatarBg,
            displayName: c.author.displayName,
            handle: c.author.handle,
            partnerTier: c.author.partnerTier,
            wes: c.wes,
            sessions: c.sessions,
            estimatedRevenue: Math.round(MONTHLY_POOL * (c.wes / TOTAL_WES)),
          }))}
          postWes={POST_WES.slice(0, 7).map((p, i) => ({
            postId: p.post.id,
            emoji: p.post.media.emoji ?? p.post.media.coverEmoji ?? '🎯',
            bgGradient: p.post.media.bgGradient ?? 'from-gray-100 to-gray-200',
            title: p.post.title,
            handle: p.post.author.handle,
            contentType: p.post.contentType,
            wes: p.wes,
            sessions: p.post.stats.experienceSessions,
            rank: i,
          }))}
        />

        <div className="px-4 pb-4 text-[12px] text-gray-400 text-center">
          순위는 매일 자정 업데이트 · WES = 체험×1 + 시간×0.8 + 반응×1.5 + 댓글×2 + 리믹스×5
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
