import Link from 'next/link';
import { mockPosts, formatViews } from '@/lib/mock-data';
import BottomNav from '@/components/layout/BottomNav';
import { notFound } from 'next/navigation';
import PostDetailClient from '@/components/post/PostDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const post = mockPosts.find((p) => p.id === id);
  if (!post) notFound();

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-[17px] font-bold text-gray-900">작품</span>
        <button className="ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </header>

      <PostDetailClient post={post} />

      <BottomNav />
    </div>
  );
}
