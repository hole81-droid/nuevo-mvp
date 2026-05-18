export type MobileLcpResult = {
  path: string;
  lcpMs: number | null;
  failedRequestCount?: number;
  exceptions?: string[];
  iframeCount?: number;
};

export type MobileLcpQaCheck = {
  path: string;
  lcpMs: number | null;
  targetMs: number;
  status: 'pass' | 'fail';
  autoplayIframeMounted: boolean;
  failedRequestCount: number;
  exceptionCount: number;
  reasons: string[];
};

export type MobileLcpQaSummary = {
  status: 'pass' | 'fail';
  targetMs: number;
  passed: number;
  failed: number;
  checks: MobileLcpQaCheck[];
};

export function summarizeMobileLcpQa(input?: {
  results?: MobileLcpResult[];
  targetMs?: number;
}): MobileLcpQaSummary;
