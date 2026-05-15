'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Post } from '@/lib/types';

interface SavedContextValue {
  savedIds: Set<string>;
  savedPosts: Post[];
  toggle: (post: Post) => void;
  isSaved: (postId: string) => boolean;
}

const SavedContext = createContext<SavedContextValue>({
  savedIds: new Set(),
  savedPosts: [],
  toggle: () => {},
  isSaved: () => false,
});

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedMap, setSavedMap] = useState<Map<string, Post>>(new Map());

  const toggle = (post: Post) =>
    setSavedMap((prev) => {
      const next = new Map(prev);
      if (next.has(post.id)) next.delete(post.id); else next.set(post.id, post);
      return next;
    });

  const savedIds = new Set(savedMap.keys());
  const savedPosts = [...savedMap.values()];

  return (
    <SavedContext.Provider value={{ savedIds, savedPosts, toggle, isSaved: (id) => savedMap.has(id) }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() { return useContext(SavedContext); }
