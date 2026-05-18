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
    steps: [
      'Open the shared route from the YouTube app description or comment link on a real mobile device.',
      'Confirm the page lands directly on the playable detail view with autoplay enabled.',
      'Check that the iframe mounts without requiring login or an extra play tap.',
    ],
    evidenceHint: 'Device, OS/browser, source app, screenshot or recording link, and iframe mount result.',
    passCriteria: 'The YouTube in-app browser opens the detail route and the iframe is playable immediately.',
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
    steps: [
      'Open the route from an Instagram bio or story link on a real mobile device.',
      'Confirm the Instagram in-app browser reaches the detail page with autoplay enabled.',
      'Check that iframe content is visible and playable without login.',
    ],
    evidenceHint: 'Device, Instagram app version if available, screenshot or recording link, and iframe behavior.',
    passCriteria: 'The Instagram in-app browser reaches the playable detail page and does not block the iframe.',
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
    steps: [
      'Open the route from a TikTok profile or test link on a real mobile device.',
      'Confirm TikTok opens the detail page with autoplay enabled.',
      'Check that the iframe appears and starts without a blocked-frame or blank state.',
    ],
    evidenceHint: 'Device, TikTok app version if available, screenshot or recording link, and iframe result.',
    passCriteria: 'The TikTok in-app browser opens the detail route and the iframe is visible and playable.',
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
    steps: [
      'Open a production-like detail route on real mobile Chrome or a trusted mobile test environment.',
      'Measure LCP for the normal non-autoplay entry.',
      'Check network/runtime errors during the first load.',
    ],
    evidenceHint: 'Route, device/browser, LCP value, network error count, runtime exception count, and report link.',
    passCriteria: 'LCP is 3000ms or less with zero failed requests and zero runtime exceptions.',
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
    steps: [
      'Open the autoplay detail route on real mobile Chrome or a trusted mobile test environment.',
      'Measure LCP while autoplay is enabled.',
      'Confirm at least one iframe is mounted during the initial playable state.',
    ],
    evidenceHint: 'Route, device/browser, LCP value, iframe count, network/runtime error counts, and report link.',
    passCriteria: 'LCP is 3000ms or less, no runtime/network failures occur, and the autoplay iframe is mounted.',
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
    steps: [
      'Use live Supabase data and open the Studio export URL with a target month.',
      'Download the CSV file from /api/studio/wes-export.',
      'Compare the header row with the WES export column contract.',
    ],
    evidenceHint: 'Month, environment, downloaded filename, header row, and a link or pasted first CSV line.',
    passCriteria: 'The live CSV includes every required WES export column in the expected order.',
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
    steps: [
      'Download a live WES CSV for a month that has events.',
      'Inspect every occurred_at value in the CSV.',
      'Confirm no row falls outside the requested YYYY-MM month.',
    ],
    evidenceHint: 'Month, row count checked, earliest/latest occurred_at values, and CSV evidence link or excerpt.',
    passCriteria: 'Every exported row belongs to the requested month and malformed month input falls back safely.',
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
    steps: [
      'Open /ux-prototype on desktop and a mobile viewport.',
      'Scan each mockup for overlap, clipped text, and unreadable controls.',
      'Capture screenshots for any layout that changed or looks risky.',
    ],
    evidenceHint: 'Viewport sizes, screenshots, and notes for any visual issue or explicit no-issue pass.',
    passCriteria: 'All prototype screens are readable, aligned, and free of clipped or overlapping content.',
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
    steps: [
      'Open /ux-flow on desktop and a mobile viewport.',
      'Review route, button, message, and auth movement sections.',
      'Check that rows, labels, and status chips remain readable without overlap.',
    ],
    evidenceHint: 'Viewport sizes, screenshots, and notes for table/card readability.',
    passCriteria: 'The UX flow board is readable on desktop and mobile with no clipped text or broken layout.',
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

function cleanBaseUrl(baseUrl = '') {
  return String(baseUrl || '').trim().replace(/\/+$/, '');
}

function cleanHandle(handle = '') {
  return String(handle || '').trim().replace(/^@+/, '') || 'creator';
}

function cleanValue(value = '', fallback = '') {
  return String(value || '').trim() || fallback;
}

export function getDefaultMvpQaTarget({ month = new Date().toISOString().slice(0, 7) } = {}) {
  return {
    baseUrl: 'http://127.0.0.1:3000',
    creatorHandle: '@creator',
    appSlug: 'app-slug',
    postId: '1',
    month,
  };
}

export function normalizeMvpQaTarget(target = {}, options = {}) {
  const defaults = getDefaultMvpQaTarget(options);
  if (!target || typeof target !== 'object') return defaults;
  const creatorHandle = cleanHandle(target.creatorHandle ?? defaults.creatorHandle);
  return {
    baseUrl: cleanBaseUrl(target.baseUrl ?? defaults.baseUrl) || defaults.baseUrl,
    creatorHandle: `@${creatorHandle}`,
    appSlug: cleanValue(target.appSlug, defaults.appSlug),
    postId: cleanValue(target.postId, defaults.postId),
    month: cleanValue(target.month, defaults.month),
  };
}

export function buildMvpQaTargetUrl(route = '', {
  baseUrl = '',
  creatorHandle = 'creator',
  appSlug = 'app-slug',
  postId = 'postId',
  month = 'YYYY-MM',
} = {}) {
  const path = String(route || '/')
    .replaceAll('@creator', `@${cleanHandle(creatorHandle)}`)
    .replaceAll('app-slug', cleanValue(appSlug, 'app-slug'))
    .replaceAll('postId', cleanValue(postId, 'postId'))
    .replaceAll('[id]', cleanValue(postId, '[id]'))
    .replaceAll('YYYY-MM', cleanValue(month, 'YYYY-MM'));
  const base = cleanBaseUrl(baseUrl);
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path;
}
