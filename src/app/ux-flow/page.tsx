import Link from 'next/link';

type FlowStep = {
  id: string;
  title: string;
  actor: string;
  entry: string;
  action: string;
  destination: string;
  message: string;
  auth: string;
  appStatus: string;
  prototypeStatus: string;
};

type RouteRow = {
  path: string;
  role: string;
  buttons: string[];
  result: string;
  guard: string;
};

const FLOW_STEPS: FlowStep[] = [
  {
    id: '01',
    title: '외부 앱 딥링크 진입',
    actor: '방문자',
    entry: 'YouTube, Instagram, TikTok, GitHub/README 링크',
    action: 'nuevo 링크 탭',
    destination: '/[handle]/[slug] -> /post/[id]?autoplay=true&utm_source=...',
    message: '로그인 없이 상세 화면으로 들어오고 iframe 체험이 즉시 시작됩니다.',
    auth: '불필요',
    appStatus: '구현됨: creator slug, autoplay, traffic source 분류',
    prototypeStatus: '첫 화면으로 강조',
  },
  {
    id: '02',
    title: '피드에서 발견',
    actor: '방문자',
    entry: '/',
    action: '카드 탭, 공유, 리믹스, 반응',
    destination: '/post/[id] 또는 /login?next=...',
    message: '체험은 공개, 소셜 액션은 로그인 경계로 보냅니다.',
    auth: '부분 필요',
    appStatus: '구현됨: PostCard, 공개 피드, 보호 액션',
    prototypeStatus: '피드 카드에 핵심 지표와 리믹스 노출',
  },
  {
    id: '03',
    title: '바로 체험',
    actor: '방문자',
    entry: '/post/[id]',
    action: '바로 해보기 또는 autoplay 진입',
    destination: 'iframe 실행 영역',
    message: '일반 진입은 탭 후 실행, 딥링크 진입은 즉시 실행합니다.',
    auth: '불필요',
    appStatus: '구현됨: InteractiveDemo defer/autoplay 분기',
    prototypeStatus: 'iframe live, source 표시',
  },
  {
    id: '04',
    title: '외부 자료 링크 첨부',
    actor: '창작자',
    entry: '/upload',
    action: '앱 URL, 태그, 외부 자료 링크 입력',
    destination: '/post/[newId]',
    message: 'YouTube/Instagram/TikTok/GitHub 등 참고 링크를 최대 3개 노출합니다.',
    auth: '필요',
    appStatus: '구현됨: posts.external_links, normalizeExternalLinks',
    prototypeStatus: '업로드 목업에 4개 예시와 3개 제한 표시',
  },
  {
    id: '05',
    title: '리믹스 생성',
    actor: '로그인 사용자',
    entry: '/upload?remix=[postId]',
    action: '리믹스 버튼 -> 원본 배너 확인 -> 게시',
    destination: '/post/[newId]',
    message: '원본 lineage를 저장하고 원작자에게 리믹스 알림을 보냅니다.',
    auth: '필요',
    appStatus: '구현됨: remix_of, remixable 차단, notifications',
    prototypeStatus: '리믹스 소셜 증명과 원본 배너 표시',
  },
  {
    id: '06',
    title: '원본의 Fame 재노출',
    actor: '창작자',
    entry: '/post/[id], /, /notifications',
    action: 'N회 리믹스됨, 이 앱의 리믹스들, 알림 확인',
    destination: '/post/[remixId] 또는 /studio',
    message: '리믹스는 파생작 생성만이 아니라 원본을 다시 발견시키는 루프입니다.',
    auth: '부분 필요',
    appStatus: '구현됨: remix count, related remix list, notification feed',
    prototypeStatus: '리믹스 UX 화면으로 독립 배치',
  },
  {
    id: '07',
    title: '창작자 Studio',
    actor: '창작자',
    entry: '/studio',
    action: 'WES breakdown, 유입 채널, CSV export 확인',
    destination: '/api/studio/wes-export?month=YYYY-MM',
    message: '수익 과장보다 체험 성과, 리믹스, 유입 경로를 먼저 보여줍니다.',
    auth: '필요',
    appStatus: '구현됨: studio page, WES export endpoint, traffic source',
    prototypeStatus: 'Fame Studio 화면에 채널/WES 표시',
  },
  {
    id: '08',
    title: '운영/점검',
    actor: '운영자',
    entry: '/settings',
    action: '데모 시드, UX 점검판, 프로토타입 이동',
    destination: '/ux-flow, /ux-prototype, /api/seed-demo-posts',
    message: 'MVP 점검에 필요한 화면을 앱 내부에서 바로 확인합니다.',
    auth: '필요',
    appStatus: '구현됨: settings MVP test links',
    prototypeStatus: '설정 화면 목업 포함',
  },
];

