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
import { buildCreatorPostPath, buildPostDeepLink } from '@/lib/deep-link';
import { buildLoginRedirectFromLocation } from '@/lib/protected-action';
import { getRemixSocialProofLabel, shouldShowRemixSocialProof } from '@/lib/remix-social-proof';
import { getRemixCtaCopy, shouldShowRemixCta } from '@/lib/remix-cta';
import { buildTrafficSourcePayload } from '@/lib/traffic-source';
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

export default function PostDetailClient({
  post,
  autoplay = false,
  relatedPosts = [],
  remixPosts = [],
}: {
  post: Post;
  autoplay?: boolean;
  relatedPosts?: Post[];
  remixPosts?: Post[];
}) {
  const { author, createdAt, text, stats, reactions, tags, externalLinks, tool, remixable, detailDescription, contentType, media, title } = post;
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const useDbSocial = isUuid(post.id);

  const { isSaved, toggle: toggleSave } = useSaved();
  const saved = isSaved(post.id);

  const commentRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleCommentClick = () => {
    if (!user) {
      requireLogin();
      return;
    }
    commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => commentInputRef.current?.focus(), 350);
  };

  const [liked, setLiked]       = useState(false);
  const [likeCount, setLikeCount] = useState(stats.likes);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(stats.reposts);
  const [shareCount, setShareCount] = useState(stats.shares ?? 0);
  const [activeReaction, setActiveReaction] = useState<ReactionKey | null>(null);
  const [reactionCounts, setReactionCounts] = useState({ ...reactions });
  const [copied, setCopied] = useState(false);
  const remixSocialProof = getRemixSocialProofLabel(repostCount);
  const remixCtaCopy = getRemixCtaCopy();

  const requireLogin = () => {
    router.push(buildLoginRedirectFromLocation(window.location));
  };

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
    const url = buildPostDeepLink(post.id, {
      origin: window.location.origin,
      autoplay: true,
      source: 'share',
      path: buildCreatorPostPath({ postId: post.id, handle: author.handle, title }),
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setShareCount((count) => count + 1);
    if (useDbSocial) {
      supabase.from('post_share_events').insert({
        post_id: post.id,
        sharer_id: user?.id ?? null,
        source: 'copy_link',
        ...buildTrafficSourcePayload({
          search: window.location.search,
          referrer: document.referrer,
        }),
      } as never).then(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!user) {
      requireLogin();
      return;
    }
    setLiked((v) => !v);
    setLikeCount((c) => liked ? c - 1 : c + 1);
  };

  const handleRepost = () => {
    if (!user) {
      requireLogin();
      return;
    }
    setReposted((v) => !v);
    setRepostCount((c) => reposted ? c - 1 : c + 1);
  };

  const handleReaction = async (key: ReactionKey) => {
    if (!user) {
      requireLogin();
      return;
    }

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
        {shouldShowRemixSocialProof(repostCount) && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[13px] font-black">
            {remixSocialProof}
          </div>
        )}

        {/* Content by type */}
        {contentType === 'interactive' && (
          <InteractiveDemo postId={post.id} postTitle={title} iframeUrl={media.iframeUrl} autoplay={autoplay} />
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
          <span><strong className="text-gray-900 font-bold">{formatViews(stats.saves ?? 0)}</strong> <span className="text-gray-500">저장</span></span>
          <span><strong className="text-gray-900 font-bold">{formatViews(shareCount)}</strong> <span className="text-gray-500">공유</span></span>
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
            onClick={remixable
              ? () => user ? router.push(`/upload?remix=${post.id}`) : requireLogin()
              : handleRepost
            }
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
            onClick={() => user ? toggleSave(post) : requireLogin()}
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
        {(detailDescription || tool || tags?.length || externalLinks?.length) && (
          <details className="mt-3 mb-1">
            <summary className="text-[14px] text-gray-500 cursor-pointer select-none list-none flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round"/></svg>
              만든 방식 보기
            </summary>
            {detailDescription && <div className="mt-2 text-[14px] text-gray-700 leading-relaxed">{detailDescription}</div>}
            {tool && <div className="mt-1 text-[13px] text-gray-500">사용 도구: {tool}</div>}
            {tags?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-[12px] text-gray-600">#{tag}</span>
                ))}
              </div>
            ) : null}
            {externalLinks?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {externalLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-gray-200 px-2.5 py-1 text-[12px] font-bold text-gray-700"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </details>
        )}
      </div>

      {shouldShowRemixCta(post) && (
        <section className="mx-4 mt-4 rounded-3xl border-2 border-black bg-[#FFFDF5] p-4 shadow-[0_18px_30px_rgba(0,0,0,0.08)]">
          <div className="text-[16px] font-black tracking-[-0.04em] text-black">{remixCtaCopy.title}</div>
          <p className="mt-1 text-[13px] leading-snug text-[#666660]">{remixCtaCopy.body}</p>
          <button
            onClick={() => user ? router.push(`/upload?remix=${post.id}`) : requireLogin()}
            className="mt-3 inline-flex h-10 items-center rounded-full bg-black px-5 text-[13px] font-black text-white active:scale-[0.98]"
          >
            {remixCtaCopy.action}
          </button>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="px-4 pt-4 pb-2 border-t border-gray-100">
          <h2 className="text-[15px] font-black tracking-[-0.04em] text-gray-900">비슷한 앱 더 보기</h2>
          <div className="mt-2 flex flex-col gap-2">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/post/${related.id}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF5] px-3 py-2 active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F7F7F2] flex items-center justify-center text-[18px]">
                  {related.media.coverEmoji ?? related.media.emoji ?? '▶'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-black text-gray-900">{related.title}</div>
                  <div className="truncate text-[12px] text-gray-500">@{related.author.handle}</div>
                </div>
                {related.tags?.[0] && (
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-gray-500">
                    #{related.tags[0]}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {remixPosts.length > 0 && (
        <section className="px-4 pt-4 pb-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-black tracking-[-0.04em] text-gray-900">이 앱의 리믹스들</h2>
            <span className="text-[12px] font-bold text-gray-400">{remixPosts.length}개</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {remixPosts.map((remix) => (
              <Link
                key={remix.id}
                href={`/post/${remix.id}`}
                className="flex items-center gap-3 rounded-2xl border border-[#D8D8D0] bg-[#FFFDF5] px-3 py-2 active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[18px]">
                  {remix.media.coverEmoji ?? remix.media.emoji ?? '↻'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-black text-gray-900">{remix.title}</div>
                  <div className="truncate text-[12px] text-gray-500">@{remix.author.handle}의 리믹스</div>
                </div>
                <span className="rounded-full bg-black px-2 py-1 text-[11px] font-black text-white">
                  리믹스
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <div ref={commentRef}>
        <CommentSection postId={post.id} postAuthorId={author.id} inputRef={commentInputRef} requireLoginPath />
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
