'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  BOTTOM_NAV_CENTER_CLASS,
  BOTTOM_NAV_CLASS,
  BOTTOM_NAV_ITEM_CLASS,
  BOTTOM_NAV_STYLE,
} from '@/lib/bottom-nav-layout';

const tabs = [
  {
    href: '/',
    label: '홈',
    icon: (filled: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round">
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
        <path d="M5 10v11h14V10" fill={filled ? 'currentColor' : 'none'} />
        {filled && <path d="M3 12L12 3l9 9v9H15v-7H9v7H3z" />}
      </svg>
    ),
  },
  {
    href: '/explore',
    label: '검색',
    icon: (filled: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 2} strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: '/notifications',
    label: '알림',
    icon: (filled: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round">
        {filled
          ? <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeWidth={2} fill="none" stroke="currentColor" />
          : <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>
        }
      </svg>
    ),
  },
  {
    href: '/profile/me',
    label: 'MY',
    icon: (filled: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round">
        {filled
          ? <>
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
            </>
          : <>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </>
        }
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const { user, profile } = useAuth();

  return (
    <>
      <nav className={BOTTOM_NAV_CLASS} style={BOTTOM_NAV_STYLE} aria-label="하단 메뉴">
        {/* Home + Explore */}
        {tabs.slice(0, 2).map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${BOTTOM_NAV_ITEM_CLASS} ${
                isActive ? 'text-gray-900' : 'text-gray-500'
              }`}
              aria-label={tab.label}
            >
              {tab.icon(isActive)}
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}

        {/* Center + button */}
        <button
          onClick={() => router.push('/upload')}
          className={`${BOTTOM_NAV_ITEM_CLASS} ${pathname === '/upload' ? 'text-gray-900' : 'text-gray-500'}`}
          aria-label="올리기"
        >
          <span className={BOTTOM_NAV_CENTER_CLASS}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span className="truncate">올리기</span>
        </button>

        {/* Notifications + Profile */}
        {tabs.slice(2).map((tab) => {
          const isActive = pathname === tab.href;
          const isNotif = tab.href === '/notifications';
          const isProfile = tab.href === '/profile/me';
          const href = isProfile && !user ? '/login?next=/profile/me' : tab.href;
          const showBadge = isNotif && unreadCount > 0;
          return (
            <Link
              key={tab.href}
              href={href}
              className={`${BOTTOM_NAV_ITEM_CLASS} ${
                isActive ? 'text-gray-900' : 'text-gray-500'
              }`}
              aria-label={tab.label}
            >
              <span className="relative flex h-[28px] items-center justify-center">
                {isProfile && profile ? (
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[15px] ${isActive ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}
                    style={{ backgroundColor: profile.avatar_bg }}
                  >
                    {profile.avatar_emoji}
                  </span>
                ) : (
                  tab.icon(isActive)
                )}
              </span>
              <span className="truncate">{tab.label}</span>
              {showBadge && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5 leading-none pointer-events-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

    </>
  );
}
