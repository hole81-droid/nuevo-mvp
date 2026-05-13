'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 초기값: minsu, sujin 팔로우 중
const INITIAL_FOLLOWING = new Set(['minsu', 'sujin']);

interface FollowContextValue {
  following: Set<string>;
  toggle: (authorId: string) => void;
  isFollowing: (authorId: string) => boolean;
}

const FollowContext = createContext<FollowContextValue>({
  following: INITIAL_FOLLOWING,
  toggle: () => {},
  isFollowing: () => false,
});

export function FollowProvider({ children }: { children: ReactNode }) {
  const [following, setFollowing] = useState<Set<string>>(new Set(INITIAL_FOLLOWING));

  const toggle = (authorId: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(authorId)) {
        next.delete(authorId);
      } else {
        next.add(authorId);
      }
      return next;
    });
  };

  const isFollowing = (authorId: string) => following.has(authorId);

  return (
    <FollowContext.Provider value={{ following, toggle, isFollowing }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  return useContext(FollowContext);
}
