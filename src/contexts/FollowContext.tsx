'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { isUuid } from '@/lib/social';
import { createNotification } from '@/lib/notification-events';

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
  const supabase = useMemo(() => createClient(), []);
  const { user, loading } = useAuth();
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const loadFollowing = async () => {
      if (loading) return;

      if (!user) {
        setFollowing(new Set(INITIAL_FOLLOWING));
        return;
      }

      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!mounted) return;
      setFollowing(new Set(data?.map((row: { following_id: string }) => row.following_id) ?? []));
    };

    loadFollowing();

    return () => {
      mounted = false;
    };
  }, [supabase, user, loading]);

  const toggle = (authorId: string) => {
    const wasFollowing = following.has(authorId);

    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(authorId)) {
        next.delete(authorId);
      } else {
        next.add(authorId);
      }
      return next;
    });

    if (!user || !isUuid(authorId) || user.id === authorId) return;

    if (wasFollowing) {
      supabase
        .from('follows')
        .delete()
        .match({ follower_id: user.id, following_id: authorId })
        .then(({ error }: { error: Error | null }) => {
          if (!error) return;
          setFollowing((prev) => new Set(prev).add(authorId));
        });
    } else {
      supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: authorId } as never)
        .then(async ({ error }: { error: Error | null }) => {
          if (!error) {
            await createNotification(supabase, {
              recipientId: authorId,
              actorId: user.id,
              type: 'follow',
            });
            return;
          }
          setFollowing((prev) => {
            const next = new Set(prev);
            next.delete(authorId);
            return next;
          });
        });
    }
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
