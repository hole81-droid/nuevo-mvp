import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getUploadRemixState } from './upload-remix-state.js';

describe('upload remix state', () => {
  it('treats a missing remix param as a normal upload', () => {
    assert.deepEqual(getUploadRemixState({ remixPostId: null, originalPost: null, hasCheckedOriginal: false }), {
      status: 'none',
      canContinue: true,
      title: '',
      message: '',
    });
  });

  it('blocks invalid remix ids before publishing', () => {
    const state = getUploadRemixState({ remixPostId: 'not-a-post-id', originalPost: null, hasCheckedOriginal: true });

    assert.equal(state.status, 'invalid');
    assert.equal(state.canContinue, false);
    assert.match(state.message, /리믹스 링크가 올바르지 않아요/);
  });

  it('allows non-uuid demo originals when the mock post exists', () => {
    const state = getUploadRemixState({
      remixPostId: 'demo-1',
      originalPost: { title: 'Demo App', remixable: true },
      hasCheckedOriginal: true,
    });

    assert.equal(state.status, 'ready');
    assert.equal(state.canContinue, true);
  });

  it('shows loading while a valid remix id is still being resolved', () => {
    const state = getUploadRemixState({
      remixPostId: '11111111-1111-4111-8111-111111111111',
      originalPost: null,
      hasCheckedOriginal: false,
    });

    assert.equal(state.status, 'loading');
    assert.equal(state.canContinue, false);
  });

  it('blocks deleted or missing originals after lookup', () => {
    const state = getUploadRemixState({
      remixPostId: '11111111-1111-4111-8111-111111111111',
      originalPost: null,
      hasCheckedOriginal: true,
    });

    assert.equal(state.status, 'missing');
    assert.equal(state.canContinue, false);
    assert.match(state.message, /원본 작품을 찾을 수 없어요/);
  });

  it('blocks originals that do not allow remix', () => {
    const state = getUploadRemixState({
      remixPostId: '11111111-1111-4111-8111-111111111111',
      originalPost: { title: 'Locked App', remixable: false },
      hasCheckedOriginal: true,
    });

    assert.equal(state.status, 'blocked');
    assert.equal(state.canContinue, false);
    assert.match(state.message, /리믹스를 허용하지 않아요/);
  });

  it('allows remix upload for remixable originals', () => {
    const state = getUploadRemixState({
      remixPostId: '11111111-1111-4111-8111-111111111111',
      originalPost: { title: 'Open App', remixable: true },
      hasCheckedOriginal: true,
    });

    assert.equal(state.status, 'ready');
    assert.equal(state.canContinue, true);
    assert.match(state.message, /원본 앱을 바탕으로 새 체험을 올립니다/);
  });
});
