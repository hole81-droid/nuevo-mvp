import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getExploreEmptyState } from './explore-empty-state.js';

describe('explore empty state copy', () => {
  it('explains that the whole explore feed is empty', () => {
    const state = getExploreEmptyState({ mode: 'default' });

    assert.equal(state.title, '아직 올라온 앱이 없어요');
    assert.match(state.body, /첫 번째 앱 URL/);
    assert.equal(state.actionLabel, '앱 올리기');
    assert.equal(state.actionHref, '/upload');
  });

  it('gives search-specific recovery options', () => {
    const state = getExploreEmptyState({ mode: 'search', query: 'github' });

    assert.equal(state.title, '"github" 검색 결과가 없어요');
    assert.match(state.body, /태그나 앱 제목/);
    assert.equal(state.actionLabel, '검색 지우기');
  });

  it('names the selected category when category results are empty', () => {
    const state = getExploreEmptyState({ mode: 'category', label: '게임' });

    assert.equal(state.title, '게임 앱이 아직 없어요');
    assert.match(state.body, /다른 카테고리/);
  });
});
