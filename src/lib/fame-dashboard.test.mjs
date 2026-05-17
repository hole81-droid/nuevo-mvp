import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildFameMetrics,
  getAverageExperienceMinutes,
} from './fame-dashboard.js';

describe('fame dashboard metrics', () => {
  it('computes average experience time safely', () => {
    assert.equal(getAverageExperienceMinutes({ sessions: 0, minutes: 50 }), 0);
    assert.equal(getAverageExperienceMinutes({ sessions: 4, minutes: 10 }), 2.5);
  });

  it('orders fame metrics before money-oriented metrics', () => {
    const metrics = buildFameMetrics({
      sessions: 100,
      minutes: 250,
      reactions: 30,
      comments: 8,
      remixes: 4,
      saves: 12,
      shares: 9,
    });

    assert.deepEqual(metrics.map((metric) => metric.key), [
      'sessions',
      'avgMinutes',
      'reactions',
      'comments',
      'saves',
      'shares',
      'remixes',
    ]);
    assert.equal(metrics[1].value, 2.5);
  });
});
