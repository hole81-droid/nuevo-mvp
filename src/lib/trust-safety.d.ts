export type ReportReason = 'unsafe' | 'hateful' | 'sexual' | 'spam' | 'ip' | 'privacy' | 'other';

export type TrustMailRequest = {
  to: string;
  subject: string;
  body: string;
  href: string;
};

export type ModerationReportInsert = {
  target_type: 'post';
  target_id: string;
  reporter_id: string | null;
  reason: ReportReason;
  detail: string | null;
  reporter_email: string | null;
  current_url: string | null;
  status: 'open';
};

export const TRUST_CONTACT_EMAILS: {
  privacy: string;
  safety: string;
};

export const REPORT_REASON_OPTIONS: Array<{
  value: ReportReason;
  label: string;
}>;

export function buildMailtoHref(input: {
  to: string;
  subject?: string;
  body?: string;
}): string;

export function normalizeReportReason(reason?: string | null): ReportReason;

export function getReportReasonLabel(reason?: string | null): string;

export function buildPostReportPath(postId: string, nextPath?: string): string;

export function buildPostReportRequest(input?: {
  postId?: string;
  reason?: string;
  detail?: string;
  reporterEmail?: string;
  currentUrl?: string;
}): TrustMailRequest;

export function buildModerationReportInsert(input?: {
  postId?: string;
  reporterId?: string | null;
  reason?: string;
  detail?: string;
  reporterEmail?: string;
  currentUrl?: string;
}): ModerationReportInsert;

export function buildAccountDeletionRequest(input?: {
  userId?: string;
  email?: string | null;
  handle?: string | null;
}): TrustMailRequest;
