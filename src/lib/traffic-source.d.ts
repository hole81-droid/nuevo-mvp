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

export function getExternalEntryCopy(input?: {
  source?: TrafficSource | string | null;
  autoplay?: boolean;
}): {
  eyebrow: string;
  title: string;
  body: string;
} | null;

export function shouldUseInternalBackFallback(input?: {
  historyLength?: number;
  search?: string;
  referrer?: string;
}): boolean;
