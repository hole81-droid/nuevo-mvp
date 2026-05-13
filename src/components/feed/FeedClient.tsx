'use client';

import { useState } from 'react';
import { Post } from '@/lib/types';
import PostCard from '@/components/post/PostCard';
import { useFollow } from '@/contexts/FollowContext';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

export default function FeedClient({ posts }: { posts: Post[] }) {
  const [tab, setTab] = useState<'recommend' | 'following'>('recommend');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { following } = useFollow();

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const displayed = tab === 'following'
    ? posts.filter((p) => following.has(p.author.id))
    : posts;

  return (
    <>
      {/* Feed tabs */}
      <div className="flex sticky top-[64px] z-30 bg-[#F8F8F3]/95 backdrop-blur-sm border-b border-[#D8D8D0]">
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
        displayed.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            expanded={expandedId === post.id}
            onToggle={() => toggle(post.id)}
          />
        ))
      )}
    </>
  );
}
