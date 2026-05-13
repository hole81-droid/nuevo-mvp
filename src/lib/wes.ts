import type { ContentType, PartnerTier } from './types';

export type WesStats = {
  sessions: number;
  minutes: number;
  reactions: number;
  comments: number;
  remixes: number;
};

export type PostWesBreakdown = WesStats & {
  id: string;
  title: string;
  kind: ContentType;
};

export const WES_WEIGHTS = {
  sessions: 1.0,
  minutes: 0.8,
  reactions: 1.5,
  comments: 2.0,
  remixes: 5.0,
} as const;

export const MONTHLY_POOL = 10_000_000;

export const TIERS: {
  id: PartnerTier;
  label: string;
  badge: string;
  minSessions: number;
  revenueShare: number;
}[] = [
  { id: 'seedling', label: '새싹', badge: '✦', minSessions: 500, revenueShare: 0.60 },
  { id: 'growth', label: '성장', badge: '✦✦', minSessions: 5_000, revenueShare: 0.70 },
  { id: 'pro', label: '프로', badge: '✦✦✦', minSessions: 50_000, revenueShare: 0.75 },
  { id: 'champion', label: '챔피언', badge: '✦✦✦✦', minSessions: 500_000, revenueShare: 0.80 },
];

export function calcWes(stats: WesStats) {
  return (
    stats.sessions * WES_WEIGHTS.sessions +
    stats.minutes * WES_WEIGHTS.minutes +
    stats.reactions * WES_WEIGHTS.reactions +
    stats.comments * WES_WEIGHTS.comments +
    stats.remixes * WES_WEIGHTS.remixes
  );
}

export function getTierBySessions(sessions: number) {
  let currentIdx = 0;
  for (let i = 0; i < TIERS.length; i += 1) {
    if (sessions >= TIERS[i].minSessions) currentIdx = i;
  }

  return {
    current: TIERS[currentIdx],
    currentIdx,
    next: TIERS[Math.min(currentIdx + 1, TIERS.length - 1)],
  };
}

export function getTierIndex(tier?: PartnerTier | null) {
  if (!tier) return -1;
  return TIERS.findIndex((item) => item.id === tier);
}

export function shouldPromoteTier(currentTier: PartnerTier | null | undefined, nextTier: PartnerTier) {
  return getTierIndex(nextTier) > getTierIndex(currentTier);
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

export function monthLabel(date = new Date()) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}
