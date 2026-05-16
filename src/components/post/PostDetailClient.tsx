'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/types';
import { formatViews } from '@/lib/mock-data';
import { useSaved } from '@/contexts/SavedContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { countReactions, isUuid, ReactionKey } from '@/lib/social';
import { createNotification } from '@/lib/notification-events';
import InteractiveDemo from './InteractiveDemo';
import AudioPlayer from './AudioPlayer';
import ImageGallery, { SUBWAY_SLIDES } from './ImageGallery';
import CommentSection from './CommentSection';
import FollowButton from '@/components/profile/FollowButton';

const REACTIONS = [
  { key: 'funny',  emoji: '😂', label: '웃김'    },
  { key: 'weird',  emoji: '👽', label: '기괴함'   },
  { key: 'genius', emoji: '🧠', label: '천재'     },
  { key: 'wtf',    emoji: '❓', label: '뭐야이건' },
] as const;

export default function PostDetailClient({ post }: { post: Post }) {
  const { author, createdAt, text, stats, reactions, tags, tool, remixable, detailDescription, contentType, media, title } = post;
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const useDbSocial = isUuid(post.id);

  const { isSaved, toggle: toggleSave } = useSaved();
  const saved = isSaved(post.id);

  const commentRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleCommentClick = () => {
    commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => commentInputRef.current?.focus(), 350);
  };

  const [liked, setLiked]       = useState(false);
  const [likeCount, setLikeCount] = useState(stats.likes);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(stats.reposts);
  const [activeReaction, setActiveReaction] = useState<ReactionKey | null>(null);
  const [reactionCounts, setReactionCounts] = useState({ ...reactions });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadReactions = async () => {
      if (!useDbSocial) return;

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
  }, [post.id, supabase, useDbSocial, user?.id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => liked ? c - 1 : c + 1);
  };

  const handleRepost = () => {
    setReposted((v) => !v);
    setRepostCount((c) => reposted ? c - 1 : c + 1);
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

  return (
    <main className="flex-1 overflow-y-auto pb-[54px] scrollbar-hide">
      <div className="px-4 pt-4">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.handle}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: author.avatarBg }}>
              {author.avatarEmoji}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] text-gray-900">{author.displayName}</div>
            <div className="text-[14px] text-gray-500">@{author.handle}</div>
          </div>
          <FollowButton authorId={author.id} />
        </div>

        {/* Text */}
        <p className="mt-3 text-[17px] text-gray-900 leading-normal whitespace-pre-wrap break-words">
          {text}
        </p>

        {/* Content by type */}
        {contentType === 'interactive' && (
          <InteractiveDemo postId={post.id} postTitle={title} iframeUrl={media.iframeUrl} />
        )}
        {contentType === 'audio' && (
          <AudioPlayer coverEmoji={media.coverEmoji ?? '🎵'} title={title} />
        )}
        {contentType === 'image' && (
          <ImageGallery
            title={title}
            slides={post.id === '3' ? SUBWAY_SLIDES : Array.from({ length: media.imageCount ?? 1 }, (_, i) => ({
              emoji: media.emoji ?? '🖼️',
              bgGradient: media.bgGradient ?? 'from-pink-100 to-pink-200',
              label: `${title} ${i + 1}/${media.imageCount ?? 1}`,
            }))}
          />
        )}

        {/* Experience stats (interactive/audio only) */}
        {(contentType === 'interactive' || contentType === 'audio') && (
          <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
            <span className="text-[13px] font-semibold text-warm">체험 {formatViews(stats.experienceSessions)}회</span>
            <span className="text-gray-300">·</span>
            <span className="text-[13px] font-semibold text-warm">총 체험 시간 {formatViews(stats.experienceMinutes)}분</span>
          </div>
        )}

        {/* Timestamp + views */}
        <div className="mt-3 text-[14px] text-gray-500 pb-3 border-b border-gray-100">
          {createdAt} · {formatViews(stats.views)} 조회
        </div>

        {/* Stats row */}
        <div className="flex gap-5 py-3 border-b border-gray-100 text-[14px]">
          <span><strong className="text-gray-900 font-bold">{repostCount}</strong> <span className="text-gray-500">리믹스</span></span>
          <span><strong className="text-gray-900 font-bold">{likeCount}</strong> <span className="text-gray-500">좋아요</span></span>
          <span><strong className="text-gray-900 font-bold">{stats.replies}</strong> <span className="text-gray-500">댓글</span></span>
        </div>

        {/* Reactions */}
        <div className="flex gap-2 py-3 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {REACTIONS.map(({ key, emoji, label }) => {
            const isActive = activeReaction === key;
            const count = reactionCounts[key as keyof typeof reactionCounts];
            return (
              <button
                key={key}
                onClick={() => handleReaction(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-semibold transition-all active:scale-95 ${
                  isActive
                    ? 'border-warm bg-orange-50 text-warm'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
                <span className={`font-normal ${isActive ? 'text-warm' : 'text-gray-400'}`}>{formatViews(count)}</span>
              </button>
            );
          })}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-around py-2 border-b border-gray-100">
          <ActionBtn
            onClick={handleCommentClick}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          />
          <ActionBtn
            active={reposted}
            activeColor="text-green-500"
            onClick={remixable ? () => router.push(`/upload?remix=${post.id}`) : handleRepost}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={reposted ? 2.5 : 2} strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>}
            label={remixable ? '리믹스' : undefined}
          />
          <ActionBtn
            active={liked}
            activeColor="text-red-500"
            onClick={handleLike}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
          />
          <ActionBtn
            active={saved}
            activeColor="text-warm"
            onClick={() => toggleSave(post)}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
          />
          <ActionBtn
            active={copied}
            activeColor="text-warm"
            onClick={handleShare}
            icon={copied
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            }
            label={copied ? '복사됨' : undefined}
          />
        </div>

        {/* Detail / tools */}
        {detailDescription && (
          <details className="mt-3 mb-1">
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
        )}
      </div>

      {/* Comments */}
      <div ref={commentRef}>
        <CommentSection postId={post.id} postAuthorId={author.id} inputRef={commentInputRef} />
      </div>
    </main>
  );
}

function ActionBtn({ icon, label, active, activeColor, onClick }: {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  activeColor?: string;
  onClick?: () => void;
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
