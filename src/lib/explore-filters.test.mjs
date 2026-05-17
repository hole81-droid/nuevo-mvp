import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_EXPLORE_CATEGORIES,
  filterPostsByCategory,
  searchPosts,
} from './explore-filters.js';

const posts = [
  {
    id: '1',
    title: 'Subway Fantasy Quiz',
    text: '서울 지하철 판타지 문제',
    contentType: 'interactive',
    author: { handle: 'maker', displayName: 'Maker' },
    tags: ['퀴즈', '서울'],
    detailDescription: 'Claude로 만든 퀴즈 앱',
    tool: 'Claude',
    externalLinks: [{ label: 'YouTube', url: 'https://youtube.com/demo' }],
  },
  {
    id: '2',
    title: 'Morning Focus Timer',
    text: '업무 집중을 돕는 생산성 앱',
    contentType: 'interactive',
    author: { handle: 'focus', displayName: 'Focus Lab' },
    tags: ['생산성'],
  },
  {
    id: '3',
    title: 'Late Night Jazz',
    text: 'AI music loop',
    contentType: 'audio',
    author: { handle: 'audio', displayName: 'Audio Lab' },
    tags: ['재즈'],
  },
];

describe('searchPosts', () => {
  it('matches title, body text, tags, tool, author, and external link labels', () => {
    assert.deepEqual(searchPosts(posts, 'youtube').map((post) => post.id), ['1']);
    assert.deepEqual(searchPosts(posts, '생산성').map((post) => post.id), ['2']);
    assert.deepEqual(searchPosts(posts, 'audio lab').map((post) => post.id), ['3']);
    assert.deepEqual(searchPosts(posts, 'claude').map((post) => post.id), ['1']);
  });
});

describe('filterPostsByCategory', () => {
  it('maps default MVP category slugs to tags and content types', () => {
    assert.deepEqual(DEFAULT_EXPLORE_CATEGORIES.map((category) => category.slug), [
      'games',
      'quizzes',
      'filters',
      'music',
      'productivity',
      'weird',
    ]);
    assert.deepEqual(filterPostsByCategory(posts, 'quizzes').map((post) => post.id), ['1']);
    assert.deepEqual(filterPostsByCategory(posts, 'music').map((post) => post.id), ['3']);
    assert.deepEqual(filterPostsByCategory(posts, 'productivity').map((post) => post.id), ['2']);
  });
});
