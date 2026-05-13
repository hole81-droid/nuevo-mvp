import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreatorMonthlyWesRow, UserRow } from '@/lib/supabase/types';
import { getTierBySessions, monthKey, shouldPromoteTier } from '@/lib/wes';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const month = monthKey();
  const { data: profile }: { data: Pick<UserRow, 'partner_tier'> | null } = await (supabase
    .from('users') as any)
    .select('partner_tier')
    .eq('id', user.id)
    .maybeSingle();

  const { data: creatorRow }: { data: Pick<CreatorMonthlyWesRow, 'sessions'> | null } = await (supabase
    .from('creator_monthly_wes') as any)
    .select('sessions')
    .eq('author_id', user.id)
    .eq('month', month)
    .maybeSingle();

  const sessions = creatorRow?.sessions ?? 0;
  const { current } = getTierBySessions(sessions);

  if (!shouldPromoteTier(profile?.partner_tier, current.id)) {
    return NextResponse.json({
      promoted: false,
      tier: profile?.partner_tier ?? current.id,
      sessions,
    });
  }

  const { error } = await (supabase.from('users') as any)
    .update({ partner_tier: current.id })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await (supabase.from('notifications') as any).insert({
    recipient_id: user.id,
    type: 'tier_up',
  });

  return NextResponse.json({
    promoted: true,
    tier: current.id,
    sessions,
  });
}
