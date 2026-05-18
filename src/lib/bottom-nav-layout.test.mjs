import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BOTTOM_NAV_CENTER_CLASS,
  BOTTOM_NAV_CLASS,
  BOTTOM_NAV_ITEM_CLASS,
  BOTTOM_NAV_STYLE,
} from './bottom-nav-layout.js';

test('bottom nav uses the full mobile viewport while staying centered in the app frame', () => {
  assert.match(BOTTOM_NAV_CLASS, /\bfixed\b/);
  assert.match(BOTTOM_NAV_CLASS, /\bw-full\b/);
  assert.match(BOTTOM_NAV_CLASS, /(?:^|\s)max-w-\[430px\](?:\s|$)/);
  assert.match(BOTTOM_NAV_CLASS, /\bleft-1\/2\b/);
  assert.match(BOTTOM_NAV_CLASS, /(?:^|\s)-translate-x-1\/2(?:\s|$)/);
  assert.doesNotMatch(BOTTOM_NAV_CLASS, /\bright-0\b/);
  assert.doesNotMatch(BOTTOM_NAV_CLASS, /\bmx-auto\b/);
});

test('bottom nav reserves five stable tap columns and safe-area height', () => {
  assert.match(BOTTOM_NAV_CLASS, /\bgrid-cols-5\b/);
  assert.match(BOTTOM_NAV_ITEM_CLASS, /\bmin-w-0\b/);
  assert.match(BOTTOM_NAV_CENTER_CLASS, /\bw-12\b/);
  assert.equal(BOTTOM_NAV_STYLE.height, 'calc(64px + env(safe-area-inset-bottom, 0px))');
  assert.equal(BOTTOM_NAV_STYLE.paddingBottom, 'max(8px, env(safe-area-inset-bottom, 0px))');
});
