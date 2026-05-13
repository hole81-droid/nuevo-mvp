'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockAuthors, mockPosts } from '@/lib/mock-data';
import { useFollow } from '@/contexts/FollowContext';
import NuevoGlyph from '@/components/ui/NuevoGlyph';

type Step = 1 | 2 | 3;
type OnboardingIcon = 'interactive' | 'audio' | 'image' | 'spark' | 'profile' | 'revenue';

const INTERESTS: { id: string; icon: OnboardingIcon; label: string }[] = [
  { id: 'interactive', icon: 'interactive', label: '인터랙티브 앱' },
  { id: 'music',       icon: 'audio', label: 'AI 음악' },
  { id: 'image',       icon: 'image', label: 'AI 이미지' },
  { id: 'humor',       icon: 'spark', label: '유머 / 밈' },
  { id: 'philosophy',  icon: 'spark', label: '철학 / 사유' },
  { id: 'office',      icon: 'profile', label: '직장인 공감' },
  { id: 'fantasy',     icon: 'spark', label: '판타지 / 세계관' },
  { id: 'poetry',      icon: 'image', label: '시 / 글쓰기' },
];

const CREATOR_INTEREST_MAP: Record<string, string[]> = {
  interactive: ['minsu', 'yejin'],
  music:       ['sujin', 'jaewon'],
  image:       ['jihun'],
  humor:       ['minsu', 'yejin'],
  philosophy:  ['yejin', 'jaewon'],
  office:      ['minsu'],
  fantasy:     ['jihun'],
  poetry:      ['jaewon', 'sujin'],
};

export default function OnboardingClient() {
  const router = useRouter();
  const { toggle, isFollowing } = useFollow();
  const [step, setStep] = useState<Step>(1);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // 선택한 관심사 기반 추천 창작자 (최대 5명, 중복 제거)
  const recommendedIds = [...new Set(
    [...selectedInterests].flatMap((i) => CREATOR_INTEREST_MAP[i] ?? [])
  )].slice(0, 5);

  const recommendedAuthors = recommendedIds.length > 0
    ? recommendedIds.map((id) => mockAuthors[id]).filter(Boolean)
    : Object.values(mockAuthors);

  const finish = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto bg-white">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-warm transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Step 1 — Welcome */}
      {step === 1 && (
        <div className="flex flex-col flex-1 items-center justify-center px-8 text-center">
          <div className="mb-6"><NuevoGlyph kind="spark" size={76} /></div>
          <div className="text-[32px] font-black tracking-[-0.06em] text-gray-900 leading-[0.95] mb-4">
            nuevo에 오신 걸<br />환영합니다
          </div>
          <p className="text-[16px] text-gray-500 leading-relaxed mb-8">
            AI로 만든 인터랙티브 앱을<br />
            직접 체험하고, 올리고, 수익을 만드세요.
          </p>

          <div className="w-full flex flex-col gap-3">
            {[
              { icon: 'interactive' as const, title: '체험', desc: '피드에서 탭 한 번으로 AI 앱 즉시 실행' },
              { icon: 'spark' as const, title: '올리기', desc: '만든 앱을 URL만 붙여넣어 올리기' },
              { icon: 'revenue' as const, title: '수익', desc: '체험 시간 기반으로 매달 정산' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-4 rounded-[28px] bg-[#F7F7F2] border-2 border-[#D8D8D0] text-left">
                <NuevoGlyph kind={item.icon} size={42} />
                <div>
                  <div className="text-[15px] font-black tracking-[-0.04em] text-gray-900">{item.title}</div>
                  <div className="text-[13px] text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="mt-8 w-full h-[62px] rounded-full bg-black text-white text-[18px] font-black tracking-[-0.04em] shadow-[0_24px_34px_rgba(0,0,0,0.16)] active:scale-95 transition-transform"
          >
            시작하기
          </button>
          <button onClick={finish} className="mt-3 text-[14px] text-gray-400">
            건너뛰기
          </button>
        </div>
      )}

      {/* Step 2 — Interests */}
      {step === 2 && (
        <div className="flex flex-col flex-1 px-5 pt-8">
          <div className="text-[11px] font-semibold text-warm uppercase tracking-widest mb-2">2 / 3</div>
          <div className="text-[28px] font-black tracking-[-0.06em] text-gray-900 mb-1">어떤 콘텐츠를 좋아하세요?</div>
          <p className="text-[14px] text-gray-500 mb-6">관심사를 고르면 맞춤 창작자를 추천해드려요.<br />여러 개 선택 가능합니다.</p>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {INTERESTS.map((item) => {
              const isSelected = selectedInterests.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`flex items-center gap-3 p-4 rounded-[28px] border-2 text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'border-black bg-[#FFFDF5]'
                      : 'border-[#D8D8D0] bg-[#F7F7F2] hover:border-black/40'
                  }`}
                >
                  <NuevoGlyph kind={item.icon} size={36} inverted={isSelected} />
                  <span className="text-[14px] font-black tracking-[-0.04em] text-gray-700">
                    {item.label}
                  </span>
                  {isSelected && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="py-5 flex gap-3">
            <button onClick={() => setStep(1)} className="px-5 py-3.5 rounded-full border border-[#D8D8D0] text-[15px] font-black text-gray-700">
              이전
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 rounded-full bg-black text-white text-[15px] font-black disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Follow creators */}
      {step === 3 && (
        <div className="flex flex-col flex-1 px-5 pt-8">
          <div className="text-[11px] font-semibold text-warm uppercase tracking-widest mb-2">3 / 3</div>
          <div className="text-[28px] font-black tracking-[-0.06em] text-gray-900 mb-1">
            {selectedInterests.size > 0 ? '맞춤 창작자를 팔로우해보세요' : '인기 창작자를 팔로우해보세요'}
          </div>
          <p className="text-[14px] text-gray-500 mb-5">팔로잉 피드에서 이들의 새 작품을 볼 수 있어요.</p>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {recommendedAuthors.map((author) => {
              const followed = isFollowing(author.id);
              const postCount = mockPosts.filter((p) => p.author.id === author.id).length;
              const topPost = mockPosts.find((p) => p.author.id === author.id);
              return (
                <div key={author.id} className="flex items-center gap-3 p-3.5 rounded-[28px] bg-[#F7F7F2] border-2 border-[#D8D8D0]">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: author.avatarBg }}
                  >
                    {author.avatarEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-gray-900">{author.displayName}</div>
                    <div className="text-[12px] text-gray-500">@{author.handle} · 작품 {postCount}개</div>
                    {topPost && (
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">{topPost.title}</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggle(author.id)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-black transition-all active:scale-95 ${
                      followed
                        ? 'border border-gray-200 text-gray-500 bg-white'
                        : 'bg-gray-900 text-white'
                    }`}
                  >
                    {followed ? '팔로잉' : '팔로우'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="py-5 flex gap-3">
            <button onClick={() => setStep(2)} className="px-5 py-3.5 rounded-full border border-[#D8D8D0] text-[15px] font-black text-gray-700">
              이전
            </button>
            <button
              onClick={finish}
              className="flex-1 py-3.5 rounded-full bg-black text-white text-[15px] font-black"
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
