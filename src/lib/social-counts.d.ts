import type { Post } from './types';

export function mergeSocialCounts(
  stats: Post['stats'],
  metric?: { replies?: number; saves?: number; shares?: number },
): Post['stats'];
