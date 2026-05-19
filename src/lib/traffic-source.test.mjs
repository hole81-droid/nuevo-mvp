import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildTrafficSourcePayload,
  classifyTrafficSource,
  getExternalEntryCopy,
  shouldUseInternalBackFallback,
  summarizeTrafficSources,
} from './traffic-source.js';

describe('classifyTrafficSource', () => {
  it('prefers utm_source over referrer', () => {
    assert.equal(classifyTrafficSource({ utmSource: 'youtube', referrer: 'https://instagram.com/p/1' }), 'youtube');
  });

  it('classifies known referrer hosts and defaults to direct', () => {
    assert.equal(classifyTrafficSource({ referrer: 'https://www.tiktok.com/@x/video/1' }), 'tiktok');
    assert.equal(classifyTrafficSource({ referrer: 'https://reddit.com/r/demo' }), 'reddit');
    assert.equal(classifyTrafficSource({ referrer: '' }), 'direct');
  });

  it('classifies short social source aliases from bio links', () => {
    assert.equal(classifyTrafficSource({ utmSource: 'ig' }), 'instagram');
    assert.equal(classifyTrafficSource({ utmSource: 'yt_shorts' }), 'youtube');
    assert.equal(classifyTrafficSource({ utmSource: 'tt_bio' }), 'tiktok');
  });
});

describe('external entry copy', () => {
  it('returns source-specific copy for autoplay app visits', () => {
    assert.deepEqual(
      getExternalEntryCopy({ source: 'instagram', autoplay: true }),
      {
        eyebrow: 'Instagram에서 바로 입장',
        title: '앱을 바로 실행 중이에요',
        body: '인스타그램 안에서도 끊기지 않게 첫 화면에서 바로 체험을 시작합니다.',
      },
    );
  });

  it('does not show entry copy for direct visits', () => {
    assert.equal(getExternalEntryCopy({ source: 'direct', autoplay: true }), null);
  });
});

describe('external entry navigation', () => {
  it('uses the internal back fallback for social autoplay links with browser history', () => {
    assert.equal(
      shouldUseInternalBackFallback({
        historyLength: 2,
        search: '?autoplay=true&utm_source=instagram',
        referrer: 'https://l.instagram.com/',
      }),
      true,
    );
  });

  it('preserves normal browser back for internal visits', () => {
    assert.equal(
      shouldUseInternalBackFallback({
        historyLength: 2,
        search: '',
        referrer: '',
      }),
      false,
    );
  });
});

describe('traffic source payload and summary', () => {
  it('builds a normalized payload from location-like input', () => {
    assert.deepEqual(
      buildTrafficSourcePayload({
        search: '?utm_source=Instagram&utm_campaign=launch',
        referrer: 'https://example.com',
      }),
      {
        traffic_source: 'instagram',
        referrer: 'https://example.com',
      },
    );
  });

  it('summarizes source rows in stable MVP channel order', () => {
    assert.deepEqual(
      summarizeTrafficSources([
        { traffic_source: 'instagram' },
        { traffic_source: 'youtube' },
        { traffic_source: 'instagram' },
        { traffic_source: null },
      ]),
      [
        { source: 'instagram', label: 'Instagram', count: 2, percent: 50 },
        { source: 'youtube', label: 'YouTube', count: 1, percent: 25 },
        { source: 'direct', label: 'Direct', count: 1, percent: 25 },
      ],
    );
  });
});
