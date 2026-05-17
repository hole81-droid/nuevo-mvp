/**
 * @typedef {'pass' | 'warn' | 'fail'} CheckLevel
 * @typedef {{ key: string; label: string; level: CheckLevel; message: string }} EmbedCheck
 * @typedef {{ ok: boolean; checks: EmbedCheck[] }} EmbedCheckResult
 */

const BLOCKING_X_FRAME_OPTIONS = new Set(['deny', 'sameorigin']);

/**
 * @param {{ status: number; url: string; headers: Headers }} input
 * @returns {EmbedCheckResult}
 */
export function analyzeEmbedHeaders(input) {
  const url = new URL(input.url);
  const xFrameOptions = input.headers.get('x-frame-options')?.trim().toLowerCase() ?? '';
  const csp = input.headers.get('content-security-policy')?.trim().toLowerCase() ?? '';

  const checks = [
    checkAccess(input.status),
    checkXFrameOptions(xFrameOptions),
    checkFrameAncestors(csp),
    checkHttps(url),
  ];

  return {
    ok: checks.every((check) => check.level !== 'fail'),
    checks,
  };
}

function checkAccess(status) {
  const pass = status >= 200 && status < 400;
  return {
    key: 'access',
    label: '공개 접근',
    level: pass ? 'pass' : 'fail',
    message: pass ? `${status} 응답으로 접근 가능해요.` : `${status} 응답이에요. 공개 접근을 확인해 주세요.`,
  };
}

function checkXFrameOptions(value) {
  const normalized = value.split(',')[0]?.trim() ?? '';
  const blocked = BLOCKING_X_FRAME_OPTIONS.has(normalized);

  return {
    key: 'x-frame-options',
    label: 'X-Frame-Options',
    level: blocked ? 'fail' : 'pass',
    message: blocked
      ? `현재 ${value.toUpperCase()} 설정이라 nuevo 안에서 열 수 없어요.`
      : 'iframe 차단 헤더가 없어요.',
  };
}

function checkFrameAncestors(csp) {
  const frameAncestors = csp.match(/frame-ancestors\s+([^;]+)/)?.[1]?.trim() ?? '';
  const blocked = frameAncestors === "'none'" || frameAncestors === 'none';

  return {
    key: 'frame-ancestors',
    label: 'CSP frame-ancestors',
    level: blocked ? 'fail' : 'pass',
    message: blocked
      ? 'frame-ancestors가 none이라 임베딩이 차단돼요.'
      : 'CSP frame-ancestors 차단은 감지되지 않았어요.',
  };
}

function checkHttps(url) {
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const pass = url.protocol === 'https:' || isLocalhost;

  return {
    key: 'https',
    label: 'HTTPS',
    level: pass ? 'pass' : 'warn',
    message: pass ? '보안 연결이에요.' : '공개 공유에는 https 주소를 권장해요.',
  };
}
