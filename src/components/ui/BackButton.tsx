'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ fallbackHref = '/' }: { fallbackHref?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
