import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';
import RemixMap from '@/components/studio/RemixMap';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

const MONTHLY_POOL = 10_000_000;
const REVENUE_SHARE = 0.70;

const MY_STATS = {
  month: '2026년 5월',
  sessions: 8234,
  minutes: 3456,
  reactions: 3126,
  comments: 124,
  remixes: 89,
};

const WES_WEIGHTS = { sessions: 1.0, minutes: 0.8, reactions: 1.5, comments: 2.0, remixes: 5.0 };

function calcWes(s: typeof MY_STATS) {
  return (
    s.sessions * WES_WEIGHTS.sessions +
    s.minutes * WES_WEIGHTS.minutes +
    s.reactions * WES_WEIGHTS.reactions +
    s.comments * WES_WEIGHTS.comments +
    s.remixes * WES_WEIGHTS.remixes
  );
}

const TOTAL_WES = calcWes(MY_STATS);
const TOTAL_PLATFORM_WES = 500_000;
const MY_SHARE = TOTAL_WES / TOTAL_PLATFORM_WES;
const ESTIMATED_REVENUE = Math.round(MONTHLY_POOL * REVENUE_SHARE * MY_SHARE);

const TIERS = [
  { id: 'seedling', label: '새싹',  badge: '✦',    minSessions: 500,     color: '#22C55E', track: 'bg-emerald-500' },
  { id: 'growth',   label: '성장',  badge: '✦✦',   minSessions: 5_000,   color: '#3B82F6', track: 'bg-blue-500'    },
  { id: 'pro',      label: '프로',  badge: '✦✦✦',  minSessions: 50_000,  color: '#8B5CF6', track: 'bg-purple-500'  },
  { id: 'champion', label: '챔피언', badge: '✦✦✦✦', minSessions: 500_000, color: '#F59E0B', track: 'bg-amber-500'   },
];

const CURRENT_TIER_IDX = 1; // 성장
const NEXT_TIER = TIERS[2];
const TIER_PROGRESS = Math.min((MY_STATS.sessions / NEXT_TIER.minSessions) * 100, 100);

const POST_BREAKDOWN = [
  {
    id: '1', kind: 'interactive' as const, title: '회의 내용 → 슬픈 밈 생성기',
    sessions: 1234, minutes: 892, reactions: 1137, comments: 124, remixes: 89,
  },
  {
    id: 'A', kind: 'interactive' as const, title: '매운맛 GPT 면접관',
    sessions: 3560, minutes: 1244, reactions: 1234, comments: 0, remixes: 0,
  },
  {
    id: 'B', kind: 'audio' as const, title: '내 영어 발음 세계지도',
    sessions: 2340, minutes: 890, reactions: 567, comments: 0, remixes: 0,
  },
  {
    id: 'C', kind: 'interactive' as const, title: '랜덤 직업 MBTI 분석기',
    sessions: 1100, minutes: 430, reactions: 188, comments: 0, remixes: 0,
  },
];

