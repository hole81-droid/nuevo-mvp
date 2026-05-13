'use client';

import { useState, useRef, useEffect } from 'react';

const RESPONSES: Record<string, string> = {
  default: '지금 당신의 표정:\n\n😮‍💨\n\n"그래서... 그래서... 그래서..."',
  회의: '"회의가 2시간째인데\n아직도 아젠다 1번입니다."\n\n지금 당신의 표정:\n\n😶‍🌫️\n\n마음속으로: 집에 가고 싶다...',
  팀장: '"팀장이 퇴근 10분 전에\n추가 업무를 줬습니다."\n\n지금 당신의 표정:\n\n😑\n\n결론: 야근 확정 밈',
  기획: '"기획서 수정이 37번째입니다."\n\n지금 당신의 표정:\n\n🥲\n\n웃음과 눈물의 경계에서',
  보고: '"보고서를 다시 써달라고 합니다."\n\n지금 당신의 표정:\n\n😶\n\n내면의 소리: "네..."',
  월급: '"월급날이 3일 남았는데\n통장이 비어있습니다."\n\n지금 당신의 표정:\n\n💸🥲💸\n\n이게 직장인이다.',
  야근: '"오늘도 마지막 퇴근자입니다."\n\n지금 당신의 표정:\n\n🌙😮‍💨\n\n"뭐... 이게 내 인생이지"',
  커피: '"커피가 없으면 아무것도 할 수 없어요."\n\n지금 당신의 표정:\n\n☕😵‍💫\n\n생물학적 한계에 도달 중',
};

type Msg = { role: 'user' | 'ai'; text: string };

const HINTS = ['팀장님 말씀', '기획서 수정', '야근 확정', '회의가 너무 길어'];

export default function MemeGenerator() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const key = Object.keys(RESPONSES).find((k) => k !== 'default' && msg.includes(k)) ?? 'default';
      setMessages((prev) => [...prev, { role: 'ai', text: RESPONSES[key] }]);
      setLoading(false);
    }, 1100);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-orange-50 to-white">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-orange-100 flex-shrink-0">
        <span className="text-lg">🎭</span>
        <div>
          <div className="text-[13px] font-bold text-gray-900">회의 내용 → 슬픈 밈 생성기</div>
          <div className="text-[10px] text-gray-400">직장인 감성 AI · GPT-4o</div>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm text-white text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-4 text-center">
            <div className="text-4xl">😢</div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              오늘 직장 상황을 입력하면<br />슬픈 밈으로 만들어 드립니다
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {HINTS.map((h) => (
                <button
                  key={h}
                  onClick={() => send(h)}
                  className="px-3 py-1.5 rounded-full bg-orange-100 text-warm text-[12px] font-medium active:scale-95 transition-transform"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div key={i} className="self-end max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm bg-warm text-white text-[14px]">
              {msg.text}
            </div>
          ) : (
            <div key={i} className="self-start max-w-[85%] px-3 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-200 text-[13px] text-gray-800 whitespace-pre-line leading-relaxed shadow-sm">
              {msg.text}
            </div>
          )
        )}
        {loading && (
          <div className="self-start flex items-center gap-1.5 px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-gray-200 shadow-sm">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-2 h-2 rounded-full bg-orange-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 px-3 py-2.5 bg-white border-t border-gray-100 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="팀장님 말씀을 입력하세요..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-[14px] text-gray-800 placeholder-gray-400 outline-none"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 flex-shrink-0 rounded-full bg-warm text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
