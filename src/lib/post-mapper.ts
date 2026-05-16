import type { Author, Post } from './types';
import type { PostRow, UserRow } from './supabase/types';
import { relativeTime } from './social';

export type DbPostWithAuthor = PostRow & {
  author?: UserRow | null;
  users?: UserRow | null;
};

const DEFAULT_AUTHOR: Author = {
  id: 'unknown',
  displayName: '알 수 없음',
  handle: 'unknown',
  avatarEmoji: '✨',
  avatarBg: '#F7F0E6',
  followerCount: 0,
};

export function mapDbAuthorToAuthor(row?: UserRow | null): Author {
  if (!row) return DEFAULT_AUTHOR;

  return {
    id: row.id,
    displayName: row.display_name,
    handle: row.handle,
    avatarEmoji: row.avatar_emoji,
    avatarBg: row.avatar_bg,
    followerCount: 0,
    bio: row.bio ?? undefined,
    partnerTier: row.partner_tier ?? undefined,
  };
}

export function mapDbPostToPost(row: DbPostWithAuthor, options?: { remixCount?: number }): Post {
  const author = row.author ?? row.users ?? null;

  return {
    id: row.id,
    author: mapDbAuthorToAuthor(author),
    createdAt: relativeTime(row.created_at),
    title: row.title,
    text: row.text,
    contentType: row.content_type,
    media: {
      iframeUrl: row.iframe_url ?? undefined,
      coverEmoji: row.cover_emoji ?? undefined,
      emoji: row.cover_emoji ?? undefined,
      bgGradient: row.bg_gradient,
    },
    stats: {
      replies: 0,
      reposts: options?.remixCount ?? 0,
      likes: 0,
      views: 0,
      experienceSessions: 0,
      experienceMinutes: 0,
    },
    reactions: {
      funny: 0,
      weird: 0,
      genius: 0,
      wtf: 0,
    },
    remixable: row.remixable,
    remixOf: row.remix_of ?? undefined,
    detailDescription: row.detail_description ?? undefined,
    tool: row.tool_used ?? undefined,
  };
}
