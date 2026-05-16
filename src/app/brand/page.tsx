import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';
import BackButton from '@/components/ui/BackButton';

const METRICS = [
  { value: '73%', label: '광고 완전 시청률', sub: 'vs. 영상 광고 45%' },
  { value: '4.2분', label: '평균 체험 시간', sub: 'vs. 영상 광고 15초' },
  { value: '28%', label: '브랜드 recall', sub: 'vs. 배너 광고 7%' },
];

const FORMATS = [
  {
    emoji: '🎮',
    name: '스폰서드 인터랙티브',
    desc: '브랜드가 의뢰한 인터랙티브 앱을 창작자가 만들어 피드에 올립니다.',
    tags: ['창작자 협업', '네이티브 광고', '체험 기반'],
    example: '"롯데리아 x @minsu_lab — 버거 조합 AI 생성기"',
  },
  {
    emoji: '✨',
    name: '챌린지 스폰서십',
    desc: '해시태그 챌린지를 스폰서하면 창작자들이 앞다퉈 리믹스 버전을 만듭니다.',
    tags: ['리믹스 확산', '챌린지', 'UGC'],
    example: '"#삼성갤럭시필터 — 갤럭시 카메라 효과 AI앱 만들기"',
  },
  {
    emoji: '📊',
    name: '브랜드 리포트',
    desc: '체험 수, 체험 시간, 반응 분포, 인구 통계를 실시간 대시보드로 제공합니다.',
    tags: ['실시간 분석', '캠페인 ROI', 'A/B 테스트'],
    example: '캠페인 기간 내 체험 세션 · 일자별 인게이지먼트 추이',
  },
];

const STEPS = [
  { icon: '💬', title: '브랜드 미팅', desc: '캠페인 목표, 타겟, 예산을 논의합니다.' },
  { icon: '🤝', title: '창작자 매칭', desc: '브랜드에 맞는 창작자를 nuevo가 연결합니다.' },
  { icon: '🚀', title: '앱 출시', desc: '창작자가 만든 브랜드 체험 앱이 피드에 올라갑니다.' },
  { icon: '📈', title: '성과 분석', desc: '실시간 대시보드로 체험 지표를 확인합니다.' },
];

const CASE_STUDIES = [
  {
    brand: '카카오뱅크',
    emoji: '🏦',
    bg: 'from-yellow-100 to-amber-100',
    title: '"나의 소비 유형 AI 분석기"',
    creator: '@yejin_ai',
    sessions: '142,000',
    avgTime: '6.8분',
    result: '앱 다운로드 +34%',
  },
  {
    brand: '올리브영',
    emoji: '🌿',
    bg: 'from-green-100 to-emerald-100',
    title: '"오늘 기분에 맞는 향수 추천"',
    creator: '@sujin_sound',
    sessions: '98,000',
    avgTime: '4.2분',
    result: '해당 향수 매출 +22%',
  },
];

