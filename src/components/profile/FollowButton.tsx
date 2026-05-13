'use client';

import { useFollow } from '@/contexts/FollowContext';

export default function FollowButton({ authorId }: { authorId: string }) {
  const { isFollowing, toggle } = useFollow();
  const followed = isFollowing(authorId);

  return (
    <button
      onClick={() => toggle(authorId)}
      className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition-all active:scale-95 ${
        followed
          ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          : 'bg-gray-900 text-white hover:bg-gray-800'
      }`}
    >
      {followed ? '팔로잉' : '팔로우'}
    </button>
  );
}
