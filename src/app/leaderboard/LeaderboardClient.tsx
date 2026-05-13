'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFollow } from '@/contexts/FollowContext';

interface CreatorRow {
  authorId: string;
  authorEmoji: string;
  authorBg: string;
  displayName: string;
  handle: string;
  partnerTier?: string;
  wes: number;
  sessions: number;
  estimatedRevenue: number;
}

interface PostRow {
  postId: string;
  emoji: string;
  bgGradient: string;
  title: string;
  handle: string;
  contentType: string;
  wes: number;
  sessions: number;
  rank: number;
}

const TIER_BADGE: Record<string, string> = { seedling: '✦', growth: '✦✦', pro: '✦✦✦', champion: '✦✦✦✦' };
const TIER_COLOR: Record<string, string> = {
  seedling: 'text-emerald-500', growth: 'text-blue-500',
  pro: 'text-purple-500', champion: 'text-amber-500',
};
const RANK_MEDAL = ['🥇', '🥈', '🥉'];

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function LeaderboardClient({ creatorWes, postWes }: {
  creatorWes: CreatorRow[];
  postWes: PostRow[];
}) {
  const [tab, setTab] = useState<'creator' | 'post'>('creator');
  const { isFollowing, toggle } = useFollow();

  return (
    <div className="px-4 pt-4">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-full">
        {(['creator', 'post'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-[14px] font-semibold transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t === 'creator' ? '창작자' : '작품'}
          </button>
        ))}
      </div>

      {/* Creator ranking */}
      {tab === 'creator' && (
        <div className="flex flex-col gap-2">
          {creatorWes.map((c, i) => (
            <div
              key={c.authorId}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
                i === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' :
                i === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200' :
                i === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' :
                'bg-white border-gray-100'
              }`}
            >
              {/* Rank */}
              <div className="w-7 text-center flex-shrink-0">
                {i < 3
                  ? <span className="text-[20px]">{RANK_MEDAL[i]}</span>
                  : <span className="text-[14px] font-bold text-gray-400">{i + 1}</span>
                }
              </div>

              {/* Avatar */}
              <Link href={`/profile/${c.handle}`}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: c.authorBg }}
                >
                  {c.authorEmoji}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-gray-900">{c.displayName}</span>
                  {c.partnerTier && (
                    <span className={`text-[11px] font-bold ${TIER_COLOR[c.partnerTier]}`}>
                      {TIER_BADGE[c.partnerTier]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-warm font-semibold">{fmt(Math.round(c.wes))} WES</span>
                  <span className="text-[10px] text-gray-400">체험 {fmt(c.sessions)}회</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  예상 ~₩{c.estimatedRevenue.toLocaleString()}
                </div>
              </div>

              {/* Follow button */}
              <button
                onClick={() => toggle(c.authorId)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${
                  isFollowing(c.authorId)
                    ? 'border border-gray-200 text-gray-500'
                    : 'bg-gray-900 text-white'
                }`}
              >
                {isFollowing(c.authorId) ? '팔로잉' : '팔로우'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Post ranking */}
      {tab === 'post' && (
        <div className="flex flex-col gap-2">
          {postWes.map((p, i) => (
            <Link
              key={p.postId}
              href={`/post/${p.postId}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
            >
              {/* Rank */}
              <div className="w-7 text-center flex-shrink-0">
                {i < 3
                  ? <span className="text-[20px]">{RANK_MEDAL[i]}</span>
                  : <span className="text-[14px] font-bold text-gray-400">{i + 1}</span>
                }
              </div>

              {/* Thumbnail */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br ${p.bgGradient}`}>
                {p.emoji}
                {p.contentType === 'interactive' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-warm flex items-center justify-center">
                    <svg width="6" height="6" viewBox="0 0 10 10" fill="white"><path d="M3 1.5l5 3.5-5 3.5z"/></svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-gray-900 truncate">{p.title}</div>
                <div className="text-[11px] text-gray-500">@{p.handle}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-warm font-semibold">{fmt(Math.round(p.wes))} WES</span>
                  <span className="text-[10px] text-gray-400">체험 {fmt(p.sessions)}회</span>
                </div>
              </div>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
