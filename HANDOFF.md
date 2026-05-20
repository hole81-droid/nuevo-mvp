# nuevo — 개발 인수인계 (Developer Handoff)

**Updated:** 2026-05-20
**For:** 오늘부터 합류하는 신규 개발자
**TL;DR:** Play Shell까지의 핵심 코어는 끝났고, 지금부터 본인이 1순위로 잡아야 할 것은 **실기기 QA 라운드 마감** + **PlayShell `liked` / `next_app_swipe` 같은 잔여 인터랙션 결정**입니다. 새 기능을 만들기 전에 이 문서 → `PRD.md` → `TASK.md`를 순서대로 30분 정도 훑으세요.

---

## 0. 5분 안에 알아야 할 것

| 질문 | 답 |
| --- | --- |
| 이 제품이 뭔가요? | AI로 만든 작은 앱(URL)을 올리면 SNS 딥링크로 들어온 사람이 **바로 전체화면으로 체험**하고, 다음 앱으로 이어가는 모바일-퍼스트 플랫폼. 영상의 "조회수"가 아니라 "체험·리믹스" 데이터를 창작자에게 돌려준다. |
| MVP의 핵심 약속은? | **올리고 → 바로 놀아보는** (수익 정산이 아니라 Fame loop + Play loop) |
| 핵심 진입은? | YouTube Shorts / Instagram Reels에 붙은 nuevo 딥링크 → `?autoplay=true` → 전체화면 **Play Shell**. |
| 지금 어디까지 됐나요? | 외부 딥링크 → Play Shell, 피드 인라인 카드, 업로드, 리믹스, 알림, Studio/WES export, 내부 QA 보드(`/qa`), `/ux-flow`, `/ux-prototype`, moderation report DB 큐, account 삭제, Play Shell 반응 영속화까지 코드 레벨로 끝. |
| 즉시 손대야 할 곳은? | (1) 실기기 in-app browser QA (Instagram/TikTok/YouTube), (2) 실 Supabase 데이터 기반 WES export QA, (3) PlayShell `liked` 처리 결정 (스키마 결정 필요). 이게 MVP 출시 잔여물의 전부입니다. |
| 손대지 말 것은? | `/create` (Phase 2, MVP UI 진입점 없음), 출금/정산 출시, 자동 추천 모델, 멀티-레벨 리믹스 정산. PRD `Explicit Non-Goals`. |

---

## 1. 기획 방향 (왜 이렇게 만들었나)

> 자세한 내용은 [`PRD.md`](PRD.md). 여기엔 코드 결정에 영향을 주는 핵심만 적습니다.

### 1.1 핵심 가설

1. 외부 SNS(특히 Instagram/TikTok/YouTube Shorts)에서 호기심 상태로 들어온 사용자는 **검색을 배우기 전에** 첫 앱을 만지고, **자동으로 이어지는 다음 앱**으로 retention이 잡힌다.
2. 창작자에게 "조회수"가 아닌 "체험 시간·반응·리믹스" 데이터를 돌려주면 SNS에서의 자기 입증 욕구가 충족된다 (Fame loop).
3. MVP에서 수익 정산은 약속하지 않는다. WES/CSV export는 향후 정산 근거를 만들기 위한 **신뢰 지표**일 뿐이다.

### 1.2 두 개의 핵심 루프

```
Creator Fame Loop
  앱 URL 올리기 → 외부 자료/태그/설명 첨부
  → nuevo 딥링크 SNS 공유
  → 비로그인 방문자가 바로 체험
  → 반응/댓글/저장/공유/리믹스 발생
  → Studio에서 Fame/WES 확인

User Play Loop
  SNS 링크 또는 Play 탭에서 발견
  → 전체화면 Play Shell에서 바로 실행
  → 하단 safe zone 버튼: 좋아요 / 완료 / 다음 앱
  → 완료 패널에서 반응/저장/공유/리믹스
  → 다음 앱으로 계속
  → 직접 바꾸고 싶으면 리믹스
```

