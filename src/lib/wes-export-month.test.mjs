import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getWesExportMonth } from './wes-export-month.js';

describe('WES export month parsing', () => {
  it('accepts YYYY-MM and returns an ISO month range', () => {
    const result = getWesExportMonth('2026-05', '2026-06');

    assert.equal(result.month, '2026-05');
    assert.equal(result.start, '2026-05-01T00:00:00.000Z');
    assert.equal(result.end, '2026-06-01T00:00:00.000Z');
    assert.equal(result.fallbackUsed, false);
  });

  it('falls back when the month is missing or malformed', () => {
    assert.deepEqual(
      getWesExportMonth('not-a-month', '2026-06'),
      {
        month: '2026-06',
        start: '2026-06-01T00:00:00.000Z',
        end: '2026-07-01T00:00:00.000Z',
        fallbackUsed: true,
      },
    );
  });
});
