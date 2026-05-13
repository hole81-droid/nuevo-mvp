'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContentType } from '@/lib/types';

const TYPE_OPTIONS: { type: ContentType; emoji: string; label: string; desc: string; placeholder: string }[] = [
  {
    type: 'interactive',
    emoji: '🎮',
    label: '인터랙티브',
    desc: '챗봇, 퀴즈, 미니 게임',
    placeholder: '예: 사용자가 오늘의 감정을 입력하면 그에 맞는 명언을 알려주는 챗봇을 만들어줘',
  },
  {
    type: 'audio',
    emoji: '🎵',
    label: '오디오',
    desc: 'AI 음악, 사운드스케이프',
    placeholder: '예: 새벽 3시 빈 카페, 재즈 피아노가 혼자 연주되는 느낌의 곡',
  },
  {
    type: 'image',
    emoji: '🖼️',
    label: '이미지',
    desc: '그림, 일러스트, 사진 시리즈',
    placeholder: '예: 서울 골목길을 물감으로 그린 것처럼, 따뜻한 저녁 빛 분위기로',
  },
];

const MOCK_TITLES: Record<ContentType, string[]> = {
  interactive: ['감정 명언 생성기', '오늘의 기분 챗봇', '랜덤 대화 시뮬레이터', 'AI 상담사 놀이'],
  audio: ['새벽 카페 재즈', '빈 거리의 멜로디', 'AI가 꿈꾸는 소리', '기억 속 한 장면'],
  image: ['서울의 다른 얼굴', '존재하지 않는 골목', '빛의 기억들', '여름의 잔상 12컷'],
};

