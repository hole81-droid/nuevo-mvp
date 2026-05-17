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
});

test('analyzeEmbedHeaders blocks deny x-frame-options', () => {
  const result = analyzeEmbedHeaders({
    status: 200,
    url: 'https://example.com/app',
    headers: new Headers({ 'x-frame-options': 'DENY' }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.checks.find((check) => check.key === 'x-frame-options')?.level, 'fail');
});

test('analyzeEmbedHeaders warns for non-https public URLs', () => {
  const result = analyzeEmbedHeaders({
    status: 200,
    url: 'http://example.com/app',
    headers: new Headers(),
  });

  assert.equal(result.ok, true);
  assert.equal(result.checks.find((check) => check.key === 'https')?.level, 'warn');
});
