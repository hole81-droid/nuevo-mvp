import { ContentType } from '@/lib/types';

type GlyphKind = ContentType | 'search' | 'spark' | 'revenue' | 'remix' | 'empty' | 'profile';

export default function NuevoGlyph({
  kind,
  size = 44,
  inverted = false,
}: {
  kind: GlyphKind;
  size?: number;
  inverted?: boolean;
}) {
  const stroke = inverted ? 'white' : 'currentColor';
  const fill = inverted ? 'white' : 'currentColor';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-2 ${
        inverted ? 'bg-black text-white border-black' : 'bg-[#FFFDF5] text-black border-[#D8D8D0]'
      }`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {kind === 'interactive' && (
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 40 40" fill="none">
          <rect x="8" y="9" width="24" height="18" rx="5" stroke={stroke} strokeWidth="3" />
          <path d="M17 18.5L22 15.5V21.5L17 18.5Z" fill={fill} />
          <path d="M13 32L16 27M27 32L24 27" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {kind === 'audio' && (
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 40 40" fill="none">
          <path d="M11 24V18M17 29V11M23 26V15M29 22V19" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <path d="M8 20C11 14 14 14 17 20C20 26 23 26 26 20C28 16 30 15 32 17" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {kind === 'image' && (
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 40 40" fill="none">
          <rect x="10" y="10" width="20" height="20" rx="4" stroke={stroke} strokeWidth="3" />
          <path d="M13 27L18 21L22 25L25 22L29 27" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24.5" cy="15.5" r="2.5" fill={fill} />
        </svg>
      )}
      {kind === 'search' && (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )}
      {kind === 'spark' && (
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.2 7.1L21 12l-6.8 2.9L12 22l-2.2-7.1L3 12l6.8-2.9L12 2z" />
        </svg>
      )}
      {kind === 'revenue' && (
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2v20M17 6.5c-.8-1-2.3-1.8-4.2-1.8-2.6 0-4.4 1.3-4.4 3.2 0 4.5 8.8 2.2 8.8 7 0 2.2-2 3.6-4.9 3.6-2.1 0-3.9-.8-5-2" />
        </svg>
      )}
      {kind === 'remix' && (
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      )}
      {(kind === 'empty' || kind === 'profile') && (
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </span>
  );
}
