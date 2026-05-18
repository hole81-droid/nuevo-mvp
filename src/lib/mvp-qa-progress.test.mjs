import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQaProgressReport,
  buildQaMarkdownReport,
  buildQaTargetLinksMarkdown,
  filterQaItemsByStatus,
  getInitialQaProgress,
  setQaItemStatus,
  summarizeQaProgress,
  getMvpReleaseGate,
  importQaProgressReport,
  importMobileLcpQaReport,
  importWesExportCsvQa,
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

  const report = buildQaProgressReport([
    { id: 'a', route: '/post/[id]' },
    { id: 'b', route: '/post/[id]?autoplay=true' },
    { id: 'c', route: '/qa' },
  ], progress, {
    generatedAt: '2026-05-18T00:00:00.000Z',
    target: { baseUrl: 'https://nuevo.example.com', postId: 'post-123' },
  });

  assert.equal(report.generatedAt, '2026-05-18T00:00:00.000Z');
  assert.deepEqual(report.target, { baseUrl: 'https://nuevo.example.com', postId: 'post-123' });
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
  assert.deepEqual(report.items.map((item) => item.targetUrl), [
    'https://nuevo.example.com/post/post-123',
    'https://nuevo.example.com/post/post-123?autoplay=true',
    'https://nuevo.example.com/qa',
  ]);
});

