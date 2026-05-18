'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { buildAccountDeletionRequest } from '@/lib/trust-safety';

export default function DeleteAccountClient() {
  const { user, profile } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const deletionRequest = useMemo(
    () => buildAccountDeletionRequest({
      userId: user?.id,
      email: user?.email ?? profile?.email,
      handle: profile?.handle,
    }),
    [profile?.email, profile?.handle, user?.email, user?.id],
  );

  const copyRequest = async () => {
    if (!confirmed || !navigator.clipboard) return;
    await navigator.clipboard.writeText(deletionRequest.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!user) {
    return (
      <div className="px-5 pt-8">
        <div className="rounded-2xl border border-[#E4E4DC] bg-[#F7F7F2] p-5">
          <div className="text-[18px] font-black text-gray-950">로그인이 필요합니다</div>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
            계정 삭제 요청은 본인 계정 확인 후 진행됩니다.
          </p>
          <Link
            href="/login?next=/settings/delete-account"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-black px-5 text-[13px] font-black text-white"
          >
            로그인하고 계속
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-6 pt-6">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-red-500">Account deletion</div>
      <h1 className="mt-2 text-[30px] font-black leading-[0.98] tracking-[-0.05em] text-gray-950">
        계정 삭제 요청
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-gray-500">
        현재 MVP에서는 운영팀 확인 기반으로 계정 삭제를 처리합니다. 요청서에는 본인 확인을 위한 최소 계정 정보만 포함됩니다.
      </p>

      <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
        <div className="text-[14px] font-black text-red-700">삭제 대상</div>
        <ul className="mt-3 flex flex-col gap-2">
          {['프로필과 로그인 계정 연결 정보', '업로드한 게시물과 외부 앱 링크', '댓글, 반응, 저장, 팔로우 기록', 'Studio/WES에서 계정에 연결된 집계 데이터'].map((item) => (
            <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-red-700">
              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <label className="mt-5 flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-1 h-4 w-4 accent-black"
        />
        <span className="text-[13px] font-bold leading-relaxed text-gray-700">
          계정 삭제 요청이 처리되면 일부 데이터는 복구할 수 없다는 점을 이해했습니다.
        </span>
      </label>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-[#FFFDF5] p-4">
        <div className="text-[13px] font-black text-gray-950">요청서 미리보기</div>
        <pre className="mt-3 max-h-52 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-[12px] leading-relaxed text-gray-600">
          {deletionRequest.body}
        </pre>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copyRequest}
          disabled={!confirmed}
          className="h-12 rounded-full border-2 border-black text-[13px] font-black text-black disabled:border-gray-200 disabled:text-gray-300"
        >
          {copied ? '복사됨' : '요청서 복사'}
        </button>
        <a
          href={confirmed ? deletionRequest.href : undefined}
          aria-disabled={!confirmed}
          className={`flex h-12 items-center justify-center rounded-full text-[13px] font-black ${
            confirmed ? 'bg-black text-white' : 'bg-gray-100 text-gray-300'
          }`}
        >
          메일로 요청
        </a>
      </div>
    </div>
  );
}
