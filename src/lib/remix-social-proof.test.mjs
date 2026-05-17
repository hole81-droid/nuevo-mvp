import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getRemixSocialProofLabel,
  shouldShowRemixSocialProof,
} from './remix-social-proof.js';

describe('remix social proof', () => {
  it('hides social proof when there are no remixes', () => {
    assert.equal(shouldShowRemixSocialProof(0), false);
    assert.equal(getRemixSocialProofLabel(0), '');
  });

  it('shows a compact Korean label for one or more remixes', () => {
    assert.equal(shouldShowRemixSocialProof(1), true);
    assert.equal(getRemixSocialProofLabel(1), '1회 리믹스됨');
    assert.equal(getRemixSocialProofLabel(1200), '1.2k회 리믹스됨');
  });
});
