'use client';

import { useState } from 'react';

interface MapNode {
  id: string;
  emoji: string;
  title: string;
  handle: string;
  revenue: string;
  cx: number;
  cy: number;
  isRoot?: boolean;
}

interface MapEdge {
  x1: number; y1: number;
  x2: number; y2: number;
}

const NODES: MapNode[] = [
  { id: 'root', emoji: '🎭', title: '회의 밈 생성기',    handle: '@minsu_lab',   revenue: '',        cx: 190, cy: 44,  isRoot: true },
  { id: 'r1',   emoji: '🌈', title: '긍정 밈 생성기',    handle: '@sujin_sound', revenue: '+₩2,100', cx: 95,  cy: 134 },
  { id: 'r2',   emoji: '🔥', title: '인사팀 밈 생성기',  handle: '@jihun_viz',   revenue: '+₩1,560', cx: 285, cy: 134 },
  { id: 'r3',   emoji: '✨', title: '아이돌 밈 생성기',  handle: '@yejin_ai',    revenue: '+₩890',   cx: 45,  cy: 228 },
  { id: 'r4',   emoji: '💙', title: '감동 밈 생성기',    handle: '@jaewon_exp',  revenue: '+₩340',   cx: 150, cy: 228 },
  { id: 'r5',   emoji: '🎸', title: '스타트업 밈 생성기', handle: '@yejin_ai',   revenue: '+₩450',   cx: 285, cy: 228 },
];

const EDGES: MapEdge[] = [
  { x1: 190, y1: 44,  x2: 95,  y2: 134 },
  { x1: 190, y1: 44,  x2: 285, y2: 134 },
  { x1: 95,  y1: 134, x2: 45,  y2: 228 },
  { x1: 95,  y1: 134, x2: 150, y2: 228 },
  { x1: 285, y1: 134, x2: 285, y2: 228 },
];

const RADIUS = { root: 28, child: 22, leaf: 18 };

function nodeRadius(n: MapNode) {
  if (n.isRoot) return RADIUS.root;
  if (n.cy === 134) return RADIUS.child;
  return RADIUS.leaf;
}

export default function RemixMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = NODES.find((n) => n.id === selected);

  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] font-bold text-gray-900">리믹스 맵</h2>
        <span className="text-[12px] text-gray-500">총 5개 파생 작품</span>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        {/* Tree SVG */}
        <svg viewBox="0 0 380 272" className="w-full" style={{ height: 220 }}>
          {/* Edges */}
          {EDGES.map((e, i) => (
            <line
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#E5E7EB"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          ))}

          {/* Nodes */}
          {NODES.map((n) => {
            const r = nodeRadius(n);
            const isSelected = selected === n.id;
            return (
              <g
                key={n.id}
                onClick={() => setSelected(isSelected ? null : n.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring when selected */}
                {isSelected && (
                  <circle cx={n.cx} cy={n.cy} r={r + 6}
                    fill="none" stroke="#E8511A" strokeWidth="2" opacity="0.4"
                  />
                )}
                {/* Background circle */}
                <circle
                  cx={n.cx} cy={n.cy} r={r}
                  fill={n.isRoot ? '#E8511A' : isSelected ? '#FFF0EA' : 'white'}
                  stroke={n.isRoot ? '#E8511A' : isSelected ? '#E8511A' : '#E5E7EB'}
                  strokeWidth={isSelected ? 2 : 1.5}
                />
                {/* Revenue badge (if has revenue) */}
                {n.revenue && !n.isRoot && (
                  <rect
                    x={n.cx + r - 4} y={n.cy - r - 14}
                    width={n.revenue.length * 6.5 + 8} height={14}
                    rx="7"
                    fill="#ECFDF5"
                    stroke="#A7F3D0"
                    strokeWidth="1"
                  />
                )}
                {n.revenue && !n.isRoot && (
                  <text
                    x={n.cx + r - 4 + (n.revenue.length * 6.5 + 8) / 2}
                    y={n.cy - r - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill="#059669"
                  >
                    {n.revenue}
                  </text>
                )}
                {/* Emoji */}
                <text
                  x={n.cx} y={n.cy + (n.isRoot ? 7 : 6)}
                  textAnchor="middle"
                  fontSize={n.isRoot ? 20 : n.cy === 134 ? 16 : 13}
                >
                  {n.emoji}
                </text>
                {/* Handle below node */}
                <text
                  x={n.cx} y={n.cy + r + 12}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isSelected ? '#E8511A' : '#9CA3AF'}
                  fontWeight={isSelected ? '600' : '400'}
                >
                  {n.handle}
                </text>
              </g>
            );
          })}

          {/* Level labels */}
          <text x="8" y="50" fontSize="9" fill="#D1D5DB" fontWeight="500">원본</text>
          <text x="8" y="140" fontSize="9" fill="#D1D5DB" fontWeight="500">1세대</text>
          <text x="8" y="234" fontSize="9" fill="#D1D5DB" fontWeight="500">2세대</text>
        </svg>

        {/* Detail card */}
        {sel ? (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-white border border-orange-100 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{sel.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-gray-900 truncate">{sel.title}</div>
                <div className="text-[11px] text-gray-500">{sel.handle}</div>
              </div>
              {sel.revenue && (
                <div className="text-[13px] font-bold text-emerald-600">{sel.revenue}</div>
              )}
              {sel.isRoot && (
                <div className="px-2 py-0.5 rounded-full bg-orange-100 text-[11px] font-semibold text-warm">
                  내 작품
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-[12px] text-gray-400 pb-3">
            노드를 탭하면 작품 정보가 나타나요
          </p>
        )}
      </div>

      <div className="mt-2 text-[12px] text-gray-400 text-center">
        리믹스 파생 수익 합계 <span className="font-semibold text-emerald-600">+₩5,340</span>이 원본 창작자에게 귀속됩니다
      </div>
    </div>
  );
}