### 1.3 두 가지 체험 모드 (절대 헷갈리지 말 것)

| | **피드 탭** (`/`) | **Play 탭 / Play Shell** (`/play`, `/play/[id]`) |
| --- | --- | --- |
| 목적 | 발견·탐색 | 몰입·연속 소비 |
| 형태 | 카드 안 compact 420px iframe (인라인 확장) | `fixed inset-0 z-50 bg-black` — 뷰포트 전체화면 |
| 외부 딥링크 | NO (autoplay=true 진입은 자동 redirect됨) | YES — `?autoplay=true`는 여기로 redirect |
| iframe 터치/스크롤 | 카드 expanded 영역 안에서만 | 100% 앱 소유 (위/아래 오버레이는 absolute로 iframe 밖) |
| 상태 머신 | 없음 (단순 mount/unmount) | `loading` → `playing` → `done` |

이 분리가 깨지면 (예: Play Shell 안에 또 다른 카드 UI를 얹는 등) "iframe 터치 가로채기" 회귀가 생깁니다.

### 1.4 WES (Weighted Experience Score)

```
WES = (sessions × 1.0) + (minutes × 0.8) + (reactions × 1.5)
    + (comments × 2.0) + (remixes × 5.0)
```

- 상수의 **단일 출처**: [`src/lib/wes.ts`](src/lib/wes.ts) — 여기 안 거치고 다른 데서 계산하지 마세요.
- 월간 집계는 Supabase view `post_monthly_wes` / `creator_monthly_wes`가 담당.
- 티어 자동 승급은 `POST /api/tier-sync` — 현재 월 sessions만 기준, 강등 없음.

---

## 2. 코드/기술 현황

> 자세한 패턴/규칙은 [`CLAUDE.md`](CLAUDE.md). 여기엔 합류 첫 주에 부딪힐 것만 적습니다.

### 2.1 스택

- Next.js **16.2.6 (App Router, Turbopack)** — *이건 당신이 아는 Next.js가 아닙니다.* breaking change가 있어요. 새 API를 쓰기 전에 `node_modules/next/dist/docs/` 확인.
- React 19.2 / TypeScript strict / Tailwind v4
- Supabase (Auth + Postgres + Storage), `@supabase/ssr` 0.10
- Vercel 배포

### 2.2 디렉터리 한눈에

```
src/
  app/                   # 라우트 (App Router)
    page.tsx             #   피드
    play/[id]/page.tsx   #   Play Shell (외부 딥링크 redirect 목적지)
    [handle]/[slug]/     #   creator 딥링크 → /post/[id] redirect
    post/[id]/           #   상세 (autoplay=true & interactive → /play/[id] redirect)
    upload/              #   업로드 / 리믹스 (?remix=[postId])
    studio/              #   Fame 대시보드 / WES
    qa/                  #   실기기 MVP QA 체크리스트 (release gate 포함)
    ux-flow/             #   내부 UX 흐름 점검
    ux-prototype/        #   내부 모바일 프로토타입 (Play Shell mock 포함)
    create/              #   ⚠️ Phase 2 — MVP UI 진입점 없음. 코드는 살아 있음.
  components/
    feed/FeedClient.tsx
    post/PostCard.tsx        # 카드 (인라인 확장)
    post/PostDetailClient.tsx
    play/PlayShell.tsx       # 전체화면 플레이어
    layout/BottomNav.tsx     # 홈 / 플레이 / 올리기 / 알림 / MY
  contexts/
    AuthContext.tsx
    SavedContext.tsx
    FollowContext.tsx
    NotificationContext.tsx
  lib/
    supabase/{client,server,types}.ts
    social.ts              # ReactionKey, isUuid, mapper들
    notification-events.ts # createNotification (UUID 가드 포함)
    play-shell.{js,d.ts}   # 상태/레이아웃 상수, buildPlayShellPath
    play-mode-analytics.js # internal_play_start / next_app_reveal / next_app_click
    wes.ts                 # WES 상수, 티어 로직 (단일 출처)
    mock-data.ts           # 데모/fallback (UUID 아닌 short ID 사용 — DB 쓰지 말 것)
    *.test.mjs             # 노드 native test (28개, 114 케이스)
supabase/schema.sql        # DDL 단일 출처
scripts/lcp-check.mjs      # npm run qa:lcp
```

