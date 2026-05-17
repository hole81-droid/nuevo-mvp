import assert from 'node:assert/strict';
import test from 'node:test';

import { buildLoginNextPath, buildLoginRedirect } from './protected-action.js';

test('buildLoginNextPath keeps path, query, and hash', () => {
  assert.equal(
    buildLoginNextPath('/post/1', '?autoplay=true', '#comments'),
    '/post/1?autoplay=true#comments',
  );
});

test('buildLoginNextPath falls back when path is unsafe', () => {
  assert.equal(buildLoginNextPath('https://evil.test', '?x=1'), '/');
  assert.equal(buildLoginNextPath('//evil.test', '?x=1'), '/');
});

test('buildLoginRedirect encodes the next path', () => {
  assert.equal(
    buildLoginRedirect('/post/1?autoplay=true&utm_source=share'),
    '/login?next=%2Fpost%2F1%3Fautoplay%3Dtrue%26utm_source%3Dshare',
  );
});
