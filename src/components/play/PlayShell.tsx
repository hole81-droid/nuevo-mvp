'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSaved } from '@/contexts/SavedContext';
import { buildLoginRedirectFromLocation } from '@/lib/protected-action';
import { buildPlayShellPath, PLAY_TOP_CLASS, PLAY_BOTTOM_CLASS, PLAY_DONE_PANEL_CLASS } from '@/lib/play-shell';
import type { PlayState } from '@/lib/play-shell';
import BackButton from '@/components/ui/BackButton';
import InteractiveDemo from '@/components/post/InteractiveDemo';
import { buildPlayModeEventPayload, recordPlayModeEvent } from '@/lib/play-mode-analytics';

const REACTIONS = [
  { key: 'funny',  emoji: '😂', label: '웃김'    },
  { key: 'weird',  emoji: '👽', label: '기괴함'   },
  { key: 'genius', emoji: '🧠', label: '천재'     },
  { key: 'wtf',    emoji: '❓', label: '뭐야이건' },
] as const;

export default function PlayShell({
  post,
  nextPost,
}: {
  post: Post;
  nextPost: Post | null;
}) {
  const [playState, setPlayState] = useState<PlayState>('loading');
  const [liked, setLiked] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const router = useRouter();

  // Track play_start on mount and next_app_reveal when next app is available
  useEffect(() => {
    recordPlayModeEvent(buildPlayModeEventPayload({
      eventName: 'internal_play_start',
      postId: post.id,
      search: window.location.search,
      referrer: document.referrer,
    }));
  }, [post.id]);

  useEffect(() => {
    if (!nextPost) return;
    recordPlayModeEvent(buildPlayModeEventPayload({
      eventName: 'next_app_reveal',
      postId: nextPost.id,
      fromPostId: post.id,
      search: window.location.search,
      referrer: document.referrer,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPost?.id, post.id]);
  const { user } = useAuth();
  const { isSaved, toggle: toggleSave } = useSaved();
  const saved = isSaved(post.id);

  const requireLogin = () => {
    router.push(buildLoginRedirectFromLocation(window.location));
  };

  const handleNext = () => {
    if (nextPost) {
      recordPlayModeEvent(buildPlayModeEventPayload({
        eventName: 'next_app_click',
        postId: nextPost.id,
        fromPostId: post.id,
        search: '?utm_source=next_app',
        referrer: window.location.href,
      }));
      router.push(buildPlayShellPath(nextPost.id, { source: 'next_app' }));
    } else {
      router.push('/');
    }
  };

  const handleLike = () => {
    if (!user) { requireLogin(); return; }
    setLiked((v) => !v);
  };

  const handleSave = () => {
    if (!user) { requireLogin(); return; }
    toggleSave(post);
  };

  const handleRemix = () => {
    if (!user) { requireLogin(); return; }
    router.push(`/upload?remix=${post.id}`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/play/${post.id}?autoplay=true`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Top overlay — outside iframe bounds */}
      <div
        className={PLAY_TOP_CLASS}
        style={{ height: 54, paddingTop: 'max(10px, env(safe-area-inset-top, 10px))' }}
      >
        <BackButton variant="inverted" fallbackHref="/" />
        <span className="flex-1 truncate text-center text-[15px] font-bold text-white">
          {post.title}
        </span>
        {/* spacer to balance back button */}
        <span className="w-9 flex-shrink-0" />
      </div>

      {/* iframe — fills entire viewport */}
      <div className="absolute inset-0">
        <InteractiveDemo
          postId={post.id}
          postTitle={post.title}
          iframeUrl={post.media.iframeUrl}
          autoplay
          deferUntilStart={false}
          variant="fullscreen"
          onReady={() => setPlayState('playing')}
        />
      </div>

      {/* Bottom — playing state: thin gradient bar */}
      {playState !== 'done' && (
        <div className={PLAY_BOTTOM_CLASS}>
          <div className="flex items-center justify-around py-3">
            {/* 좋아요 */}
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-1 px-4 transition-colors ${liked ? 'text-red-400' : 'text-white'}`}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="text-[10px] font-black">좋아요</span>
            </button>

            {/* 건너뛰기 (loading) / 완료 (playing) */}
            <button
              onClick={playState === 'loading' ? handleNext : () => setPlayState('done')}
              className="flex flex-col items-center gap-1 px-4 text-white/70"
            >
              {playState === 'loading' ? (
                <>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="text-[10px] font-black">건너뛰기</span>
                </>
              ) : (
                <>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[10px] font-black">완료</span>
                </>
              )}
            </button>

            {/* 다음 앱 */}
            <button
              onClick={handleNext}
              className="flex flex-col items-center gap-1 px-4 text-white"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span className="text-[10px] font-black">다음 앱</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom — done state: slide-up panel */}
      {playState === 'done' && (
        <div className={PLAY_DONE_PANEL_CLASS}>
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7D7D78] mb-3">
            체험이 끝났어요
          </div>

          {/* Reaction row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {REACTIONS.map(({ key, emoji, label }) => {
              const isActive = activeReaction === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveReaction(isActive ? null : key)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border text-[12px] font-bold transition-colors ${
                    isActive
                      ? 'border-black bg-black text-white'
                      : 'border-[#D7D7CF] bg-white text-gray-700'
                  }`}
                >
                  <span className="text-[20px] leading-none">{emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Social actions */}
          <div className="flex gap-2 mb-4">
            {post.remixable && (
              <button
                onClick={handleRemix}
                className="flex-1 h-10 rounded-full border-2 border-black text-[13px] font-black text-black active:scale-[0.98]"
              >
                리믹스
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex-1 h-10 rounded-full border text-[13px] font-black active:scale-[0.98] ${
                saved ? 'border-black bg-black text-white' : 'border-[#D7D7CF] text-gray-700'
              }`}
            >
              {saved ? '저장됨' : '저장'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 h-10 rounded-full border border-[#D7D7CF] text-[13px] font-black text-gray-700 active:scale-[0.98]"
            >
              공유
            </button>
          </div>

          {/* Primary next CTA */}
          <button
            onClick={handleNext}
            className="w-full h-12 rounded-full bg-black text-[14px] font-black text-white active:scale-[0.98]"
          >
            {nextPost ? '다음 앱 바로 체험 →' : '피드로 돌아가기'}
          </button>
        </div>
      )}
    </div>
  );
}
