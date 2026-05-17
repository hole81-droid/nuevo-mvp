import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mergeSocialCounts } from './social-counts.js';

describe('mergeSocialCounts', () => {
  it('applies save and share counts without lowering existing optimistic values', () => {
    const result = mergeSocialCounts(
      {
        replies: 0,
        reposts: 0,
        likes: 0,
        views: 0,
        saves: 7,
        shares: 0,
        experienceSessions: 0,
        experienceMinutes: 0,
      },
      { replies: 2, saves: 5, shares: 3 },
    );

    assert.equal(result.replies, 2);
    assert.equal(result.saves, 7);
    assert.equal(result.shares, 3);
  });
});
