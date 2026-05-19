import type { Post } from './types';

export type PlayModeContinuation =
  | { kind: 'next'; post: Post; links: [] }
  | { kind: 'fallback'; post: null; links: Array<{ href: string; label: string }> };

export function isPlayModeRequested(
  searchParams?: Record<string, string | string[] | undefined>,
): boolean;

export function buildPlayModePath(
  postId: string,
  options?: { source?: string },
): string;

export function getNextPlayablePost(
  currentPost: Pick<Post, 'id'> | null | undefined,
  posts?: Post[],
): Post | null;

export function getPlayModeContinuation(
  currentPost: Pick<Post, 'id'> | null | undefined,
  posts?: Post[],
): PlayModeContinuation;
