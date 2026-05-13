import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';

const TIERS = [
  { tier: '새싹', badge: '✦', sessions: '0+', rate: '60%', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { tier: '성장', badge: '✦✦', sessions: '5,000+', rate: '70%', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { tier: '프로', badge: '✦✦✦', sessions: '30,000+', rate: '75%', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { tier: '챔피언', badge: '✦✦✦✦', sessions: '100,000+', rate: '80%', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
];

const STEPS = [
  {
    num: '01',
    title: 'AI로 앱 만들기',
    desc: 'Claude Code, Cursor, Replit 등으로 인터랙티브 앱을 만드세요. 입력 받고, 결과를 보여주는 것이면 무엇이든 됩니다.',
    tips: ['X-Frame-Options를 ALLOWALL로 설정하면 iframe 임베딩이 가능합니다', '모바일 최적화 (430px 기준)로 만들면 더 좋아요', 'CORS 없이 배포하려면 /demo/[id] 라우트를 활용하세요'],
  },
  {
    num: '02',
    title: 'URL 복사 후 올리기',
    desc: '앱을 Vercel, Replit, GitHub Pages 등에 배포하고 URL을 복사하세요. nuevo에서 "+" 버튼을 눌러 올려보세요.',
    tips: ['미리보기 버튼으로 임베딩이 되는지 먼저 확인하세요', 'Replit은 기본적으로 iframe 허용', 'GitHub Pages는 일반적으로 임베딩 가능'],
  },
  {
    num: '03',
    title: '수익 창출 시작',
    desc: '파트너 프로그램에 가입하면 체험 수와 시간을 기반으로 매달 정산을 받을 수 있습니다.',
    tips: ['누적 체험 세션 5,000회 이상이면 성장 파트너 신청 가능', '리믹스를 허용하면 추가 수익 발생', '월말 자동 정산, 최소 출금 금액 ₩10,000'],
  },
];

export default function GuidePage() {
  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      <div className="flex-1 overflow-y-auto pb-20">

        {/* Hero */}
        <div className="px-5 pt-7 pb-6 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="text-[11px] font-semibold text-warm uppercase tracking-widest mb-2">창작자 가이드</div>
          <div className="text-[26px] font-bold text-gray-900 leading-tight">
            AI로 만들고,<br />올리고, 수익 내기
          </div>
          <p className="mt-3 text-[14px] text-gray-600 leading-relaxed">
            nuevo는 AI 인터랙티브 앱을 공유하는 플랫폼입니다. 유저가 직접 체험하면 체험 시간에 비례해 수익이 쌓입니다.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-warm text-white rounded-full text-[14px] font-semibold"
          >
            지금 올리기 →
          </Link>
        </div>

        {/* How to start */}
        <div className="px-5 pt-6 pb-2">
          <div className="text-[17px] font-bold text-gray-900 mb-4">시작하는 방법</div>
          <div className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-warm text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-gray-900">{step.title}</div>
                    <p className="mt-1 text-[13px] text-gray-600 leading-relaxed">{step.desc}</p>
                    <ul className="mt-2.5 flex flex-col gap-1">
                      {step.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-1.5 text-[12px] text-gray-500">
                          <span className="text-warm mt-0.5 flex-shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WES Formula */}
        <div className="px-5 pt-6 pb-2">
          <div className="text-[17px] font-bold text-gray-900 mb-1">수익 계산 방법 (WES)</div>
          <p className="text-[13px] text-gray-500 mb-4">WES(Weighted Experience Score)를 기반으로 매달 수익을 정산합니다.</p>

          <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-[13px] leading-relaxed mb-4">
            WES = 체험수×1.0 + 체험분×0.8<br />
            {'     '}+ 반응수×1.5 + 댓글수×2.0<br />
            {'     '}+ 리믹스수×5.0
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: '체험 1회', value: '+1.0점', color: 'bg-orange-50 border-orange-100' },
              { label: '체험 1분', value: '+0.8점', color: 'bg-amber-50 border-amber-100' },
              { label: '반응 1개', value: '+1.5점', color: 'bg-pink-50 border-pink-100' },
              { label: '댓글 1개', value: '+2.0점', color: 'bg-purple-50 border-purple-100' },
              { label: '리믹스 1개', value: '+5.0점', color: 'bg-blue-50 border-blue-100' },
              { label: '월 정산', value: '자동', color: 'bg-green-50 border-green-100' },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border ${item.color} flex flex-col`}>
                <div className="text-[11px] text-gray-500">{item.label}</div>
                <div className="text-[15px] font-bold text-gray-800 mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Tiers */}
        <div className="px-5 pt-6 pb-2">
          <div className="text-[17px] font-bold text-gray-900 mb-1">파트너 등급</div>
          <p className="text-[13px] text-gray-500 mb-4">등급이 높을수록 더 많은 수익을 받습니다.</p>
          <div className="flex flex-col gap-2.5">
            {TIERS.map((t) => (
              <div key={t.tier} className={`flex items-center justify-between p-3.5 rounded-xl border ${t.border} ${t.bg}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`text-[15px] ${t.color} font-bold`}>{t.badge}</span>
                  <div>
                    <div className={`text-[13px] font-bold ${t.color}`}>{t.tier} 파트너</div>
                    <div className="text-[11px] text-gray-500">월간 체험 {t.sessions}회</div>
                  </div>
                </div>
                <div className={`text-[18px] font-bold ${t.color}`}>{t.rate}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-gray-400 text-center">
            WES 기준 월간 집계 → 자동 승급 · 강등
          </p>
        </div>

        {/* Embed Spec */}
        <div className="px-5 pt-6 pb-2">
          <div className="text-[17px] font-bold text-gray-900 mb-1">앱 임베딩 스펙</div>
          <p className="text-[13px] text-gray-500 mb-4">외부 URL을 새로운 앱으로 올리려면 아래 설정이 필요합니다.</p>

          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="text-[13px] font-bold text-gray-800 mb-2">① X-Frame-Options 설정</div>
              <div className="bg-slate-100 rounded-lg p-3 font-mono text-[12px] text-slate-700 mb-2">
                X-Frame-Options: ALLOWALL
              </div>
              <p className="text-[12px] text-gray-500">또는 Content-Security-Policy의 frame-ancestors를 * 또는 nuevo 도메인으로 설정하세요.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="text-[13px] font-bold text-gray-800 mb-2">② 뷰포트 설정</div>
              <div className="bg-slate-100 rounded-lg p-3 font-mono text-[12px] text-slate-700 mb-2">
                {'<meta name="viewport" content="width=device-width, initial-scale=1">'}
              </div>
              <p className="text-[12px] text-gray-500">430px 너비 기준으로 모바일 최적화를 권장합니다.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="text-[13px] font-bold text-gray-800 mb-2">③ 추천 배포 플랫폼</div>
              <div className="flex flex-col gap-2 mt-1">
                {[
                  { name: 'Replit', status: '✅ 기본 허용', note: '빠른 배포, AI 코딩 지원' },
                  { name: 'Vercel', status: '✅ 설정 후 허용', note: 'vercel.json에 headers 추가' },
                  { name: 'GitHub Pages', status: '✅ 대체로 허용', note: '정적 사이트에 적합' },
                  { name: 'Netlify', status: '✅ 설정 후 허용', note: '_headers 파일로 설정' },
                ].map((p) => (
                  <div key={p.name} className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-medium text-gray-800">{p.name}</div>
                      <div className="text-[11px] text-gray-500">{p.note}</div>
                    </div>
                    <div className="text-[11px] text-gray-600 whitespace-nowrap">{p.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mx-5 mt-6 mb-2 p-5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white text-center">
          <div className="text-[20px] mb-1">🚀</div>
          <div className="text-[16px] font-bold mb-1">파트너 프로그램 신청</div>
          <p className="text-[13px] text-orange-100 mb-4">체험 세션 5,000회 이상이면 성장 파트너로 신청할 수 있습니다.</p>
          <Link
            href="/upload"
            className="inline-block px-6 py-2.5 bg-white text-warm rounded-full text-[14px] font-bold"
          >
            지금 작품 올리기
          </Link>
        </div>

        <div className="h-4" />
      </div>
      <BottomNav />
    </div>
  );
}
