'use client';

import { useEffect, useState } from 'react';
import type { PartnerTier } from '@/lib/types';
import { TIERS } from '@/lib/wes';

const TIER_LABEL = Object.fromEntries(TIERS.map((tier) => [tier.id, `${tier.badge} ${tier.label} 파트너`])) as Record<PartnerTier, string>;

type TierSyncResponse = {
  promoted?: boolean;
  tier?: PartnerTier;
  error?: string;
};

export default function TierSyncNotice({ enabled }: { enabled: boolean }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const sync = async () => {
      const response = await fetch('/api/tier-sync', { method: 'POST' });
      const payload = (await response.json()) as TierSyncResponse;
      if (cancelled || !response.ok || !payload.promoted || !payload.tier) return;
      setMessage(`${TIER_LABEL[payload.tier]}로 승급했어요. 프로필에도 반영됩니다.`);
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!message) return null;

  return (
    <div className="mx-4 mt-4 rounded-[24px] border-2 border-black bg-black px-4 py-3 text-white">
      <div className="text-[13px] font-black tracking-[-0.04em]">등급 업데이트</div>
      <div className="mt-1 text-[12px] text-white/70 leading-relaxed">{message}</div>
    </div>
  );
}
