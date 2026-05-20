# nuevo MVP PRD

**Version:** 1.3
**Updated:** 2026-05-20
**Scope:** Fame loop + Play-first Vertical Stack 중심 MVP

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
SNS 링크 또는 Play 탭에서 앱 발견
-> 전체화면 Play 탭에서 바로 실행 (외부 유입 + Play 탭 공통)
-> 하단 safe zone 버튼으로 좋아요 / 체험 완료 / 다음 앱 전환
-> 체험 완료 패널에서 반응/저장/공유/리믹스
-> 다음 앱으로 계속 이어보기
-> 직접 바꾸고 싶으면 리믹스
-> 새 버전이 피드와 원본 상세에 재노출
```

외부 SNS에서 들어온 첫 세션은 검색이나 일반 피드 탐색을 먼저 요구하지 않습니다. 사용자는 Instagram Reels, TikTok, YouTube Shorts에서 온 호기심 상태이므로, 외부 딥링크와 Play 탭 모두 YouTube Shorts·Instagram Reels와 동일한 **전체화면 Play Shell** UX를 사용합니다.

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
- Entry context: Instagram/TikTok/YouTube에서 왔다는 짧은 안내
- Internal back: 소셜 딥링크에서는 뒤로가기가 외부 앱으로 튕기지 않고 nuevo 내부 홈으로 복귀
- Mobile LCP target: 3초 이하 목표

Current app mapping:

- `src/lib/deep-link.js`
- `src/app/[handle]/[slug]/page.tsx`
- `src/app/post/[id]/page.tsx`
- `src/components/post/InteractiveDemo.tsx`
- `src/lib/traffic-source.js`

### 4.2 Play Tab (Shorts/Reels UX)

Play 탭은 YouTube Shorts·Instagram Reels와 동일한 전체화면 앱 체험 탭입니다. 피드 탭과 Play 탭은 목적이 다릅니다.

| | 피드 탭 (`/`) | Play 탭 (`/play`) |
|---|---|---|
| iframe 크기 | 카드 안 compact (420px) | 뷰포트 전체화면 |
| 진입 경위 | 피드 탐색 | Play 탭 직접 진입 / 외부 딥링크 |
| 목적 | 발견·탐색 | 몰입 체험·연속 소비 |

**Play Shell 레이아웃** (항상 노출 오버레이, tap-to-toggle 없음):

```
┌──────────────────────────┐  ← 상단 overlay: 뒤로가기 + 앱 제목 (h=54px)
│                          │
│      iframe 앱            │  ← 앱이 100% 소유 (터치/스와이프 충돌 없음)
│   (뷰포트 전체 높이)       │
│                          │
├──────────────────────────┤
│ ♡좋아요   ✓완료   ↑다음앱 │  ← 하단 safe zone (h=64px, 항상 노출)
└──────────────────────────┘
```

**앱 상태별 전환**:

- **로딩 중**: 하단 "건너뛰기 →" 버튼 → 다음 앱
- **체험 중**: 하단 safe zone 좋아요 / 완료 / 다음 앱 버튼 (앱 터치와 분리된 영역)
- **체험 완료** (`완료` 탭 후): 반응(이모지) + 리믹스/저장/공유 + 큰 "다음 앱 바로 체험" CTA 패널 슬라이드업

Required:

- `/play` BottomNav 탭: 인터랙티브 앱 전체화면 체험 입장점
- `/play/[id]`: 특정 앱 전체화면 Play Shell
- 외부 딥링크 `?autoplay=true` → `/play/[id]` 전체화면으로 진입
- iframe이 뷰포트를 채우는 동안 상단/하단 safe zone만 nuevo 컨트롤
- 탭/스와이프는 앱에 온전히 전달됨 (scroll conflict 없음)
- 하단 safe zone: 좋아요(요로그인 유도) / 완료 / 다음 앱 (항상 노출)
- 완료 패널: 이모지 반응 + 리믹스/저장/공유 + 다음 앱 CTA
- 다음 앱: `getSimilarPosts()` / 같은 태그 / 같은 창작자 / 리믹스 lineage fallback
- Guest play 유지: 반응·저장·리믹스만 로그인 유도

Current app mapping:

- `src/app/play/page.tsx`
- `src/app/play/[id]/page.tsx`
- `src/components/play/PlayShell.tsx`
- `src/lib/play-shell.js`
- `src/components/post/InteractiveDemo.tsx`
- `src/lib/play-retention.js`

### 4.3 Upload With External Resource Links

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

### 4.4 Remix Fame Loop

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

### 4.5 Discovery / Play Retention

Required:

- Public feed
- Explore/search by title, text, tag, tool, author, external link label
- Category and tag entry points
- Daily playable / most remixed / longest played sections
- Related posts under detail
- External deep-link sessions should prefer the Play-first Vertical Stack before asking users to search

Current app mapping:

- `src/app/page.tsx`
- `src/app/explore/page.tsx`
- `src/lib/explore-filters.js`
- `src/lib/play-retention.js`

### 4.6 Creator Fame Studio

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
- External deep-link first app completion/meaningful-play rate
- Next app reveal rate after first app
- Second app play rate
- 2+ app session rate from Instagram/TikTok/YouTube
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
- Play Shell safe zone separation (top 54px + bottom 64px) must not consume app touch events.
- iframe scroll/touch conflict is eliminated by the full-screen approach; safe zones are outside the iframe bounds.
- Recommendation quality can start heuristic-based; do not block MVP on an advanced model.
- iframe compatibility varies by creator hosting platform and must keep clear diagnostics.
- Revenue language must stay conservative until real settlement exists.
