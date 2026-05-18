'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import PostCard from '@/components/post/PostCard';
import { useFollow } from '@/contexts/FollowContext';
import NuevoGlyph from '@/components/ui/NuevoGlyph';
import { FEED_TABS_STICKY_CLASS } from '@/lib/feed-layout';

export default function FeedClient({ posts }: { posts: Post[] }) {
  const [tab, setTab] = useState<'recommend' | 'following'>('recommend');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { following } = useFollow();

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const displayed = tab === 'following'
    ? posts.filter((p) => following.has(p.author.id))
    : posts;
  const remixAlerts = displayed.filter((p) => p.remixOf).slice(0, 3);

  return (
    <>
      {/* Feed tabs */}
      <div className={FEED_TABS_STICKY_CLASS}>
        {(['recommend', 'following'] as const).map((t) => {
          const label = t === 'recommend' ? '추천' : '팔로잉';
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => { setTab(t); setExpandedId(null); }}
              className={`flex-1 py-3 text-[15px] font-semibold transition-colors border-b-2 ${
                active
                  ? 'text-black border-black'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <NuevoGlyph kind="empty" size={58} />
          <div className="text-[15px] font-black tracking-[-0.04em] text-gray-700">아직 팔로잉한 창작자가 없어요</div>
          <div className="text-[13px] text-gray-400">탐색에서 마음에 드는 창작자를 팔로우해보세요</div>
        </div>
      ) : (
        <>
          {remixAlerts.length > 0 && (
            <section className="border-b border-[#D8D8D0] bg-[#FFFDF5] px-4 py-3">
              <div className="text-[12px] font-black uppercase tracking-wider text-gray-400">리믹스 소식</div>
              <div className="mt-2 flex flex-col gap-2">
                {remixAlerts.map((post) => (
                  <Link
                    key={`remix-alert-${post.id}`}
                    href={`/post/${post.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-[#D8D8D0] bg-white px-3 py-2 active:scale-[0.99]"
                  >
                    <NuevoGlyph kind="remix" size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-black text-gray-900">@{post.author.handle}이 새 리믹스를 올렸어요</div>
                      <div className="truncate text-[12px] text-gray-500">{post.title}</div>
                    </div>
                    <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-black text-white">
                      보기
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {displayed.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              expanded={expandedId === post.id}
              onToggle={() => toggle(post.id)}
            />
          ))}
        </>
      )}
    </>
  );
}