const ROUTES: RouteRow[] = [
  { path: '/', role: '공개 피드', guard: '공개', buttons: ['카드', '공유', '리믹스', '올리기'], result: '상세 진입, 공유 복사, 로그인 경계 또는 업로드' },
  { path: '/[handle]/[slug]', role: '외부 딥링크', guard: '공개', buttons: ['SNS 링크'], result: 'post id 추출 후 상세로 연결' },
  { path: '/post/[id]', role: '체험 상세', guard: '공개', buttons: ['체험 시작', '반응', '댓글', '공유', '리믹스'], result: '체험 공개, 소셜 액션은 로그인 필요' },
  { path: '/upload', role: '앱 올리기', guard: '로그인', buttons: ['URL 검사', '외부 링크', '게시'], result: '게시 후 새 상세 화면 이동' },
  { path: '/upload?remix=[postId]', role: '리믹스 올리기', guard: '로그인', buttons: ['원본 확인', '게시'], result: '원본 연결, 원작자 알림, 리믹스 상세 이동' },
  { path: '/explore', role: '검색/카테고리', guard: '공개', buttons: ['검색', '태그', '카테고리'], result: '태그/텍스트/외부 링크 라벨 기반 탐색' },
  { path: '/notifications', role: '알림', guard: '조건부', buttons: ['알림 카드', '전체 읽음'], result: '리믹스/반응/댓글 알림에서 관련 화면 이동' },
  { path: '/studio', role: 'Fame Studio', guard: '로그인', buttons: ['CSV export', '가이드'], result: 'WES breakdown과 유입 채널 확인' },
  { path: '/settings', role: '운영/테스트', guard: '로그인', buttons: ['데모 시드', 'UX Flow', 'Prototype'], result: '점검 화면 또는 데모 데이터 생성' },
];

const GAPS = [
  '모바일 LCP 3초 목표는 스크립트가 있으나 현재 PC headless Chrome GPU 오류로 실측이 막혀 있습니다.',
  'Instagram/TikTok 인앱 브라우저 실기기 QA는 아직 문서상 체크 항목으로 남겨야 합니다.',
  '브랜드/수익 정산은 MVP 화면에 보조 정보로만 남기고 핵심 UX에서는 Fame/WES 중심으로 유지합니다.',
];

