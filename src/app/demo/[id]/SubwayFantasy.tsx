'use client';

import { useState } from 'react';

const STATIONS = [
  { name: '강남',    emoji: '👑', world: '황금 왕도',      desc: '부와 권력이 집중된 왕국의 수도. 모든 길이 이곳으로 통한다.',       bg: 'from-amber-200 to-yellow-300',  role: '수도' },
  { name: '홍대',    emoji: '🎨', world: '마법사의 거리',   desc: '예술 마법사들이 새로운 주문을 창조하는 창의의 마을.',              bg: 'from-purple-200 to-pink-300',   role: '마법 도시' },
  { name: '신촌',    emoji: '⚔️', world: '청년 용사 마을',  desc: '전사 지망생들이 무예를 갈고닦는 훈련 도시. 열정이 넘친다.',        bg: 'from-blue-200 to-cyan-300',     role: '훈련 도시' },
  { name: '시청',    emoji: '🏯', world: '왕국 의회',       desc: '법과 질서를 수호하는 기사단 본거지. 근엄한 석조 궁전이 솟아있다.', bg: 'from-stone-200 to-gray-300',    role: '통치 구역' },
  { name: '합정',    emoji: '🌊', world: '항구 도시',       desc: '대륙과 섬을 잇는 무역항. 이국적인 상품과 뱃사람들이 가득하다.',    bg: 'from-teal-200 to-blue-300',     role: '항구' },
  { name: '뚝섬',    emoji: '🌲', world: '요정 숲 입구',    desc: '인간계와 요정계의 경계. 달밤에는 요정들의 노래가 들린다.',         bg: 'from-green-200 to-emerald-300', role: '이계 경계' },
  { name: '성수',    emoji: '🔬', world: '연금술사 공방',   desc: '쇠와 마법이 합쳐지는 장인의 거리. 밤새 불꽃이 꺼지지 않는다.',    bg: 'from-orange-200 to-red-300',    role: '장인 거리' },
  { name: '건대',    emoji: '🎓', world: '마법 아카데미',   desc: '젊은 마법사들이 기초 주문을 배우는 왕립 마법 학원.',               bg: 'from-indigo-200 to-purple-300', role: '학원 도시' },
  { name: '교대',    emoji: '⚖️', world: '마법 법원',       desc: '마법 범죄를 심판하는 재판소. 모든 마법사는 여기를 두려워한다.',    bg: 'from-gray-200 to-slate-300',    role: '법원 구역' },
  { name: '신림',    emoji: '🌙', world: '달신의 신전',     desc: '달의 여신을 모시는 신관들의 성지. 보름달 밤에 기적이 일어난다.',   bg: 'from-violet-200 to-indigo-300', role: '신성 구역' },
  { name: '잠실',    emoji: '🐉', world: '용사의 경기장',   desc: '대륙 최강의 용사들이 겨루는 콜로세움. 주말마다 함성이 울린다.',    bg: 'from-red-200 to-orange-300',    role: '경기장' },
  { name: '왕십리',  emoji: '🌸', world: '벚꽃 정령 마을',  desc: '봄마다 정령들이 피워내는 벚꽃이 하늘을 수놓는 평화로운 마을.',    bg: 'from-pink-200 to-rose-300',     role: '정령 마을' },
  { name: '신당',    emoji: '🍺', world: '모험가 선술집',   desc: '퀘스트를 마친 모험가들이 모여 무용담을 나누는 소란스러운 거리.',   bg: 'from-amber-100 to-orange-200',  role: '모험가 거리' },
  { name: '사당',    emoji: '🏔️', world: '드워프 광산',     desc: '지하 깊은 곳까지 이어지는 드워프 제국의 출입구. 귀금속이 넘친다.', bg: 'from-stone-100 to-zinc-200',    role: '광산 입구' },
  { name: '방배',    emoji: '🧘', world: '현자의 은둔처',   desc: '속세를 떠난 현자들이 조용히 수행하는 고즈넉한 산중 마을.',        bg: 'from-green-100 to-teal-200',    role: '은둔처' },
];

export default function SubwayFantasy() {
  const [selected, setSelected] = useState<typeof STATIONS[0] | null>(null);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-indigo-950 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="text-[11px] text-indigo-300 font-semibold uppercase tracking-widest mb-1">서울 지하철 2호선</div>
        <div className="text-[20px] font-bold text-white">역명 → 판타지 세계 배치</div>
        <div className="text-[13px] text-slate-400 mt-0.5">역을 탭하면 판타지 세계 정보가 나타나요</div>
      </div>

      {/* Station grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {STATIONS.map((s) => {
            const isSelected = selected?.name === s.name;
            return (
              <button
                key={s.name}
                onClick={() => setSelected(isSelected ? null : s)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <span className="text-[22px]">{s.emoji}</span>
                <span className={`text-[12px] font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {s.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-indigo-400 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {s.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail card — slides up when station selected */}
      {selected && (
        <div className={`mx-3 mb-4 p-4 rounded-2xl bg-gradient-to-br ${selected.bg} shadow-xl`}>
          <div className="flex items-start gap-3">
            <div className="text-[44px] leading-none">{selected.emoji}</div>
            <div className="flex-1">
              <div className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">
                {selected.name}역
              </div>
              <div className="text-[19px] font-bold text-gray-900 mt-0.5">
                {selected.world}
              </div>
              <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-black/10 text-[11px] text-gray-700 font-medium">
                {selected.role}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-gray-700 leading-relaxed">
            {selected.desc}
          </p>
        </div>
      )}
    </div>
  );
}
