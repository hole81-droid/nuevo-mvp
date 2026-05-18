export type EmbedUrlValidation = {
  ok: boolean;
  normalizedUrl: string;
  message?: string;
};

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function validateEmbedUrl(
  rawUrl: string,
  options: { allowRelative?: boolean; requirePublicUrl?: boolean } = {},
): EmbedUrlValidation {
  const value = rawUrl.trim();

  if (!value) {
    return {
      ok: false,
      normalizedUrl: '',
      message: '앱 URL을 입력해 주세요.',
    };
  }

  if (options.allowRelative && value.startsWith('/')) {
    return {
      ok: true,
      normalizedUrl: value,
    };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return {
      ok: false,
      normalizedUrl: value,
      message: 'https://로 시작하는 전체 주소를 입력해 주세요.',
    };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return {
      ok: false,
      normalizedUrl: value,
      message: 'http 또는 https 주소만 사용할 수 있어요.',
    };
  }

  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (options.requirePublicUrl && url.protocol !== 'https:' && !isLocalhost) {
    return {
      ok: false,
      normalizedUrl: value,
      message: '공개 앱은 https 주소가 필요해요. 로컬 테스트는 localhost만 허용됩니다.',
    };
  }

  url.hash = '';

  return {
    ok: true,
    normalizedUrl: url.toString(),
  };
}
