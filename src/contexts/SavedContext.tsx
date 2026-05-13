'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SavedContextValue {
  savedIds: Set<string>;
  toggle: (postId: string) => void;
  isSaved: (postId: string) => boolean;
}

const SavedContext = createContext<SavedContextValue>({
  savedIds: new Set(),
  toggle: () => {},
  isSaved: () => false,
});

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggle = (postId: string) =>
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });

  return (
    <SavedContext.Provider value={{ savedIds, toggle, isSaved: (id) => savedIds.has(id) }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() { return useContext(SavedContext); }
