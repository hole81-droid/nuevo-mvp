import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FEED_TABS_STICKY_CLASS } from './feed-layout.js';

test('feed tabs stick directly under the home header without a wasted offset', () => {
  assert.match(FEED_TABS_STICKY_CLASS, /\bsticky\b/);
  assert.match(FEED_TABS_STICKY_CLASS, /\btop-0\b/);
  assert.doesNotMatch(FEED_TABS_STICKY_CLASS, /top-\[\d+px\]/);
});
