import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  validateWesExportCsv,
  buildWesEventRows,
  toCsv,
} from './wes-export.js';

describe('WES raw event export', () => {
  it('normalizes mixed raw events into export rows', () => {
    const rows = buildWesEventRows({
      experiences: [{
        id: 'e1',
        post_id: 'p1',
        post_title: 'Quiz App',
        started_at: '2026-05-01T00:00:00Z',
        duration_seconds: 90,
        traffic_source: 'youtube',
      }],
      reactions: [{
        post_id: 'p1',
        post_title: 'Quiz App',
        reaction: 'funny',
        created_at: '2026-05-01T00:02:00Z',
      }],
      comments: [{
        id: 'c1',
        post_id: 'p1',
        post_title: 'Quiz App',
        created_at: '2026-05-01T00:03:00Z',
      }],
      remixes: [{
        id: 'r1',
        remix_of: 'p1',
        original_title: 'Quiz App',
        created_at: '2026-05-01T00:04:00Z',
      }],
    });

    assert.deepEqual(rows.map((row) => row.event_type), ['experience', 'reaction', 'comment', 'remix']);
    assert.equal(rows[0].wes_weight, 1);
    assert.equal(rows[0].value, 1);
    assert.equal(rows[0].duration_seconds, 90);
    assert.equal(rows[3].wes_weight, 5);
  });

  it('escapes CSV values', () => {
    assert.equal(
      toCsv([{ event_type: 'comment', post_title: 'A, "quoted" app' }], ['event_type', 'post_title']),
      'event_type,post_title\ncomment,"A, ""quoted"" app"',
    );
  });

  it('validates exported CSV columns and month range', () => {
    const csv = toCsv([
      {
        event_type: 'experience',
        event_id: 'e1',
        post_id: 'p1',
        post_title: 'Quiz App',
        occurred_at: '2026-05-10T00:00:00.000Z',
        value: 1,
        duration_seconds: 30,
        traffic_source: 'youtube',
        detail: '',
        wes_weight: 1,
      },
    ]);

    assert.deepEqual(validateWesExportCsv(csv, { month: '2026-05' }), {
      ok: true,
      rowCount: 1,
      errors: [],
    });
  });

  it('reports missing columns and rows outside the requested month', () => {
    const csv = [
      'event_type,event_id,post_id,occurred_at',
      'experience,e1,p1,2026-04-30T23:59:00.000Z',
    ].join('\n');

    const result = validateWesExportCsv(csv, { month: '2026-05' });

    assert.equal(result.ok, false);
    assert.match(result.errors.join(' '), /Missing columns/);
    assert.match(result.errors.join(' '), /outside 2026-05/);
  });

  it('accepts empty exports when only the header row exists', () => {
    assert.deepEqual(validateWesExportCsv(toCsv([]), { month: '2026-05' }), {
      ok: true,
      rowCount: 0,
      errors: [],
    });
  });
});