function postWes(p: typeof POST_BREAKDOWN[0]) {
  return (
    p.sessions * WES_WEIGHTS.sessions +
    p.minutes * WES_WEIGHTS.minutes +
    p.reactions * WES_WEIGHTS.reactions +
    p.comments * WES_WEIGHTS.comments +
    p.remixes * WES_WEIGHTS.remixes
  );
}

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtKRW(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${n.toLocaleString()}원`;
}

export default function StudioPage() {
  const wesBreakdown = [
    { label: '체험 세션', value: MY_STATS.sessions, weight: WES_WEIGHTS.sessions, score: MY_STATS.sessions * WES_WEIGHTS.sessions },
    { label: '체험 시간(분)', value: MY_STATS.minutes, weight: WES_WEIGHTS.minutes, score: MY_STATS.minutes * WES_WEIGHTS.minutes },
    { label: '반응', value: MY_STATS.reactions, weight: WES_WEIGHTS.reactions, score: MY_STATS.reactions * WES_WEIGHTS.reactions },
    { label: '댓글', value: MY_STATS.comments, weight: WES_WEIGHTS.comments, score: MY_STATS.comments * WES_WEIGHTS.comments },
    { label: '리믹스', value: MY_STATS.remixes, weight: WES_WEIGHTS.remixes, score: MY_STATS.remixes * WES_WEIGHTS.remixes },
  ];

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <Link href="/profile/me" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="font-bold text-[17px] text-gray-900">크리에이터 스튜디오</div>
          <div className="text-[12px] text-gray-500">{MY_STATS.month} 기준</div>
        </div>
        <Link href="/guide" className="text-[12px] text-warm font-medium">
          수익 가이드
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">

        {/* Revenue summary cards */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <div className="bg-[#F7F7F2] border-2 border-[#D8D8D0] rounded-[28px] p-3">
            <div className="text-[11px] text-gray-500 leading-tight">총 체험</div>
            <div className="text-[22px] font-bold text-gray-900 mt-1">{fmt(MY_STATS.sessions)}</div>
            <div className="text-[11px] text-warm font-medium mt-0.5">회</div>
          </div>
          <div className="bg-[#F7F7F2] border-2 border-[#D8D8D0] rounded-[28px] p-3">
            <div className="text-[11px] text-gray-500 leading-tight">총 체험 시간</div>
            <div className="text-[22px] font-bold text-gray-900 mt-1">{fmt(MY_STATS.minutes)}</div>
            <div className="text-[11px] text-blue-500 font-medium mt-0.5">분</div>
          </div>
          <div className="bg-[#F7F7F2] border-2 border-[#D8D8D0] rounded-[28px] p-3">
            <div className="text-[11px] text-gray-500 leading-tight">예상 수익</div>
            <div className="text-[19px] font-bold text-gray-900 mt-1">{fmtKRW(ESTIMATED_REVENUE)}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">이번 달</div>
          </div>
        </div>

        {/* Partner tier card */}
        <div className="mx-4 mb-4 p-4 rounded-[30px] border-2 border-[#D8D8D0] bg-[#F7F7F2]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] text-gray-500">현재 등급</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[20px] font-bold text-blue-600">✦✦</span>
                <span className="text-[18px] font-bold text-gray-900">성장 파트너</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-gray-500">수익 배분율</div>
              <div className="text-[24px] font-bold text-blue-600">70%</div>
            </div>
          </div>

          {/* Progress to next tier */}
          <div className="mt-2">
            <div className="flex justify-between text-[12px] text-gray-500 mb-1.5">
              <span>프로 파트너까지</span>
              <span className="font-medium text-gray-700">{fmt(MY_STATS.sessions)} / {fmt(NEXT_TIER.minSessions)} 체험</span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${TIER_PROGRESS}%` }}
              />
            </div>
            <div className="text-[11px] text-blue-500 mt-1.5 font-medium">
              {fmt(NEXT_TIER.minSessions - MY_STATS.sessions)}회 더 → 수익 배분 75%로 상승
            </div>
          </div>

          {/* All tiers */}
          <div className="flex gap-1 mt-3">
            {TIERS.map((tier, i) => (
              <div key={tier.id} className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold ${i === CURRENT_TIER_IDX ? 'bg-blue-500 text-white' : i < CURRENT_TIER_IDX ? 'bg-blue-200 text-blue-700' : 'bg-white/60 text-gray-400'}`}>
                {tier.badge}<br/>{tier.label}
              </div>
            ))}
          </div>
        </div>

        {/* WES breakdown */}
        <div className="mx-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold text-gray-900">WES 점수 분해</h2>
            <span className="text-[13px] font-bold text-warm">{Math.round(TOTAL_WES).toLocaleString()} WES</span>
          </div>
          <div className="rounded-[28px] border-2 border-[#D8D8D0] overflow-hidden bg-[#F7F7F2]">
            {wesBreakdown.map((item, i) => {
              const pct = (item.score / TOTAL_WES) * 100;
              return (
                <div key={i} className={`px-4 py-3 ${i < wesBreakdown.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[13px] text-gray-700">
                      {item.label}
                      <span className="text-gray-400 ml-1.5">×{item.weight}</span>
                    </div>
                    <div className="text-[13px] font-bold text-gray-900">{Math.round(item.score).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-warm rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 w-8 text-right">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
            <div className="px-4 py-3 bg-orange-50 border-t border-orange-100 flex justify-between">
              <span className="text-[13px] font-bold text-warm">플랫폼 전체 대비 내 비중</span>
              <span className="text-[13px] font-bold text-warm">{(MY_SHARE * 100).toFixed(2)}%</span>
            </div>
          </div>
          <div className="mt-2 text-[12px] text-gray-400 text-center">
            플랫폼 월 배분 {(MONTHLY_POOL / 10000).toLocaleString()}만원 × 70% × {(MY_SHARE * 100).toFixed(2)}% = {fmtKRW(ESTIMATED_REVENUE)}
          </div>
        </div>

        {/* Per-post breakdown */}
        <div className="mx-4 mb-4">
          <h2 className="text-[16px] font-bold text-gray-900 mb-3">작품별 WES</h2>
          <div className="flex flex-col gap-2">
            {POST_BREAKDOWN.map((p) => {
              const wes = postWes(p);
              const maxWes = Math.max(...POST_BREAKDOWN.map(postWes));
              const barPct = (wes / maxWes) * 100;
              const postRevenue = Math.round(MONTHLY_POOL * REVENUE_SHARE * (wes / TOTAL_PLATFORM_WES));
              return (
                <div key={p.id} className="bg-[#F7F7F2] border-2 border-[#D8D8D0] rounded-[28px] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <NuevoGlyph kind={p.kind} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-gray-900 truncate">{p.title}</div>
                      <div className="text-[11px] text-gray-500">{fmt(p.sessions)}회 체험 · {fmt(p.minutes)}분</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[13px] font-bold text-gray-900">{Math.round(wes).toLocaleString()}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">~{fmtKRW(postRevenue)}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-warm rounded-full" style={{ width: `${barPct}%` }} />
                  </div>
                  <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
                    <span>반응 {fmt(p.reactions)}</span>
                    <span>댓글 {p.comments}</span>
                    <span>리믹스 {p.remixes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remix Map */}
        <RemixMap />

        {/* Payout info */}
        <div className="mx-4 mb-6 p-4 rounded-[28px] bg-[#F7F7F2] border-2 border-[#D8D8D0]">
          <div className="text-[14px] font-bold text-gray-900 mb-2">정산 안내</div>
          <div className="text-[13px] text-gray-600 leading-relaxed space-y-1">
            <div>· 매월 말일 기준 WES 집계</div>
            <div>· 다음 달 15일 등록 계좌로 자동 입금</div>
            <div>· 최소 출금액: 10,000원 (미달 시 이월)</div>
            <div>· 리믹스 수익 (+10%)은 별도 정산</div>
          </div>
          <button className="mt-3 w-full py-3 rounded-full bg-black text-white text-[14px] font-black tracking-[-0.04em] hover:bg-gray-800 transition-colors">
            출금 계좌 등록하기
          </button>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
