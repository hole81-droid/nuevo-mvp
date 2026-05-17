import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCreatorPostPath,
  buildPostDeepLink,
  extractPostIdFromCreatorSlug,
  getShareCopy,
  isAutoplayRequested,
} from './deep-link.js';

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

test('buildCreatorPostPath creates @handle slug URL with encoded post id', () => {
  assert.equal(
    buildCreatorPostPath({
      postId: 'abc-123',
      handle: 'maker_lab',
      title: '서울 2호선 역 → 판타지 세계 배치 퀴즈',
    }),
    '/@maker_lab/seoul-2-fantasy-quiz--abc-123',
  );
});

test('extractPostIdFromCreatorSlug returns the encoded id suffix', () => {
  assert.equal(extractPostIdFromCreatorSlug('seoul-2-fantasy-quiz--abc-123'), 'abc-123');
});

test('getShareCopy returns channel-specific share text', () => {
  assert.match(
    getShareCopy('youtube', { title: 'Quiz App', handle: 'maker' }),
    /YouTube/,
  );
  assert.match(
    getShareCopy('instagram', { title: 'Quiz App', handle: 'maker' }),
    /@maker/,
  );
});
