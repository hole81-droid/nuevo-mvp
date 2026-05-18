import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/layout/BottomNav';
import { TRUST_CONTACT_EMAILS } from '@/lib/trust-safety';

export const metadata = {
  title: '이용약관 | nuevo',
};

const TERMS = [
  {
    title: '서비스 목적',
    body: 'nuevo는 창작자가 이미 만든 AI 앱, 데모, 인터랙티브 콘텐츠의 링크를 게시하고 방문자가 설치 없이 체험할 수 있도록 돕는 MVP 서비스입니다.',
  },
  {
    title: '창작자 책임',
    body: '창작자는 본인이 올리는 앱 URL, 설명, 이미지, 외부 리소스 링크에 필요한 권리를 보유해야 하며, 타인의 권리나 개인정보를 침해하지 않아야 합니다.',
  },
  {
    title: '금지 콘텐츠',
    body: '불법 행위, 사기, 악성 코드, 혐오와 괴롭힘, 미성년자에게 부적절한 성적 콘텐츠, 명백한 권리 침해 콘텐츠는 게시할 수 없습니다.',
  },
  {
    title: '게시물 검토와 제한',
    body: '신고가 접수되거나 서비스 안전에 위험이 있다고 판단되는 경우 nuevo는 게시물 숨김, 외부 링크 차단, 계정 제한, 추가 확인 요청을 진행할 수 있습니다.',
  },
  {
    title: '성과 지표와 정산',
    body: 'MVP 단계의 Fame, WES, 예상 수익 정보는 창작자 성과를 이해하기 위한 지표입니다. 실제 정산 또는 파트너 조건은 별도 안내와 검토 절차에 따릅니다.',
  },
  {
    title: '문의',
    body: `약관, 신고, 권리 침해 문의는 ${TRUST_CONTACT_EMAILS.safety}로 연락해 주세요.`,
  },
];

export default function TermsPage() {
  return (
    <div className="flex h-full max-w-[430px] mx-auto flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-[53px] items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-sm">
        <BackButton fallbackHref="/settings" />
        <span className="text-[17px] font-bold text-gray-900">이용약관</span>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 pt-6">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-warm">nuevo MVP</div>
        <h1 className="mt-2 text-[30px] font-black leading-[0.98] tracking-[-0.05em] text-gray-950">
          창작자와 방문자를 위한 기본 약속
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-gray-500">
          최종 업데이트: 2026년 5월 19일. 본 문서는 MVP 운영 기준을 사용자에게 공개하기 위한 기본 약관입니다.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {TERMS.map((item) => (
            <section key={item.title} className="rounded-2xl border border-gray-100 bg-[#FFFDF5] p-4">
              <h2 className="text-[15px] font-black text-gray-950">{item.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-600">{item.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[#E4E4DC] bg-[#F7F7F2] p-4 text-[13px] leading-relaxed text-gray-600">
          개인정보 처리 기준은 <Link href="/privacy" className="font-black text-black underline underline-offset-2">개인정보 처리방침</Link>에서 확인할 수 있습니다.
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
