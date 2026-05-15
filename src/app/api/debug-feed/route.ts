// 임시 진단용 엔드포인트. 홈 피드가 mock fallback에 빠지는 원인 파악용.
// 배포에서 문제가 해결되면 이 파일은 삭제해야 한다.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyLen = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from('posts')
    .select('*, author:users(*)', { count: 'exact' })
    .limit(3);

  return NextResponse.json({
    env: {
      hasUrl: !!url,
      urlPrefix: url?.slice(0, 30),
      anonKeyLength: keyLen,
    },
    query: {
      ok: !error,
      errorMessage: error?.message ?? null,
      errorCode: error?.code ?? null,
      errorDetails: error?.details ?? null,
      errorHint: error?.hint ?? null,
      rowCount: count,
      dataLength: data?.length ?? 0,
    },
  });
}
