'use client';

import { useState } from 'react';
import type { PayoutRequestRow } from '@/lib/supabase/types';
import { getPayoutEligibility, MIN_PAYOUT_KRW } from '@/lib/payout';

function fmtKRW(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${n.toLocaleString()}원`;
}

const STATUS_LABEL: Record<PayoutRequestRow['status'], string> = {
  requested: '요청 접수',
  reviewing: '검토 중',
  approved: '승인됨',
  paid: '지급 완료',
  rejected: '반려됨',
};

export default function PayoutRequestPanel({
  month,
  amountKrw,
  existingRequest,
}: {
  month: string;
  amountKrw: number;
  existingRequest: PayoutRequestRow | null;
}) {
  const [request, setRequest] = useState<PayoutRequestRow | null>(existingRequest);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const eligibility = getPayoutEligibility(amountKrw, request?.status ?? null);

  const submit = async () => {
    if (!eligibility.eligible) {
      setMessage(eligibility.reason);
      return;
    }

    setSubmitting(true);
    setMessage('');

    const response = await fetch('/api/payout-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, amountKrw }),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.error ?? '정산 요청에 실패했습니다.');
      return;
    }

    setRequest(payload.payoutRequest);
    setMessage('정산 요청이 접수됐습니다.');
  };

  return (
    <div className="mx-4 mb-6 p-4 rounded-[28px] bg-[#F7F7F2] border-2 border-[#D8D8D0]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-bold text-gray-900 mb-2">정산 안내</div>
          <div className="text-[13px] text-gray-600 leading-relaxed space-y-1">
            <div>· 매월 말일 기준 WES 집계</div>
            <div>· 다음 달 15일 등록 계좌로 입금 처리</div>
            <div>· 최소 정산 금액: {MIN_PAYOUT_KRW.toLocaleString()}원</div>
            <div>· 현재 요청 가능 금액: {fmtKRW(amountKrw)}</div>
          </div>
        </div>
        {request && (
          <div className="px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-black whitespace-nowrap">
            {STATUS_LABEL[request.status]}
          </div>
        )}
      </div>

      {message && (
        <div className="mt-3 rounded-2xl bg-[#EFEFE8] px-3 py-2 text-[12px] text-gray-700">
          {message}
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting || !eligibility.eligible}
        className="mt-3 w-full py-3 rounded-full bg-black text-white text-[14px] font-black tracking-[-0.04em] transition-all active:scale-[0.98] disabled:bg-[#CFCFC7] disabled:shadow-none disabled:cursor-not-allowed"
      >
        {request ? '정산 요청됨' : submitting ? '요청 중...' : '정산 요청하기'}
      </button>
      {!eligibility.eligible && !request && (
        <div className="mt-2 text-center text-[12px] text-gray-400">{eligibility.reason}</div>
      )}
    </div>
  );
}
