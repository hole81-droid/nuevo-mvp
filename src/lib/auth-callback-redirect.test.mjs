import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildAuthCallbackFailureRedirect } from './auth-callback-redirect.js';

describe('auth callback failure redirect', () => {
  it('preserves next and adds a missing-code reason', () => {
    assert.equal(
      buildAuthCallbackFailureRedirect({ next: '/post/1?autoplay=true', reason: 'missing_code' }),
      '/login?next=%2Fpost%2F1%3Fautoplay%3Dtrue&auth_error=missing_code',
    );
  });

  it('falls back to home for unsafe next paths', () => {
    assert.equal(
      buildAuthCallbackFailureRedirect({ next: 'https://evil.example', reason: 'exchange_failed' }),
      '/login?next=%2F&auth_error=exchange_failed',
    );
  });
});
