'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import NuevoGlyph from '@/components/ui/NuevoGlyph';
import { relativeTime } from '@/lib/social';
import type { NotificationRow, PostRow, UserRow } from '@/lib/supabase/types';

type NotifType = 'like' | 'remix' | 'follow' | 'comment' | 'reaction' | 'revenue' | 'tier_up' | 'remix_revenue';

interface Notif {
  id: string;
  type: NotifType;
  actorEmoji?: string;
  actorName?: string;
  actorHandle?: string;
  actorBg?: string;
  postTitle?: string;
  postId?: string;
  reaction?: string;
  amount?: number;
  tierName?: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: Notif[] = [
  // Revenue notifications (system)
  {
    id: 'r1', type: 'tier_up',
    tierName: '성장 파트너',
    time: '오늘', read: false,
  },
  {
    id: 'r2', type: 'revenue',
    amount: 231000,
    time: '2일', read: false,
  },
  {
    id: 'r3', type: 'remix_revenue',
    actorEmoji: '🌊', actorName: '예솔', actorHandle: 'yesol_ai', actorBg: '#E0F0FF',
    postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1',
    amount: 3200,
    time: '3일', read: false,
  },
  // Regular notifications
  { id: '1', type: 'reaction', actorEmoji: '🦊', actorName: '예진', actorHandle: 'yejin_ai', actorBg: '#EEFAD6', postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1', reaction: '😂 웃김', time: '1시간', read: false },
  { id: '2', type: 'remix', actorEmoji: '🦁', actorName: '재원', actorHandle: 'jaewon_exp', actorBg: '#F7F0E6', postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1', time: '2시간', read: false },
  { id: '3', type: 'follow', actorEmoji: '🌸', actorName: '지훈', actorHandle: 'jihun_viz', actorBg: '#FFE8F4', time: '3시간', read: false },
  { id: '4', type: 'like', actorEmoji: '🎸', actorName: '수진', actorHandle: 'sujin_sound', actorBg: '#EEE9FF', postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1', time: '5시간', read: true },
  { id: '5', type: 'comment', actorEmoji: '🐧', actorName: '지수', actorHandle: 'jisu_art', actorBg: '#EEF0FF', postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1', time: '6시간', read: true },
  { id: '6', type: 'reaction', actorEmoji: '⚗️', actorName: '재원2', actorHandle: 'jaewon2', actorBg: '#F7F0E6', postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1', reaction: '🧠 천재', time: '어제', read: true },
  { id: '7', type: 'like', actorEmoji: '🎨', actorName: '민지', actorHandle: 'minji_draws', actorBg: '#FFEEDD', postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1', time: '2일', read: true },
  { id: '8', type: 'remix', actorEmoji: '🌊', actorName: '예솔', actorHandle: 'yesol_ai', actorBg: '#E0F0FF', postTitle: '회의 내용 → 슬픈 밈 생성기', postId: '1', time: '3일', read: true },
];

function fmtKRW(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}만원` : `${n.toLocaleString()}원`;
}

function SystemIcon({ type }: { type: NotifType }) {
  if (type === 'tier_up') {
    return <NuevoGlyph kind="spark" size={40} />;
  }
  return <NuevoGlyph kind="revenue" size={40} />;
}

function NotifRow({ notif }: { notif: Notif }) {
  const isSystem = notif.type === 'revenue' || notif.type === 'tier_up';
  const isRemixRevenue = notif.type === 'remix_revenue';

  if (isSystem) {
    return (
      <Link
        href="/studio"
        className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 active:bg-gray-50 transition-colors ${!notif.read ? 'bg-amber-50/60' : 'bg-white'}`}
      >
        <SystemIcon type={notif.type} />
        <div className="flex-1 min-w-0">
          {notif.type === 'tier_up' && (
            <>
              <p className="text-[14px] text-gray-900 leading-snug">
                <span className="font-bold text-black">{notif.tierName ?? '파트너 티어'} 승급!</span>
              </p>
              <p className="text-[13px] text-gray-500 mt-0.5">
                수익 배분율이 <strong>70%</strong>로 올라갔어요. 스튜디오에서 확인해보세요.
              </p>
            </>
          )}
          {notif.type === 'revenue' && (
            <>
              <p className="text-[14px] text-gray-900 leading-snug">
                이번 달 예상 수익이 확정됐어요
              </p>
              <p className="text-[13px] text-emerald-600 font-bold mt-0.5">
                {fmtKRW(notif.amount!)} 입금 예정
              </p>
            </>
          )}
          <div className="text-[12px] text-gray-400 mt-0.5">{notif.time} 전</div>
        </div>
        {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />}
      </Link>
    );
  }

  if (isRemixRevenue) {
    return (
      <Link
        href="/studio"
        className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 active:bg-gray-50 transition-colors ${!notif.read ? 'bg-orange-50/50' : 'bg-white'}`}
      >
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: notif.actorBg }}>
            {notif.actorEmoji}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-gray-900 leading-snug">
            <span className="font-bold">{notif.actorName}</span>
            {' '}
            <span className="text-gray-600">님이 내 작품을 리믹스했어요</span>
          </p>
          <p className="text-[12px] text-gray-400 truncate mt-0.5">「{notif.postTitle}」</p>
          <p className="text-[12px] text-emerald-600 font-semibold mt-0.5">
            +{fmtKRW(notif.amount!)} 추가 수익 예상
          </p>
          <div className="text-[12px] text-gray-400 mt-0.5">{notif.time} 전</div>
        </div>
        {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-warm mt-1.5 flex-shrink-0" />}
      </Link>
    );
  }

  // Regular notifications
  const NOTIF_META: Record<string, { icon: string; text: (n: Notif) => string }> = {
    like:     { icon: 'LIKE', text: (n) => `회원님의 "${n.postTitle}"을 좋아합니다` },
    remix:    { icon: 'REMIX', text: (n) => `"${n.postTitle}"을 리믹스했습니다` },
    follow:   { icon: 'FOLLOW', text: () => '회원님을 팔로우하기 시작했습니다' },
    comment:  { icon: 'REPLY', text: (n) => `"${n.postTitle}"에 댓글을 달았습니다` },
    reaction: { icon: 'REACT', text: (n) => `"${n.postTitle}"에 ${n.reaction ?? '반응'}을 남겼습니다` },
  };

  const meta = NOTIF_META[notif.type];
  if (!meta) return null;
  const href = notif.postId ? `/post/${notif.postId}` : `/profile/${notif.actorHandle}`;

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 active:bg-gray-50 transition-colors ${!notif.read ? 'bg-orange-50/50' : 'bg-white'}`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: notif.actorBg }}>
          {notif.actorEmoji}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 px-1 h-4 rounded-full bg-black text-white text-[7px] font-black leading-4">{meta.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-gray-900 leading-snug">
          <span className="font-bold">{notif.actorName}</span>
          {' '}
          <span className="text-gray-600">{meta.text(notif)}</span>
        </p>
        <div className="text-[12px] text-gray-400 mt-0.5">{notif.time} 전</div>
      </div>
      {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-warm mt-1.5 flex-shrink-0" />}
    </Link>
  );
}

export default function NotificationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const [notifications, setNotifications] = useState<Notif[]>(NOTIFICATIONS);

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!data?.length) {
        setNotifications(NOTIFICATIONS);
        return;
      }
      const rows = data as NotificationRow[];

      const actorIds = Array.from(new Set(rows.map((n) => n.actor_id).filter(Boolean))) as string[];
      const postIds = Array.from(new Set(rows.flatMap((n) => [n.post_id, n.remix_post_id]).filter(Boolean))) as string[];

      const [{ data: actors }, { data: posts }] = await Promise.all([
        actorIds.length
          ? supabase.from('users').select('*').in('id', actorIds)
          : Promise.resolve({ data: [] }),
        postIds.length
          ? supabase.from('posts').select('*').in('id', postIds)
          : Promise.resolve({ data: [] }),
      ]);

      const actorRows = (actors ?? []) as UserRow[];
      const postRows = (posts ?? []) as PostRow[];
      const actorById = new Map(actorRows.map((actor) => [actor.id, actor]));
      const postById = new Map(postRows.map((post) => [post.id, post]));

      const realNotifications: Notif[] = rows.map((notif) => {
        const actor = notif.actor_id ? actorById.get(notif.actor_id) : null;
        const postId = notif.post_id ?? notif.remix_post_id;
        const post = postId ? postById.get(postId) : null;

        return {
          id: notif.id,
          type: notif.type,
          actorEmoji: actor?.avatar_emoji ?? '✨',
          actorName: actor?.display_name ?? '누군가',
          actorHandle: actor?.handle ?? 'creator',
          actorBg: actor?.avatar_bg ?? '#F7F0E6',
          postTitle: post?.title ?? '내 작품',
          postId: postId ?? undefined,
          reaction: notif.type === 'reaction' ? '반응' : undefined,
          tierName: notif.type === 'tier_up' ? '새 파트너 티어' : undefined,
          time: relativeTime(notif.created_at),
          read: notif.read,
        };
      });

      setNotifications(realNotifications);
    };

    loadNotifications();
  }, [supabase, user]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-[53px] flex items-center justify-between">
        <span className="text-[20px] font-bold text-gray-900">
          알림
          {unreadCount > 0 && <span className="ml-2 text-[13px] font-semibold text-warm">{unreadCount}개 새 알림</span>}
        </span>
        <button onClick={handleMarkAllRead} className="text-[14px] text-gray-500 font-medium hover:text-gray-700">모두 읽음</button>
      </header>

      <main className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">
        {notifications.map((notif) => (
          <NotifRow key={notif.id} notif={notif} />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
