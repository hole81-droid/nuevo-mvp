import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test('mobile app shell starts near the top of the viewport', () => {
  const shell = ruleBody('.max-w-\\[430px\\].mx-auto:not(.fixed)');
  assert.match(shell, /margin-top:\s*12px;/);
  assert.match(shell, /min-height:\s*calc\(100dvh - 12px\);/);
  assert.doesNotMatch(shell, /margin-top:\s*80px;/);
});

test('decorative phone chrome no longer consumes top content space', () => {
  const stage = ruleBody('body::before');
  const status = ruleBody('body::after');
  assert.match(stage, /top:\s*12px;/);
  assert.match(status, /display:\s*none;/);
  assert.doesNotMatch(stage, /top:\s*68px;/);
  assert.doesNotMatch(status, /top:\s*42px;/);
});
