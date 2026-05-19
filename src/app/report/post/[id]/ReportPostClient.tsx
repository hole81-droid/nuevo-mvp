'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  REPORT_REASON_OPTIONS,
  buildPostReportRequest,
  normalizeReportReason,
} from '@/lib/trust-safety';

export default function ReportPostClient({ postId, nextPath }: { postId: string; nextPath: string }) {
  const [reason, setReason] = useState('unsafe');
  const [detail, setDetail] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const reportRequest = useMemo(
    () => buildPostReportRequest({
      postId,
      reason,
      detail,
      reporterEmail,
      currentUrl: nextPath,
    }),
    [detail, nextPath, postId, reason, reporterEmail],
  );

  const copyReport = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(reportRequest.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const submitReport = async () => {
    setSubmitting(true);
    setSubmitError('');
    setSubmitted(false);

    const response = await fetch('/api/moderation-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        reason,
        detail,
        reporterEmail,
        currentUrl: nextPath,
      }),
    });
    const result = await response.json().catch(() => ({}));

    setSubmitting(false);
    if (!response.ok) {
      setSubmitError(result.error ?? '신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="px-5 pb-6 pt-6">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-red-500">Safety report</div>
      <h1 className="mt-2 text-[30px] font-black leading-[0.98] tracking-[-0.05em] text-gray-950">
        게시물 신고
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-gray-500">
        게시물, 외부 앱 링크, 설명, 댓글이 위험하거나 권리를 침해한다고 판단되면 신고 요청서를 보내 주세요.
      </p>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <label className="text-[13px] font-black text-gray-950" htmlFor="report-reason">신고 사유</label>
        <select
          id="report-reason"
          value={reason}
          onChange={(event) => setReason(normalizeReportReason(event.target.value))}
          className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-[14px] font-bold text-gray-800"
        >
          {REPORT_REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label className="mt-4 block text-[13px] font-black text-gray-950" htmlFor="report-detail">상세 설명</label>
        <textarea
          id="report-detail"
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          rows={5}
          placeholder="무엇이 문제인지, 어느 부분을 확인해야 하는지 적어 주세요."
          className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-3 py-3 text-[14px] leading-relaxed text-gray-800 outline-none focus:border-black"
        />

        <label className="mt-4 block text-[13px] font-black text-gray-950" htmlFor="report-email">연락처 선택 입력</label>
        <input
          id="report-email"
          value={reporterEmail}
          onChange={(event) => setReporterEmail(event.target.value)}
          placeholder="답변 받을 이메일"
          className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-3 text-[14px] text-gray-800 outline-none focus:border-black"
        />
      </section>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-[#FFFDF5] p-4">
        <div className="text-[13px] font-black text-gray-950">요청서 미리보기</div>
        <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-[12px] leading-relaxed text-gray-600">
          {reportRequest.body}
        </pre>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={submitReport}
          disabled={submitting || submitted}
          className="h-12 rounded-full bg-black text-[13px] font-black text-white disabled:bg-gray-300"
        >
          {submitted ? '접수 완료' : submitting ? '접수 중...' : '신고 제출'}
        </button>
        <button
          type="button"
          onClick={copyReport}
          className="h-12 rounded-full border-2 border-black text-[13px] font-black text-black"
        >
          {copied ? '복사됨' : '신고서 복사'}
        </button>
      </div>

      {submitted && (
        <div className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-[13px] font-bold leading-relaxed text-green-700">
          신고가 운영 검토 큐에 접수되었습니다. 필요한 경우 입력한 연락처로 추가 확인을 요청할게요.
        </div>
      )}
      {submitError && (
        <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-bold leading-relaxed text-red-600">
          {submitError}
        </div>
      )}
      <a
        href={reportRequest.href}
        className="mt-3 flex h-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[13px] font-black text-gray-600"
      >
        메일로 백업 신고
      </a>

      <Link
        href={nextPath}
        className="mt-4 flex h-11 items-center justify-center rounded-full bg-[#F7F7F2] text-[13px] font-black text-gray-700"
      >
        게시물로 돌아가기
      </Link>
    </div>
  );
}
