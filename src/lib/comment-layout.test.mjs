import assert from 'node:assert/strict';
import { test } from 'node:test';

import { COMMENT_INPUT_BAR_CLASS } from './comment-layout.js';

test('comment input bar stays in document flow instead of floating over content', () => {
  assert.match(COMMENT_INPUT_BAR_CLASS, /\bborder-t\b/);
  assert.match(COMMENT_INPUT_BAR_CLASS, /\bflex\b/);
  assert.doesNotMatch(COMMENT_INPUT_BAR_CLASS, /\bsticky\b/);
  assert.doesNotMatch(COMMENT_INPUT_BAR_CLASS, /\bfixed\b/);
  assert.doesNotMatch(COMMENT_INPUT_BAR_CLASS, /\bbottom-0\b/);
});
