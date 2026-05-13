'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Props {
  postId?: string;
  postTitle: string;
  iframeUrl?: string;
}

export default function InteractiveDemo({ postId, postTitle, iframeUrl }: Props) {
  const [loaded, setLoaded] = useState(false);
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
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
    await (supabase.from('experience_events') as any)
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', eventId);
  };

  const startSession = async () => {
    if (!postId || !iframeUrl || eventIdRef.current) return;

    startedAtRef.current = Date.now();
    finalizedRef.current = false;

    const { data } = await (supabase.from('experience_events') as any)
      .insert({
        post_id: postId,
        viewer_id: user?.id ?? null,
        client_session_id: getClientSessionId(),
      })
      .select('id')
      .single();

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

  return (
    <div className="mt-3 rounded-[28px] border-2 border-[#D8D8D0] overflow-hidden bg-[#F7F7F2]">
      {/* Label bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F7F2] border-b border-[#D8D8D0]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-black tracking-[-0.03em]">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          인터랙티브 · 지금 실행 중
        </div>
        <span className="text-[11px] text-gray-400 truncate ml-auto max-w-[130px]">{postTitle}</span>
        {iframeUrl && (
          <a
            href={iframeUrl}
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
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px] text-gray-400">앱 불러오는 중...</span>
          </div>
        )}
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="camera; microphone"
            onLoad={() => {
              setLoaded(true);
              void startSession();
            }}
            style={{ display: loaded ? 'block' : 'none' }}
            title={postTitle}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px] text-gray-400">앱 URL이 없습니다</span>
          </div>
        )}
      </div>
    </div>
  );
}
