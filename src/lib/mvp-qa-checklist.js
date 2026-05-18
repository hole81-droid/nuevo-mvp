export const MVP_QA_CHECKLIST = [
  {
    id: 'deeplink-youtube',
    area: 'external-deeplink',
    source: 'YouTube',
    title: 'YouTube 설명/댓글 링크에서 바로 체험',
    route: '/@creator/app-slug--postId?autoplay=true&utm_source=youtube',
    expected: '상세 화면으로 이동하고 iframe이 즉시 mount된다.',
    requiresLiveData: false,
    evidenceRequired: true,
  },
  {
    id: 'deeplink-instagram',
    area: 'external-deeplink',
    source: 'Instagram',
    title: 'Instagram bio/story 링크에서 바로 체험',
    route: '/@creator/app-slug--postId?autoplay=true&utm_source=instagram',
    expected: '인앱 브라우저에서도 로그인 없이 상세 화면과 iframe이 열린다.',
    requiresLiveData: false,
    evidenceRequired: true,
  },
  {
    id: 'deeplink-tiktok',
    area: 'external-deeplink',
    source: 'TikTok',
    title: 'TikTok profile 링크에서 바로 체험',
    route: '/@creator/app-slug--postId?autoplay=true&utm_source=tiktok',
    expected: 'TikTok 인앱 브라우저에서 iframe이 차단되지 않고 즉시 실행된다.',
    requiresLiveData: false,
    evidenceRequired: true,
  },
  {
    id: 'lcp-detail',
    area: 'mobile-lcp',
    source: 'Real Chrome mobile',
    title: '일반 상세 진입 LCP',
    route: '/post/[id]',
    expected: '모바일 LCP가 3초 이하이고 runtime/network failure가 없다.',
    requiresLiveData: false,
    evidenceRequired: true,
  },
  {
    id: 'lcp-autoplay',
    area: 'mobile-lcp',
    source: 'Real Chrome mobile',
    title: '딥링크 autoplay 상세 진입 LCP',
    route: '/post/[id]?autoplay=true',
    expected: '모바일 LCP가 3초 이하이고 iframe 즉시 mount 판정이 pass다.',
    requiresLiveData: false,
    evidenceRequired: true,
  },
  {
    id: 'wes-live-columns',
    area: 'wes-export',
    source: 'Live Supabase',
    title: 'WES CSV 컬럼',
    route: '/api/studio/wes-export?month=YYYY-MM',
    expected: '다운로드된 CSV가 WES export 표준 컬럼을 모두 포함한다.',
    requiresLiveData: true,
    evidenceRequired: true,
  },
  {
    id: 'wes-live-month',
    area: 'wes-export',
    source: 'Live Supabase',
    title: 'WES CSV month 필터',
    route: '/api/studio/wes-export?month=YYYY-MM',
    expected: 'CSV의 모든 occurred_at 값이 요청 month 범위 안에 있다.',
    requiresLiveData: true,
    evidenceRequired: true,
  },
  {
    id: 'visual-prototype',
    area: 'visual-review',
    source: 'Desktop/mobile browser',
    title: 'UX prototype visual pass',
    route: '/ux-prototype',
    expected: '핵심 화면 mockup이 겹침 없이 모바일 폭에서 읽힌다.',
    requiresLiveData: false,
    evidenceRequired: true,
  },
  {
    id: 'visual-flow',
    area: 'visual-review',
    source: 'Desktop/mobile browser',
    title: 'UX flow visual pass',
    route: '/ux-flow',
    expected: 'route/button/message 표가 모바일과 데스크톱에서 깨지지 않는다.',
    requiresLiveData: false,
    evidenceRequired: true,
  },
];

export function getMvpQaChecklistByArea(area, checklist = MVP_QA_CHECKLIST) {
  return checklist.filter((item) => item.area === area);
}

export function getMvpQaSummary(checklist = MVP_QA_CHECKLIST) {
  return checklist.reduce(
    (summary, item) => ({
      total: summary.total + 1,
      byArea: {
        ...summary.byArea,
        [item.area]: (summary.byArea[item.area] ?? 0) + 1,
      },
    }),
    { total: 0, byArea: {} },
  );
}
