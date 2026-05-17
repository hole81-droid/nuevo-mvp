export const TRAFFIC_SOURCE_LABELS = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  reddit: 'Reddit',
  direct: 'Direct',
};

const SOURCE_ORDER = ['instagram', 'tiktok', 'youtube', 'reddit', 'direct'];

function normalizeSource(value) {
  const source = String(value ?? '').trim().toLowerCase();
  if (source.includes('instagram')) return 'instagram';
  if (source.includes('tiktok')) return 'tiktok';
  if (source.includes('youtube') || source === 'yt' || source.includes('youtu.be')) return 'youtube';
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
