'use client';

import { useState } from 'react';
import { Post } from '@/lib/types';
import PostCard from '@/components/post/PostCard';
import { useSaved } from '@/contexts/SavedContext';

const TABS_BASE = ['작품', '리믹스', '좋아요'] as const;
const TABS_ME   = ['작품', '리믹스', '좋아요', '저장'] as const;
type Tab = '작품' | '리믹스' | '좋아요' | '저장';

interface Props {
  posts: Post[];
  remixedPosts: Post[];
  likedPosts: Post[];
  isMe?: boolean;
}

export default function ProfileTabsClient({ posts, remixedPosts, likedPosts, isMe }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('작품');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { savedPosts } = useSaved();

  const TABS = isMe ? TABS_ME : TABS_BASE;

  const displayPosts =
    activeTab === '작품'  ? posts :
    activeTab === '리믹스' ? remixedPosts :
    activeTab === '저장'   ? savedPosts :
    likedPosts;

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <>
      <div className="flex border-b border-gray-100 sticky top-[53px] bg-white z-30">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setExpandedId(null); }}
            className={`flex-1 py-3 text-[14px] font-semibold transition-colors ${
              activeTab === tab
                ? 'text-gray-900 border-b-2 border-warm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              expanded={expandedId === post.id}
              onToggle={() => toggle(post.id)}
            />
          ))
        ) : (
          <div className="px-4 py-14 text-center text-gray-400">
            <div className="text-4xl mb-3">🌱</div>
            <div className="text-[15px]">아직 없어요</div>
          </div>
        )}
      </div>
    </>
  );
}
