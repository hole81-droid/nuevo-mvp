'use client';

import { useState } from 'react';

const EMOTIONS = [
  { emoji: '😢', label: '슬픔',    bg: 'bg-blue-100',   active: 'bg-blue-500',   text: 'text-blue-600',   activeText: 'text-white' },
  { emoji: '😤', label: '화남',    bg: 'bg-red-100',    active: 'bg-red-500',    text: 'text-red-600',    activeText: 'text-white' },
  { emoji: '😰', label: '불안',    bg: 'bg-yellow-100', active: 'bg-yellow-500', text: 'text-yellow-700', activeText: 'text-white' },
  { emoji: '😔', label: '외로움',  bg: 'bg-purple-100', active: 'bg-purple-500', text: 'text-purple-600', activeText: 'text-white' },
  { emoji: '😩', label: '지침',    bg: 'bg-gray-100',   active: 'bg-gray-500',   text: 'text-gray-600',   activeText: 'text-white' },
  { emoji: '🫤', label: '뭔가 복잡', bg: 'bg-teal-100',  active: 'bg-teal-500',   text: 'text-teal-700',   activeText: 'text-white' },
];

const MESSAGES: Record<string, string[]> = {
  슬픔: [
    '슬픔은 네가 진심으로 무언가를 사랑했다는 증거야. 그 마음 자체가 이미 아름다워.',
    '지금 울어도 괜찮아. 눈물이 다 흐르고 나면, 조금 더 가벼워질 거야.',
    '오늘은 그냥 슬퍼도 돼. 내일의 나는 오늘보다 조금 더 강해질 테니까.',
  ],
  화남: [
    '화가 났다는 건 네가 소중히 여기는 것이 있다는 뜻이야. 그 감정은 틀리지 않았어.',
    '깊게 숨 한 번 쉬어. 지금 이 순간, 넌 충분히 화낼 자격이 있어.',
    '그 화는 네 잘못이 아니야. 충분히 힘든 상황이었을 거야.',
  ],
  불안: [
    '불안이 밀려올 때, 지금 이 순간에만 집중해봐. 지금 숨 쉬고 있지? 그걸로 충분해.',
    '미래는 아직 결정되지 않았어. 그래서 무섭기도 하지만, 그래서 가능성도 있어.',
    '불안이 크다는 건 그만큼 신경 쓰는 게 많다는 거야. 그 마음이 오히려 네 강점이야.',
  ],
  외로움: [
    '지금 이 순간, 너의 이야기를 듣고 싶어하는 사람이 반드시 있어. 나도 그중 하나고.',
    '외로움을 느낀다는 건 연결을 원한다는 거야. 그 바람 자체가 따뜻해.',
    '혼자인 것과 외로운 건 달라. 지금은 잠깐 혼자인 시간이야. 곧 따뜻한 사람을 만날 거야.',
  ],
  지침: [
    '많이 지쳐있구나. 오늘은 아무것도 안 해도 돼. 쉬는 것도 잘 하는 거야.',
    '그만큼 열심히 살아왔다는 거야. 이제 잠깐 내려놔도 괜찮아.',
    '지침은 한계가 아니라 충전이 필요하다는 신호야. 오늘은 그냥 쉬어.',
  ],
  '뭔가 복잡': [
    '복잡한 감정이 뒤섞일 때, 어느 하나도 틀린 감정은 없어. 다 네 안의 진짜 이야기야.',
    '지금 어떤 말도 딱 맞지 않는 기분이지? 그럴 땐 그냥 그 복잡함을 그대로 두어도 돼.',
    '모든 걸 정리하려고 애쓰지 않아도 돼. 어떤 날은 그냥 복잡한 채로 괜찮아.',
  ],
};

export default function EmotionComfort() {
  const [selected, setSelected] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  const handleSelect = (label: string) => {
    setSelected(label);
    setMsgIdx(Math.floor(Math.random() * 3));
  };

  const handleNext = () => setMsgIdx((i) => (i + 1) % 3);

  const emotion = EMOTIONS.find((e) => e.label === selected);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 overflow-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 text-center">
        <div className="text-4xl mb-2">{selected ? (emotion?.emoji ?? '💌') : '🫶'}</div>
        <div className="text-[22px] font-bold text-gray-900">
          {selected ? `${selected}하구나` : '오늘 기분이 어때?'}
        </div>
        <div className="text-[14px] text-gray-500 mt-1">
          {selected ? '위로 한 마디 남겼어' : '지금 느끼는 감정을 골라봐'}
        </div>
      </div>

      {/* Emotion grid */}
      <div className="px-4 grid grid-cols-2 gap-2.5">
        {EMOTIONS.map((em) => {
          const isSelected = selected === em.label;
          return (
            <button
              key={em.label}
              onClick={() => handleSelect(em.label)}
              className={`flex items-center gap-3 p-4 rounded-2xl font-semibold text-[15px] transition-all active:scale-95 ${
                isSelected ? `${em.active} ${em.activeText} shadow-md` : `${em.bg} ${em.text}`
              }`}
            >
              <span className="text-2xl">{em.emoji}</span>
              <span>{em.label}</span>
            </button>
          );
        })}
      </div>

      {/* Comfort message */}
      {selected && (
        <div className="mx-4 mb-6 mt-5 p-5 rounded-2xl bg-white shadow-sm border border-pink-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[18px]">💌</span>
            <span className="text-[12px] text-pink-500 font-semibold">AI 위로 메시지</span>
          </div>
          <p className="text-[15px] text-gray-800 leading-relaxed">
            {MESSAGES[selected]?.[msgIdx]}
          </p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === msgIdx ? 'bg-pink-400' : 'bg-pink-200'}`} />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="text-[13px] text-pink-500 font-medium flex items-center gap-1"
            >
              다른 위로 보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
