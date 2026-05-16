'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { Post } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isUuid } from '@/lib/social';
import { mapDbPostToPost, DbPostWithAuthor } from '@/lib/post-mapper';

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
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [savedMap, setSavedMap] = useState<Map<string, Post>>(new Map());

  useEffect(() => {
    if (!user) {
      setSavedMap(new Map());
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('saved_posts')
        .select('post_id, posts:posts(*, author:users(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!data?.length) return;

      const map = new Map<string, Post>();
      for (const row of data as Array<{ post_id: string; posts: DbPostWithAuthor | null }>) {
        if (row.posts) {
          map.set(row.post_id, mapDbPostToPost(row.posts));
        }
      }
      setSavedMap(map);
    };

    load();
  }, [supabase, user]);

  const toggle = (post: Post) => {
    const isSaving = !savedMap.has(post.id);
    setSavedMap((prev) => {
      const next = new Map(prev);
      if (isSaving) next.set(post.id, post); else next.delete(post.id);
      return next;
    });

    if (!user || !isUuid(post.id)) return;

    if (isSaving) {
      supabase
        .from('saved_posts')
        .insert({ user_id: user.id, post_id: post.id } as never)
        .then(({ error }) => {
          if (error) setSavedMap((prev) => { const next = new Map(prev); next.delete(post.id); return next; });
        });
    } else {
      supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .then(({ error }) => {
          if (error) setSavedMap((prev) => { const next = new Map(prev); next.set(post.id, post); return next; });
        });
    }
  };

  const savedIds = new Set(savedMap.keys());
  const savedPosts = [...savedMap.values()];

  return (
    <SavedContext.Provider value={{ savedIds, savedPosts, toggle, isSaved: (id) => savedMap.has(id) }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() { return useContext(SavedContext); }
