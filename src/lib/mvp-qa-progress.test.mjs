import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQaProgressReport,
  buildQaMarkdownReport,
  filterQaItemsByStatus,
  getInitialQaProgress,
  setQaItemStatus,
  summarizeQaProgress,
  getMvpReleaseGate,
  importQaProgressReport,
} from './mvp-qa-progress.js';

const items = [
  { id: 'a', area: 'external-deeplink' },
  { id: 'b', area: 'mobile-lcp' },
  { id: 'c', area: 'wes-export' },
];

test('creates pending progress for each checklist item', () => {
  assert.deepEqual(getInitialQaProgress(items), {
    a: { status: 'pending', note: '' },
    b: { status: 'pending', note: '' },
    c: { status: 'pending', note: '' },
  });
});

test('updates one item status and note without dropping other progress', () => {
  const progress = getInitialQaProgress(items);
  const next = setQaItemStatus(progress, 'b', 'fail', 'Instagram iframe blocked');

  assert.equal(progress.b.status, 'pending');
  assert.deepEqual(next.b, { status: 'fail', note: 'Instagram iframe blocked' });
  assert.deepEqual(next.a, { status: 'pending', note: '' });
});

test('summarizes pass fail pending counts and completion percent', () => {
  const progress = {
    a: { status: 'pass', note: '' },
    b: { status: 'fail', note: 'slow' },
    c: { status: 'pending', note: '' },
  };

  assert.deepEqual(summarizeQaProgress(items, progress), {
    total: 3,
    pass: 1,
    fail: 1,
    pending: 1,
    complete: 2,
    completionPercent: 67,
  });
});

test('builds a portable QA progress report with notes', () => {
  const progress = {
    a: { status: 'pass', note: 'YouTube works' },
    b: { status: 'fail', note: 'LCP 3400ms' },
    c: { status: 'pending', note: '' },
  };

  const report = buildQaProgressReport(items, progress, { generatedAt: '2026-05-18T00:00:00.000Z' });

  assert.equal(report.generatedAt, '2026-05-18T00:00:00.000Z');
  assert.deepEqual(report.summary, {
    total: 3,
    pass: 1,
    fail: 1,
    pending: 1,
    complete: 2,
    completionPercent: 67,
  });
  assert.deepEqual(report.items.map((item) => [item.id, item.status, item.note]), [
    ['a', 'pass', 'YouTube works'],
    ['b', 'fail', 'LCP 3400ms'],
    ['c', 'pending', ''],
  ]);
});

test('builds a human-readable markdown QA report', () => {
  const report = buildQaMarkdownReport([
    { id: 'a', area: 'external-deeplink', title: 'YouTube deep link', source: 'YouTube', route: '/post/1?autoplay=true' },
    { id: 'b', area: 'mobile-lcp', title: 'Autoplay LCP', source: 'Chrome', route: '/post/1?autoplay=true' },
  ], {
    a: { status: 'pass', note: 'iPhone 15, iframe mounted' },
    b: { status: 'fail', note: 'LCP 3400ms' },
  }, { generatedAt: '2026-05-18T00:00:00.000Z' });

  assert.match(report, /^# nuevo MVP QA Report/);
  assert.match(report, /Generated: 2026-05-18T00:00:00.000Z/);
  assert.match(report, /Release gate: BLOCKED - 1 QA item\(s\) failed\./);
  assert.match(report, /\| YouTube deep link \| external-deeplink \| pass \| iPhone 15, iframe mounted \|/);
  assert.match(report, /\| Autoplay LCP \| mobile-lcp \| fail \| LCP 3400ms \|/);
});

test('filters QA items by current status', () => {
  const progress = {
    a: { status: 'pass', note: '' },
    b: { status: 'fail', note: '' },
    c: { status: 'pending', note: '' },
  };

  assert.deepEqual(filterQaItemsByStatus(items, progress, 'all').map((item) => item.id), ['a', 'b', 'c']);
  assert.deepEqual(filterQaItemsByStatus(items, progress, 'fail').map((item) => item.id), ['b']);
  assert.deepEqual(filterQaItemsByStatus(items, progress, 'pending').map((item) => item.id), ['c']);
});

test('filters passed QA items that are missing required evidence notes', () => {
  const evidenceItems = [
    { id: 'a', area: 'external-deeplink', evidenceRequired: true },
    { id: 'b', area: 'mobile-lcp', evidenceRequired: true },
    { id: 'c', area: 'wes-export', evidenceRequired: false },
  ];
  const progress = {
    a: { status: 'pass', note: '' },
    b: { status: 'pass', note: 'iPhone screenshot' },
    c: { status: 'pass', note: '' },
  };

  assert.deepEqual(
    filterQaItemsByStatus(evidenceItems, progress, 'evidence-missing').map((item) => item.id),
    ['a'],
  );
});

test('marks release gate blocked until every item passes', () => {
  assert.deepEqual(getMvpReleaseGate(items, {
    a: { status: 'pass', note: '' },
    b: { status: 'pass', note: '' },
    c: { status: 'pending', note: '' },
  }), {
    status: 'blocked',
    message: '1 QA item(s) still pending.',
  });

  assert.deepEqual(getMvpReleaseGate(items, {
    a: { status: 'pass', note: '' },
    b: { status: 'fail', note: 'slow' },
    c: { status: 'pass', note: '' },
  }), {
    status: 'blocked',
    message: '1 QA item(s) failed.',
  });

  assert.deepEqual(getMvpReleaseGate(items, {
    a: { status: 'pass', note: '' },
    b: { status: 'pass', note: '' },
    c: { status: 'pass', note: '' },
  }), {
    status: 'ready',
    message: 'All MVP QA items passed.',
  });
});

test('blocks release when passed evidence-required items have no note', () => {
  const evidenceItems = [
    { id: 'a', area: 'external-deeplink', evidenceRequired: true },
    { id: 'b', area: 'mobile-lcp', evidenceRequired: false },
  ];

  assert.deepEqual(getMvpReleaseGate(evidenceItems, {
    a: { status: 'pass', note: '' },
    b: { status: 'pass', note: 'ok' },
  }), {
    status: 'blocked',
    message: '1 QA evidence note(s) missing.',
  });

  assert.deepEqual(getMvpReleaseGate(evidenceItems, {
    a: { status: 'pass', note: 'iPhone 15 Safari screenshot attached' },
    b: { status: 'pass', note: 'ok' },
  }), {
    status: 'ready',
    message: 'All MVP QA items passed.',
  });
});

test('imports progress from a portable QA report and ignores unknown item ids', () => {
  const report = {
    generatedAt: '2026-05-18T00:00:00.000Z',
    items: [
      { id: 'a', status: 'pass', note: 'ok' },
      { id: 'b', status: 'fail', note: 'blocked' },
      { id: 'x', status: 'pass', note: 'unknown item' },
    ],
  };

  assert.deepEqual(importQaProgressReport(items, JSON.stringify(report)), {
    ok: true,
    imported: 2,
    progress: {
      a: { status: 'pass', note: 'ok' },
      b: { status: 'fail', note: 'blocked' },
      c: { status: 'pending', note: '' },
    },
    error: '',
  });
});

test('rejects invalid QA report JSON', () => {
  const result = importQaProgressReport(items, '{not json');

  assert.equal(result.ok, false);
  assert.equal(result.imported, 0);
  assert.deepEqual(result.progress, getInitialQaProgress(items));
  assert.match(result.error, /Invalid QA report/);
});
