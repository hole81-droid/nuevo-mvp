import SettingsClient from './SettingsClient';
import BottomNav from '@/components/layout/BottomNav';
import BackButton from '@/components/ui/BackButton';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <BackButton fallbackHref="/profile/me" />
        <span className="text-[17px] font-bold text-gray-900">설정</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <SettingsClient />
      </main>

      <BottomNav />
    </div>
  );
}
