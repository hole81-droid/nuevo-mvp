import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzeEmbedHeaders } from './embed-check.js';

test('analyzeEmbedHeaders passes accessible https responses without frame blockers', () => {
  const result = analyzeEmbedHeaders({
    status: 200,
    url: 'https://example.com/app',
    headers: new Headers(),
  });

  assert.equal(result.ok, true);
  assert.equal(result.checks.every((check) => check.level === 'pass'), true);
  assert.deepEqual(result.checks.map((check) => check.label), [
    '공개 접근',
    'X-Frame-Options',
    'CSP frame-ancestors',
    'HTTPS',
  ]);
});

test('analyzeEmbedHeaders blocks deny x-frame-options', () => {
  const result = analyzeEmbedHeaders({
    status: 200,
    url: 'https://example.com/app',
    headers: new Headers({ 'x-frame-options': 'DENY' }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.checks.find((check) => check.key === 'x-frame-options')?.level, 'fail');
  assert.match(
    result.checks.find((check) => check.key === 'x-frame-options')?.message ?? '',
    /nuevo 안에서 열 수 없어요/,
  );
});

test('analyzeEmbedHeaders warns for non-https public URLs', () => {
  const result = analyzeEmbedHeaders({
    status: 200,
    url: 'http://example.com/app',
    headers: new Headers(),
  });

  assert.equal(result.ok, true);
  assert.equal(result.checks.find((check) => check.key === 'https')?.level, 'warn');
  assert.match(
    result.checks.find((check) => check.key === 'https')?.message ?? '',
    /https 주소를 권장/,
  );
});
