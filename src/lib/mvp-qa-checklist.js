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
    id: 'play-mode-external',
    area: 'play-mode',
    source: 'Real mobile',
    title: '외부 SNS 유입 Play Mode: 앱 우선 + 다음 앱 노출',
    route: '/post/[id]?autoplay=true&utm_source=instagram',
    expected: 'Play Mode 헤더가 표시되고, iframe이 먼저 렌더링되며, 다음 앱 섹션이 아래로 스크롤 시 보인다.',
    requiresLiveData: false,
    evidenceRequired: true,
    steps: [
      'Open a post route with autoplay=true and utm_source=instagram (or tiktok/youtube) on a real mobile device.',
      'Confirm the "Play Mode" header is visible above the iframe.',
      'Interact with the iframe and verify no accidental scroll to the next section occurs during iframe interaction.',
      'Scroll below the iframe and confirm the next-app card appears (or the feed/explore fallback if no recommendation exists).',
      'Tap the next-app "체험" button and confirm it navigates to the next post in Play Mode.',
    ],
    evidenceHint: 'Device, source (ig/tt/yt), screenshot of Play Mode header + iframe + next-app card, and next-app navigation result.',
    passCriteria: 'Play Mode header visible, iframe first, next-app card or fallback visible on scroll, next-app navigation works, no scroll hijack during iframe interaction.',
  },
  {
    id: 'play-shell-deeplink',
    area: 'play-shell',
    source: 'Real mobile',
    title: '외부 딥링크 → Play Shell 전체화면 진입',
    route: '/post/[id]?autoplay=true&utm_source=instagram',
    expected: '딥링크가 /play/[id]로 리디렉트되고, 전체화면 Play Shell이 열리며 iframe이 뷰포트를 가득 채운다.',
    requiresLiveData: false,
    evidenceRequired: true,
    steps: [
      'Open a post detail route with ?autoplay=true on a real mobile device (Instagram/TikTok/YouTube in-app browser).',
      'Confirm the URL redirects to /play/[id]?autoplay=true.',
      'Confirm the iframe fills the entire viewport with no page chrome visible except the top/bottom overlays.',
      'Confirm top overlay shows back button + app title. Bottom overlay shows 좋아요 / 완료 / 다음앱 buttons.',
      'Interact with the app (tap/swipe) and confirm the page does not accidentally scroll.',
    ],
    evidenceHint: 'Device, source app (ig/tt/yt), screenshot showing full-screen iframe + overlays, and tap-interaction result.',
    passCriteria: 'URL redirects to /play/[id], iframe fills viewport, safe zone buttons visible, no touch/scroll conflict.',
  },
  {
    id: 'play-shell-state-machine',
    area: 'play-shell',
    source: 'Real mobile',
    title: 'Play Shell 상태 머신: loading → playing → done',
    route: '/play/[id]?autoplay=true',
    expected: '로딩 중 건너뛰기 버튼, 체험 중 완료 버튼, 완료 후 slide-up 패널이 순서대로 나타난다.',
    requiresLiveData: false,
    evidenceRequired: true,
    steps: [
      'Open /play/[id]?autoplay=true on a real mobile device.',
      'While the iframe is loading, confirm the bottom bar shows the "건너뛰기" button.',
      'After the iframe loads, confirm the bottom bar switches to ♡좋아요 / ✓완료 / ↑다음앱.',
      'Tap "완료" and confirm a slide-up panel appears with: emoji reactions, 리믹스/저장/공유 buttons, and "다음 앱 바로 체험" CTA.',
      'Tap "다음 앱 바로 체험" and confirm navigation to /play/[nextId].',
    ],
    evidenceHint: 'Device, screenshots of each state (loading/playing/done), and next-app navigation result.',
    passCriteria: 'All three states render correctly. Done panel shows reactions + actions + next CTA. Next app navigation works.',
  },
  {
    id: 'play-shell-next-app',
    area: 'play-shell',
    source: 'Real mobile',
    title: 'Play Shell 다음 앱 연속 체험',
    route: '/play/[id] → /play/[nextId]',
    expected: '다음 앱 버튼/CTA 탭 시 Play Shell 전체화면을 유지하며 다음 앱으로 이어진다.',
    requiresLiveData: false,
    evidenceRequired: true,
    steps: [
      'Open /play/[id]?autoplay=true on a real mobile device.',
      'In playing or done state, tap "다음 앱" or "다음 앱 바로 체험".',
      'Confirm navigation goes to /play/[nextId]?autoplay=true (full-screen Play Shell).',
      'Confirm the new app loads immediately in full-screen mode.',
      'Repeat once more to confirm a 3+ app session is achievable.',
    ],
    evidenceHint: 'Device, screenshot/recording of 2+ app transitions, and final URLs visited.',
    passCriteria: 'Each next-app tap stays in full-screen Play Shell. 2+ app session completes without leaving Play Shell.',
  },
  {
    id: 'play-tab-entry',
    area: 'play-shell',
    source: 'Real mobile',
    title: 'Play 탭 직접 진입',
    route: '/play',
    expected: 'BottomNav 플레이 탭 탭 시 /play로 이동하고 첫 번째 인터랙티브 앱 Play Shell이 열린다.',
    requiresLiveData: false,
    evidenceRequired: true,
    steps: [
      'Open the app on a real mobile device.',
      'Tap the "플레이" tab in the bottom navigation bar.',
      'Confirm the URL goes to /play then immediately redirects to /play/[id]?autoplay=true.',
      'Confirm the full-screen Play Shell opens with the first interactive post.',
    ],
    evidenceHint: 'Device, screenshot of bottom nav with play tab active, screenshot of play shell.',
    passCriteria: 'Play tab navigates to full-screen Play Shell. First interactive app loads automatically.',
  },
  {
    id: 'play-mode-internal',
    area: 'play-mode',
    source: 'Real mobile',
    title: '내부 피드 Browse → Play Mode 전환',
    route: '/ → /post/[id]?mode=play&autoplay=true&utm_source=feed',
    expected: '피드 카드에서 "바로 체험" CTA 탭 시 Play Mode로 전환되고 동일한 next-app 흐름이 이어진다.',
    requiresLiveData: false,
    evidenceRequired: true,
    steps: [
      'Open the feed at / on a real mobile device.',
      'Find a feed card and confirm the "바로 체험" primary CTA button is visible.',
      'Tap "바로 체험" and confirm the navigation lands on /post/[id]?mode=play&autoplay=true&utm_source=feed.',
      'Confirm the Play Mode header is shown and the iframe autoplay starts.',
      'Scroll below the iframe and confirm the next-app continuation section appears.',
    ],
    evidenceHint: 'Device, screenshot of feed card CTA, Play Mode entry URL, Play Mode header + next-app card screenshot.',
    passCriteria: 'Feed card CTA navigates to Play Mode, Play Mode header visible, iframe autoplays, next-app section appears on scroll.',
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