### 2.3 절대 깨면 안 되는 코딩 규칙

다음 규칙은 이미 한 번씩 회귀 사고를 낸 적이 있어서 못 박혀 있습니다:

1. **`'use client'`** — 상태/이벤트 있는 컴포넌트는 반드시. 빠뜨리면 hydration 에러.
2. **서버 컴포넌트의 `params`는 `Promise<{...}>`** — `await params` 필수 (Next 16 변화).
3. **`await createClient()`** — 서버 `cookies()`가 async라서 `createClient`도 async. 클라이언트는 sync.
4. **iframe sandbox**: `allow-scripts`와 `allow-same-origin`을 **함께 쓰지 않는다**. iframe은 격리된 origin 전제.
5. **mockPosts (non-UUID ID) 가드**: `'1'`, `'minsu'` 같은 short ID는 DB FK와 안 맞음. `follows`/`comments`/`post_reactions`에 쓰기 전 **`isUuid(post.id)` 체크**. 패턴은 `PostCard.tsx`의 `useDbSocial` 변수 참고.
6. **카드 내부 버튼은 `e.stopPropagation()`** — 카드 자체가 클릭 가능한 영역이라 안 막으면 모든 버튼이 카드 확장 토글까지 트리거.
7. **Tailwind 위주**, 인라인 style은 CSS 변수(`--nuevo-black` 등) 참조나 동적 값일 때만.
8. **세 번 비슷한 줄이 premature abstraction보다 낫다** — `PostCard` / `PostDetailClient` / `PlayShell`의 `handleReaction`은 의도적으로 셋 다 inline. 공통 hook으로 추출하려면 PR에서 충분히 논의 후.

### 2.4 디자인 토큰

| CSS 변수 | 값 | 용도 |
| --- | --- | --- |
| `--nuevo-black` | `#000` | 배경 stage, primary CTA, 선택 상태 |
| `--nuevo-sheet` | `#F8F8F3` | 메인 시트 |
| `--nuevo-soft` | `#EFEFE8` | 보조 surface |
| `--nuevo-line` | `#D7D7CF` | 테두리/구분선 |
| `--nuevo-ink` | `#050505` | 본문 텍스트 |
| `--nuevo-muted` | `#7D7D78` | 보조/메타 |

- `@theme inline`에서 `--color-warm`, `--color-cool` 모두 `#000`으로 매핑. `text-warm`/`bg-warm` 는 검정이다 (이 코드베이스의 의도).
- 오렌지 `#E8511A` / 퍼플 `#5B3FD4` 는 **`/create` Phase 2 페이지에서만** 인라인 사용.
- 모바일 우선: `max-w-[430px] mx-auto`, iPhone 기준.

전체 디자인 원칙은 [`Design Ref.md`](Design%20Ref.md).

---

## 3. 환경 부팅

### 3.1 로컬 설정

```bash
npm install
cp .env.local.example .env.local   # 또는 PowerShell: Copy-Item .env.local.example .env.local
npm run dev
```

`http://localhost:3000`.

