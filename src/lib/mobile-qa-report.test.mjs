import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeMobileLcpQa } from './mobile-qa-report.js';

test('passes when all measured detail routes meet the mobile LCP target', () => {
  const summary = summarizeMobileLcpQa({
    targetMs: 3000,
    results: [
      { path: '/post/1', lcpMs: 1800, failedRequestCount: 0, exceptions: [], iframeCount: 0 },
      { path: '/post/1?autoplay=true', lcpMs: 2200, failedRequestCount: 0, exceptions: [], iframeCount: 1 },
    ],
  });

  assert.equal(summary.status, 'pass');
  assert.equal(summary.passed, 2);
  assert.equal(summary.failed, 0);
  assert.equal(summary.checks[1].autoplayIframeMounted, true);
});

test('fails slow routes and autoplay routes without an iframe', () => {
  const summary = summarizeMobileLcpQa({
    targetMs: 3000,
    results: [
      { path: '/post/1', lcpMs: 3400, failedRequestCount: 0, exceptions: [], iframeCount: 0 },
      { path: '/post/1?autoplay=true', lcpMs: 2600, failedRequestCount: 0, exceptions: [], iframeCount: 0 },
    ],
  });

  assert.equal(summary.status, 'fail');
  assert.equal(summary.failed, 2);
  assert.match(summary.checks[0].reasons.join(' '), /LCP 3400ms/);
  assert.match(summary.checks[1].reasons.join(' '), /autoplay/);
});

test('marks missing LCP and runtime errors as failures', () => {
  const summary = summarizeMobileLcpQa({
    results: [
      { path: '/post/1', lcpMs: null, failedRequestCount: 2, exceptions: ['boom'], iframeCount: 0 },
    ],
  });

  assert.equal(summary.status, 'fail');
  assert.deepEqual(summary.checks[0].reasons, [
    'LCP was not captured',
    '2 network request(s) failed',
    '1 runtime exception(s) occurred',
  ]);
});
