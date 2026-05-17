import type { Post } from './types';

export function shouldShowRemixCta(post: Pick<Post, 'remixable' | 'remixOf'>): boolean;

export function getRemixCtaCopy(): {
  title: string;
  body: string;
  action: string;
};
