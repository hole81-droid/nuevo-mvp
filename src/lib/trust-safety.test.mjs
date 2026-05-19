import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildAccountDeletionRequest,
  buildMailtoHref,
  buildModerationReportInsert,
  buildPostReportPath,
  buildPostReportRequest,
  normalizeReportReason,
} from './trust-safety.js';

describe('trust and safety helpers', () => {
  it('builds encoded mailto links with subject and body', () => {
    assert.equal(
      buildMailtoHref({
        to: 'safety@nuevo.app',
        subject: 'nuevo 신고',
        body: 'post: 123\nreason: spam',
      }),
      'mailto:safety%40nuevo.app?subject=nuevo%20%EC%8B%A0%EA%B3%A0&body=post%3A%20123%0Areason%3A%20spam',
    );
  });

  it('keeps report next paths relative and safe', () => {
    assert.equal(
      buildPostReportPath('post 123', '/post/post 123?autoplay=true'),
      '/report/post/post%20123?next=%2Fpost%2Fpost%20123%3Fautoplay%3Dtrue',
    );

    assert.equal(
      buildPostReportPath('post-123', 'https://evil.example/phish'),
      '/report/post/post-123',
    );
  });

  it('normalizes unsupported report reasons to other', () => {
    assert.equal(normalizeReportReason('unsafe'), 'unsafe');
    assert.equal(normalizeReportReason('not-a-reason'), 'other');
    assert.equal(normalizeReportReason(''), 'other');
  });

  it('builds a structured post report request', () => {
    const request = buildPostReportRequest({
      postId: 'post-123',
      reason: 'ip',
      detail: 'This app copied my prompt and assets.',
      reporterEmail: 'creator@example.com',
      currentUrl: 'https://nuevo.app/post/post-123',
    });

    assert.equal(request.to, 'safety@nuevo.app');
    assert.equal(request.subject, '[nuevo] 게시물 신고: post-123');
    assert.match(request.body, /신고 사유: 지식재산권 또는 권리 침해/);
    assert.match(request.body, /신고 대상: post-123/);
    assert.match(request.body, /연락처: creator@example.com/);
    assert.match(request.href, /^mailto:safety%40nuevo\.app\?/);
  });

  it('builds a database moderation report insert with normalized public fields', () => {
    const insert = buildModerationReportInsert({
      postId: ' post-123 ',
      reporterId: 'user-123',
      reason: 'spam',
      detail: 'x'.repeat(1300),
      reporterEmail: ' reporter@example.com ',
      currentUrl: ' https://nuevo.app/post/post-123 ',
    });

    assert.deepEqual(insert, {
      target_type: 'post',
      target_id: 'post-123',
      reporter_id: 'user-123',
      reason: 'spam',
      detail: `${'x'.repeat(1200)}...`,
      reporter_email: 'reporter@example.com',
      current_url: 'https://nuevo.app/post/post-123',
      status: 'open',
    });
  });

  it('allows guest moderation reports without leaking empty optional fields', () => {
    const insert = buildModerationReportInsert({
      postId: '',
      reason: 'unsupported',
      detail: '',
      reporterEmail: '',
      currentUrl: '',
    });

    assert.deepEqual(insert, {
      target_type: 'post',
      target_id: 'unknown',
      reporter_id: null,
      reason: 'other',
      detail: null,
      reporter_email: null,
      current_url: null,
      status: 'open',
    });
  });

  it('builds an account deletion request from the signed-in profile', () => {
    const request = buildAccountDeletionRequest({
      userId: 'user-123',
      email: 'creator@example.com',
      handle: 'maker',
    });

    assert.equal(request.to, 'privacy@nuevo.app');
    assert.equal(request.subject, '[nuevo] 계정 삭제 요청: @maker');
    assert.match(request.body, /사용자 ID: user-123/);
    assert.match(request.body, /이메일: creator@example.com/);
    assert.match(request.body, /핸들: @maker/);
  });
});
