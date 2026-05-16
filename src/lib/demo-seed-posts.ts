import type { ContentType } from './supabase/types';

export type DemoSeedPost = {
  title: string;
  text: string;
  contentType: ContentType;
  iframeUrl: string;
  coverEmoji: string;
  bgGradient: string;
  detailDescription?: string;
  toolUsed?: string;
};

export const DEMO_SEED_POSTS: DemoSeedPost[] = [
  {
    title: '회의 내용 → 슬픈 밈 생성기',
    text: '회의 문장을 넣으면 바로 회사원의 마음을 대변하는 밈을 만들어줘요.',
    contentType: 'interactive',
    iframeUrl: '/demo/1',
    coverEmoji: '🎮',
    bgGradient: 'from-orange-100 to-orange-200',
    detailDescription: 'Claude API를 사용해 입력 문장을 분석하고, 직장인 감성의 밈 텍스트를 생성합니다. 시스템 프롬프트에 "절망적 직장인" 페르소나를 부여해 공감 포인트를 극대화했어요.',
    toolUsed: 'Claude API, Next.js',
  },
  {
    title: '철학자 고양이 상담소',
    text: '고민을 쓰면 고양이가 니체, 소크라테스, 칸트 모드로 대답합니다.',
    contentType: 'interactive',
    iframeUrl: '/demo/4',
    coverEmoji: '🎮',
    bgGradient: 'from-lime-100 to-emerald-200',
    detailDescription: '선택한 철학자의 스타일로 고민에 답하는 캐릭터 챗봇. 각 철학자별 대표 개념과 어조를 프롬프트에 주입했고, 고양이 어투를 섞어 유쾌함을 더했습니다.',
    toolUsed: 'Claude API, React',
  },
  {
    title: '전생 직업 판정기',
    text: '지금 직업을 입력하면 전생에 무슨 일을 했는지 이상하게 분석해줘요.',
    contentType: 'interactive',
    iframeUrl: '/demo/6',
    coverEmoji: '🎮',
    bgGradient: 'from-violet-100 to-purple-200',
    detailDescription: '현재 직업 키워드를 바탕으로 전생 시나리오를 생성합니다. 황당하지만 논리적인 연결고리를 만들어내는 것이 포인트 — "개발자 → 조선시대 지도 제작자" 같은 식으로요.',
    toolUsed: 'Claude API, Tailwind CSS',
  },
];