function Pill({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${dark ? 'bg-black text-white' : 'bg-[#EFEFE8] text-[#050505]'}`}>
      {children}
    </span>
  );
}

export default function UxFlowPage() {
  return (
    <main className="min-h-screen bg-[#F8F8F3] text-[#050505]">
      <header className="sticky top-0 z-30 border-b border-[#D7D7CF] bg-[#F8F8F3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-[12px] font-black uppercase tracking-[0.18em] text-[#7D7D78]">nuevo MVP</div>
            <h1 className="mt-1 text-[34px] font-black leading-none tracking-[-0.05em]">UX Flow 점검판</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/ux-prototype" className="rounded-full border border-black px-4 py-2 text-[13px] font-black">화면 프로토타입</Link>
            <Link href="/" className="rounded-full bg-black px-4 py-2 text-[13px] font-black text-white">앱으로 이동</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 py-7">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ['핵심 진입', '외부 앱 딥링크'],
            ['핵심 생성', 'URL 올리기 + 외부 자료'],
            ['핵심 성장', '리믹스 Fame loop'],
            ['핵심 증명', 'Studio/WES export'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-[#D7D7CF] bg-white p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7D7D78]">{label}</div>
              <div className="mt-2 text-[18px] font-black tracking-[-0.04em]">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#D7D7CF] bg-[#EFEFE8]">
        <div className="mx-auto max-w-[1180px] px-5 py-6">
          <h2 className="text-[24px] font-black tracking-[-0.05em]">프로토타입과 현재 앱 비교 결론</h2>
          <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#575752]">
            프로토타입은 현재 MVP 앱의 실제 구현 범위를 기준으로 맞췄습니다. 딥링크 즉시 체험, 외부 자료 링크 첨부, 리믹스 생성과 재노출,
            Studio/WES 확인은 코드에 반영되어 있고, 아래 남은 항목은 QA와 운영 검증 중심입니다.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {GAPS.map((gap) => (
              <div key={gap} className="rounded-[8px] bg-[#F8F8F3] p-3 text-[13px] font-bold leading-5">{gap}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[26px] font-black tracking-[-0.05em]">핵심 사용자 흐름</h2>
          <Pill dark>8개 주요 접점</Pill>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {FLOW_STEPS.map((step) => (
            <article key={step.id} className="rounded-[8px] border border-[#D7D7CF] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[12px] font-black text-[#7D7D78]">{step.id} · {step.actor}</div>
                  <h3 className="mt-1 text-[19px] font-black tracking-[-0.04em]">{step.title}</h3>
                </div>
                <Pill>{step.auth}</Pill>
              </div>
              <dl className="mt-4 grid gap-3 text-[13px] leading-5">
                <div><dt className="font-black text-[#7D7D78]">진입</dt><dd>{step.entry}</dd></div>
                <div><dt className="font-black text-[#7D7D78]">누르는 것</dt><dd>{step.action}</dd></div>
                <div><dt className="font-black text-[#7D7D78]">이동</dt><dd className="font-bold">{step.destination}</dd></div>
                <div><dt className="font-black text-[#7D7D78]">메시지</dt><dd>{step.message}</dd></div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="rounded-[8px] bg-[#EFEFE8] p-3"><strong>앱:</strong> {step.appStatus}</div>
                  <div className="rounded-[8px] bg-[#EFEFE8] p-3"><strong>프로토타입:</strong> {step.prototypeStatus}</div>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#D7D7CF] bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-8">
          <h2 className="text-[26px] font-black tracking-[-0.05em]">Route / Button Map</h2>
          <div className="mt-5 overflow-x-auto rounded-[8px] border border-[#D7D7CF]">
            <table className="min-w-[980px] w-full border-collapse text-left text-[13px]">
              <thead className="bg-[#EFEFE8] text-[12px] font-black uppercase tracking-[0.08em] text-[#575752]">
                <tr>
                  <th className="border-b border-[#D7D7CF] px-4 py-3">Page</th>
                  <th className="border-b border-[#D7D7CF] px-4 py-3">역할</th>
                  <th className="border-b border-[#D7D7CF] px-4 py-3">Guard</th>
                  <th className="border-b border-[#D7D7CF] px-4 py-3">주요 버튼</th>
                  <th className="border-b border-[#D7D7CF] px-4 py-3">결과</th>
                </tr>
              </thead>
              <tbody>
                {ROUTES.map((route) => (
                  <tr key={route.path} className="border-b border-[#EFEFE8] last:border-0">
                    <td className="px-4 py-3 font-black">{route.path}</td>
                    <td className="px-4 py-3">{route.role}</td>
                    <td className="px-4 py-3"><Pill>{route.guard}</Pill></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {route.buttons.map((button) => <Pill key={button}>{button}</Pill>)}
                      </div>
                    </td>
                    <td className="px-4 py-3">{route.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