### 3.2 환경 변수

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-supabase-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=replace-with-supabase-service-role-secret   # /api/account/delete 만 사용. 브라우저 노출 금지.
```

Supabase OAuth redirect URLs (Supabase 콘솔에 등록되어 있어야 함):

```
http://localhost:3000/auth/callback
https://nuevo-instagram-test.vercel.app/auth/callback
```

### 3.3 Supabase 인계 항목 (관리자 권한 필요)

기존 운영자에게 받아두세요:

- **프로젝트 owner 권한** (Supabase 대시보드)
- **Vercel 프로젝트 권한** (배포/로그)
- **`SUPABASE_SERVICE_ROLE_KEY`** (별도 secret manager / 1Password 등)
- **`NEXT_PUBLIC_*` 키 2개** (anon 키)
- **운영용 Google OAuth 콘솔** 권한 (redirect URL 추가 시 필요)
- **도메인/DNS** 접근 (필요 시)

### 3.4 검증 명령 (PR 전 모두 통과)

```bash
npm run lint
npx tsc --noEmit --pretty false
node --test src\lib\*.test.mjs        # 28 files / 114 cases
npm run build
```

옵션:

```bash
npm run qa:lcp                        # 모바일 LCP 자동 측정 (3초 목표)
```

> ⚠️ **로컬 알려진 이슈**: Windows 헤드리스 Chrome/Edge가 GPU 시작 오류로 죽는 경우가 있음. 실기기/리얼 브라우저 또는 CI 브라우저 환경으로 옮겨서 측정하세요.

### 3.5 DB 스키마 변경 시

[`supabase/schema.sql`](supabase/schema.sql)이 **단일 출처**입니다. 절대 Supabase 대시보드에서만 변경하지 마세요 — 항상 schema.sql에 먼저 반영하고 PR 리뷰 → 운영 SQL Editor에 붙여넣기 순서. 새 테이블에는 RLS 정책도 같은 파일에 적습니다 (`moderation_reports` 참고).

---

## 4. MVP 상태 점검

> 100% 완료라는 뜻이 아니라, **MVP 출시 정의(Definition of Done)에 한해서** 어디까지 됐는지의 표입니다. P1/P2는 [`TASK.md`](TASK.md).

### 4.1 P0 — 끝났음 (코드 레벨)

- [x] 외부 딥링크 즉시 실행 (`/[handle]/[slug]`, `/post/[id]?autoplay=true` → `/play/[id]` redirect)
- [x] Play 탭 + 전체화면 Play Shell (loading/playing/done 상태 머신)
- [x] 비로그인 체험 + 보호 액션의 로그인 유도 (next path 복원)
- [x] 업로드 + iframe 호환성 진단(`/api/check-url`) + 외부 자료 링크 3개 + 모바일 미리보기
- [x] 태그 검색 / 카테고리 탐색 / 일일 추천 / 가장 많이 리믹스된 / 가장 오래 체험된
- [x] 리믹스 lineage + 사회적 증명 (`N회 리믹스됨`) + 원본 재노출 + 알림
- [x] 반응 / 댓글 / 저장 / 공유 (`post_reactions`, `comments`, `post_share_events` 영속화 — PlayShell 포함, 오늘 마감)
- [x] 알림 (remix / reaction / comment / follow / tier_up)
- [x] Studio Fame 대시보드 + WES breakdown + traffic source + CSV export + tier-sync API
- [x] 신뢰/안전: `/terms`, `/privacy`, `/report/post/[id]`, `/settings/delete-account` + DB moderation queue + service-role auth user 삭제
- [x] 내부 점검 라우트: `/ux-flow`, `/ux-prototype`, `/qa` (모두 release-gate 포함)

### 4.2 P0 — 미완 (실데이터/실기기 의존)

여기 3개가 **MVP 출시 잔여 작업의 전부**입니다.

- [ ] **실기기 in-app browser QA** — Instagram/TikTok/YouTube 앱 내부 브라우저에서 Play Shell 동작 (`/qa` 보드에 항목 등록되어 있음)
- [ ] **모바일 LCP 3초 목표 QA** — `/play/[id]` 및 `/play/[id]?autoplay=true` 둘 다. `npm run qa:lcp` 또는 PageSpeed Insights, WebPageTest, 실기기 Lighthouse
- [ ] **실 Supabase 데이터 기반 WES export QA** — CSV 컬럼 및 월 필터링 검증 (`/qa` 보드의 `wes-export` 항목)

### 4.3 P1 — 미완 / 앱스토어 제출 시 필요

- [ ] Sign in with Apple 또는 store-specific 로그인 fallback (네이티브 제출 시)
- [ ] 앱스토어 privacy / data safety 공개 체크리스트
- [ ] 최종 시각 QA 후 스크린샷 보강 (선택)

### 4.4 의도적인 Non-Goals (PRD 1.0)

PRD에 명시. 시간 절약 위해 손대지 마세요:

- 플랫폼 내 AI 앱 생성기
- 실제 출금/정산 출시
- 자동 브랜드 marketplace
- 자동 추천 모델
- 멀티-레벨 리믹스 정산
- 공개 브랜드 대시보드
- 커스텀 도메인을 출시 blocker로 두는 것

---

## 5. 본인이 1주차에 잡을 것 (제안 우선순위)

### 우선순위 1 — 출시 잔여 QA (1~2일)

1. 실기기 1대(가능하면 iOS + Android 각 1)에서 [`/qa`](http://localhost:3000/qa) 보드를 켜고:
   - `external-deeplink`(3) — Instagram/TikTok/YouTube 셰어 시뮬레이션
   - `play-shell`(4) — 위/아래 오버레이가 iframe 터치를 가로채지 않는지, done 상태 패널이 잘 올라오는지, 다음 앱이 이어지는지
   - `mobile-lcp`(2) — `npm run qa:lcp` 결과 import 또는 수동 기록
   - `wes-export`(2) — 실 데이터로 CSV import해서 컬럼/월 검증
   - `visual-review`(2)
2. 결과는 `/qa`에서 **JSON + Markdown 리포트로 export**해서 PR / 위키에 첨부.

### 우선순위 2 — PlayShell `liked` 결정 (반나절)

오늘 시점에서 `PlayShell.tsx`의 상단 `좋아요` 버튼은 **로컬 state만 토글**합니다. 스키마에 `likes` 테이블이 없습니다. 다음 중 하나를 결정해야 합니다:

1. **reactions에 통합** (가장 가벼움): "좋아요"를 다섯 번째 `ReactionKey`로 추가하거나, 별도 카운트로 다루지 않고 done 패널의 4종 반응으로 위임. 상단 버튼은 시각 표지로 남기되 done 패널 반응을 같이 토글. — **추천.**
2. **`post_likes` 테이블 신설** (별도 카운트가 마케팅적으로 의미 있다고 판단될 때): `(post_id, user_id, created_at)` UNIQUE, RLS는 reactions와 동일.
3. **Phase 2로 유지**: 현재 로컬-only 상태를 명시적으로 주석 처리하고 PRD에 기록.

결정 후 `WORKLOG.md`에 한 줄, `PRD.md` 또는 `TASK.md`에 한 줄.

### 우선순위 3 — `/qa` 보드 모바일 LCP 자동 import 확장 (선택)

[`scripts/lcp-check.mjs`](scripts/lcp-check.mjs)는 이미 JSON 출력 가능. `/qa`의 `mobile-lcp` 항목이 JSON import를 지원합니다. CI에서 자동 측정 → 자동 import 흐름을 붙이면 출시 전 회귀를 막을 수 있습니다.

### 그 외에 흥미로워 보이는 것을 만들고 싶을 때

PRD `Explicit Non-Goals`와 충돌하지 않는지 먼저 확인. P1/P2를 추가하려면 `TASK.md`에 항목을 넣고 PR 리뷰 단계에서 합의.

---

## 6. 자주 빠지는 함정 (지난 13세션의 교훈)

| 함정 | 어떻게 피하는가 |
| --- | --- |
| Play Shell 위에 또 다른 카드/모달을 올리고 싶어진다 | iframe 터치 영역을 침범한다. **위/아래 oeverlay는 절대 위치, iframe은 `absolute inset-0` 단독**이 깨지면 회귀. |
| `?autoplay=true`를 `/post/[id]`에서 직접 처리하려 한다 | 이미 `/play/[id]`로 redirect됨. 새 진입을 만들지 말고 redirect 체인을 유지. |
| 반응/댓글/저장 같은 DB 액션을 mock 데이터에서 호출한다 | mock post ID는 UUID가 아니라서 FK 충돌. `isUuid(post.id)` 가드 필요. PostCard `useDbSocial` 패턴 그대로. |
| 새 알림 type을 추가하면서 `notification-events.ts`를 안 거친다 | `createNotification`이 UUID 가드와 self-notify 차단을 담당. 우회하면 mock 환경에서 터진다. |
| WES 상수를 컴포넌트 안에 다시 적는다 | `src/lib/wes.ts`만 단일 출처. 카피하면 정산 정합성 날아간다. |
| 서버 컴포넌트에서 `params`를 await 없이 쓴다 | Next 16 변화. type은 `Promise<...>`. |
| 헤드리스 Chrome으로 LCP 측정이 GPU 에러로 죽는다 | 알려진 Windows 이슈. 실기기 / CI 브라우저로 옮겨서 측정. |
| `node --test src/lib/*.test.mjs` 가 0건 실행된다 | PowerShell glob 미확장. `node --test src\lib\*.test.mjs` (Windows 백슬래시) 또는 npm script로 묶기. |

---

## 7. 인계 받기 좋은 순서 (체크리스트)

첫 날 (1~2시간):

- [ ] 이 문서 끝까지 읽기
- [ ] [`PRD.md`](PRD.md) 1~6장
- [ ] [`Design Ref.md`](Design%20Ref.md) Play Shell 부분
- [ ] [`TASK.md`](TASK.md) 전체
- [ ] [`WORKLOG.md`](WORKLOG.md) 최근 3세션
- [ ] `npm install` + `npm run dev` 로컬 부팅 확인
- [ ] `/`, `/play`, `/play/[id]`, `/upload`, `/studio`, `/ux-prototype`, `/qa` 한 바퀴

첫 주 (2~5일):

- [ ] Supabase / Vercel / OAuth 권한 인계
- [ ] `npm run lint && npx tsc --noEmit && node --test src\lib\*.test.mjs && npm run build` 모두 그린
- [ ] 실기기 QA 라운드 1회 완수 → JSON 리포트 export → 위키 첨부
- [ ] PlayShell `liked` 결정 PR
- [ ] WORKLOG.md 본인 세션 한 줄 추가

---

## 8. 문서 지도

| 파일 | 언제 보나 |
| --- | --- |
| `HANDOFF.md` (이 문서) | 첫 진입 |
| `PRD.md` | 기획 배경 / 결정 근거 |
| `PRD_V3.md` | 구현 facing 스펙 (API/필드 단위) |
| `Design Ref.md` | UI/UX/토큰 |
| `TASK.md` | 무엇이 남았나 |
| `WORKLOG.md` | 무엇이 왜 그렇게 됐나 (세션 히스토리) |
| `CLAUDE.md` | 코드 규칙, 패턴, 디렉터리 |
| `AGENTS.md` | "이 Next는 당신이 아는 그 Next가 아니다" 경고 |
| `README.md` | 외부에 보여주는 짧은 요약 + 셋업 |
| `supabase/schema.sql` | DB 단일 출처 |

질문이 막히면: WORKLOG 검색 → PRD 검색 → 코드 검색. 그래도 막히면 운영자/이전 작업자에게 핑.

---

행운을 빕니다. 만들기보다 **이미 만들어진 흐름이 깨지지 않게 인수받는 것**이 우선입니다.
