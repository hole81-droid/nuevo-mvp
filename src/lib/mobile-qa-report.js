const DEFAULT_TARGET_MS = 3000;

function isAutoplayPath(path = '') {
  return path.includes('autoplay=true');
}

function summarizeCheck(result, targetMs) {
  const reasons = [];
  const lcpMs = typeof result.lcpMs === 'number' ? result.lcpMs : null;
  const failedRequestCount = Number(result.failedRequestCount ?? 0);
  const exceptionCount = Array.isArray(result.exceptions) ? result.exceptions.length : 0;
  const autoplayIframeMounted = !isAutoplayPath(result.path) || Number(result.iframeCount ?? 0) > 0;

  if (lcpMs === null) reasons.push('LCP was not captured');
  else if (lcpMs > targetMs) reasons.push(`LCP ${lcpMs}ms exceeds ${targetMs}ms target`);
  if (failedRequestCount > 0) reasons.push(`${failedRequestCount} network request(s) failed`);
  if (exceptionCount > 0) reasons.push(`${exceptionCount} runtime exception(s) occurred`);
  if (!autoplayIframeMounted) reasons.push('autoplay route did not mount an iframe immediately');

  return {
    path: result.path,
    lcpMs,
    targetMs,
    status: reasons.length ? 'fail' : 'pass',
    autoplayIframeMounted,
    failedRequestCount,
    exceptionCount,
    reasons,
  };
}

export function summarizeMobileLcpQa({ results = [], targetMs = DEFAULT_TARGET_MS } = {}) {
  const checks = results.map((result) => summarizeCheck(result, targetMs));
  const failed = checks.filter((check) => check.status === 'fail').length;
  return {
    status: failed ? 'fail' : 'pass',
    targetMs,
    passed: checks.length - failed,
    failed,
    checks,
  };
}
