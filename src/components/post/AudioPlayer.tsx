'use client';

import { useState, useEffect, useRef } from 'react';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

interface Props {
  coverEmoji: string;
  title: string;
}

const BAR_HEIGHTS = [40, 70, 55, 90, 40, 65, 80, 45, 70, 55, 35, 75, 60, 85, 50, 65, 40, 78, 55, 90, 45, 68, 52, 80];

export default function AudioPlayer({ coverEmoji, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return p + 0.5;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const elapsed = Math.floor((progress / 100) * 204);
  const remaining = 204 - elapsed;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const activeBars = Math.floor((progress / 100) * BAR_HEIGHTS.length);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(pct * 100);
  };

  return (
    <div className="mt-3 rounded-[28px] border-2 border-[#D8D8D0] overflow-hidden bg-[#F7F7F2]">
      {/* Label */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#D8D8D0]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-black tracking-[-0.03em]">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18V5l12-2v13" strokeLinecap="round"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          오디오
        </div>
        <span className="text-[11px] text-gray-400 ml-auto">{title}</span>
      </div>

      <div className="px-4 py-4">
        {/* Album + controls */}
        <div className="flex items-center gap-4 mb-4">
          {/* Album art */}
          <div className="w-16 h-16 rounded-[24px] bg-[#FFFDF5] flex items-center justify-center flex-shrink-0 border-2 border-[#D8D8D0]" title={coverEmoji}>
            <NuevoGlyph kind="audio" size={42} />
          </div>

          {/* Play + title */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[14px] text-gray-900 truncate">{title}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">AI 생성 오디오</div>

            <div className="flex items-center gap-4 mt-2">
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 20L9 12l10-8v16zM5 4v16H3V4h2z"/>
                </svg>
              </button>
              <button
                onClick={() => setPlaying((v) => !v)}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-[0_14px_24px_rgba(0,0,0,0.18)] active:scale-95 transition-transform"
              >
                {playing ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                    <path d="M5 3l14 9-14 9V3z"/>
                  </svg>
                )}
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 4L15 12 5 20V4zM19 4v16h-2V4h2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex items-end gap-[2.5px] h-10 mb-2">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-colors duration-200"
              style={{
                height: `${h}%`,
                backgroundColor: i < activeBars ? '#000000' : '#D8D8D0',
                opacity: playing && i === activeBars ? 0.72 : 1,
              }}
            />
          ))}
        </div>

        {/* Progress bar — clickable to seek */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="h-3 flex items-center cursor-pointer group mb-1.5"
        >
          <div className="w-full h-1.5 bg-[#D8D8D0] rounded-full overflow-visible relative">
            <div
              className="h-full bg-black rounded-full transition-[width] relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="flex justify-between text-[11px] text-gray-400 font-mono">
          <span>{fmt(elapsed)}</span>
          <span>-{fmt(remaining)}</span>
        </div>
      </div>
    </div>
  );
}
