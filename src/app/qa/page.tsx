import Link from 'next/link';
import QaChecklistClient from './QaChecklistClient';
import { MVP_QA_CHECKLIST } from '@/lib/mvp-qa-checklist';

export default function QaPage() {
  return (
    <main className="min-h-screen bg-[#F8F8F3] text-[#050505]">
      <header className="border-b border-[#D7D7CF] bg-white">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-5 py-5">
          <div>
            <div className="text-[12px] font-black uppercase tracking-[0.18em] text-[#7D7D78]">nuevo MVP</div>
            <h1 className="mt-1 text-[32px] font-black leading-none tracking-[-0.05em]">QA 실행판</h1>
          </div>
          <Link href="/settings" className="rounded-full bg-black px-4 py-2 text-[13px] font-black text-white">
            Settings
          </Link>
        </div>
      </header>

      <QaChecklistClient items={MVP_QA_CHECKLIST} />
    </main>
  );
}
