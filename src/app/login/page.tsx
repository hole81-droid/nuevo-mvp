'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NuevoGlyph from '@/components/ui/NuevoGlyph';
import { safeNextPath } from '@/lib/safe-next-path';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'), '/');
  const { user, loading, signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, next, router, user]);

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    await signInWithGoogle(next);
    setSubmitting(false);
  };

  return (
    <div className="min-h-full max-w-[430px] mx-auto flex flex-col bg-white">
      <header className="h-[53px] px-4 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Link>
        <span className="text-[17px] font-bold">로그인</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 px-6 py-10 flex flex-col">
        <div className="mb-10">
          <NuevoGlyph kind="spark" size={68} />
          <h1 className="mt-6 text-[38px] font-black leading-[0.92] tracking-[-0.07em] text-gray-950 uppercase">
            올리고,<br />바로 놀아보세요
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
            AI로 만든 앱을 URL로 올리고, 사람들이 피드 안에서 직접 체험하게 하세요.
          </p>
        </div>

        <div className="rounded-[30px] border-2 border-[#D8D8D0] bg-[#F7F7F2] p-4 mb-6">
          <div className="text-[13px] font-black tracking-[-0.04em] text-black mb-2">MVP에서 필요한 계정</div>
          <div className="text-[13px] text-gray-700 leading-relaxed">
            업로드, 리믹스, 스튜디오 수익 대시보드는 창작자 계정과 연결됩니다.
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full h-[62px] rounded-full border-2 border-black bg-black flex items-center justify-center gap-3 text-[17px] font-black tracking-[-0.04em] text-white active:scale-[0.98] disabled:opacity-60 shadow-[0_24px_34px_rgba(0,0,0,0.16)]"
        >
          <span className="text-[20px]">G</span>
          {submitting ? 'Google로 이동 중...' : 'Google로 계속하기'}
        </button>

        <div className="mt-auto pt-8 text-[12px] text-gray-400 leading-relaxed text-center">
          계속하면 nuevo의 이용약관과 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </div>
      </main>
    </div>
  );
}
