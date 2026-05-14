import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPayoutEligibility } from '@/lib/payout';
import type { PayoutRequestRow } from '@/lib/supabase/types';

type PayoutRequestBody = {
  month?: string;
  amountKrw?: number;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = (await request.json()) as PayoutRequestBody;
  const month = body.month;
  const amountKrw = Math.floor(Number(body.amountKrw ?? 0));

  if (!month || !/^\d{4}-\d{2}-01$/.test(month)) {
    return NextResponse.json({ error: '정산 월 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const { data: existing }: { data: Pick<PayoutRequestRow, 'id' | 'status'> | null } = await supabase
    .from('payout_requests')
    .select('id,status')
    .eq('creator_id', user.id)
    .eq('month', month)
    .maybeSingle();

  const eligibility = getPayoutEligibility(amountKrw, existing?.status ?? null);
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.reason }, { status: 400 });
  }

  const { data, error }: { data: PayoutRequestRow | null; error: { message: string } | null } = await supabase
    .from('payout_requests')
    .insert({
      creator_id: user.id,
      month,
      amount_krw: amountKrw,
    } as never)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payoutRequest: data }, { status: 201 });
}