type Step = 1 | 2 | 3;

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    if (!prompt.trim() || !selectedType) return;
    setGenerating(true);
    setStep(2);

    setTimeout(() => {
      const titles = MOCK_TITLES[selectedType];
      const title = titles[Math.floor(Math.random() * titles.length)];
      setGeneratedTitle(title);
      setGenerating(false);
      setGenerated(true);
    }, 2800);
  };

  const handlePublish = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-[53px]">
        <button
          onClick={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700"
        >
          {step === 1 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          )}
        </button>
        <span className="text-[17px] font-bold text-warm">만들기</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {/* ── Step 1: Type + Prompt ── */}
        {step === 1 && (
          <div className="px-4 pt-5 pb-6 flex flex-col gap-6">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
                뭘 만들까요?
              </h2>
              <p className="text-[14px] text-gray-500">타입을 고르고, 만들고 싶은 걸 설명해 주세요</p>
            </div>

            {/* Type chips */}
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(({ type, emoji, label }) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'border-warm bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className={`text-[12px] font-semibold ${isSelected ? 'text-warm' : 'text-gray-600'}`}>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Prompt */}
            <div>
              <div className="text-[13px] font-bold text-gray-700 mb-2">
                어떤 걸 만들고 싶으세요?
              </div>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    selectedType
                      ? TYPE_OPTIONS.find((t) => t.type === selectedType)?.placeholder
                      : '타입을 먼저 선택해 주세요'
                  }
                  disabled={!selectedType}
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100 resize-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                />
                {prompt.trim().length > 0 && (
                  <button
                    onClick={() => setPrompt('')}
                    className="absolute top-3 right-3 text-gray-300 hover:text-gray-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Prompt examples */}
              {selectedType && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {getExamples(selectedType).map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex)}
                      className="px-3 py-1.5 rounded-full bg-gray-100 text-[12px] text-gray-600 hover:bg-gray-200 text-left active:scale-95 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Generating / Preview ── */}
        {step === 2 && (
          <div className="px-4 pt-5 pb-6">
            {generating ? (
              <GeneratingView type={selectedType!} prompt={prompt} />
            ) : (
              <GeneratedPreview
                type={selectedType!}
                prompt={prompt}
                generatedTitle={generatedTitle}
                postTitle={postTitle}
                postDesc={postDesc}
                onTitleChange={setPostTitle}
                onDescChange={setPostDesc}
              />
            )}
          </div>
        )}
      </main>

      {/* CTA */}
      <div className="px-4 pb-6 pt-3 border-t border-gray-100">
        {step === 1 && (
          <button
            disabled={!selectedType || !prompt.trim()}
            onClick={handleGenerate}
            className="w-full py-4 rounded-2xl text-[16px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#E8511A' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            AI로 생성하기
          </button>
        )}

        {step === 2 && !generating && (
          <button
            disabled={!postTitle.trim() || !postDesc.trim()}
            onClick={handlePublish}
            className="w-full py-4 rounded-2xl text-[16px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E8511A', boxShadow: postTitle.trim() && postDesc.trim() ? '0 4px 20px rgba(232,81,26,0.35)' : 'none' }}
          >
            게시하기
          </button>
        )}

        {step === 2 && generating && (
          <button disabled className="w-full py-4 rounded-2xl text-[16px] font-bold text-white opacity-40 cursor-not-allowed" style={{ backgroundColor: '#E8511A' }}>
            생성 중...
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Generating animation ── */
function GeneratingView({ type, prompt }: { type: ContentType; prompt: string }) {
  const typeLabel = TYPE_OPTIONS.find((t) => t.type === type)?.label ?? '';

  return (
    <div className="flex flex-col items-center py-10 gap-6">
      {/* Pulsing orb */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-warm/20 animate-ping absolute inset-0" />
        <div className="w-24 h-24 rounded-full bg-warm/10 animate-ping absolute inset-0" style={{ animationDelay: '0.5s' }} />
        <div className="relative w-24 h-24 rounded-full bg-warm flex items-center justify-center shadow-lg">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <div className="text-[18px] font-bold text-gray-900 mb-1">{typeLabel} 만드는 중...</div>
        <div className="text-[13px] text-gray-500 max-w-[240px] leading-relaxed">
          &ldquo;{prompt.length > 60 ? prompt.slice(0, 60) + '...' : prompt}&rdquo;
        </div>
      </div>

      {/* Progress steps */}
      <div className="w-full max-w-[240px] flex flex-col gap-3">
        {getProgressSteps(type).map((step, i) => (
          <ProgressStep key={step} label={step} delay={i * 700} />
        ))}
      </div>
    </div>
  );
}

function ProgressStep({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), delay + 600);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex items-center gap-2.5 text-[13px] transition-all duration-500 ${done ? 'text-gray-900' : 'text-gray-400'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        done ? 'bg-warm' : 'bg-gray-200'
      }`}>
        {done ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        )}
      </div>
      <span className={done ? 'font-medium' : ''}>{label}</span>
    </div>
  );
}

/* ── Generated preview ── */
function GeneratedPreview({
  type, prompt, generatedTitle, postTitle, postDesc, onTitleChange, onDescChange,
}: {
  type: ContentType;
  prompt: string;
  generatedTitle: string;
  postTitle: string;
  postDesc: string;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
}) {
  const bgClass = type === 'interactive'
    ? 'from-orange-50 to-orange-100'
    : type === 'audio'
    ? 'from-violet-50 to-violet-100'
    : 'from-pink-50 to-pink-100';

  const emoji = type === 'interactive' ? '🎮' : type === 'audio' ? '🎵' : '🖼️';
  const badge = type === 'interactive' ? '인터랙티브' : type === 'audio' ? '오디오' : '이미지';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-warm flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-[14px] font-bold text-warm">생성 완료!</span>
        </div>
        <div className="text-[22px] font-bold text-gray-900 leading-tight">{generatedTitle}</div>
        <div className="text-[13px] text-gray-400 mt-0.5">생성된 작품을 게시하기 전에 이름을 붙여주세요</div>
      </div>

      {/* Preview card */}
      <div className={`rounded-2xl border border-gray-200 overflow-hidden bg-gradient-to-br ${bgClass}`}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/40">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[11px] font-semibold ${
            type === 'interactive' ? 'bg-warm' : 'bg-cool'
          }`}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
            {badge}
          </div>
          <span className="text-[11px] text-gray-400 ml-auto">{generatedTitle}</span>
        </div>
        <div className="flex items-center justify-center h-[140px]">
          <div className="flex flex-col items-center gap-3 opacity-60">
            <span className="text-5xl">{emoji}</span>
            <span className="text-[13px] text-gray-500">미리보기 불가 — 게시 후 확인 가능</span>
          </div>
        </div>
      </div>

      {/* Prompt used */}
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">사용한 프롬프트</div>
        <div className="text-[13px] text-gray-600 leading-relaxed">{prompt}</div>
      </div>

      {/* Title input */}
      <div>
        <div className="text-[13px] font-bold text-gray-700 mb-2">제목 <span className="text-warm text-[11px]">필수</span></div>
        <div className="relative">
          <input
            type="text"
            maxLength={40}
            value={postTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={generatedTitle}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-mono">
            {postTitle.length}/40
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="text-[13px] font-bold text-gray-700 mb-2">한 줄 소개 <span className="text-warm text-[11px]">필수</span></div>
        <div className="relative">
          <input
            type="text"
            maxLength={80}
            value={postDesc}
            onChange={(e) => onDescChange(e.target.value)}
            placeholder="피드에 표시될 짧은 소개"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-warm focus:ring-2 focus:ring-orange-100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-mono">
            {postDesc.length}/80
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function getExamples(type: ContentType): string[] {
  if (type === 'interactive') return [
    '오늘의 기분 → 위로 한 마디',
    '팀장 말씀 → 슬픈 밈 생성',
    '직업 입력 → 전생 직업 알려주기',
  ];
  if (type === 'audio') return [
    '새벽 3시 텅 빈 지하철역 재즈',
    '비 오는 날 도서관 ASMR',
    '존재하지 않는 언어로 부르는 자장가',
  ];
  return [
    '서울 골목을 수채화로, 저녁 빛',
    '강남역을 중세 판타지 왕도로',
    '2호선 12개 역, 각자의 세계관',
  ];
}

function getProgressSteps(type: ContentType): string[] {
  if (type === 'interactive') return ['프롬프트 분석 중', 'AI 로직 설계 중', '인터페이스 빌드 중'];
  if (type === 'audio') return ['음악 구조 설계 중', '멜로디 생성 중', '마스터링 중'];
  return ['스타일 분석 중', '이미지 생성 중', '후처리 중'];
}
