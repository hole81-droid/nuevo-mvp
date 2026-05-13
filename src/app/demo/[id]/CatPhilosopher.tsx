'use client';

import { useState, useRef, useEffect } from 'react';

type Philosopher = 'nietzsche' | 'socrates' | 'kant';

const PHILOSOPHERS: Record<Philosopher, { name: string; emoji: string; color: string; responses: Record<string, string> }> = {
  nietzsche: {
    name: '니체',
    emoji: '😼',
    color: 'bg-purple-500',
    responses: {
      default: '냥... 신은 죽었다.\n그리고 나는 참치를 원한다.\n\n이것이 내 초인적 의지다.',
      삶: '삶이란 고통의 연속이다.\n하지만 나는 그것을 사랑한다.\n\n아모르 파티, 냥.',
      의미: '의미는 스스로 창조하는 것이다.\n마치 내가 쥐 인형을 찢듯이.\n\n그것이 진짜 자유다, 냥.',
      행복: '행복을 추구하지 마라.\n힘에의 의지를 추구하라.\n\n나는 지금 선반 위에 올라갔다.\n그것으로 충분하다.',
      고양이: '나는 그저 고양이가 아니다.\n나는 초고양이다.\n\n모든 인간은 나의 가신이다, 냥냥.',
    },
  },
  socrates: {
    name: '소크라테스',
    emoji: '🤔',
    color: 'bg-blue-500',
    responses: {
      default: '냥... 그대는 진정 그것을 아는가?\n\n나는 내가 모른다는 것만 안다.\n그리고 지금 배가 고프다는 것도.',
      삶: '삶이 무엇인지 알기 전에,\n먼저 물어야 한다:\n\n"무엇이 좋은 삶인가?" 냥.\n그대는 아는가?',
      의미: '"의미"란 무엇인가?\n그것을 정의할 수 있는가?\n\n나는 아직 창문 밖을 보고 있다.',
      행복: '행복한 고양이란 어떤 고양이인가?\n\n따뜻한 햇빛에 자는 고양이인가?\n생선을 먹는 고양이인가? 냥.',
      고양이: '고양이란 무엇인가?\n진정 고양이다운 것이란?\n\n나는 이 질문을 평생 연구할 것이다, 냥.',
    },
  },
  kant: {
    name: '칸트',
    emoji: '📚',
    color: 'bg-amber-600',
    responses: {
      default: '냥. 이 상황을 분석하겠다:\n\n① 나는 고양이다 (선험적 사실)\n② 나는 배가 고프다 (경험적 사실)\n③ 따라서 밥을 줘야 한다 (실천이성)',
      삶: '삶은 세 범주로 분류된다:\n\n① 먹기 위한 삶\n② 자기 위한 삶\n③ 창문 보기 위한 삶\n\n이것이 순수이성비판이다, 냥.',
      의미: '의미를 찾으려면 먼저 물어야 한다:\n"이것은 보편화 가능한가?"\n\n나의 낮잠은 보편화 가능하다. 냥.',
      행복: '행복은 의무와 충돌 시 의무를 따라야 한다.\n\n현재 내 의무는\n저 화분을 밀어야 한다. 냥.',
      고양이: '고양이의 정언명령:\n\n"네 행동이 보편 법칙이 될 수 있도록 행동하라."\n\n나는 지금 화분을 밀겠다. 냥.',
    },
  },
};

const ORDER: Philosopher[] = ['nietzsche', 'socrates', 'kant'];

type Msg = { role: 'user' | 'ai'; text: string; philosopher: Philosopher };

const HINTS = ['삶이 뭔가요', '의미가 있나요', '행복해지려면', '고양이란?'];

export default function CatPhilosopher() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<Philosopher>('nietzsche');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const phil = active;
    setMessages((prev) => [...prev, { role: 'user', text: msg, philosopher: phil }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const data = PHILOSOPHERS[phil];
      const key = Object.keys(data.responses).find((k) => k !== 'default' && msg.includes(k)) ?? 'default';
      setMessages((prev) => [...prev, { role: 'ai', text: data.responses[key], philosopher: phil }]);
      setLoading(false);
    }, 1300);
  };

  const current = PHILOSOPHERS[active];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-green-50 to-white">
      <div className="px-4 py-2.5 bg-white border-b border-green-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🐱</span>
          <div>
            <div className="text-[13px] font-bold text-gray-900">고양이가 철학자라면</div>
            <div className="text-[10px] text-gray-400">AI 철학 시뮬레이터 · Claude 3.5</div>
          </div>
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        </div>
        <div className="flex gap-1.5">
          {ORDER.map((p) => {
            const pd = PHILOSOPHERS[p];
            const isActive = p === active;
            return (
              <button
                key={p}
                onClick={() => setActive(p)}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                  isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {pd.emoji} {pd.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-3 text-center">
            <div className="text-4xl">{current.emoji}</div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              <strong className="text-gray-800">{current.name} 고양이</strong>에게<br />무엇이든 물어보세요
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {HINTS.map((h) => (
                <button
                  key={h}
                  onClick={() => send(h)}
                  className="px-3 py-1.5 rounded-full bg-green-100 text-emerald-700 text-[12px] font-medium active:scale-95 transition-transform"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div key={i} className="self-end max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm bg-emerald-500 text-white text-[14px]">
              {msg.text}
            </div>
          ) : (
            <div key={i} className="self-start max-w-[85%]">
              <div className="text-[10px] text-gray-400 mb-1 ml-1">
                {PHILOSOPHERS[msg.philosopher].emoji} {PHILOSOPHERS[msg.philosopher].name} 고양이
              </div>
              <div className="px-3 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-200 text-[13px] text-gray-800 whitespace-pre-line leading-relaxed shadow-sm">
                {msg.text}
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="self-start flex items-center gap-1.5 px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-gray-200 shadow-sm">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
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
          placeholder={`${current.emoji} ${current.name}에게 물어보세요...`}
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-[14px] text-gray-800 placeholder-gray-400 outline-none"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 flex-shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
