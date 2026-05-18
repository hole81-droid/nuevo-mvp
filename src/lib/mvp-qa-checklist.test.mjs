import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MVP_QA_CHECKLIST,
  getMvpQaSummary,
  getMvpQaChecklistByArea,
} from './mvp-qa-checklist.js';

test('covers the remaining real-device MVP QA areas', () => {
  assert.deepEqual(
    getMvpQaSummary(MVP_QA_CHECKLIST),
    {
      total: 9,
      byArea: {
        'external-deeplink': 3,
        'mobile-lcp': 2,
        'wes-export': 2,
        'visual-review': 2,
      },
    },
  );
});

test('deep-link QA items include source app, route, and expected message', () => {
  const items = getMvpQaChecklistByArea('external-deeplink');

  assert.equal(items.length, 3);
  assert.deepEqual(items.map((item) => item.source), ['YouTube', 'Instagram', 'TikTok']);
  assert.ok(items.every((item) => item.route.includes('autoplay=true')));
  assert.ok(items.every((item) => item.expected.includes('iframe')));
});

test('WES export QA describes live data checks instead of mock-only checks', () => {
  const items = getMvpQaChecklistByArea('wes-export');

  assert.equal(items.length, 2);
  assert.ok(items.every((item) => item.requiresLiveData));
  assert.match(items.map((item) => item.expected).join(' '), /CSV/);
  assert.match(items.map((item) => item.expected).join(' '), /month/);
});
