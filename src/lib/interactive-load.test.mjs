import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getInteractiveLoadState,
  shouldMountInteractiveFrame,
} from './interactive-load.js';

test('autoplay mounts the interactive frame immediately', () => {
  assert.equal(shouldMountInteractiveFrame({ autoplay: true, deferUntilStart: true, started: false }), true);
});

test('deferred interactive frames wait for an explicit start', () => {
  assert.equal(shouldMountInteractiveFrame({ autoplay: false, deferUntilStart: true, started: false }), false);
  assert.equal(shouldMountInteractiveFrame({ autoplay: false, deferUntilStart: true, started: true }), true);
});

test('non-deferred interactive frames preserve feed expansion behavior', () => {
  assert.equal(shouldMountInteractiveFrame({ autoplay: false, deferUntilStart: false, started: false }), true);
});

test('load state copy distinguishes ready and loading states', () => {
  assert.deepEqual(getInteractiveLoadState({ mounted: false, loaded: false }), {
    label: '탭해서 앱 실행',
    busy: false,
  });
  assert.deepEqual(getInteractiveLoadState({ mounted: true, loaded: false }), {
    label: '앱 불러오는 중...',
    busy: true,
  });
  assert.deepEqual(getInteractiveLoadState({ mounted: true, loaded: true }), {
    label: '앱 실행 중',
    busy: false,
  });
});
