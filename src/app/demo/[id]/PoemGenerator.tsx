'use client';

import { useState } from 'react';

const POEMS: Array<{ trigger: string[]; lines: string[] }> = [
  { trigger: ['비', '쿠팡', '할머니'], lines: ['비가 내린다', '쿠팡의 박스처럼', '할머니는 묻는다', '— 왜 또 샀냐고'] },
  { trigger: ['회의', '커피', '내일'], lines: ['회의는 끝나지 않는다', '커피처럼 식어가면서', '내일도 회의가 있다', '— 이것이 인생이다'] },
  { trigger: ['고양이', '월급', '자유'], lines: ['고양이는 안다', '월급의 허무함을', '그래서 고양이는', '— 자유롭다'] },
  { trigger: ['팀장', '야근', '퇴근'], lines: ['팀장의 "잠깐만"은', '야근의 다른 이름', '퇴근은 신기루처럼', '— 내일도 보인다'] },
  { trigger: ['서울', '지하철', '사람'], lines: ['서울은 달린다', '지하철 속에서', '사람과 사람 사이', '— 우리는 모른다'] },
];

const generatePoem = (words: string[]): string[] => {
  const found = POEMS.find((p) =>
    p.trigger.some((t) => words.some((w) => w.includes(t) || t.includes(w)))
  );
  if (found) return found.lines;

  const [w1 = '것', w2 = '우리', w3 = '시간'] = words;
  return [
    `${w1}은(는) 왜 있는가`,
    `${w2}는 묻는다`,
    `${w3}이 흘러도`,
    `— 아무도 모른다`,
  ];
};

export default function PoemGenerator() {
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [poem, setPoem] = useState<string[] | null>(null);

  const addWord = () => {
    const w = currentWord.trim();
    if (!w || words.length >= 3) return;
    const next = [...words, w];
    setWords(next);
    setCurrentWord('');
    if (next.length === 3) {
      setTimeout(() => setPoem(generatePoem(next)), 800);
    }
  };

  const reset = () => { setWords([]); setCurrentWord(''); setPoem(null); };

  const WORD_EXAMPLES = [['비', '쿠팡', '할머니'], ['회의', '커피', '내일'], ['고양이', '월급', '자유']];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-white">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-amber-100 flex-shrink-0">
        <span className="text-lg">📜</span>
        <div>
          <div className="text-[13px] font-bold text-gray-900">단어 세 개 → AI 순수 시 생성기</div>
          <div className="text-[10px] text-gray-400">이상하고 아름다운 시 · Claude</div>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {!poem ? (
          <>
            <div className="text-center pt-2">
              <p className="text-[14px] text-gray-600 leading-relaxed">
                단어 <strong className="text-amber-600">세 개</strong>를 입력하면<br />
                AI가 시를 써드립니다
              </p>
            </div>

            {/* Word slots */}
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-12 rounded-2xl border-2 flex items-center justify-center text-[14px] font-bold transition-all ${
                    words[i]
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : i === words.length
                      ? 'border-amber-300 border-dashed text-gray-400'
                      : 'border-gray-200 text-gray-300'
                  }`}
                >
                  {words[i] ?? (i === words.length ? '?' : '—')}
                </div>
              ))}
            </div>

            {words.length < 3 && (
              <div className="text-[12px] text-gray-500 text-center">
                {3 - words.length}개 더 입력하세요
              </div>
            )}

            {words.length === 3 && !poem && (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <div className="text-[13px] text-gray-500">시를 쓰는 중...</div>
              </div>
            )}

            {/* Example sets */}
            {words.length === 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-bold text-gray-400 text-center">예시 조합</div>
                {WORD_EXAMPLES.map((set, i) => (
                  <button
                    key={i}
                    onClick={() => { setWords(set); setTimeout(() => setPoem(generatePoem(set)), 800); }}
                    className="flex gap-2 justify-center"
                  >
                    {set.map((w) => (
                      <span key={w} className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[12px] font-medium">
                        {w}
                      </span>
                    ))}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-1.5 flex-wrap">
              {words.map((w) => (
                <span key={w} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[12px] font-semibold">
                  #{w}
                </span>
              ))}
            </div>
            <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide mb-3">AI 순수 시</div>
              {poem.map((line, i) => (
                <div
                  key={i}
                  className={`text-[17px] leading-relaxed ${line.startsWith('—') ? 'text-amber-600 font-bold mt-2' : 'text-gray-800'}`}
                >
                  {line}
                </div>
              ))}
            </div>
            <button
              onClick={reset}
              className="py-3 rounded-2xl border-2 border-amber-200 text-amber-600 text-[14px] font-bold active:scale-95 transition-transform"
            >
              다른 단어로 써보기
            </button>
          </div>
        )}
      </div>

      {words.length < 3 && !poem && (
        <div className="flex gap-2 px-3 py-2.5 bg-white border-t border-gray-100 flex-shrink-0">
          {words.length > 0 && (
            <button onClick={reset} className="w-9 h-9 flex-shrink-0 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <input
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addWord()}
            placeholder={`${words.length + 1}번째 단어 입력...`}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-[14px] text-gray-800 placeholder-gray-400 outline-none"
          />
          <button
            onClick={addWord}
            disabled={!currentWord.trim()}
            className="w-9 h-9 flex-shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