export default function BrandPage() {
  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <div className="flex-1 overflow-y-auto pb-20">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
          <BackButton />
          <span className="text-[17px] font-bold text-gray-900">브랜드 파트너십</span>
        </header>

        {/* Hero */}
        <div className="px-5 pt-7 pb-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
          <div className="text-[11px] font-semibold text-indigo-300 uppercase tracking-widest mb-2">nuevo for Brands</div>
          <div className="text-[26px] font-bold leading-tight mb-3">
            유저가 직접 실행하는<br />인터랙티브 광고
          </div>
          <p className="text-[14px] text-slate-300 leading-relaxed mb-5">
            영상을 보는 게 아니라, 직접 체험합니다.<br />
            AI 창작자와 함께 브랜드 경험을 만드세요.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {METRICS.map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-[22px] font-bold text-white">{m.value}</div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-tight">{m.label}</div>
                <div className="text-[10px] text-slate-500 mt-1">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ad formats */}
        <div className="px-5 pt-6 pb-2">
          <div className="text-[17px] font-bold text-gray-900 mb-1">광고 포맷</div>
          <p className="text-[13px] text-gray-500 mb-4">브랜드 목표에 맞는 포맷을 선택하세요.</p>
          <div className="flex flex-col gap-4">
            {FORMATS.map((f) => (
              <div key={f.name} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="text-[15px] font-bold text-gray-900">{f.name}</span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{f.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {f.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-50 text-[11px] text-indigo-600 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="px-3 py-2 rounded-lg bg-gray-50 text-[12px] text-gray-500 italic">
                  예시: {f.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case studies */}
        <div className="px-5 pt-6 pb-2">
          <div className="text-[17px] font-bold text-gray-900 mb-1">캠페인 사례</div>
          <p className="text-[13px] text-gray-500 mb-4">실제 브랜드 체험 캠페인 결과입니다.</p>
          <div className="flex flex-col gap-3">
            {CASE_STUDIES.map((c) => (
              <div key={c.brand} className={`p-4 rounded-2xl bg-gradient-to-br ${c.bg} border border-white`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-[13px] font-bold text-gray-700">{c.brand}</span>
                  <span className="ml-auto text-[11px] text-gray-500">{c.creator}</span>
                </div>
                <div className="text-[14px] font-semibold text-gray-900 mb-3">{c.title}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/60 rounded-xl p-2.5 text-center">
                    <div className="text-[16px] font-bold text-gray-900">{c.sessions}</div>
                    <div className="text-[10px] text-gray-500">체험 세션</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2.5 text-center">
                    <div className="text-[16px] font-bold text-gray-900">{c.avgTime}</div>
                    <div className="text-[10px] text-gray-500">평균 시간</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2.5 text-center">
                    <div className="text-[13px] font-bold text-gray-900">{c.result}</div>
                    <div className="text-[10px] text-gray-500">캠페인 결과</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="px-5 pt-6 pb-2">
          <div className="text-[17px] font-bold text-gray-900 mb-4">시작하는 방법</div>
          <div className="relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-gray-100" />
            <div className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex items-start gap-4 relative">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-[18px] flex-shrink-0 z-10">
                    {s.icon}
                  </div>
                  <div className="pt-1">
                    <div className="text-[14px] font-bold text-gray-900">{i + 1}. {s.title}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing teaser */}
        <div className="mx-5 mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
          <div className="text-[14px] font-bold text-indigo-700 mb-1">💼 브랜드 요금제</div>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { plan: '스타터', price: '₩500만', unit: '/ 캠페인', desc: '1개 포맷, 창작자 1명' },
              { plan: '그로스', price: '₩1,500만', unit: '/ 캠페인', desc: '2개 포맷, 창작자 3명, 리포트' },
              { plan: '엔터프라이즈', price: '별도 문의', unit: '', desc: '전담 매니저, 무제한 창작자' },
            ].map((p) => (
              <div key={p.plan} className="flex items-center justify-between py-2 border-b border-indigo-100 last:border-0">
                <div>
                  <div className="text-[13px] font-semibold text-gray-800">{p.plan}</div>
                  <div className="text-[11px] text-gray-500">{p.desc}</div>
                </div>
                <div className="text-right">
                  <span className="text-[14px] font-bold text-indigo-700">{p.price}</span>
                  <span className="text-[11px] text-gray-400 ml-0.5">{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mx-5 mt-5 mb-2 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center">
          <div className="text-[18px] font-bold mb-1">브랜드 미팅 신청하기</div>
          <p className="text-[13px] text-slate-300 mb-4">캠페인 목표를 알려주시면 맞춤 제안서를 드립니다.</p>
          <button className="px-6 py-2.5 bg-white text-gray-900 rounded-full text-[14px] font-bold">
            brand@nuevo.app 문의하기
          </button>
          <div className="mt-3 text-[12px] text-slate-400">
            또는 아래에서 직접 브랜드 계정을 만들어보세요
          </div>
          <Link href="/upload" className="inline-block mt-2 text-[12px] text-indigo-300 underline underline-offset-2">
            창작자로 먼저 시작하기 →
          </Link>
        </div>

        <div className="h-4" />
      </div>
      <BottomNav />
    </div>
  );
}
