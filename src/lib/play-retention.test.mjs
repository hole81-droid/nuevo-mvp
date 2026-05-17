import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getDailyPlayablePosts,
  getLongestPlayedPosts,
  getMostRemixedPosts,
  getSimilarPosts,
} from './play-retention.js';

const baseAuthor = { id: 'a1', handle: 'maker', displayName: 'Maker' };
const posts = [
  {
    id: 'quiz',
    title: 'Fantasy Quiz',
    text: 'tap to play',
    contentType: 'interactive',
    author: baseAuthor,
    tags: ['퀴즈', '판타지'],
    stats: { experienceSessions: 80, experienceMinutes: 30, reposts: 4 },
  },
  {
    id: 'music',
    title: 'AI Music',
    text: 'listen',
    contentType: 'audio',
    author: baseAuthor,
    tags: ['음악'],
    stats: { experienceSessions: 20, experienceMinutes: 120, reposts: 8 },
  },
  {
    id: 'image',
    title: 'Poster',
    text: 'look',
    contentType: 'image',
    author: baseAuthor,
    tags: ['포스터'],
    stats: { experienceSessions: 5, experienceMinutes: 2, reposts: 0 },
  },
  {
    id: 'remix-hit',
    title: 'Remix Hit',
    text: 'play',
    contentType: 'interactive',
    author: baseAuthor,
    tags: ['퀴즈'],
    stats: { experienceSessions: 50, experienceMinutes: 40, reposts: 12 },
  },
];

describe('play retention sections', () => {
  it('selects daily playable posts from runnable content by session count', () => {
    assert.deepEqual(getDailyPlayablePosts(posts).map((post) => post.id), ['quiz', 'remix-hit', 'music']);
  });

  it('selects most remixed and longest played posts', () => {
    assert.deepEqual(getMostRemixedPosts(posts).map((post) => post.id), ['remix-hit', 'music', 'quiz']);
    assert.deepEqual(getLongestPlayedPosts(posts).map((post) => post.id), ['music', 'remix-hit', 'quiz']);
  });

  it('finds similar posts by shared tags and excludes the current post', () => {
    assert.deepEqual(getSimilarPosts(posts[0], posts).map((post) => post.id), ['remix-hit']);
  });
});
