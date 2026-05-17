import { Post } from '@/lib/types';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

interface Props {
  post: Post;
  compact?: boolean; // feed card (no actual iframe) vs detail page (can show iframe)
}

export default function ContentViewer({ post, compact = true }: Props) {
  const { contentType, media, title } = post;

  if (contentType === 'interactive') {
    return (
      <div className="mt-3 rounded-[28px] overflow-hidden border-2 border-[#D8D8D0] relative aspect-video bg-[#F7F7F2]">
        {/* Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 select-none">
          <NuevoGlyph kind="interactive" size={112} />
        </div>

        {/* Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-black tracking-[-0.03em]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          인터랙티브
        </div>

        {/* CTA */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center shadow-[0_20px_30px_rgba(0,0,0,0.18)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            {compact && (
              <span className="text-xs font-black text-black bg-[#FFFDF5]/90 px-3 py-1 rounded-full border border-[#D8D8D0] backdrop-blur-sm">
                탭해서 바로 해보기
              </span>
            )}
          </div>
        </div>

        {/* Detail: actual iframe */}
        {!compact && media.iframeUrl && (
          <div className="absolute inset-0">
            <iframe
              src={media.iframeUrl}
              title={title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-forms"
            />
          </div>
        )}
      </div>
    );
  }

  if (contentType === 'audio') {
    return (
      <div className="mt-3 flex gap-3 items-center p-3 rounded-[28px] border-2 border-[#D8D8D0] bg-[#F7F7F2]">
        {/* Album art */}
        <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-[24px] flex items-center justify-center bg-[#FFFDF5] border-2 border-[#D8D8D0]">
          <NuevoGlyph kind="audio" size={46} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center shadow">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>

        {/* Info + waveform */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-black tracking-[-0.03em] mb-1">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18V5l12-2v13" strokeLinecap="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            오디오
          </div>

          {/* Waveform bars */}
          <div className="flex items-end gap-[2px] h-8">
            {[40, 70, 55, 90, 40, 65, 80, 45, 70, 55, 35, 75, 60, 85, 50, 65, 40, 78, 55, 90, 45, 68].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-black/35"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Duration hint */}
          <div className="mt-1 text-[11px] text-gray-400">
            {compact ? '탭해서 재생' : '3:24'}
          </div>
        </div>
      </div>
    );
  }

  if (contentType === 'image') {
    const count = media.imageCount ?? 1;

    return (
      <div className="mt-3 relative rounded-[28px] overflow-hidden border-2 border-[#D8D8D0] aspect-video bg-[#F7F7F2]">
        {/* Background emoji */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25 select-none">
          <NuevoGlyph kind="image" size={116} />
        </div>

        {/* Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF5]/90 backdrop-blur-sm text-black text-[11px] font-black border border-[#D8D8D0]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m3 9 4-4 4 4 4-6 4 6" />
          </svg>
          이미지
        </div>

        {/* Count badge */}
        {count > 1 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold backdrop-blur-sm">
            1 / {count}
          </div>
        )}
      </div>
    );
  }

  return null;
}
