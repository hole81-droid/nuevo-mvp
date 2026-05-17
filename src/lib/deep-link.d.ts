export function isAutoplayRequested(searchParams: URLSearchParams | Record<string, string | string[] | undefined>): boolean;

export function buildPostDeepLink(
  postId: string,
  options?: { origin?: string; autoplay?: boolean; source?: string; path?: string },
): string;

export function buildCreatorPostPath(post: {
  postId: string;
  handle: string;
  title: string;
}): string;

export function extractPostIdFromCreatorSlug(slug: string): string;

export function getShareCopy(channel: string, post: { title: string; handle: string }): string;
