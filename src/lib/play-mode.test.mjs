import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildPlayModePath,
  getPlayModeContinuation,
  getNextPlayablePost,
  isPlayModeRequested,
} from './play-mode.js';

describe('play mode routing', () => {
  it('treats explicit play mode and autoplay as Play Mode entries', () => {
    assert.equal(isPlayModeRequested({ mode: 'play' }), true);
    assert.equal(isPlayModeRequested({ autoplay: 'true' }), true);
    assert.equal(isPlayModeRequested({ mode: 'browse', autoplay: 'false' }), false);
  });

  it('builds an internal Play Mode URL with autoplay and optional source', () => {
    assert.equal(buildPlayModePath('42'), '/post/42?mode=play&autoplay=true');
    assert.equal(
      buildPlayModePath('42', { source: 'feed' }),
      '/post/42?mode=play&autoplay=true&utm_source=feed',
    );
  });

  it('selects the first runnable next app and skips the current post', () => {
    const posts = [
      { id: 'current', contentType: 'interactive' },
      { id: 'image', contentType: 'image' },
      { id: 'audio', contentType: 'audio' },
      { id: 'interactive', contentType: 'interactive' },
    ];

    assert.equal(getNextPlayablePost(posts[0], posts)?.id, 'audio');
  });

  it('returns a next-app continuation when a playable recommendation exists', () => {
    const current = { id: 'current', contentType: 'interactive' };
    const next = { id: 'next', contentType: 'interactive', title: 'Next app' };

    assert.deepEqual(getPlayModeContinuation(current, [next]), {
      kind: 'next',
      post: next,
      links: [],
    });
  });

  it('returns feed and explore fallback links when no playable recommendation exists', () => {
    const current = { id: 'current', contentType: 'interactive' };

    assert.deepEqual(getPlayModeContinuation(current, [{ id: 'image', contentType: 'image' }]), {
      kind: 'fallback',
      post: null,
      links: [
        { href: '/', label: '피드로 돌아가기' },
        { href: '/explore', label: '탐색에서 더 보기' },
      ],
    });
  });
});
