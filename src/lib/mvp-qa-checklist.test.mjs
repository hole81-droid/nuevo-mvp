import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MVP_QA_CHECKLIST,
  getMvpQaSummary,
  getMvpQaChecklistByArea,
  buildMvpQaTargetUrl,
  getDefaultMvpQaTarget,
  normalizeMvpQaTarget,
} from './mvp-qa-checklist.js';

test('covers the remaining real-device MVP QA areas', () => {
  assert.deepEqual(
    getMvpQaSummary(MVP_QA_CHECKLIST),
    {
      total: 15,
      byArea: {
        'external-deeplink': 3,
        'play-mode': 2,
        'play-shell': 4,
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

test('every QA item includes runnable steps, evidence hints, and pass criteria', () => {
  assert.ok(MVP_QA_CHECKLIST.every((item) => Array.isArray(item.steps)));
  assert.ok(MVP_QA_CHECKLIST.every((item) => item.steps.length >= 2));
  assert.ok(MVP_QA_CHECKLIST.every((item) => item.steps.every((step) => step.trim().length > 0)));
  assert.ok(MVP_QA_CHECKLIST.every((item) => item.evidenceHint.trim().length > 0));
  assert.ok(MVP_QA_CHECKLIST.every((item) => item.passCriteria.trim().length > 0));
});

test('builds runnable QA target URLs from placeholder routes', () => {
  const target = {
    baseUrl: 'https://nuevo.example.com/',
    creatorHandle: '@alice',
    appSlug: 'maze-runner',
    postId: 'post-123',
    month: '2026-05',
  };

  assert.equal(
    buildMvpQaTargetUrl('/@creator/app-slug--postId?autoplay=true&utm_source=youtube', target),
    'https://nuevo.example.com/@alice/maze-runner--post-123?autoplay=true&utm_source=youtube',
  );
  assert.equal(
    buildMvpQaTargetUrl('/post/[id]?autoplay=true', target),
    'https://nuevo.example.com/post/post-123?autoplay=true',
  );
  assert.equal(
    buildMvpQaTargetUrl('/api/studio/wes-export?month=YYYY-MM', target),
    'https://nuevo.example.com/api/studio/wes-export?month=2026-05',
  );
});

test('normalizes persisted QA target values with safe defaults', () => {
  assert.deepEqual(normalizeMvpQaTarget({
    baseUrl: ' https://nuevo.example.com/ ',
    creatorHandle: 'alice',
    appSlug: '',
    postId: 'post-123',
  }, { month: '2026-05' }), {
    ...getDefaultMvpQaTarget({ month: '2026-05' }),
    baseUrl: 'https://nuevo.example.com',
    creatorHandle: '@alice',
    postId: 'post-123',
  });

  assert.deepEqual(normalizeMvpQaTarget(null, { month: '2026-05' }), getDefaultMvpQaTarget({ month: '2026-05' }));
});
