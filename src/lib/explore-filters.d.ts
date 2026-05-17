import type { ContentType, Post } from './types';

export const DEFAULT_EXPLORE_CATEGORIES: Array<{
  slug: string;
  label: string;
  keywords: string[];
  contentTypes?: ContentType[];
}>;

export function searchPosts(posts: Post[], query: string): Post[];

export function filterPostsByCategory(posts: Post[], slug: string): Post[];
