import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildTrafficSourcePayload,
  classifyTrafficSource,
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
