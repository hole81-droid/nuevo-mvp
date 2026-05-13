import Link from 'next/link';
import SettingsClient from './SettingsClient';
import BottomNav from '@/components/layout/BottomNav';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <Link href="/profile/me" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-[17px] font-bold text-gray-900">설정</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <SettingsClient />
      </main>

      <BottomNav />
    </div>
  );
}
