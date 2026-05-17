export type TrafficSource = 'instagram' | 'tiktok' | 'youtube' | 'reddit' | 'direct';

export const TRAFFIC_SOURCE_LABELS: Record<TrafficSource, string>;

export function classifyTrafficSource(input?: {
  utmSource?: string | null;
  referrer?: string | null;
}): TrafficSource;

export function buildTrafficSourcePayload(input?: {
  search?: string;
  referrer?: string;
}): {
  traffic_source: TrafficSource;
  referrer: string | null;
};

export function summarizeTrafficSources(rows?: Array<{ traffic_source?: string | null }>): Array<{
  source: TrafficSource;
  label: string;
  count: number;
  percent: number;
}>;
