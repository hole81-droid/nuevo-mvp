'use client';

import { useState, useRef } from 'react';

export interface GallerySlide {
  emoji: string;
  bgGradient: string;
  label?: string;
  sublabel?: string;
}

interface Props {
  slides: GallerySlide[];
  title: string;
}

export default function ImageGallery({ slides, title }: Props) {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);

  const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
  const goNext = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const diff = e.clientX - startX.current;
    if (diff < -40) goNext();
    else if (diff > 40) goPrev();
    startX.current = null;
  };

  const slide = slides[current];

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 select-none">
      {/* Image area */}
      <div
        className={`relative aspect-[4/3] flex flex-col items-center justify-center bg-gradient-to-br ${slide.bgGradient} cursor-grab active:cursor-grabbing`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Emoji */}
        <div className="text-[72px] drop-shadow-sm">{slide.emoji}</div>

        {/* Labels */}
        {(slide.label || slide.sublabel) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8">
            {slide.label && (
              <div className="text-white font-bold text-[15px] leading-tight">{slide.label}</div>
            )}
            {slide.sublabel && (
              <div className="text-white/80 text-[12px] mt-0.5 leading-snug">{slide.sublabel}</div>
            )}
          </div>
        )}

        {/* Counter badge */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/50 text-white text-[12px] font-semibold backdrop-blur-sm">
          {current + 1} / {slides.length}
        </div>

        {/* Prev arrow */}
        {current > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {current < slides.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dot navigation */}
      <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${i === current ? 'w-4 h-2 bg-gray-800' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Slide data for mock posts ── */
export const SUBWAY_SLIDES: GallerySlide[] = [
  { emoji: '👑', bgGradient: 'from-amber-100 to-yellow-200',   label: '강남역 → 황금 왕도',    sublabel: '부와 권력이 집중된 왕국의 수도. 모든 길이 이곳으로 통한다.' },
  { emoji: '🎨', bgGradient: 'from-purple-100 to-pink-200',    label: '홍대입구 → 마법사의 거리', sublabel: '예술 마법사들이 새로운 주문을 창조하는 창의의 마을.' },
  { emoji: '⚔️', bgGradient: 'from-blue-100 to-cyan-200',      label: '신촌 → 청년 용사 마을',  sublabel: '전사 지망생들이 무예를 갈고닦는 훈련 도시. 열정이 넘친다.' },
  { emoji: '🏯', bgGradient: 'from-stone-100 to-stone-200',    label: '시청 → 왕국 의회',       sublabel: '법과 질서를 수호하는 기사단의 본거지. 근엄한 석조 궁전.' },
  { emoji: '🌊', bgGradient: 'from-teal-100 to-blue-200',      label: '합정 → 항구 도시',       sublabel: '대륙과 섬을 잇는 무역항. 이국적인 상품이 넘쳐흐른다.' },
  { emoji: '🌲', bgGradient: 'from-green-100 to-emerald-200',  label: '뚝섬 → 요정 숲 입구',    sublabel: '인간계와 요정계의 경계. 달밤에는 요정들의 노래가 들린다.' },
  { emoji: '🔬', bgGradient: 'from-orange-100 to-red-200',     label: '성수 → 연금술사 공방',   sublabel: '쇠와 마법이 합쳐지는 장인의 거리. 밤새 불꽃이 꺼지지 않는다.' },
  { emoji: '🎓', bgGradient: 'from-indigo-100 to-purple-200',  label: '건대입구 → 마법 학원',   sublabel: '젊은 마법사들이 기초 주문을 배우는 왕립 마법 아카데미.' },
  { emoji: '⚖️', bgGradient: 'from-gray-100 to-slate-200',     label: '교대 → 마법 법원',       sublabel: '마법 범죄를 심판하는 재판소. 모든 마법사는 여기를 두려워한다.' },
  { emoji: '🌙', bgGradient: 'from-violet-100 to-indigo-200',  label: '신림 → 달신의 신전',     sublabel: '달의 여신을 모시는 신관들의 성지. 보름달 밤에 기적이 일어난다.' },
  { emoji: '🐉', bgGradient: 'from-red-100 to-orange-200',     label: '잠실 → 용사의 경기장',   sublabel: '대륙 최강의 용사들이 겨루는 콜로세움. 주말마다 함성이 울린다.' },
  { emoji: '🌸', bgGradient: 'from-pink-100 to-rose-200',      label: '왕십리 → 벚꽃 정령 마을', sublabel: '봄마다 정령들이 피워내는 벚꽃이 하늘을 수놓는 평화로운 마을.' },
];
