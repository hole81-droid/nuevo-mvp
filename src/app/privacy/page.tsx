import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/layout/BottomNav';
import { TRUST_CONTACT_EMAILS } from '@/lib/trust-safety';

export const metadata = {
  title: '개인정보 처리방침 | nuevo',
};

const PRIVACY_SECTIONS = [
  {
    title: '수집하는 정보',
    items: [
      '로그인 계정 정보: 이메일, 사용자 ID, 프로필 핸들, 표시 이름',
      '창작물 정보: 게시물 제목, 설명, 태그, 외부 앱 URL, 외부 리소스 링크',
      '사용 기록: 체험 시작/종료 시간, 체험 시간, 반응, 댓글, 저장, 공유, 리믹스, 유입 출처',
      '기기/브라우저 정보: 오류 분석과 모바일 QA에 필요한 기본 접속 환경 정보',
    ],
  },
  {
    title: '사용 목적',
    items: [
      '게시물 업로드, 피드 노출, 외부 딥링크와 즉시 체험 제공',
      '창작자 Fame, WES, 유입 채널, CSV export 제공',
      '신고 검토, 악용 방지, 계정 보호, 서비스 안정성 개선',
      'MVP 실험 결과 분석과 제품 개선',
    ],
  },
  {
    title: '보관과 삭제',
    items: [
      '계정과 연결된 데이터는 서비스 제공과 안전 운영에 필요한 기간 동안 보관합니다.',
      '계정 삭제 요청이 접수되면 운영팀이 본인 확인 후 계정과 연결 데이터를 삭제 처리합니다.',
      '법적 의무, 분쟁 대응, 부정 사용 방지를 위해 필요한 일부 기록은 제한된 기간 동안 보관될 수 있습니다.',
    ],
  },
  {
    title: '사용자 권리',
    items: [
      '사용자는 본인 계정 정보와 게시물 정보를 확인하고 수정할 수 있습니다.',
      '사용자는 계정 삭제를 요청할 수 있습니다.',
      '개인정보, 신고, 권리 침해 관련 문의는 개인정보 연락처로 보낼 수 있습니다.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex h-full max-w-[430px] mx-auto flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-[53px] items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-sm">
        <BackButton fallbackHref="/settings" />
        <span className="text-[17px] font-bold text-gray-900">개인정보 처리방침</span>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 pt-6">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-warm">Privacy</div>
        <h1 className="mt-2 text-[30px] font-black leading-[0.98] tracking-[-0.05em] text-gray-950">
          어떤 데이터를 왜 쓰는지 명확히 알립니다
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-gray-500">
          최종 업데이트: 2026년 5월 19일. nuevo MVP는 창작물 체험과 성과 측정을 위해 필요한 데이터만 최소한으로 다룹니다.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <h2 className="text-[15px] font-black text-gray-950">{section.title}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-gray-600">
                    <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warm" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[#E4E4DC] bg-[#F7F7F2] p-4">
          <div className="text-[13px] font-black text-gray-950">계정 삭제와 개인정보 문의</div>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
            설정의 <Link href="/settings/delete-account" className="font-black text-black underline underline-offset-2">계정 삭제</Link>에서 요청서를 만들거나 {TRUST_CONTACT_EMAILS.privacy}로 문의해 주세요.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
