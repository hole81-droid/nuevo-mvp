import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPostDeepLink, isAutoplayRequested } from './deep-link.js';

test('isAutoplayRequested treats true and 1 as autoplay requests', () => {
  assert.equal(isAutoplayRequested({ autoplay: 'true' }), true);
  assert.equal(isAutoplayRequested({ autoplay: '1' }), true);
  assert.equal(isAutoplayRequested(new URLSearchParams('autoplay=true')), true);
});

test('isAutoplayRequested rejects missing and false autoplay params', () => {
  assert.equal(isAutoplayRequested({}), false);
  assert.equal(isAutoplayRequested({ autoplay: 'false' }), false);
  assert.equal(isAutoplayRequested(new URLSearchParams('autoplay=0')), false);
});

test('buildPostDeepLink includes autoplay and source params when requested', () => {
  assert.equal(
    buildPostDeepLink('abc-123', { origin: 'https://nuevo.app', autoplay: true, source: 'youtube' }),
    'https://nuevo.app/post/abc-123?autoplay=true&utm_source=youtube',
  );
});
