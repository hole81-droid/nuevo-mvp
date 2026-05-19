import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildModerationReportInsert } from '@/lib/trust-safety';
import type { ModerationReportRow } from '@/lib/supabase/types';

type ModerationReportBody = {
  postId?: string;
  reason?: string;
  detail?: string;
  reporterEmail?: string;
  currentUrl?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const body = (await request.json()) as ModerationReportBody;

  const insert = buildModerationReportInsert({
    ...body,
    reporterId: user?.id ?? null,
  });

  if (insert.target_id === 'unknown') {
    return NextResponse.json({ error: '신고 대상 게시물을 확인할 수 없습니다.' }, { status: 400 });
  }

  const { data, error }: { data: Pick<ModerationReportRow, 'id' | 'status'> | null; error: { message: string } | null } = await supabase
    .from('moderation_reports')
    .insert(insert as never)
    .select('id,status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ report: data }, { status: 201 });
}
