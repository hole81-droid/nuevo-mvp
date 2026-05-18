import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/layout/BottomNav';
import { safeNextPath } from '@/lib/safe-next-path';
import ReportPostClient from './ReportPostClient';

export const metadata = {
  title: '게시물 신고 | nuevo',
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function ReportPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const nextPath = safeNextPath(rawNext, `/post/${id}`);

  return (
    <div className="flex h-full max-w-[430px] mx-auto flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-[53px] items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-sm">
        <BackButton fallbackHref={nextPath} />
        <span className="text-[17px] font-bold text-gray-900">게시물 신고</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <ReportPostClient postId={id} nextPath={nextPath} />
      </main>

      <BottomNav />
    </div>
  );
}
