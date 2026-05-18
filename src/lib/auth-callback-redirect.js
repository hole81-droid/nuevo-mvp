const ERROR_REASONS = new Set(['missing_code', 'exchange_failed', 'missing_user']);

function safeNextPathValue(value, fallback = '/') {
  if (!value || typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export function buildAuthCallbackFailureRedirect({ next, reason } = {}) {
  const safeNext = safeNextPathValue(next, '/');
  const safeReason = ERROR_REASONS.has(reason) ? reason : 'exchange_failed';
  const params = new URLSearchParams({
    next: safeNext,
    auth_error: safeReason,
  });
  return `/login?${params.toString()}`;
}

export function getAuthErrorCopy(reason) {
  switch (reason) {
    case 'missing_code':
      return 'Google 로그인 응답을 받지 못했어요. 다시 시도해 주세요.';
    case 'missing_user':
      return '로그인 사용자를 확인하지 못했어요. 다시 시도해 주세요.';
    case 'exchange_failed':
      return '로그인 세션을 만들지 못했어요. 다시 시도해 주세요.';
    default:
      return '';
  }
}
