import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/layout/BottomNav';
import DeleteAccountClient from './DeleteAccountClient';

export const metadata = {
  title: '계정 삭제 | nuevo',
};

export default function DeleteAccountPage() {
  return (
    <div className="flex h-full max-w-[430px] mx-auto flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-[53px] items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-sm">
        <BackButton fallbackHref="/settings" />
        <span className="text-[17px] font-bold text-gray-900">계정 삭제</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <DeleteAccountClient />
      </main>

      <BottomNav />
    </div>
  );
}
