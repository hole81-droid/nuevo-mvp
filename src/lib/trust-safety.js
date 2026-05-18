export const TRUST_CONTACT_EMAILS = {
  privacy: 'privacy@nuevo.app',
  safety: 'safety@nuevo.app',
};

export const REPORT_REASON_OPTIONS = [
  { value: 'unsafe', label: '위험하거나 유해한 콘텐츠' },
  { value: 'hateful', label: '혐오, 괴롭힘, 따돌림' },
  { value: 'sexual', label: '성적이거나 부적절한 콘텐츠' },
  { value: 'spam', label: '스팸, 사기, 오해 소지' },
  { value: 'ip', label: '지식재산권 또는 권리 침해' },
  { value: 'privacy', label: '개인정보 노출' },
  { value: 'other', label: '기타 신고' },
];

const REPORT_REASON_LABELS = Object.fromEntries(
  REPORT_REASON_OPTIONS.map((option) => [option.value, option.label]),
);

function isSafeRelativePath(value = '') {
  return value.startsWith('/') && !value.startsWith('//');
}

function normalizeHandle(handle = '') {
  const value = String(handle || '').trim().replace(/^@+/, '');
  return value ? `@${value}` : '@unknown';
}

function truncateText(value = '', maxLength = 1200) {
  const text = String(value || '').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function buildMailtoHref({ to, subject = '', body = '' }) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function normalizeReportReason(reason) {
  const value = String(reason || '').trim();
  return REPORT_REASON_LABELS[value] ? value : 'other';
}

export function getReportReasonLabel(reason) {
  return REPORT_REASON_LABELS[normalizeReportReason(reason)];
}

export function buildPostReportPath(postId, nextPath = '') {
  const path = `/report/post/${encodeURIComponent(String(postId || '').trim() || 'unknown')}`;
  if (!isSafeRelativePath(String(nextPath || ''))) return path;
  return `${path}?next=${encodeURIComponent(nextPath)}`;
}

export function buildPostReportRequest({
  postId,
  reason = 'other',
  detail = '',
  reporterEmail = '',
  currentUrl = '',
} = {}) {
  const normalizedReason = normalizeReportReason(reason);
  const reasonLabel = getReportReasonLabel(normalizedReason);
  const target = String(postId || '').trim() || 'unknown';
  const body = [
    'nuevo 게시물 신고 요청',
    '',
    `신고 대상: ${target}`,
    `신고 사유: ${reasonLabel}`,
    `연락처: ${String(reporterEmail || '').trim() || '미입력'}`,
    `대상 URL: ${String(currentUrl || '').trim() || '미입력'}`,
    '',
    '상세 설명:',
    truncateText(detail) || '미입력',
    '',
    '운영팀 검토 후 필요한 경우 게시물 숨김, 링크 차단, 계정 제한, 추가 확인 요청을 진행합니다.',
  ].join('\n');

  const subject = `[nuevo] 게시물 신고: ${target}`;
  return {
    to: TRUST_CONTACT_EMAILS.safety,
    subject,
    body,
    href: buildMailtoHref({ to: TRUST_CONTACT_EMAILS.safety, subject, body }),
  };
}

export function buildAccountDeletionRequest({ userId = '', email = '', handle = '' } = {}) {
  const normalizedHandle = normalizeHandle(handle);
  const body = [
    'nuevo 계정 삭제 요청',
    '',
    `사용자 ID: ${String(userId || '').trim() || 'unknown'}`,
    `이메일: ${String(email || '').trim() || 'unknown'}`,
    `핸들: ${normalizedHandle}`,
    '',
    '요청 사항:',
    '내 nuevo 계정과 계정에 연결된 프로필, 게시물, 댓글, 저장, 팔로우 데이터를 삭제해 주세요.',
    '',
    '운영팀 확인 후 삭제 처리 상태를 회신해 주세요.',
  ].join('\n');
  const subject = `[nuevo] 계정 삭제 요청: ${normalizedHandle}`;

  return {
    to: TRUST_CONTACT_EMAILS.privacy,
    subject,
    body,
    href: buildMailtoHref({ to: TRUST_CONTACT_EMAILS.privacy, subject, body }),
  };
}
