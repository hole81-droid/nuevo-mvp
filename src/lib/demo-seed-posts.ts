import type { ContentType } from './supabase/types';

export type DemoSeedPost = {
  title: string;
  text: string;
  contentType: ContentType;
  iframeUrl: string;
  coverEmoji: string;
  bgGradient: string;
};

export const DEMO_SEED_POSTS: DemoSeedPost[] = [
  {
    title: '회의 내용 → 슬픈 밈 생성기',
    text: '회의 문장을 넣으면 바로 회사원의 마음을 대변하는 밈을 만들어줘요.',
    contentType: 'interactive',
    iframeUrl: '/demo/1',
    coverEmoji: 'PLAY',
    bgGradient: 'from-orange-100 to-orange-200',
  },
  {
    title: '철학자 고양이 상담소',
    text: '고민을 쓰면 고양이가 니체, 소크라테스, 칸트 모드로 대답합니다.',
    contentType: 'interactive',
    iframeUrl: '/demo/4',
    coverEmoji: 'CHAT',
    bgGradient: 'from-lime-100 to-emerald-200',
  },
  {
    title: '전생 직업 판정기',
    text: '지금 직업을 입력하면 전생에 무슨 일을 했는지 이상하게 분석해줘요.',
    contentType: 'interactive',
    iframeUrl: '/demo/6',
    coverEmoji: 'JOB',
    bgGradient: 'from-violet-100 to-purple-200',
  },
];
