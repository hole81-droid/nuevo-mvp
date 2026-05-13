'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

const STORAGE_KEY = 'nuevo_onboarding_done';

export default function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(true); // true = hidden by default (SSR safe)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) queueMicrotask(() => setDismissed(false));
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="mx-4 mt-3 mb-1 p-4 rounded-[28px] bg-black text-white flex items-center gap-3 shadow-[0_24px_36px_rgba(0,0,0,0.16)]">
      <NuevoGlyph kind="spark" size={44} inverted />
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-black tracking-[-0.04em]">nuevo를 시작해보세요!</div>
        <div className="text-[12px] text-white/65 mt-0.5">관심사를 설정하고 창작자를 팔로우해봐요</div>
        <Link
          href="/onboarding"
          className="inline-block mt-2 px-4 py-1.5 bg-white text-black rounded-full text-[12px] font-black"
          onClick={dismiss}
        >
          온보딩 시작 →
        </Link>
      </div>
      <button onClick={dismiss} className="flex-shrink-0 text-white/65 hover:text-white p-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  );
}
