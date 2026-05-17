'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { validateEmbedUrl } from '@/lib/embed-url';

interface Props {
  postId?: string;
  postTitle: string;
  iframeUrl?: string;
  autoplay?: boolean;
}

export default function InteractiveDemo({ postId, postTitle, iframeUrl, autoplay = false }: Props) {
  const [loadedUrl, setLoadedUrl] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const validation = validateEmbedUrl(iframeUrl ?? '', { allowRelative: true });
  const playableUrl = validation.ok ? validation.normalizedUrl : '';
  const loaded = Boolean(playableUrl && loadedUrl === playableUrl);
  const loadIssue = Boolean(playableUrl && issueUrl === playableUrl);
  const eventIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const finalizedRef = useRef(false);
  const clientSessionIdRef = useRef<string | null>(null);

  const getClientSessionId = () => {
    if (!clientSessionIdRef.current) {
      clientSessionIdRef.current = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `session-${new Date().getTime()}`;
    }
    return clientSessionIdRef.current;
  };

  const finalizeSession = async () => {
    const eventId = eventIdRef.current;
    const startedAt = startedAtRef.current;
    if (!eventId || !startedAt || finalizedRef.current) return;

    finalizedRef.current = true;
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    await supabase
      .from('experience_events')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      } as never)
      .eq('id', eventId);
  };

  const startSession = async () => {
    if (!postId || !playableUrl || eventIdRef.current) return;

    startedAtRef.current = Date.now();
    finalizedRef.current = false;

    const { data } = await supabase
      .from('experience_events')
      .insert({
        post_id: postId,
        viewer_id: user?.id ?? null,
        client_session_id: getClientSessionId(),
      } as never)
      .select('id')
      .single() as { data: { id: string } | null };

    eventIdRef.current = data?.id ?? null;
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') void finalizeSession();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void finalizeSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    eventIdRef.current = null;
    startedAtRef.current = null;
    finalizedRef.current = false;
  }, [playableUrl]);

  useEffect(() => {
    if (!playableUrl || loaded) return;

    const timer = window.setTimeout(() => {
      setIssueUrl(playableUrl);
    }, 12000);

    return () => window.clearTimeout(timer);
  }, [loaded, playableUrl]);

  return (
    <div className="mt-3 rounded-[28px] border-2 border-[#D8D8D0] overflow-hidden bg-[#F7F7F2]">
      {/* Label bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F7F2] border-b border-[#D8D8D0]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-black tracking-[-0.03em]">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          {autoplay ? '인터랙티브 · 딥링크 실행 중' : '인터랙티브 · 지금 실행 중'}
        </div>
        <span className="text-[11px] text-gray-400 truncate ml-auto max-w-[130px]">{postTitle}</span>
        {playableUrl && (
          <a
            href={playableUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            title="새 탭에서 열기"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {/* App area */}
      <div className="relative bg-[#EFEFE8]" style={{ height: 420 }}>
        {!playableUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-[13px] font-black tracking-[-0.04em] text-black">앱 URL을 실행할 수 없어요</span>
            <span className="max-w-[240px] text-center text-[12px] text-gray-400">
              {validation.message ?? '올바른 앱 URL이 없습니다.'}
            </span>
          </div>
        )}
        {playableUrl && !loaded && !loadIssue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px] text-gray-400">앱 불러오는 중...</span>
          </div>
        )}
        {playableUrl && loadIssue && !loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#EFEFE8] px-7 text-center">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-black tracking-[-0.04em] text-black">앱이 오래 걸려요</div>
              <p className="mt-1 text-[12px] text-gray-500 leading-snug">
                앱이 iframe을 막았거나 응답이 느릴 수 있어요. 새 탭으로 열어 확인해 보세요.
              </p>
            </div>
            <a
              href={playableUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-black"
            >
              새 탭에서 열기
            </a>
          </div>
        )}
        {playableUrl && (
          <iframe
            src={playableUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-popups"
            allow="camera; microphone"
            onLoad={() => {
              setLoadedUrl(playableUrl);
              setIssueUrl('');
              void startSession();
            }}
            style={{ display: loaded ? 'block' : 'none' }}
            title={postTitle}
          />
        )}
      </div>
    </div>
  );
}
