'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import type { MvpQaArea, MvpQaChecklistItem } from '@/lib/mvp-qa-checklist';
import {
  buildQaProgressReport,
  buildQaMarkdownReport,
  filterQaItemsByStatus,
  getInitialQaProgress,
  getMvpReleaseGate,
  importQaProgressReport,
  setQaItemStatus,
  summarizeQaProgress,
  type QaProgressMap,
  type QaItemStatus,
} from '@/lib/mvp-qa-progress';

const STORAGE_KEY = 'nuevo:mvp-qa-progress:v1';
const STORAGE_EVENT = 'nuevo:mvp-qa-progress-updated';

const AREA_LABELS: Record<MvpQaArea, string> = {
  'external-deeplink': '외부 앱 딥링크',
  'mobile-lcp': '모바일 LCP',
  'wes-export': 'WES export',
  'visual-review': '시각 QA',
};

const AREA_ORDER = Object.keys(AREA_LABELS) as MvpQaArea[];

function parseProgress(snapshot: string, items: MvpQaChecklistItem[]) {
  try {
    const saved = JSON.parse(snapshot || '{}') as QaProgressMap;
    return { ...getInitialQaProgress(items), ...saved };
  } catch {
    return getInitialQaProgress(items);
  }
}

function subscribeToProgress(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getProgressSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? '{}';
}

function getServerProgressSnapshot() {
  return '{}';
}

