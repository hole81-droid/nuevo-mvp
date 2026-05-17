import Link from 'next/link';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import RemixMap from '@/components/studio/RemixMap';
import PayoutRequestPanel from '@/components/studio/PayoutRequestPanel';
import BackButton from '@/components/ui/BackButton';
import TierSyncNotice from '@/components/studio/TierSyncNotice';
import NuevoGlyph from '@/components/ui/NuevoGlyph';
import { createClient } from '@/lib/supabase/server';
import type { ContentType } from '@/lib/types';
import type { CreatorMonthlyWesRow, PayoutRequestRow, PostMonthlyWesRow } from '@/lib/supabase/types';
import {
  calcWes,
  getTierBySessions,
  monthKey,
  monthLabel,
  MONTHLY_POOL,
  PostWesBreakdown,
  TIERS,
  WES_WEIGHTS,
  WesStats,
} from '@/lib/wes';
import { buildFameMetrics } from '@/lib/fame-dashboard';
import { summarizeTrafficSources } from '@/lib/traffic-source';


function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtKRW(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${n.toLocaleString()}원`;
}

type StudioData = {
  month: string;
  monthKey: string;
  stats: WesStats;
  saves: number;
  shares: number;
  trafficSources: ReturnType<typeof summarizeTrafficSources>;
  platformWes: number;
  postBreakdown: Array<PostWesBreakdown & { saves: number; shares: number }>;
  payoutRequest: PayoutRequestRow | null;
  isLive: boolean;
};

async function getStudioData(): Promise<StudioData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/studio');

  const month = monthKey();
  const { data: creatorRow }: { data: CreatorMonthlyWesRow | null } = await supabase
    .from('creator_monthly_wes')
    .select('*')
    .eq('author_id', user.id)
    .eq('month', month)
    .maybeSingle();

  const { data: platformRows }: { data: Pick<CreatorMonthlyWesRow, 'wes'>[] | null } = await supabase
    .from('creator_monthly_wes')
    .select('wes')
    .eq('month', month);

  const { data: postRows }: { data: PostMonthlyWesRow[] | null } = await supabase
    .from('post_monthly_wes')
    .select('*')
    .eq('author_id', user.id)
    .eq('month', month)
    .order('wes', { ascending: false })
    .limit(8);

  const { data: payoutRequest }: { data: PayoutRequestRow | null } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('creator_id', user.id)
    .eq('month', month)
    .maybeSingle();

  const { data: creatorPosts }: { data: Array<{ id: string }> | null } = await supabase
    .from('posts')
    .select('id')
    .eq('author_id', user.id);

  const creatorPostIds = (creatorPosts ?? []).map((post) => post.id);
  const [{ data: saveRows }, { data: shareRows }, { data: experienceSourceRows }] = creatorPostIds.length
    ? await Promise.all([
        supabase.from('saved_posts').select('post_id').in('post_id', creatorPostIds),
        supabase.from('post_share_events').select('post_id, traffic_source').in('post_id', creatorPostIds),
        supabase.from('experience_events').select('post_id, traffic_source').in('post_id', creatorPostIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const saveCounts = new Map<string, number>();
  const shareCounts = new Map<string, number>();
  ((saveRows ?? []) as Array<{ post_id: string }>).forEach((row) => {
    saveCounts.set(row.post_id, (saveCounts.get(row.post_id) ?? 0) + 1);
  });
  ((shareRows ?? []) as Array<{ post_id: string }>).forEach((row) => {
    shareCounts.set(row.post_id, (shareCounts.get(row.post_id) ?? 0) + 1);
  });

  const platformWes = Math.max(
    1,
    (platformRows ?? []).reduce((sum, row) => sum + Number(row.wes ?? 0), 0),
  );

  const stats: WesStats = {
    sessions: creatorRow?.sessions ?? 0,
    minutes: creatorRow?.minutes ?? 0,
    reactions: creatorRow?.reactions ?? 0,
    comments: creatorRow?.comments ?? 0,
    remixes: creatorRow?.remixes ?? 0,
  };

  return {
    month: monthLabel(),
    monthKey: month,
    stats,
    saves: Array.from(saveCounts.values()).reduce((sum, count) => sum + count, 0),
    shares: Array.from(shareCounts.values()).reduce((sum, count) => sum + count, 0),
    trafficSources: summarizeTrafficSources([
      ...((experienceSourceRows ?? []) as Array<{ traffic_source: string | null }>),
      ...((shareRows ?? []) as Array<{ traffic_source: string | null }>),
    ]),
    platformWes,
    postBreakdown: (postRows ?? []).map((row) => ({
      id: row.post_id,
      title: row.title,
      kind: row.content_type as ContentType,
      sessions: row.sessions,
      minutes: row.minutes,
      reactions: row.reactions,
      comments: row.comments,
      remixes: row.remixes,
      saves: saveCounts.get(row.post_id) ?? 0,
      shares: shareCounts.get(row.post_id) ?? 0,
    })),
    payoutRequest,
    isLive: true,
  };
}

export default async function StudioPage() {
  const studio = await getStudioData();
  const totalWes = calcWes(studio.stats);
  const myShare = studio.platformWes > 0 ? totalWes / studio.platformWes : 0;
  const { current, currentIdx, next } = getTierBySessions(studio.stats.sessions);
  const tierProgress = next.id === current.id
    ? 100
    : Math.min((studio.stats.sessions / next.minSessions) * 100, 100);
  const estimatedRevenue = Math.round(MONTHLY_POOL * current.revenueShare * myShare);
  const postBreakdown = studio.postBreakdown;
  const fameMetrics = buildFameMetrics({
    ...studio.stats,
    saves: studio.saves,
    shares: studio.shares,
  });

  const wesBreakdown = [
    { label: '체험 세션', value: studio.stats.sessions, weight: WES_WEIGHTS.sessions, score: studio.stats.sessions * WES_WEIGHTS.sessions },
    { label: '체험 시간(분)', value: studio.stats.minutes, weight: WES_WEIGHTS.minutes, score: studio.stats.minutes * WES_WEIGHTS.minutes },
    { label: '반응', value: studio.stats.reactions, weight: WES_WEIGHTS.reactions, score: studio.stats.reactions * WES_WEIGHTS.reactions },
    { label: '댓글', value: studio.stats.comments, weight: WES_WEIGHTS.comments, score: studio.stats.comments * WES_WEIGHTS.comments },
    { label: '리믹스', value: studio.stats.remixes, weight: WES_WEIGHTS.remixes, score: studio.stats.remixes * WES_WEIGHTS.remixes },
  ];

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center gap-3 px-4 h-[53px]">
        <BackButton fallbackHref="/profile/me" />
        <div className="flex-1">
          <div className="font-bold text-[17px] text-gray-900">크리에이터 스튜디오</div>
          <div className="text-[12px] text-gray-500">
            {studio.month} 기준 · {studio.isLive ? '실 데이터' : '데모 데이터'}
          </div>
        </div>
        <Link href="/guide" className="text-[12px] text-warm font-medium">
          수익 가이드
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">
        <TierSyncNotice enabled={studio.isLive} />

        {/* Fame dashboard */}
        <div className="p-4">
          <div className="mb-3">
            <h1 className="text-[24px] font-black tracking-[-0.06em] text-gray-900">Fame dashboard</h1>
            <p className="mt-1 text-[13px] leading-snug text-gray-500">사람들이 얼마나 오래 놀고, 저장하고, 퍼뜨렸는지를 먼저 봅니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {fameMetrics.map((metric, index) => (
              <div
                key={metric.key}
                className={`rounded-[26px] border-2 border-[#D8D8D0] p-3 ${
                  index === 0 ? 'col-span-2 bg-black text-white' : 'bg-[#F7F7F2] text-gray-900'
                }`}
              >
                <div className={index === 0 ? 'text-[12px] text-white/65' : 'text-[11px] text-gray-500'}>{metric.label}</div>
                <div className="mt-1 flex items-end gap-1">
                  <span className={index === 0 ? 'text-[34px] font-black tracking-[-0.08em]' : 'text-[24px] font-black tracking-[-0.05em]'}>
                    {fmt(metric.value)}
                  </span>
                  <span className={index === 0 ? 'pb-1 text-[12px] font-bold text-white/70' : 'pb-1 text-[11px] font-bold text-warm'}>
                    {metric.suffix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mb-4 rounded-[28px] border-2 border-[#D8D8D0] bg-[#FFFDF5] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-black tracking-[-0.04em] text-gray-900">유입 채널</h2>
              <p className="mt-1 text-[12px] text-gray-500">체험과 공유 이벤트 기준으로 집계합니다.</p>
            </div>
            <div className="rounded-full bg-black px-3 py-1 text-[11px] font-black text-white">
              {studio.trafficSources[0]?.label ?? 'Direct'}
            </div>
          </div>
          {studio.trafficSources.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {studio.trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="font-bold text-gray-700">{source.label}</span>
                    <span className="text-gray-400">{source.count} · {source.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-warm" style={{ width: `${source.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-[12px] text-gray-400">
              아직 유입 이벤트가 없어요.
            </div>
          )}
        </div>

        <div className="mx-4 mb-4 rounded-[28px] border-2 border-[#D8D8D0] bg-[#F7F7F2] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] text-gray-500">보조 정보 · 예상 수익</div>
              <div className="mt-1 text-[24px] font-black tracking-[-0.06em] text-gray-900">{fmtKRW(estimatedRevenue)}</div>
              <div className="mt-1 text-[11px] text-gray-500">확정 수익은 월말 검수 후 정산 요청에서 표시됩니다.</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-gray-500">이번 달 WES</div>
              <div className="mt-1 text-[18px] font-black text-warm">{Math.round(totalWes).toLocaleString()}</div>
            </div>
          </div>
          <Link
            href={`/api/studio/wes-export?month=${studio.monthKey}`}
            className="mt-3 inline-flex h-10 items-center rounded-full bg-black px-4 text-[12px] font-black text-white"
          >
            Raw WES 이벤트 CSV
          </Link>
        </div>

        {/* Partner tier card */}
        <div className="mx-4 mb-4 p-4 rounded-[30px] border-2 border-[#D8D8D0] bg-[#F7F7F2]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] text-gray-500">현재 등급</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[20px] font-bold text-blue-600">{current.badge}</span>
                <span className="text-[18px] font-bold text-gray-900">{current.label} 파트너</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-gray-500">수익 배분율</div>
              <div className="text-[24px] font-bold text-blue-600">{Math.round(current.revenueShare * 100)}%</div>
            </div>
          </div>

          {/* Progress to next tier */}
          <div className="mt-2">
            <div className="flex justify-between text-[12px] text-gray-500 mb-1.5">
              <span>{next.id === current.id ? '최상위' : `${next.label} 파트너`}까지</span>
              <span className="font-medium text-gray-700">{fmt(studio.stats.sessions)} / {fmt(next.minSessions)} 체험</span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-blue-500 mt-1.5 font-medium">
              {next.id === current.id
                ? '최상위 파트너 등급입니다'
                : `${fmt(Math.max(0, next.minSessions - studio.stats.sessions))}회 더 → 수익 배분 ${Math.round(next.revenueShare * 100)}%로 상승`}
            </div>
          </div>

          {/* All tiers */}
          <div className="flex gap-1 mt-3">
            {TIERS.map((tier, i) => (
              <div key={tier.id} className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold ${i === currentIdx ? 'bg-blue-500 text-white' : i < currentIdx ? 'bg-blue-200 text-blue-700' : 'bg-white/60 text-gray-400'}`}>
                {tier.badge}<br/>{tier.label}
              </div>
            ))}
          </div>
        </div>

        {/* WES breakdown */}
        <div className="mx-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold text-gray-900">WES breakdown</h2>
            <span className="text-[13px] font-bold text-warm">{Math.round(totalWes).toLocaleString()} WES</span>
          </div>
          <div className="rounded-[28px] border-2 border-[#D8D8D0] overflow-hidden bg-[#F7F7F2]">
            {wesBreakdown.map((item, i) => {
              const pct = totalWes > 0 ? (item.score / totalWes) * 100 : 0;
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
              <span className="text-[13px] font-bold text-warm">{(myShare * 100).toFixed(2)}%</span>
            </div>
          </div>
          <div className="mt-2 text-[12px] text-gray-400 text-center">
            플랫폼 월 배분 {(MONTHLY_POOL / 10000).toLocaleString()}만원 × {Math.round(current.revenueShare * 100)}% × {(myShare * 100).toFixed(2)}% = {fmtKRW(estimatedRevenue)}
          </div>
        </div>

        {/* Per-post breakdown */}
        <div className="mx-4 mb-4">
          <h2 className="text-[16px] font-bold text-gray-900 mb-3">작품별 WES</h2>
          {postBreakdown.length === 0 ? (
            <div className="bg-[#F7F7F2] border-2 border-[#D8D8D0] rounded-[28px] p-6 text-center">
              <div className="text-3xl mb-2">🌱</div>
              <div className="text-[14px] font-bold text-gray-700">아직 체험 데이터가 없어요</div>
              <div className="text-[12px] text-gray-500 mt-1">작품을 올리면 이 달 체험 통계가 쌓여요</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {postBreakdown.map((p) => {
                const wes = calcWes(p);
                const maxWes = Math.max(1, ...postBreakdown.map(calcWes));
                const barPct = (wes / maxWes) * 100;
                const postRevenue = Math.round(MONTHLY_POOL * current.revenueShare * (wes / studio.platformWes));
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
                      <span>저장 {p.saves}</span>
                      <span>공유 {p.shares}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Remix Map */}
        <RemixMap />

        <PayoutRequestPanel
          month={studio.monthKey}
          amountKrw={estimatedRevenue}
          existingRequest={studio.payoutRequest}
        />

      </main>

      <BottomNav />
    </div>
  );
}
