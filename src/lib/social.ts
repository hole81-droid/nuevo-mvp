import { Author, Comment } from '@/lib/types';
import { UserRow } from '@/lib/supabase/types';

export type ReactionKey = 'funny' | 'weird' | 'genius' | 'wtf';

export const REACTION_KEYS: ReactionKey[] = ['funny', 'weird', 'genius', 'wtf'];

export const EMPTY_REACTION_COUNTS: Record<ReactionKey, number> = {
  funny: 0,
  weird: 0,
  genius: 0,
  wtf: 0,
};

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function mapUserRowToAuthor(user: UserRow): Author {
  return {
    id: user.id,
    displayName: user.display_name,
    handle: user.handle,
    avatarEmoji: user.avatar_emoji,
    avatarBg: user.avatar_bg,
    followerCount: 0,
    bio: user.bio ?? undefined,
    partnerTier: user.partner_tier ?? undefined,
  };
}

export function relativeTime(iso: string) {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSeconds < 60) return '방금';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

export function mapDbCommentToComment(row: {
  id: string;
  text: string;
  created_at: string;
  author?: UserRow | null;
  users?: UserRow | null;
}): Comment {
  const author = row.author ?? row.users;

  return {
    id: row.id,
    author: author
      ? mapUserRowToAuthor(author)
      : {
          id: 'unknown',
          displayName: '알 수 없음',
          handle: 'unknown',
          avatarEmoji: 'N',
          avatarBg: '#EFEFE8',
          followerCount: 0,
        },
    text: row.text,
    createdAt: relativeTime(row.created_at),
    likes: 0,
  };
}

export function countReactions(rows: Array<{ reaction: ReactionKey }>) {
  return rows.reduce<Record<ReactionKey, number>>(
    (counts, row) => {
      counts[row.reaction] += 1;
      return counts;
    },
    { ...EMPTY_REACTION_COUNTS },
  );
}
