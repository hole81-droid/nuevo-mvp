import { analyzeEmbedHeaders } from '@/lib/embed-check';
import { validateEmbedUrl } from '@/lib/embed-url';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body.url === 'string' ? body.url : '';
  const validation = validateEmbedUrl(rawUrl, { requirePublicUrl: true });

  if (!validation.ok) {
    return Response.json(
      { ok: false, error: validation.message ?? '앱 URL을 확인해 주세요.', checks: [] },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(validation.normalizedUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
    });

    const result = analyzeEmbedHeaders({
      status: response.status,
      url: response.url,
      headers: response.headers,
    });

    return Response.json({
      ok: result.ok,
      normalizedUrl: validation.normalizedUrl,
      finalUrl: response.url,
      checks: result.checks,
    });
  } catch {
    return Response.json(
      {
        ok: false,
        error: 'URL에 접근할 수 없어요. 공개 배포 주소인지 확인해 주세요.',
        checks: [{
          key: 'access',
          label: '공개 접근',
          level: 'fail',
          message: '서버에서 URL에 접근하지 못했어요.',
        }],
      },
      { status: 200 },
    );
  }
}
