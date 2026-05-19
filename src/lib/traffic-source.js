export const TRAFFIC_SOURCE_LABELS = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  reddit: 'Reddit',
  direct: 'Direct',
};

const SOURCE_ORDER = ['instagram', 'tiktok', 'youtube', 'reddit', 'direct'];
const TRUE_VALUES = new Set(['true', '1']);

function normalizeSource(value) {
  const source = String(value ?? '').trim().toLowerCase();
  if (source === 'ig' || source.includes('instagram')) return 'instagram';
  if (source === 'tt' || source.startsWith('tt_') || source.includes('tiktok')) return 'tiktok';
  if (source.includes('youtube') || source === 'yt' || source.includes('youtu.be')) return 'youtube';
  if (source.startsWith('yt_')) return 'youtube';
  if (source.includes('reddit')) return 'reddit';
  if (source.includes('share')) return 'direct';
  return source || '';
}

export function classifyTrafficSource({ utmSource, referrer } = {}) {
  const normalizedUtm = normalizeSource(utmSource);
  if (SOURCE_ORDER.includes(normalizedUtm)) return normalizedUtm;

  const normalizedReferrer = normalizeSource(referrer);
  if (SOURCE_ORDER.includes(normalizedReferrer)) return normalizedReferrer;

  try {
    const host = new URL(referrer ?? '').hostname;
    const normalizedHost = normalizeSource(host);
    if (SOURCE_ORDER.includes(normalizedHost)) return normalizedHost;
  } catch {
    // Empty or malformed referrer is treated as direct.
  }

  return 'direct';
}

export function buildTrafficSourcePayload({ search = '', referrer = '' } = {}) {
  const params = new URLSearchParams(String(search).replace(/^\?/, ''));
  return {
    traffic_source: classifyTrafficSource({
      utmSource: params.get('utm_source'),
      referrer,
    }),
    referrer: referrer || null,
  };
}

export function summarizeTrafficSources(rows) {
  const counts = new Map();

  for (const row of rows ?? []) {
    const source = SOURCE_ORDER.includes(row?.traffic_source) ? row.traffic_source : 'direct';
    counts.set(source, (counts.get(source) ?? 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0) || 1;

  return SOURCE_ORDER
    .filter((source) => counts.has(source))
    .map((source) => ({
      source,
      label: TRAFFIC_SOURCE_LABELS[source],
      count: counts.get(source),
      percent: Math.round((counts.get(source) / total) * 100),
    }));
}

const EXTERNAL_ENTRY_COPY = {
  instagram: {
    eyebrow: 'Instagram에서 바로 입장',
    title: '앱을 바로 실행 중이에요',
    body: '인스타그램 안에서도 끊기지 않게 첫 화면에서 바로 체험을 시작합니다.',
  },
  tiktok: {
    eyebrow: 'TikTok에서 바로 입장',
    title: '기다림 없이 바로 플레이해요',
    body: '짧은 영상에서 넘어온 흐름 그대로, 탭 한 번 없이 앱 체험을 이어갑니다.',
  },
  youtube: {
    eyebrow: 'YouTube에서 바로 입장',
    title: '설명란 링크에서 앱으로 연결됐어요',
    body: '영상에서 본 아이디어를 지금 화면 안에서 바로 실행합니다.',
  },
};

export function getExternalEntryCopy({ source, autoplay } = {}) {
  if (!autoplay) return null;
  return EXTERNAL_ENTRY_COPY[source] ?? null;
}

export function shouldUseInternalBackFallback({ historyLength = 0, search = '', referrer = '' } = {}) {
  if (historyLength <= 1) return false;

  const params = new URLSearchParams(String(search).replace(/^\?/, ''));
  const autoplay = TRUE_VALUES.has(String(params.get('autoplay') ?? '').toLowerCase());
  if (!autoplay) return false;

  return getExternalEntryCopy({
    source: classifyTrafficSource({ utmSource: params.get('utm_source'), referrer }),
    autoplay,
  }) !== null;
}
