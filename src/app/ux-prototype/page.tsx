import Link from 'next/link';

type Screen = {
  title: string;
  route: string;
  purpose: string;
  primaryCta: string;
  next: string;
  status: string;
  content: React.ReactNode;
};

const FLOW_RAIL = ['외부 딥링크', 'Play Mode', 'Browse to Play', '외부 자료 첨부', '리믹스', 'Fame Studio', '운영 점검'];

function Chip({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${dark ? 'bg-black text-white' : 'bg-[#EFEFE8] text-[#050505]'}`}>{children}</span>;
}

function TopBar({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-[#D7D7CF] bg-[#F8F8F3] px-4">
      <div className="text-[18px] font-black tracking-[-0.05em]">{title}</div>
      <div className="text-[12px] font-black text-[#7D7D78]">{right}</div>
    </div>
  );
}

function BottomTabs({ active }: { active: string }) {
  const tabs = ['홈', '탐색', '올리기', '알림', '프로필'];
  return (
    <div className="absolute bottom-0 left-0 right-0 flex h-14 items-center justify-around bg-[#30302F] px-2 text-[10px] font-black text-white">
      {tabs.map((tab) => <div key={tab} className={`rounded-full px-3 py-2 ${active === tab ? 'bg-white text-black' : ''}`}>{tab}</div>)}
    </div>
  );
}

function PhoneFrame({ screen }: { screen: Screen }) {
  return (
    <article className="rounded-[10px] border border-[#D7D7CF] bg-[#EFEFE8] p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7D7D78]">{screen.route}</div>
          <h2 className="mt-1 text-[18px] font-black tracking-[-0.04em]">{screen.title}</h2>
          <p className="mt-1 text-[12px] leading-5 text-[#575752]">{screen.purpose}</p>
        </div>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black">{screen.status}</span>
      </div>
      <div className="mx-auto h-[640px] max-w-[310px] overflow-hidden rounded-[28px] border-[8px] border-[#050505] bg-[#F8F8F3] shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
        <div className="flex h-8 items-center justify-between bg-[#050505] px-6 text-[11px] font-black text-white">
          <span>9:41</span><span>NUEVO</span>
        </div>
        <div className="h-[592px] overflow-hidden">{screen.content}</div>
      </div>
      <div className="mt-3 rounded-[8px] bg-white p-3 text-[12px] leading-5">
        <div><strong>누르는 버튼:</strong> {screen.primaryCta}</div>
        <div><strong>다음 이동:</strong> {screen.next}</div>
      </div>
    </article>
  );
}

function DeepLinkMock() {
  return (
    <div className="h-full bg-[#111] text-white">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        <div className="text-[16px] font-black">YouTube Shorts</div>
        <div className="text-[11px] font-black text-white/50">외부 앱</div>
      </div>
      <div className="px-4 py-4">
        <div className="h-80 rounded-[24px] bg-gradient-to-b from-[#2C2C2C] to-[#050505] p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50">creator video</div>
          <div className="mt-24 text-[28px] font-black leading-[0.95] tracking-[-0.06em]">AI 앱을<br />바로 실행해요</div>
          <div className="mt-4 flex gap-2"><Chip dark>Instagram</Chip><Chip dark>TikTok</Chip><Chip dark>YouTube</Chip></div>
        </div>
        <div className="mt-4 rounded-[18px] bg-white p-3 text-black">
          <div className="text-[11px] font-black text-[#7D7D78]">설명란 링크</div>
          <div className="mt-2 break-all text-[12px] font-black leading-5">nuevo.app/@minsu/emotion-comfort--p1?autoplay=true&utm_source=youtube</div>
          <button className="mt-3 h-10 w-full rounded-full bg-black text-[12px] font-black text-white">링크 누르기</button>
        </div>
      </div>
    </div>
  );
}

function ExternalPlayModeMock() {
  return (
    <div className="h-full bg-[#F8F8F3]">
      <TopBar title="바로 체험" right="SNS" />
      <div className="px-4 py-4">
        <div className="rounded-[22px] bg-black p-4 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/55">Play Mode</div>
          <div className="mt-2 text-[22px] font-black leading-[1] tracking-[-0.06em]">앱부터 바로 체험하세요</div>
          <p className="mt-2 text-[12px] leading-5 text-white/65">
            아래로 스크롤하면 이어지는 다음 앱을 바로 만날 수 있어요.
          </p>
        </div>
        <div className="mt-4 rounded-[24px] border border-[#D7D7CF] bg-white p-3">
          <div className="h-52 rounded-[20px] bg-[#EFEFE8] p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#207A3A]">iframe live</div>
              <Chip>autoplay=true</Chip>
            </div>
            <div className="mt-12 text-center text-[26px] font-black tracking-[-0.06em]">지금 기분은?</div>
            <div className="mx-auto mt-6 flex w-fit gap-2">
              <button className="rounded-full bg-black px-5 py-3 text-[12px] font-black text-white">기쁨</button>
              <button className="rounded-full bg-white px-5 py-3 text-[12px] font-black">불안</button>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-[22px] border-2 border-black bg-[#FFFDF5] p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8A6A22]">Next App</div>
          <div className="mt-1 text-[18px] font-black tracking-[-0.05em]">다음 앱 바로 보기</div>
          <p className="mt-1 text-[12px] leading-5 text-[#575752]">방금 본 앱과 비슷한 체험이에요.</p>
          <div className="mt-3 flex items-center justify-between rounded-[16px] bg-white px-3 py-3 text-[12px] font-black">
            <span>Emotion card remix</span>
            <span className="rounded-full bg-black px-3 py-2 text-white">체험</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InternalBrowseToPlayMock() {
  return (
    <div className="relative h-full pb-14">
      <TopBar title="NUEVO" right="Browse Mode" />
      <div className="border-b border-[#D7D7CF] px-4 py-4">
        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7D7D78]">피드 카드</div>
        <div className="mt-2 text-[16px] font-black tracking-[-0.04em]">카드 탭은 인라인 확장, CTA는 Play Mode</div>
        <div className="mt-3 rounded-[20px] border border-[#D7D7CF] bg-white p-3">
          <div className="h-24 rounded-[16px] bg-[#EFEFE8] p-4">
            <div className="text-[18px] font-black tracking-[-0.05em]">감정 위로 생성기</div>
            <div className="mt-2 text-[12px] text-[#575752]">인라인 preview · 8회 리믹스됨</div>
          </div>
          <button className="mt-3 h-11 w-full rounded-full bg-black text-[13px] font-black text-white">바로 체험</button>
        </div>
        <div className="mt-3 rounded-[16px] bg-[#EFEFE8] p-3 text-[12px] leading-5">
          CTA → <code>/post/1?mode=play&autoplay=true&utm_source=feed</code>
        </div>
      </div>
      <div className="px-4 py-5">
        <div className="rounded-[20px] bg-black p-4 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/55">CTA 이후</div>
          <div className="mt-1 text-[20px] font-black tracking-[-0.06em]">Play Mode로 전환</div>
          <p className="mt-2 text-[12px] leading-5 text-white/65">
            피드 탐색 후 체험 결심 → Play Mode와 동일한 next-app 흐름.
          </p>
        </div>
      </div>
      <BottomTabs active="홈" />
    </div>
  );
}

function UploadMock() {
  return (
    <div className="h-full">
      <TopBar title="올리기" right="2/3" />
      <div className="px-4 py-4">
        <h3 className="text-[34px] font-black leading-[0.9] tracking-[-0.07em]">ADD DETAILS.</h3>
        <div className="mt-5 space-y-3">
          <div className="rounded-[18px] border border-[#D7D7CF] bg-white p-3"><div className="text-[11px] font-black text-[#7D7D78]">앱 URL</div><div className="mt-2 rounded-[12px] bg-[#EFEFE8] px-3 py-3 text-[12px]">https://my-ai-app.vercel.app</div><div className="mt-2 text-[11px] font-black text-[#207A3A]">iframe 호환 가능</div></div>
          <div className="rounded-[18px] border border-[#D7D7CF] bg-white p-3">
            <div className="flex items-center justify-between"><div className="text-[11px] font-black text-[#7D7D78]">외부 자료 링크</div><div className="text-[10px] font-black text-[#7D7D78]">최대 3개</div></div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {['YouTube', 'Instagram', 'TikTok', 'GitHub'].map((label, index) => <div key={label} className={`rounded-[12px] px-2 py-2 text-[10px] font-black ${index < 3 ? 'bg-[#EFEFE8]' : 'border border-dashed border-[#D7D7CF] text-[#7D7D78]'}`}>{index < 3 ? '첨부됨 · ' : '예시 · '}{label}</div>)}
            </div>
          </div>
          <div className="rounded-[18px] border border-[#D7D7CF] bg-white p-3"><div className="text-[11px] font-black text-[#7D7D78]">태그</div><div className="mt-2 flex gap-1 text-[11px] font-black"><span>#감정</span><span>#AI</span><span>#위로</span></div></div>
        </div>
        <button className="mt-5 h-12 w-full rounded-full bg-black text-[14px] font-black text-white">게시하기</button>
        <div className="mt-3 rounded-[14px] bg-[#EFEFE8] p-3 text-[12px]">게시 중... → 게시 완료! → /post/[newId]</div>
      </div>
    </div>
  );
}

function RemixMock() {
  return (
    <div className="relative h-full pb-14">
      <TopBar title="리믹스" right="8회 리믹스됨" />
      <div className="px-4 py-4">
        <div className="rounded-[20px] border border-[#D7D7CF] bg-white p-3">
          <div className="text-[13px] font-black">원본 · 감정 위로 생성기</div>
          <div className="text-[11px] text-[#7D7D78]">@minsu_lab</div>
          <div className="mt-3 rounded-[16px] bg-black px-3 py-2 text-[12px] font-black text-white">8회 리믹스됨 · 피드에서 소셜 증명으로 노출</div>
          <button className="mt-3 h-11 w-full rounded-full bg-black text-[13px] font-black text-white">이 앱을 다르게 바꿔보기</button>
        </div>
        <div className="mt-4 rounded-[20px] border border-[#D7D7CF] bg-white p-3">
          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7D7D78]">/upload?remix=p1</div>
          <div className="mt-2 rounded-[14px] bg-[#EFEFE8] p-3 text-[12px] leading-5">원본 작품 리믹스 중 · remixable=true일 때만 게시 가능</div>
        </div>
        <div className="mt-4">
          <div className="mb-2 text-[13px] font-black">이 앱의 리믹스들</div>
          {['긍정 버전', '반전 감동 버전', '직장인 버전'].map((title) => <div key={title} className="mb-2 flex items-center justify-between rounded-[14px] bg-[#EFEFE8] px-3 py-2 text-[12px] font-black"><span>{title}</span><span>보기</span></div>)}
        </div>
        <div className="mt-4 rounded-[16px] bg-[#EFEFE8] p-3 text-[12px] leading-5">게시 완료 후 원작자 알림, 원본 상세 재노출, 새 버전 피드 노출이 이어집니다.</div>
      </div>
      <BottomTabs active="올리기" />
    </div>
  );
}

function StudioMock() {
  return (
    <div className="h-full">
      <TopBar title="Studio" right="CSV" />
      <div className="px-4 py-4">
        <div className="rounded-[20px] bg-black p-4 text-white"><div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/60">Fame score</div><div className="mt-3 text-[42px] font-black tracking-[-0.08em]">8,420</div><div className="mt-1 text-[12px] text-white/70">체험, 시간, 반응, 댓글, 리믹스 기반</div></div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[['체험 세션', '1.8k'], ['평균 시간', '4.2분'], ['공유', '320'], ['리믹스', '48']].map(([label, value]) => <div key={label} className="rounded-[18px] border border-[#D7D7CF] bg-white p-3"><div className="text-[11px] font-black text-[#7D7D78]">{label}</div><div className="mt-2 text-[24px] font-black tracking-[-0.06em]">{value}</div></div>)}
        </div>
        <div className="mt-3 rounded-[16px] bg-white p-3 text-[12px]"><div className="font-black">유입 채널</div><div className="mt-2 flex flex-wrap gap-1.5">{['YouTube 42%', 'TikTok 24%', 'Instagram 18%', 'Direct 16%'].map((label) => <Chip key={label}>{label}</Chip>)}</div></div>
        <div className="mt-4 rounded-[16px] bg-[#EFEFE8] p-3 text-[12px] leading-5">예상 수익은 보조 정보입니다. MVP는 Fame/WES와 raw export 신뢰를 먼저 보여줍니다.</div>
      </div>
    </div>
  );
}

function SettingsMock() {
  return (
    <div className="relative h-full pb-14">
      <TopBar title="설정" right="MVP" />
      <div className="px-4 py-4">
        <div className="rounded-[18px] border border-[#D7D7CF] bg-white p-4"><div className="text-[15px] font-black">MVP 데모 앱 채우기</div><p className="mt-1 text-[12px] leading-5 text-[#575752]">iframe 실행 가능한 데모 앱을 생성하고 피드로 이동합니다.</p><button className="mt-3 h-11 w-full rounded-full bg-black text-[13px] font-black text-white">데모 앱 3개 생성</button></div>
        <div className="mt-3 rounded-[18px] border border-[#D7D7CF] bg-white">
          {['UX Flow 점검판', 'UX 화면 프로토타입', '창작자 가이드', '로그아웃'].map((item) => <div key={item} className="flex items-center justify-between border-b border-[#EFEFE8] px-4 py-3 text-[13px] font-black last:border-0"><span>{item}</span><span>›</span></div>)}
        </div>
      </div>
      <BottomTabs active="프로필" />
    </div>
  );
}

const SCREENS: Screen[] = [
  { title: '외부 앱 딥링크', route: 'YouTube/TikTok/Instagram -> nuevo', purpose: '외부 SNS에서 링크를 누르면 바로 체험으로 들어오는 첫 순간입니다.', primaryCta: 'nuevo 링크 탭', next: '/[handle]/[slug] -> /post/[id]?autoplay=true', status: '핵심', content: <DeepLinkMock /> },
  { title: '외부 유입 Play Mode', route: '/post/[id]?autoplay=true', purpose: '앱이 첫 화면입니다. 다음 앱 섹션이 바로 이어지고 피드/검색은 보조 CTA입니다.', primaryCta: '다음 앱 바로 보기', next: '/post/[nextId]?mode=play&autoplay=true&utm_source=next_app', status: 'Play Mode', content: <ExternalPlayModeMock /> },
  { title: '내부 Browse → Play', route: '/ → /post/[id]?mode=play', purpose: '피드 탐색은 가볍게 유지하고, 바로 체험 CTA 탭 시 Play Mode로 전환합니다.', primaryCta: '바로 체험', next: '/post/[id]?mode=play&autoplay=true&utm_source=feed', status: 'Play Mode', content: <InternalBrowseToPlayMock /> },
  { title: '올리기 + 외부 자료', route: '/upload', purpose: '앱 URL과 함께 YouTube/Instagram/TikTok/GitHub 같은 제작 맥락을 첨부합니다.', primaryCta: '게시하기', next: '/post/[newId]', status: '구현', content: <UploadMock /> },
  { title: '리믹스 UX', route: '/upload?remix=[postId]', purpose: '원본을 다시 띄우고 새 버전을 만들게 하는 MVP의 핵심 성장 루프입니다.', primaryCta: '이 앱을 다르게 바꿔보기', next: '원본 배너 -> 게시 -> 원작자 알림', status: '구현', content: <RemixMock /> },
  { title: 'Fame Studio', route: '/studio', purpose: '창작자가 체험 성과, 리믹스, 유입 채널, WES export를 확인합니다.', primaryCta: 'CSV export', next: '/api/studio/wes-export', status: '구현', content: <StudioMock /> },
  { title: '운영 점검', route: '/settings', purpose: '데모 데이터, UX 점검판, 프로토타입으로 빠르게 QA를 시작합니다.', primaryCta: 'UX Flow 점검판', next: '/ux-flow', status: '운영', content: <SettingsMock /> },
];

export default function UxPrototypePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#050505]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-5 text-white">
          <div>
            <div className="text-[12px] font-black uppercase tracking-[0.18em] text-white/50">nuevo MVP</div>
            <h1 className="mt-1 text-[32px] font-black leading-none tracking-[-0.06em] md:text-[52px]">UX Prototype Board</h1>
          </div>
          <div className="flex gap-2"><Link href="/ux-flow" className="rounded-full border border-white/30 px-4 py-2 text-[13px] font-black text-white">Flow 문서</Link><Link href="/" className="rounded-full bg-white px-4 py-2 text-[13px] font-black text-black">앱</Link></div>
        </div>
      </header>
      <section className="mx-auto max-w-[1280px] px-5 py-6">
        <div className="rounded-[10px] bg-[#F8F8F3] p-5">
          <div className="flex flex-wrap items-center gap-2">
            {FLOW_RAIL.map((item, index) => <div key={item} className="flex items-center gap-2"><span className="rounded-full bg-black px-3 py-1.5 text-[12px] font-black text-white">{index + 1}. {item}</span>{index < FLOW_RAIL.length - 1 && <span className="hidden text-[#7D7D78] md:inline">→</span>}</div>)}
          </div>
          <p className="mt-4 max-w-[860px] text-[14px] leading-6 text-[#575752]">현재 개발 중인 MVP 앱과 비교하기 위한 화면형 점검판입니다. 각 목업은 누를 버튼, 이동 경로, 표시 메시지, 내외부 이동을 먼저 검토할 수 있도록 구성했습니다.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-5 px-5 pb-10 lg:grid-cols-2 xl:grid-cols-3">
        {SCREENS.map((screen) => <PhoneFrame key={screen.route} screen={screen} />)}
      </section>
    </main>
  );
}
