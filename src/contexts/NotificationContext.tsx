'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NotifContextValue {
  unreadCount: number;
  markAllRead: () => void;
}

const NotifContext = createContext<NotifContextValue>({ unreadCount: 0, markAllRead: () => {} });

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(6);
  return (
    <NotifContext.Provider value={{ unreadCount, markAllRead: () => setUnreadCount(0) }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifications() { return useContext(NotifContext); }