function saveProgress(progress: QaProgressMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function StatusButton({
  active,
  status,
  children,
  onClick,
}: {
  active: boolean;
  status: QaItemStatus;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const activeClass = status === 'pass' ? 'bg-emerald-600 text-white' : status === 'fail' ? 'bg-red-600 text-white' : 'bg-black text-white';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full px-3 text-[12px] font-black transition-all active:scale-95 ${
        active ? activeClass : 'border border-[#D7D7CF] bg-white text-[#575752]'
      }`}
    >
      {children}
    </button>
  );
}

export default function QaChecklistClient({ items }: { items: MvpQaChecklistItem[] }) {
  const progressSnapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, getServerProgressSnapshot);
  const progress = useMemo(() => parseProgress(progressSnapshot, items), [items, progressSnapshot]);
  const summary = useMemo(() => summarizeQaProgress(items, progress), [items, progress]);
  const releaseGate = useMemo(() => getMvpReleaseGate(items, progress), [items, progress]);
  const [filter, setFilter] = useState<QaItemStatus | 'all' | 'evidence-missing'>('all');
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const visibleItems = useMemo(() => filterQaItemsByStatus(items, progress, filter), [filter, items, progress]);
  const reportText = useMemo(() => JSON.stringify(buildQaProgressReport(items, progress), null, 2), [items, progress]);
  const markdownReportText = useMemo(() => buildQaMarkdownReport(items, progress), [items, progress]);

  const updateStatus = (itemId: string, status: QaItemStatus) => {
    saveProgress(setQaItemStatus(progress, itemId, status, progress[itemId]?.note ?? ''));
  };

  const updateNote = (itemId: string, note: string) => {
    saveProgress(setQaItemStatus(progress, itemId, progress[itemId]?.status ?? 'pending', note));
  };

  const reset = () => {
    const initial = getInitialQaProgress(items);
    saveProgress(initial);
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
  };

  const downloadReport = () => {
    const blob = new Blob([`${reportText}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nuevo-mvp-qa-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyMarkdownReport = async () => {
    await navigator.clipboard.writeText(markdownReportText);
  };

  const downloadMarkdownReport = () => {
    const blob = new Blob([markdownReportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nuevo-mvp-qa-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importReport = () => {
    const result = importQaProgressReport(items, importText);
    if (!result.ok) {
      setImportMessage(result.error);
      return;
    }
    saveProgress(result.progress);
    setImportText('');
    setImportMessage(`${result.imported}개 QA 항목을 불러왔습니다.`);
  };

  return (
    <>
      <section className="mx-auto max-w-[1080px] px-5 py-6">
        <div className={`mb-3 rounded-[8px] border px-4 py-3 ${
          releaseGate.status === 'ready'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
            : 'border-red-200 bg-red-50 text-red-900'
        }`}>
          <div className="text-[12px] font-black uppercase tracking-[0.12em]">
            {releaseGate.status === 'ready' ? 'MVP QA READY' : 'MVP QA BLOCKED'}
          </div>
          <div className="mt-1 text-[15px] font-black">{releaseGate.message}</div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-[8px] border border-[#D7D7CF] bg-white p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7D7D78]">Progress</div>
            <div className="mt-2 text-[30px] font-black">{summary.completionPercent}%</div>
            <button type="button" onClick={reset} className="mt-2 text-[12px] font-black text-[#575752] underline">
              초기화
            </button>
          </div>
          {[
            ['PASS', summary.pass, 'text-emerald-700'],
            ['FAIL', summary.fail, 'text-red-700'],
            ['PENDING', summary.pending, 'text-[#575752]'],
            ['TOTAL', summary.total, 'text-black'],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-[8px] border border-[#D7D7CF] bg-white p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7D7D78]">{label}</div>
              <div className={`mt-2 text-[30px] font-black ${tone}`}>{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(['all', 'pending', 'pass', 'fail', 'evidence-missing'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`h-10 rounded-full px-4 text-[12px] font-black uppercase ${
                filter === status ? 'bg-black text-white' : 'border border-[#D7D7CF] bg-white text-[#575752]'
              }`}
            >
              {status === 'evidence-missing' ? 'evidence' : status}
            </button>
          ))}
          <button type="button" onClick={copyReport} className="ml-auto h-10 rounded-full border border-black px-4 text-[12px] font-black">
            리포트 복사
          </button>
          <button type="button" onClick={downloadReport} className="h-10 rounded-full bg-black px-4 text-[12px] font-black text-white">
            JSON 다운로드
          </button>
          <button type="button" onClick={copyMarkdownReport} className="h-10 rounded-full border border-black px-4 text-[12px] font-black">
            Markdown 복사
          </button>
          <button type="button" onClick={downloadMarkdownReport} className="h-10 rounded-full bg-[#EFEFE8] px-4 text-[12px] font-black text-black">
            MD 다운로드
          </button>
        </div>
        <div className="mt-3 rounded-[8px] border border-[#D7D7CF] bg-white p-3">
          <div className="text-[12px] font-black uppercase tracking-[0.12em] text-[#7D7D78]">Import QA Report</div>
          <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="다운로드한 nuevo MVP QA JSON을 붙여넣기"
              className="min-h-[84px] resize-none rounded-[8px] border border-[#D7D7CF] px-3 py-2 text-[12px] outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={importReport}
              className="h-11 self-end rounded-full bg-black px-4 text-[12px] font-black text-white disabled:bg-[#CFCFC7]"
              disabled={!importText.trim()}
            >
              리포트 불러오기
            </button>
          </div>
          {importMessage && <div className="mt-2 text-[12px] font-bold text-[#575752]">{importMessage}</div>}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1080px] gap-4 px-5 pb-10">
        {AREA_ORDER.map((area) => {
          const areaItems = visibleItems.filter((item) => item.area === area);
          if (!areaItems.length) return null;
          return (
            <section key={area} className="rounded-[8px] border border-[#D7D7CF] bg-white">
              <div className="border-b border-[#EFEFE8] px-4 py-3">
                <h2 className="text-[20px] font-black tracking-[-0.04em]">{AREA_LABELS[area]}</h2>
              </div>
              <div className="divide-y divide-[#EFEFE8]">
                {areaItems.map((item) => {
                  const itemProgress = progress[item.id] ?? { status: 'pending', note: '' };
                  return (
                    <article key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_1fr_1.4fr]">
                      <div>
                        <div className="text-[12px] font-black text-[#7D7D78]">{item.source}</div>
                        <div className="mt-1 text-[16px] font-black text-gray-950">{item.title}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusButton active={itemProgress.status === 'pass'} status="pass" onClick={() => updateStatus(item.id, 'pass')}>PASS</StatusButton>
                          <StatusButton active={itemProgress.status === 'fail'} status="fail" onClick={() => updateStatus(item.id, 'fail')}>FAIL</StatusButton>
                          <StatusButton active={itemProgress.status === 'pending'} status="pending" onClick={() => updateStatus(item.id, 'pending')}>PENDING</StatusButton>
                        </div>
                      </div>
                      <div className="rounded-[8px] bg-[#EFEFE8] px-3 py-2 text-[12px] font-bold">{item.route}</div>
                      <div>
                        <div className="text-[13px] leading-5 text-[#575752]">
                          {item.expected}
                          {item.requiresLiveData && (
                            <span className="ml-2 inline-flex rounded-full bg-black px-2 py-0.5 text-[10px] font-black text-white">
                              LIVE DATA
                            </span>
                          )}
                          {item.evidenceRequired && (
                            <span className="ml-2 inline-flex rounded-full bg-[#EFEFE8] px-2 py-0.5 text-[10px] font-black text-[#575752]">
                              EVIDENCE REQUIRED
                            </span>
                          )}
                        </div>
                        <textarea
                          value={itemProgress.note}
                          onChange={(event) => updateNote(item.id, event.target.value)}
                          placeholder={item.evidenceRequired ? '증거 메모: 기기/브라우저/스크린샷 링크/측정값' : '결과 메모'}
                          className="mt-3 min-h-[72px] w-full resize-none rounded-[8px] border border-[#D7D7CF] bg-white px-3 py-2 text-[13px] outline-none focus:border-black"
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>
    </>
  );
}
