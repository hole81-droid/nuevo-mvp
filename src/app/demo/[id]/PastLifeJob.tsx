'use client';

import { useState } from 'react';

const RESULTS: Record<string, { title: string; desc: string; emoji: string }> = {
  default: {
    emoji: '🔮',
    title: '조선시대 점쟁이',
    desc: '당신은 전생에 점쟁이였습니다. 틀려도 "운이 없어서"라고 했습니다. 현대에도 그 기술이 남아있는 것 같습니다.',
  },
  개발자: {
    emoji: '📜',
    title: '조선시대 기록관',
    desc: '"코딩"이 아닌 한자로 버그 리포트를 쓰던 분이시군요. 매일 밤 오류를 찾아 먹을 갈다가 눈이 나빠졌다고 합니다.',
  },
  의사: {
    emoji: '⚗️',
    title: '중세 연금술사',
    desc: '포션 배합이 디버깅과 비슷하다고 생각하지 않으신가요? 전생에서도 "일단 넣어보자" 식의 의료를 하셨습니다.',
  },
  선생님: {
    emoji: '📚',
    title: '서당 훈장',
    desc: '천자문 PR 리뷰가 유독 엄격하셨습니다. "이 획이 왜 삐뚤어졌냐"는 코멘트를 하루 200개씩 다셨다고 합니다.',
  },
  요리사: {
    emoji: '🍱',
    title: '궁중 수라간 상궁',
    desc: '레시피를 절대 공유하지 않는 것도 그때 버릇입니다. "비법은 나만 알아야지"라고 하시다 승하하셨습니다.',
  },
  회계사: {
    emoji: '📊',
    title: '고려시대 세금 징수관',
    desc: '백성들이 당신을 매우 좋아했습니다. (거짓말) 주판을 하도 퉁겨서 손가락에 굳은살이 박였다고 합니다.',
  },
  디자이너: {
    emoji: '🎨',
    title: '조선시대 화원',
    desc: '왕의 초상화를 그렸는데 "이 색 좀 바꿔주세요"라는 피드백을 3개월째 받고 계셨습니다. 익숙하지 않으신가요?',
  },
  변호사: {
    emoji: '⚖️',
    title: '조선시대 사헌부 관원',
    desc: '논박이 특기이셨습니다. 상대방 주장을 반박하다 밥을 못 드신 날이 많았다고 합니다. 지금과 다를 게 없군요.',
  },
  공무원: {
    emoji: '📋',
    title: '조선 6조 판서',
    desc: '결재 올리면 처리 기간이 3~6개월이었습니다. 전생에도 그랬고, 지금도... 뭐, 다 이유가 있겠죠.',
  },
  작가: {
    emoji: '✍️',
    title: '고려시대 향리 문인',
    desc: '詩 한 편 쓰는 데 보름이 걸리셨습니다. 마감은 항상 어기셨고, "거의 다 됐어요"가 입버릇이셨습니다.',
  },
};

const EXAMPLES = ['개발자', '의사', '디자이너', '선생님', '요리사', '변호사'];

export default function PastLifeJob() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<typeof RESULTS[string] | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = (job?: string) => {
    const text = (job ?? input).trim();
    if (!text || loading) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const key = Object.keys(RESULTS).find((k) => k !== 'default' && text.includes(k)) ?? 'default';
      setResult(RESULTS[key]);
      setLoading(false);
    }, 1600);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-purple-100 flex-shrink-0">
        <span className="text-lg">🔮</span>
        <div>
          <div className="text-[13px] font-bold text-gray-900">직업 입력 → 전생 직업 AI 분석기</div>
          <div className="text-[10px] text-gray-400">정확도 99.9% · GPT-4o</div>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {!result && !loading && (
          <div className="flex flex-col items-center gap-4 pt-4 text-center">
            <div className="text-5xl">🔮</div>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              현재 직업을 입력하면<br />
              <strong className="text-purple-600">전생의 직업</strong>을 분석해 드립니다
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setInput(ex); analyze(ex); }}
                  className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-[12px] font-medium active:scale-95 transition-transform"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-purple-200 animate-ping absolute inset-0" />
              <div className="relative w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-2xl">
                🔮
              </div>
            </div>
            <div className="text-[14px] text-gray-600">전생을 들여다보는 중...</div>
            <div className="text-[12px] text-gray-400">정확도 99.9%로 분석 중입니다</div>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm">
              <div className="text-3xl mb-2">{result.emoji}</div>
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide mb-1">전생의 직업</div>
              <div className="text-[20px] font-bold text-gray-900 mb-3">{result.title}</div>
              <p className="text-[14px] text-gray-700 leading-relaxed">{result.desc}</p>
            </div>
            <button
              onClick={() => { setResult(null); setInput(''); }}
              className="py-3 rounded-2xl border-2 border-purple-200 text-purple-600 text-[14px] font-bold active:scale-95 transition-transform"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>

      {!result && (
        <div className="flex gap-2 px-3 py-2.5 bg-white border-t border-gray-100 flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze()}
            placeholder="현재 직업을 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-[14px] text-gray-800 placeholder-gray-400 outline-none"
          />
          <button
            onClick={() => analyze()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 flex-shrink-0 rounded-full bg-purple-500 text-white flex items-center justify-center disabled:opacity-40"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
