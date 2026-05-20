'use client';

import { useRouter } from 'next/navigation';
import { shouldUseInternalBackFallback } from '@/lib/traffic-source';

export default function BackButton({
  fallbackHref = '/',
  variant = 'default',
}: {
  fallbackHref?: string;
  /** 'default': dark icon on light bg. 'inverted': white icon for dark/overlay bg. */
  variant?: 'default' | 'inverted';
}) {
  const router = useRouter();

  const handleClick = () => {
    const useFallback = shouldUseInternalBackFallback({
      historyLength: window.history.length,
      search: window.location.search,
      referrer: document.referrer,
    });

    if (!useFallback && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-9 h-9 flex items-center justify-center rounded-full ${
        variant === 'inverted'
          ? 'text-white hover:bg-white/20'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
