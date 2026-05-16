'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/types';
import { formatViews } from '@/lib/mock-data';
import { useSaved } from '@/contexts/SavedContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { countReactions, isUuid, ReactionKey } from '@/lib/social';
import { createNotification } from '@/lib/notification-events';
import ContentViewer from './ContentViewer';
import InteractiveDemo from './InteractiveDemo';
import AudioPlayer from './AudioPlayer';
import ImageGallery, { SUBWAY_SLIDES } from './ImageGallery';
import CommentSection from './CommentSection';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

const REACTIONS = [
  { key: 'funny',  label: '웃김'    },
  { key: 'weird',  label: '기괴함'   },
  { key: 'genius', label: '천재'     },
  { key: 'wtf',    label: '뭐야이건' },
] as const;

export default function PostCard({
  post,
  expanded = false,
  onToggle,
}: {
  post: Post;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const router = useRouter();
  const { author, createdAt, text, stats, tags, tool, remixable, detailDescription, contentType, media, title, remixOf } = post;
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const useDbSocial = isUuid(post.id);

  const { isSaved, toggle: toggleSave } = useSaved();
  const saved = isSaved(post.id);

  const [liked, setLiked]         = useState(false);
  const [likeCount, setLikeCount] = useState(stats.likes);
  const [reposted, setReposted]   = useState(false);
  const [repostCount, setRepostCount] = useState(stats.reposts);
  const [activeReaction, setActiveReaction] = useState<ReactionKey | null>(null);
  const [reactionCounts, setReactionCounts] = useState({ ...post.reactions });
  const [copied, setCopied] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;

    const loadReactions = async () => {
      if (!expanded || !useDbSocial) return;

      const { data, error } = await supabase
        .from('post_reactions')
        .select('user_id, reaction')
        .eq('post_id', post.id);

      if (!mounted || error) return;

      const rows = (data ?? []) as Array<{ user_id: string; reaction: ReactionKey }>;
      setReactionCounts(countReactions(rows));
      setActiveReaction(rows.find((row) => row.user_id === user?.id)?.reaction ?? null);
    };

    loadReactions();

    return () => {
      mounted = false;
    };
  }, [expanded, post.id, supabase, useDbSocial, user?.id]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((v) => !v);
    setLikeCount((c) => liked ? c - 1 : c + 1);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReposted((v) => !v);
    setRepostCount((c) => reposted ? c - 1 : c + 1);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = async (key: ReactionKey) => {
    const previousReaction = activeReaction;

    if (activeReaction === key) {
      setActiveReaction(null);
      setReactionCounts((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
    } else {
      if (activeReaction) {
        setReactionCounts((prev) => ({ ...prev, [activeReaction]: Math.max(0, prev[activeReaction] - 1) }));
      }
      setActiveReaction(key);
      setReactionCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    }

    if (!useDbSocial || !user) return;

    const { error } = previousReaction === key
      ? await supabase
          .from('post_reactions')
          .delete()
          .match({ post_id: post.id, user_id: user.id })
      : await supabase
          .from('post_reactions')
          .upsert({ post_id: post.id, user_id: user.id, reaction: key } as never);

    if (!error) {
      if (previousReaction === null) {
        await createNotification(supabase, {
          recipientId: author.id,
          actorId: user.id,
          type: 'reaction',
          postId: post.id,
        });
      }
      return;
    }

    setActiveReaction(previousReaction);
    setReactionCounts((prev) => {
      const next = { ...prev };
      if (previousReaction === key) {
        next[key] += 1;
      } else {
        next[key] = Math.max(0, next[key] - 1);
        if (previousReaction) next[previousReaction] += 1;
      }
      return next;
    });
  };

  const handleCardClick = () => {
    if (onToggle) onToggle();
    else router.push(`/post/${post.id}`);
  };

  return (
    <article
      className="border-b border-[#D8D8D0]"
      onClick={!expanded ? handleCardClick : undefined}
      style={!expanded ? { cursor: 'pointer' } : undefined}
    >

      {/* ── Compact header (always visible) ── */}
      <div className={`px-4 py-3 ${!expanded ? 'active:bg-gray-50 transition-colors' : ''}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <Link href={`/profile/${author.handle}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-[#D8D8D0] bg-[#FFFDF5]" style={{ backgroundColor: author.avatarBg }}>
              {author.avatarEmoji}
            </div>
          </Link>

          {/* Content column */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-1 min-w-0">
              <Link href={`/profile/${author.handle}`} onClick={(e) => e.stopPropagation()} className="font-bold text-[15px] text-gray-900 truncate hover:underline">
                {author.displayName}
              </Link>
              <span className="text-[15px] text-gray-500 flex-shrink-0">@{author.handle}</span>
              <span className="text-[15px] text-gray-400 flex-shrink-0">·</span>
              <span className="text-[15px] text-gray-400 flex-shrink-0">{createdAt}</span>
              <button onClick={(e) => e.stopPropagation()} className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-full">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </div>

            {/* Text */}
            <p className="text-[15px] text-gray-900 leading-normal mt-0.5 whitespace-pre-wrap break-words">{text}</p>
            {remixOf && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFDF5] text-black text-[12px] font-black border border-[#D8D8D0]">
                <NuevoGlyph kind="remix" size={18} /> 원본 작품 리믹스
              </div>
            )}

            {/* Compact content + action bar (collapsed only) */}
            {!expanded && (
              <>
                <ContentViewer post={post} compact />
                <div className="flex items-center mt-3 -ml-2 text-gray-500">
                  <SmallBtn
                    onClick={(e) => { e.stopPropagation(); router.push(`/post/${post.id}`); }}
                    count={stats.replies}
                    active={false}
                    activeColor="blue"
                    icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                  />
                  <SmallBtn
                    onClick={handleRepost}
                    count={repostCount}
                    active={reposted}
                    activeColor="green"
                    icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={reposted ? 2.5 : 2} strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>}
                  />
                  <SmallBtn
                    onClick={handleLike}
                    count={likeCount}
                    active={liked}
                    activeColor="red"
                    icon={<svg width="19" height="19" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                  />
                  <SmallBtn
                    onClick={(e) => e.stopPropagation()}
                    count={stats.views}
                    active={false}
                    activeColor="blue"
                    formatter={formatViews}
                    icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  />
                  <button
                    onClick={handleShare}
                    className={`ml-auto flex items-center p-2 rounded-full transition-colors ${copied ? 'text-warm' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'}`}
                  >
                    {copied
                      ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded detail (inline) ── */}
      {expanded && (
        <div>
          {/* Full content */}
          <div className="px-4">
            {contentType === 'interactive' && <InteractiveDemo postId={post.id} postTitle={title} iframeUrl={media.iframeUrl} />}
            {contentType === 'audio' && <AudioPlayer coverEmoji={media.coverEmoji ?? '🎵'} title={title} />}
            {contentType === 'image' && (
              <ImageGallery
                title={title}
                slides={post.id === '3' ? SUBWAY_SLIDES : Array.from({ length: media.imageCount ?? 1 }, (_, i) => ({
                  emoji: media.emoji ?? '',
                  bgGradient: media.bgGradient ?? 'from-pink-100 to-pink-200',
                  label: `${title} ${i + 1}/${media.imageCount ?? 1}`,
                }))}
              />
            )}
          </div>

          {/* Timestamp + views */}
          <div className="mt-3 px-4 text-[14px] text-gray-500 pb-3 border-b border-gray-100">
            {createdAt} · {formatViews(stats.views)} 조회
          </div>

          {/* Experience stats (interactive/audio only) */}
          {(contentType === 'interactive' || contentType === 'audio') && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#FFFDF5] border-b border-[#D8D8D0]">
              <span className="text-[13px] font-black text-black flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                체험 {formatViews(stats.experienceSessions)}회
              </span>
              <span className="text-[#B7B7AF]">·</span>
              <span className="text-[13px] font-black text-black flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                총 체험 시간 {formatViews(stats.experienceMinutes)}분
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex gap-5 px-4 py-3 border-b border-gray-100 text-[14px]">
            <span><strong className="text-gray-900 font-bold">{repostCount}</strong> <span className="text-gray-500">리믹스</span></span>
            <span><strong className="text-gray-900 font-bold">{likeCount}</strong> <span className="text-gray-500">좋아요</span></span>
            <span><strong className="text-gray-900 font-bold">{stats.replies}</strong> <span className="text-gray-500">댓글</span></span>
          </div>

          {/* Reactions */}
          <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {REACTIONS.map(({ key, label }) => {
              const isActive = activeReaction === key;
              const count = reactionCounts[key as keyof typeof reactionCounts];
              return (
                <button
                  key={key}
                  onClick={() => handleReaction(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-semibold transition-all active:scale-95 ${
                    isActive ? 'border-black bg-black text-white' : 'border-[#D8D8D0] text-gray-700 hover:bg-[#EFEFE8]'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`font-normal ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{formatViews(count)}</span>
                </button>
              );
            })}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-around py-2 px-4 border-b border-gray-100">
            <BigBtn
              onClick={(e) => { e.stopPropagation(); commentInputRef.current?.focus(); }}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
            />
            <BigBtn
              active={reposted}
              activeColor="text-green-500"
              onClick={remixable
                ? (e) => { e.stopPropagation(); router.push(`/upload?remix=${post.id}`); }
                : handleRepost
              }
              label={remixable ? '리믹스' : undefined}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={reposted ? 2.5 : 2} strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>}
            />
            <BigBtn
              active={liked}
              activeColor="text-red-500"
              onClick={handleLike}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
            />
            <BigBtn
              active={copied}
              activeColor="text-warm"
              onClick={handleShare}
              label={copied ? '복사됨' : undefined}
              icon={copied
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              }
            />
            <BigBtn
              active={saved}
              activeColor="text-warm"
              onClick={(e) => { e.stopPropagation(); toggleSave(post); }}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
            />
          </div>

          {/* Detail / tools */}
          {detailDescription && (
            <div className="px-4 mt-3 mb-1">
              <details>
                <summary className="text-[14px] text-gray-500 cursor-pointer select-none list-none flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round"/></svg>
                  만든 방식 보기
                </summary>
                <div className="mt-2 text-[14px] text-gray-700 leading-relaxed">{detailDescription}</div>
                {tool && <div className="mt-1 text-[13px] text-gray-500">사용 도구: {tool}</div>}
                {tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-[12px] text-gray-600">#{tag}</span>
                    ))}
                  </div>
                )}
              </details>
            </div>
          )}

          {/* Comments */}
          <CommentSection postId={post.id} postAuthorId={author.id} inputRef={commentInputRef} />

          {/* Collapse button */}
          <button
            onClick={onToggle}
            className="w-full py-3 flex items-center justify-center gap-1.5 text-[14px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
            접기
          </button>
        </div>
      )}
    </article>
  );
}

/* ── Compact action button ── */
const COLOR_MAP = {
  blue:  { text: 'text-blue-500',  bg: 'hover:bg-blue-50'  },
  green: { text: 'text-green-500', bg: 'hover:bg-green-50' },
  red:   { text: 'text-red-500',   bg: 'hover:bg-red-50'   },
};

function SmallBtn({
  icon, count, active, activeColor, formatter, onClick,
}: {
  icon: React.ReactNode;
  count: number;
  active: boolean;
  activeColor: 'blue' | 'green' | 'red';
  formatter?: (n: number) => string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { text, bg } = COLOR_MAP[activeColor];
  const display = formatter
    ? formatter(count)
    : count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count > 0 ? String(count) : '';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${bg} ${active ? text : 'text-gray-500'}`}
    >
      {icon}
      {display && <span className="text-[13px]">{display}</span>}
    </button>
  );
}

/* ── Expanded action button ── */
function BigBtn({ icon, label, active, activeColor, onClick }: {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  activeColor?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-gray-100 ${active && activeColor ? activeColor : 'text-gray-500'}`}
    >
      {icon}
      {label && <span className="text-[13px] font-medium">{label}</span>}
    </button>
  );
}
