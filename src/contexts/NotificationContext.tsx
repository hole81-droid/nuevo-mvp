'use client';

import { createContext, useContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface NotifContextValue {
  unreadCount: number;
  markAllRead: () => Promise<void>;
}

const NotifContext = createContext<NotifContextValue>({
  unreadCount: 0,
  markAllRead: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (mounted) setUnreadCount(count ?? 0);
    };

    loadUnreadCount();

    return () => {
      mounted = false;
    };
  }, [supabase, user]);

  const markAllRead = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    setUnreadCount(0);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true } as never)
      .eq('recipient_id', user.id)
      .eq('read', false);

    if (error) {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
      setUnreadCount(count ?? 0);
    }
  }, [supabase, user]);

  return (
    <NotifContext.Provider value={{ unreadCount, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifications() { return useContext(NotifContext); }
