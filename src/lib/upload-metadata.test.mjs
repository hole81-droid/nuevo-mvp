import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  normalizeExternalLinks,
  normalizeTags,
} from './upload-metadata.js';

describe('normalizeTags', () => {
  it('trims, de-duplicates, removes hash prefixes, and keeps at most five tags', () => {
    assert.deepEqual(
      normalizeTags(' game, #AI, Game, 퀴즈,  weird app , 음악, 생산성 '),
      ['game', 'AI', '퀴즈', 'weird app', '음악'],
    );
  });

  it('drops empty tags and limits each tag length', () => {
    assert.deepEqual(
      normalizeTags(['', '   ', 'super-long-tag-name-over-limit', '#짧음']),
      ['super-long-tag-name', '짧음'],
    );
  });
});

describe('normalizeExternalLinks', () => {
  it('keeps at most three valid http links with trimmed labels', () => {
    assert.deepEqual(
      normalizeExternalLinks([
        { label: ' YouTube ', url: ' https://youtube.com/watch?v=abc ' },
        { label: '', url: 'https://github.com/acme/app' },
        { label: 'bad', url: 'javascript:alert(1)' },
        { label: 'Demo', url: 'https://example.com/demo' },
        { label: 'Extra', url: 'https://example.com/extra' },
      ]),
      [
        { label: 'YouTube', url: 'https://youtube.com/watch?v=abc' },
        { label: 'Link 2', url: 'https://github.com/acme/app' },
        { label: 'Demo', url: 'https://example.com/demo' },
      ],
    );
  });
});
