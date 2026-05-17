import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getRemixCtaCopy,
  shouldShowRemixCta,
} from './remix-cta.js';

describe('remix CTA', () => {
  it('shows playful copy for remixable original posts', () => {
    assert.equal(shouldShowRemixCta({ remixable: true, remixOf: undefined }), true);
    assert.deepEqual(getRemixCtaCopy(), {
      title: '이 앱을 더 웃기게 바꿔보세요',
      body: '원본 창작자에게 리믹스 알림이 가고, 새 버전은 피드에 다시 노출돼요.',
      action: '리믹스하기',
    });
  });

  it('hides CTA for non-remixable posts and remix children', () => {
    assert.equal(shouldShowRemixCta({ remixable: false }), false);
    assert.equal(shouldShowRemixCta({ remixable: true, remixOf: 'post-1' }), false);
  });
});
