import type { Post } from './types';

export function getDailyPlayablePosts(posts: Post[], limit?: number): Post[];

export function getMostRemixedPosts(posts: Post[], limit?: number): Post[];

export function getLongestPlayedPosts(posts: Post[], limit?: number): Post[];

export function getSimilarPosts(currentPost: Post, posts: Post[], limit?: number): Post[];