test('builds a human-readable markdown QA report', () => {
  const report = buildQaMarkdownReport([
    { id: 'a', area: 'external-deeplink', title: 'YouTube deep link', source: 'YouTube', route: '/post/1?autoplay=true', passCriteria: 'Iframe mounts inside the in-app browser.' },
    { id: 'b', area: 'mobile-lcp', title: 'Autoplay LCP', source: 'Chrome', route: '/post/1?autoplay=true', passCriteria: 'LCP is 3000ms or less and autoplay iframe is present.' },
  ], {
    a: { status: 'pass', note: 'iPhone 15, iframe mounted' },
    b: { status: 'fail', note: 'LCP 3400ms' },
  }, {
    generatedAt: '2026-05-18T00:00:00.000Z',
    target: { baseUrl: 'https://nuevo.example.com', postId: 'post-123' },
  });

  assert.match(report, /^# nuevo MVP QA Report/);
  assert.match(report, /Generated: 2026-05-18T00:00:00.000Z/);
  assert.match(report, /Release gate: BLOCKED - 1 QA item\(s\) failed\./);
  assert.match(report, /\| YouTube deep link \| external-deeplink \| pass \| https:\/\/nuevo\.example\.com\/post\/1\?autoplay=true \| Iframe mounts inside the in-app browser\. \| iPhone 15, iframe mounted \|/);
  assert.match(report, /\| Autoplay LCP \| mobile-lcp \| fail \| https:\/\/nuevo\.example\.com\/post\/1\?autoplay=true \| LCP is 3000ms or less and autoplay iframe is present\. \| LCP 3400ms \|/);
});

test('builds a compact markdown list of runnable QA target links', () => {
  const report = buildQaTargetLinksMarkdown([
    { id: 'deeplink-youtube', area: 'external-deeplink', title: 'YouTube deep link', route: '/@creator/app-slug--postId?autoplay=true&utm_source=youtube' },
    { id: 'lcp-detail', area: 'mobile-lcp', title: 'Detail LCP', route: '/post/[id]' },
  ], {
    baseUrl: 'https://nuevo.example.com',
    creatorHandle: '@alice',
    appSlug: 'maze-runner',
    postId: 'post-123',
    month: '2026-05',
  });

  assert.match(report, /^# nuevo MVP QA Target Links/);
  assert.match(report, /- \[YouTube deep link\]\(https:\/\/nuevo\.example\.com\/@alice\/maze-runner--post-123\?autoplay=true&utm_source=youtube\) `external-deeplink`/);
  assert.match(report, /- \[Detail LCP\]\(https:\/\/nuevo\.example\.com\/post\/post-123\) `mobile-lcp`/);
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
    target: {
      baseUrl: 'https://nuevo.example.com',
      creatorHandle: '@alice',
      appSlug: 'maze-runner',
      postId: 'post-123',
      month: '2026-05',
    },
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
    target: {
      baseUrl: 'https://nuevo.example.com',
      creatorHandle: '@alice',
      appSlug: 'maze-runner',
      postId: 'post-123',
      month: '2026-05',
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

test('imports mobile LCP QA output into matching checklist items', () => {
  const lcpItems = [
    { id: 'lcp-detail', area: 'mobile-lcp' },
    { id: 'lcp-autoplay', area: 'mobile-lcp' },
    { id: 'deeplink-youtube', area: 'external-deeplink' },
  ];
  const current = {
    'lcp-detail': { status: 'pending', note: '' },
    'lcp-autoplay': { status: 'pending', note: '' },
    'deeplink-youtube': { status: 'pass', note: 'keep me' },
  };
  const report = {
    summary: {
      checks: [
        {
          path: '/post/1',
          lcpMs: 1800,
          targetMs: 3000,
          status: 'pass',
          failedRequestCount: 0,
          exceptionCount: 0,
          autoplayIframeMounted: true,
          reasons: [],
        },
        {
          path: '/post/1?autoplay=true',
          lcpMs: 3400,
          targetMs: 3000,
          status: 'fail',
          failedRequestCount: 1,
          exceptionCount: 0,
          autoplayIframeMounted: false,
          reasons: ['LCP 3400ms exceeds 3000ms target', 'autoplay route did not mount an iframe immediately'],
        },
      ],
    },
  };

  const result = importMobileLcpQaReport(lcpItems, current, JSON.stringify(report));

  assert.equal(result.ok, true);
  assert.equal(result.imported, 2);
  assert.equal(result.progress['lcp-detail'].status, 'pass');
  assert.match(result.progress['lcp-detail'].note, /LCP 1800ms \/ target 3000ms/);
  assert.equal(result.progress['lcp-autoplay'].status, 'fail');
  assert.match(result.progress['lcp-autoplay'].note, /autoplay iframe: missing/);
  assert.match(result.progress['lcp-autoplay'].note, /LCP 3400ms exceeds 3000ms target/);
  assert.deepEqual(result.progress['deeplink-youtube'], { status: 'pass', note: 'keep me' });
});

test('rejects mobile LCP QA output without summary checks', () => {
  const result = importMobileLcpQaReport(items, getInitialQaProgress(items), '{"summary":{}}');

  assert.equal(result.ok, false);
  assert.equal(result.imported, 0);
  assert.match(result.error, /Invalid mobile LCP QA JSON/);
});

test('imports WES CSV validation into column and month checklist items', () => {
  const wesItems = [
    { id: 'wes-live-columns', area: 'wes-export' },
    { id: 'wes-live-month', area: 'wes-export' },
    { id: 'lcp-detail', area: 'mobile-lcp' },
  ];
  const current = {
    'wes-live-columns': { status: 'pending', note: '' },
    'wes-live-month': { status: 'pending', note: '' },
    'lcp-detail': { status: 'pass', note: 'keep me' },
  };
  const csv = [
    'event_type,event_id,post_id,post_title,occurred_at,value,duration_seconds,traffic_source,detail,wes_weight',
    'experience,e1,p1,Quiz,2026-05-10T00:00:00.000Z,1,30,youtube,,1',
  ].join('\n');

  const result = importWesExportCsvQa(wesItems, current, csv, '2026-05');

  assert.equal(result.ok, true);
  assert.equal(result.imported, 2);
  assert.equal(result.progress['wes-live-columns'].status, 'pass');
  assert.match(result.progress['wes-live-columns'].note, /WES CSV import: month 2026-05; rows 1; columns ok/);
  assert.equal(result.progress['wes-live-month'].status, 'pass');
  assert.match(result.progress['wes-live-month'].note, /month filter ok/);
  assert.deepEqual(result.progress['lcp-detail'], { status: 'pass', note: 'keep me' });
});

test('fails WES CSV column and month items independently', () => {
  const wesItems = [
    { id: 'wes-live-columns', area: 'wes-export' },
    { id: 'wes-live-month', area: 'wes-export' },
  ];
  const csv = [
    'event_type,event_id,post_id,occurred_at',
    'experience,e1,p1,2026-04-30T23:59:00.000Z',
  ].join('\n');

  const result = importWesExportCsvQa(wesItems, getInitialQaProgress(wesItems), csv, '2026-05');

  assert.equal(result.ok, true);
  assert.equal(result.progress['wes-live-columns'].status, 'fail');
  assert.match(result.progress['wes-live-columns'].note, /Missing columns/);
  assert.equal(result.progress['wes-live-month'].status, 'fail');
  assert.match(result.progress['wes-live-month'].note, /outside 2026-05/);
});

test('rejects WES CSV import without a valid month', () => {
  const result = importWesExportCsvQa(items, getInitialQaProgress(items), 'event_type\n', 'May');

  assert.equal(result.ok, false);
  assert.equal(result.imported, 0);
  assert.match(result.error, /valid YYYY-MM month/);
});
