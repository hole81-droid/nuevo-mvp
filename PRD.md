# nuevo MVP PRD

**Version:** 1.1
**Updated:** 2026-05-18
**Scope:** Fame loop + Play loop 중심 MVP

## 1. Product Definition

nuevo는 AI로 만든 작은 인터랙티브 앱을 기존 SNS 트래픽에서 바로 실행 가능한 체험으로 연결하고, 사용자가 그 앱을 체험, 반응, 공유, 리믹스하면서 창작자가 Fame과 검증된 데이터를 얻는 플랫폼입니다.

MVP 슬로건:

> 올리고, 바로 플레이해보자.

MVP의 목적은 앱 생성기가 아닙니다. 창작자는 이미 Claude Code, Cursor, Replit, Vercel, GitHub Pages 등으로 앱을 만들고 있습니다. nuevo MVP는 그 앱을 배포, 발견, 체험, 리믹스, 성과 확인까지 이어주는 얇고 빠른 레이어입니다.

## 2. MVP Core Loops

### Creator Fame Loop

```text
앱 URL 올리기
-> 외부 자료/태그/설명 첨부
-> nuevo 상세 딥링크 공유
-> 방문자가 로그인 없이 바로 체험
-> 반응, 댓글, 저장, 공유, 리믹스 발생
-> 원본 앱이 다시 노출
-> 창작자가 Studio에서 Fame/WES 확인
```

### User Play Loop

```text
SNS 링크, 피드, 탐색에서 앱 발견
-> 바로 실행
-> 마음에 들면 반응/댓글/저장/공유
-> 직접 바꾸고 싶으면 리믹스
-> 새 버전이 피드와 원본 상세에 재노출
```

### Trust / Data Loop

```text
체험 이벤트 기록
-> WES breakdown
-> raw event CSV export
-> 향후 브랜드/스폰서십/정산 근거로 사용
```

MVP에서 수익은 핵심 약속이 아닙니다. 현재 화면은 예상 수익을 보조 정보로만 다루고, 체험 성과와 데이터 신뢰를 먼저 검증합니다.

## 3. Target Users

### Creators

- AI 도구로 직접 앱, 퀴즈, 생성기, 인터랙티브 콘텐츠를 만드는 창작자
- Instagram, TikTok, YouTube Shorts, Reddit, GitHub README 등에서 자기 앱을 보여주고 싶은 사람
- 영상 조회수보다 “사람들이 실제로 실행했고, 리믹스했고, 반응했다”는 증거가 필요한 사람

### Visitors / Players

- SNS에서 본 AI 앱을 설치 없이 바로 눌러보고 싶은 사람
- 재미있으면 댓글, 반응, 저장, 공유, 리믹스로 참여하고 싶은 사람

### Brands / Sponsors

- 일반 조회수보다 직접 체험 시간, 반응, 리믹스 데이터를 보고 싶은 브랜드
- MVP에서는 운영팀 수동 매칭 또는 소개 페이지 수준으로 제한합니다.

## 4. MVP Must-Have Experiences

### 4.1 External Deep Link Immediate Play

외부 앱에서 nuevo 링크를 누르면 곧바로 앱 체험이 시작되어야 합니다.

Required:

- Creator URL: `/[handle]/[slug]`
- Post URL: `/post/[id]`
- Autoplay query: `?autoplay=true`
- Source query: `utm_source=youtube|instagram|tiktok|reddit|direct`
- Guest access: 로그인 없이 상세 체험 가능
- Mobile LCP target: 3초 이하 목표

Current app mapping:

- `src/lib/deep-link.js`
- `src/app/[handle]/[slug]/page.tsx`
- `src/app/post/[id]/page.tsx`
- `src/components/post/InteractiveDemo.tsx`
- `src/lib/traffic-source.js`

### 4.2 Upload With External Resource Links

창작자는 앱 URL과 함께 제작 맥락을 보여주는 외부 자료 링크를 붙일 수 있어야 합니다.

Required:

- App URL
- iframe compatibility check
- Title, description, tags
- External links up to 3
- Examples: YouTube tutorial, Instagram post, TikTok video, GitHub repo, original demo page
- Posted detail page shows the external links

Current app mapping:

- `src/app/upload/page.tsx`
- `src/lib/upload-metadata.js`
- `posts.external_links`
- `src/components/post/PostDetailClient.tsx`
- `src/components/post/PostCard.tsx`

### 4.3 Remix Fame Loop

리믹스는 단순 파생작 기능이 아니라 원본의 Fame을 다시 키우는 성장 루프입니다.

Required:

- Remix CTA on original posts
- `/upload?remix=[postId]`
- Original banner in upload flow
- `remixable=false` blocks remix
- `posts.remix_of` lineage
- Remix count social proof: `N회 리믹스됨`
- Original detail page shows “이 앱의 리믹스들”
- Original creator receives remix notification
- Remix posts can re-enter feed/explore

Current app mapping:

- `src/lib/remix-cta.js`
- `src/lib/remix-social-proof.js`
- `src/app/upload/page.tsx`
- `src/components/post/PostCard.tsx`
- `src/components/post/PostDetailClient.tsx`
- `src/app/notifications/page.tsx`

### 4.4 Discovery / Play Retention

Required:

- Public feed
- Explore/search by title, text, tag, tool, author, external link label
- Category and tag entry points
- Daily playable / most remixed / longest played sections
- Related posts under detail

Current app mapping:

- `src/app/page.tsx`
- `src/app/explore/page.tsx`
- `src/lib/explore-filters.js`
- `src/lib/play-retention.js`

### 4.5 Creator Fame Studio

Required:

- Experience sessions
- Experience minutes
- Reactions
- Comments
- Saves/shares where available
- Remix count
- Traffic source breakdown
- WES breakdown
- Raw event CSV export

Current app mapping:

- `src/app/studio/page.tsx`
- `src/app/api/studio/wes-export/route.ts`
- `src/lib/wes.ts`
- `src/lib/wes-export.js`
- `src/lib/fame-dashboard.js`

## 5. Non-Goals For MVP

These should not become the primary MVP promise:

- In-app AI app generation
- Real payout / withdrawal
- Automated brand marketplace
- Advanced recommendation algorithm
- Multi-level remix settlement chain
- Public creator WES profile for brands
- Full community forum
- Custom domain launch requirement

## 6. UX Validation Pages

MVP includes two internal review surfaces:

- `/ux-flow`: route, button, message, guard, and internal/external movement checklist
- `/ux-prototype`: screen-first mobile prototype board for the core MVP experience

These pages are not end-user production surfaces. They are alignment tools for product, design, and QA.

## 7. Success Metrics

Launch validation:

- External deep-link play success rate
- Mobile detail LCP for `/post/[id]` and `/post/[id]?autoplay=true`
- Upload completion rate
- First play after publish time
- Guest-to-login conversion at protected actions
- Remix creation rate
- Traffic source distribution
- WES export usage by creators

3-6 month goals:

- 100 early creators
- 1,000 creators with at least one posted app
- 10-15% remix rate target
- Average meaningful play time above 2 minutes
- External SNS traffic becomes a measurable top source

## 8. Open QA / Risk

- Mobile LCP needs real Chrome/device confirmation. The local `npm run qa:lcp` script exists, but the current Windows headless browser hit a GPU startup failure.
- Instagram/TikTok in-app browser behavior should be tested on real devices.
- iframe compatibility varies by creator hosting platform and must keep clear diagnostics.
- Revenue language must stay conservative until real settlement exists.
