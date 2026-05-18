# nuevo — 작업 로그

다른 PC로 이어받아 작업할 수 있도록 세션별 작업 내용을 기록한다.

---

## 세션 10 — 2026-05-18

### 완료 내역

#### 신규 PC 인수 및 로컬 환경 복원
- GitHub 저장소 `https://github.com/hole81-droid/nuevo-mvp`를 `C:\Users\UX_Lab_Live\Desktop\Nuevo MVP`에 새로 클론.
- `npm install` 실행 완료.
  - 참고: 최초 실행은 사용자 npm cache 권한 문제로 실패했고, 승인된 권한으로 재실행해 완료.
  - npm audit 기준 moderate 취약점 2건이 보고됨. 자동 `audit fix --force`는 breaking change 가능성이 있어 실행하지 않음.
- `.env.local`은 git 제외 파일이며 현재 새 클론에는 없음.
  - 실제 Supabase anon key는 별도 전달/대시보드 확인 필요.
  - 검증 명령은 임시 placeholder 환경변수로만 실행.

#### 인수 직후 품질 게이트 확인
- `npm run lint` 통과.
- `npx tsc --noEmit --pretty false` 통과.
- `node --test src\lib\*.test.mjs` → 37 passed.
- `npm run build`:
  - `.env.local` 없이 실행하면 Supabase URL/anon key 누락으로 실패하는 것을 확인.
  - 임시 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)를 주입하면 production build 통과.

#### N1 모바일 LCP QA 준비 상태 확인
- production build 후 `next start` 기준 로컬 HTTP 응답 확인:
  - `/post/1` → 200, 약 77ms
  - `/post/1?autoplay=true` → 200, 약 68ms
  - `/demo/1` → 200, 약 57ms
- 일반 상세 진입과 autoplay 상세 진입 모두 서버 응답은 빠르게 반환됨.
- 실제 모바일 LCP 3초 이하 체크는 브라우저 렌더링 계측이 필요하므로 아직 완료 처리하지 않음.
  - 현재 PC에는 gstack headless browser가 미설치 상태(`NEEDS_SETUP`).
  - 다음에 브라우저 도구 1회 셋업 후 모바일 viewport에서 LCP/콘솔/네트워크를 확인하면 N1 QA를 마무리할 수 있음.

#### LCP 계측 스크립트 추가
- `scripts/lcp-check.mjs` 추가.
  - Next production server를 띄운 뒤 Chrome DevTools Protocol로 모바일 viewport(`390x844`, DPR 3)에서 LCP를 측정.
  - 기본 측정 경로: `/post/1`, `/post/1?autoplay=true`.
  - `npm run qa:lcp`로 실행.
  - 환경변수:
    - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 실제/임시 Supabase 값.
    - `CHROME_PATH`: 사용할 Chrome/Edge 실행 파일 경로.
    - `LCP_OUTPUT`: JSON 결과 파일 저장 경로.
    - `LCP_HEADLESS_MODE=old`: 구형 Chromium에서 old headless 강제.
- 현재 PC에서 실행 결과:
  - 시스템 Chrome, Edge, Puppeteer cache Chrome 모두 headless 시작 또는 페이지 로드 중 GPU process fatal 발생.
  - 대표 오류: `GPU process isn't usable. Goodbye.`
  - 따라서 이 PC/sandbox에서는 실제 LCP 수치를 확정하지 못함.
  - 브라우저 실행 권한이 정상인 로컬 환경 또는 배포 URL + Lighthouse/PageSpeed 환경에서 같은 스크립트/측정을 재시도 필요.

#### MVP 잔여 항목 정리
- `TASK.md`의 stale 체크 상태를 실제 작업로그 기준으로 정리.
  - Supabase Auth Google OAuth 설정은 세션 4에서 완료되어 체크 처리.
  - 브랜드 셀프서브 마켓플레이스와 AI 앱 생성기는 MVP 제외/Phase 2 유지로 체크 처리.
  - 커스텀 도메인은 선택 운영 작업이며 MVP 기능 완료 조건이 아니라고 명시.
  - N1 모바일 LCP QA는 `npm run qa:lcp` 자동화 준비 완료, 현재 PC headless GPU 오류로 실측 차단 상태를 명시.
- 새 클론 로컬 실행 안내가 깨지지 않도록 `.env.local.example` 추가.
  - `.gitignore`에서 `.env.local.example`은 추적되도록 예외 처리.
  - `README.md` 검증 명령을 현재 사용한 명령과 맞추고 `qa:lcp` 사용법 추가.

#### 전체 UX Flow 점검판
- `/ux-flow` 내부 점검 페이지 추가 (`src/app/ux-flow/page.tsx`).
  - 핵심 유저 여정 12개를 `진입 → 버튼/행동 → 이동 → 메시지/상태 → 점검 포인트`로 정리.
  - Route map, 상태 메시지, 외부 이동/다운로드/클립보드 동작을 한 화면에서 점검 가능.
  - `/settings`의 MVP 테스트 섹션에 "UX Flow 점검판" 링크 추가.
- 목적:
  - 실제 개발 재개 전 전체 UX, 로그인 경계, 버튼 목적지, 내/외부 이동, Phase 2 노출 여부를 빠르게 리뷰.
  - 제품팀/운영자가 코드 읽지 않고도 플로우 누락과 어색한 메시지를 체크.

#### 전체 UX 화면 프로토타입
- `/ux-prototype` 내부 프로토타입 보드 추가 (`src/app/ux-prototype/page.tsx`).
  - 홈 피드, 상세 체험, 로그인 경계, 업로드, Fame Studio, 설정/운영 6개 모바일 목업을 한 화면에 배치.
  - 각 목업 카드에 `누르는 버튼`과 `다음 이동`을 표시해 UX 리뷰 중 바로 대조 가능.
  - `/ux-flow` 상단과 `/settings` MVP 테스트 섹션에서 접근 가능.
- 목적:
  - 문서형 플로우 점검 전에 실제 화면 감각을 먼저 보고, 어떤 흐름을 실제 앱에서 클릭 QA할지 합의.
  - MVP의 핵심 톤인 "체험 먼저, 소셜 액션은 로그인 후, 수익보다 Fame/WES"가 화면에 보이는지 점검.

#### 핵심 MVP 경험 반영 보강
- 사용자 토론 결과 MVP에 추가된 핵심 경험이 프로토타입에 더 선명히 보이도록 `/ux-prototype` 개선.
  - 외부 앱 딥링크 화면 추가: YouTube/TikTok/Instagram 등에서 `@handle/app-slug--postId?autoplay=true` 링크를 눌러 nuevo 상세로 들어오고 즉시 iframe 체험이 시작되는 흐름을 첫 화면으로 배치.
  - 상세 체험 화면 개선: `autoplay=true`, `source: youtube`, iframe live 상태를 명시.
  - 올리기 화면 개선: 앱 URL 외에 외부 자료 링크를 최대 3개 첨부하는 UX를 표시하고 YouTube/Instagram/TikTok/GitHub를 예시 플랫폼으로 노출.
  - 리믹스 전용 화면 추가: `N회 리믹스됨` 소셜 증명, 리믹스 CTA, `/upload?remix=...`, 원본 배너, "이 앱의 리믹스들", 원본 창작자 알림과 피드 재노출까지 한 화면에 표시.
  - Studio 화면 개선: YouTube/TikTok/Instagram/Direct 유입 채널 breakdown을 표시.
- `/ux-flow` 문서형 점검판도 같은 내용으로 보강.

### 현재 git 상태
- 브랜치: `main`
- 작업 트리: `.env.local.example`, `.gitignore`, `README.md`, `TASK.md`, `WORKLOG.md`, `package.json`, `scripts/lcp-check.mjs`, `src/app/ux-flow/page.tsx`, `src/app/ux-prototype/page.tsx`, `src/app/settings/SettingsClient.tsx` 수정/추가.

---

## 세션 9 — 2026-05-18

### 완료 내역

#### PRD 재정의 기반 MVP 개발
- MVP 방향을 **Fame loop + Play loop** 중심으로 재정렬.
- 수익배분은 MVP의 전면 약속이 아니라 **WES breakdown/raw export 기반 신뢰 장치**로 후퇴.
- `PRD.md`, `CLAUDE.md`, `TASK.md`를 이 방향에 맞춰 업데이트.

#### P0/P1 기능 구현
- **SNS 딥링크/공유**
  - `@handle/app-slug--postId` 형태 공유 경로 추가 (`src/app/[handle]/[slug]/page.tsx`).
  - `?autoplay=true` 딥링크 진입 시 상세 페이지 iframe 즉시 실행 유지.
  - 포스트별 OG/Twitter metadata fallback 추가 (`src/app/post/[id]/page.tsx`, `public/nuevo-og.svg`).
  - Instagram/TikTok/YouTube/Reddit용 공유 문구 템플릿 추가 (`src/lib/deep-link.js`).
- **업로드/발견성**
  - iframe 호환성 진단 API와 업로드 UI 연결.
  - `posts.tags`, `posts.external_links` 기반 메타데이터 확장.
  - 탐색 검색/카테고리/관련 포스트 로직 고도화.
- **리믹스 Fame loop**
  - 리믹스 소셜 증명, 원본 상세의 리믹스 섹션, 리믹스 CTA 추가.
- **Play retention**
  - Daily playable, 많이 리믹스된 앱, 오래 체험된 앱, 비슷한 앱 더 보기 섹션 추가.
- **저장/공유 실 지표**
  - 저장 수/공유 이벤트 집계 및 creator dashboard 반영.
- **Creator Fame dashboard**
  - `/studio`를 수익보다 체험/시간/반응/댓글/저장/공유/리믹스/유입 채널 중심으로 재정렬.
  - 예상 수익은 보조 카드로 이동.
- **유입 채널 분석**
  - `utm_source`/referrer 기반 `traffic_source` 기록.
  - Instagram/TikTok/YouTube/Reddit/Direct breakdown 표시.
- **WES 신뢰 장치**
  - WES breakdown 표시.
  - 월별 raw WES event CSV export API 추가 (`/api/studio/wes-export`).
  - "예상 수익"과 "확정 수익" 문구 분리.

#### Studio 수익 UX 후퇴
- 정산 요청 패널을 기본 접힘 상태로 변경 (`src/components/studio/PayoutRequestPanel.tsx`).
- 복잡한 파트너 등급 ladder를 `WES 신뢰 정보` 접이식 섹션으로 축소 (`src/app/studio/page.tsx`).
- `TASK.md`의 "실제 출금 UX 전면 노출 축소", "복잡한 파트너 등급 카피 축소" 완료 처리.

#### 모바일 상세 성능 가드
- 일반 상세 진입은 iframe을 즉시 mount하지 않고 "탭해서 바로 해보기"로 대기.
- `?autoplay=true` 딥링크는 기존처럼 즉시 mount/실행.
- 로딩 정책을 `src/lib/interactive-load.js`로 분리하고 테스트 추가.
- `TASK.md`에 "일반 상세 진입 시 iframe 지연 실행으로 모바일 첫 렌더 비용 축소" 완료 처리.
- 남은 항목: 실제 모바일 LCP 3초 이하 측정 QA.

#### 품질 게이트 정리
- React lint blocking error 2건 수정:
  - `notifications/page.tsx`: guest fallback을 state 복사 대신 파생 렌더 값으로 변경.
  - `SavedContext.tsx`: 로그아웃 상태 empty saved map을 파생값으로 처리.
- ESLint warning 6개 제거:
  - leaderboard unused import 제거.
  - profile unused destructuring 제거.
  - PostCard side-effect ternary 핸들러를 명시적 `if/else`로 정리.

### 검증
- `node --test ...` → 37 passed.
- `npx tsc --noEmit --pretty false` → 통과.
- `npm run lint` → warning 없이 통과.
- `npm run build` → 통과.
  - 참고: 샌드박스 내부에서는 Next/Turbopack이 CSS 처리 중 포트 바인딩 제한으로 실패할 수 있음.
  - 승인된 환경에서 실행하면 정상 통과.

### 커밋 (이 세션 — 최신순)
- `06b491d` Clear lint warnings
- `b426898` Improve studio trust and interactive loading
- `e5596a3` Add share routing and studio analytics
- `15123d2` Build MVP fame and play loops

### 현재 git 상태
- 브랜치: `main`
- 원격: `origin/main`과 동기화 완료
- untracked로 남겨둔 로컬 자료:
  - `meeting/`
  - `meeting2/`
  - `prd_v2.md`
- 위 3개는 회의/초안 원본 자료라 커밋하지 않았음.

---

## 세션 8 — 2026-05-16

### 완료 내역

#### 피드 카드 리믹스 버튼 실동작 연결 (`src/components/post/PostCard.tsx`)
- 기존: compact 카드의 리믹스 SmallBtn이 `handleRepost()` 호출 → 로컬 카운터 토글만 (DB 연동 없음)
- 개선: `useDbSocial && remixable` → `/upload?remix={id}` 이동, `useDbSocial && !remixable` → `/post/{id}` 이동, mock 포스트만 기존 로컬 토글 유지
- 효과: 리믹스 가능한 실 포스트에서 compact 카드 리믹스 버튼이 실제 업로드 플로우로 연결됨

#### 업로드 폼 허위 "필수" 라벨 제거 (`src/app/upload/page.tsx`)
- 기존: 썸네일·오디오·이미지 `<FormGroup>` 에 `required` prop → "필수" 뱃지 표시
- 실제로는 `canProceedStep2()` 검증 대상 아님 + 파일 업로드 기능 미구현
- 개선: `required` prop 제거 → 유저에게 잘못된 정보 전달하지 않음

#### 로그인 유저 팔로잉 mock 깜빡임 제거 (`src/contexts/FollowContext.tsx`)
- 기존: `useState(new Set(INITIAL_FOLLOWING))` — auth 확인 전에 minsu/sujin 팔로우 상태가 잠깐 표시됨
- 개선: `useState(new Set())` (빈 Set 시작) + `loading` 의존성 추가
  - `loading=true` 동안 아무것도 세팅하지 않음
  - `loading=false` + `!user` → `INITIAL_FOLLOWING`
  - `loading=false` + `user` → Supabase `follows` 조회
- 패턴: `SavedContext`, `NotificationContext`, `CommentSection`과 동일한 "loading 대기 후 분기" 패턴 통일

#### 알림 시간 이중 "전" 표기 제거 (`src/app/notifications/page.tsx`)
- 기존: `NotifRow`의 regular 타입이 `{notif.time} 전` → `relativeTime()`이 이미 "5분 전" 형태로 반환하므로 "5분 전 전" 표시
- 개선: `{notif.time}` (suffix 제거)
- 주의: system/revenue 알림 행(lines 104, 136)은 원래 올바르게 `{notif.time}` 사용 중 — 건드리지 않음

#### 알림 반응 라벨 통일 (`src/app/notifications/page.tsx`)
- 기존: `weird: '🤔 이상해'`, `wtf: '😱 충격'` — PostCard/PostDetailClient와 불일치
- 개선: `weird: '👽 기괴함'`, `wtf: '❓ 뭐야이건'` — 전체 일관성 확보

#### post-mapper relativeTime 중복 제거 (`src/lib/post-mapper.ts`)
- 기존: 로컬 `relativeTime()` 함수가 `Math.max(1, ...)` 최소 1분 → 방금 올린 포스트가 "1분 전" 표시
- 개선: 로컬 함수 제거 + `import { relativeTime } from './social'` 로 통일
- `social.ts`의 공식: diffSeconds < 60 → "방금", < 60min → "N분 전", < 24h → "N시간 전", else → "N일 전"

### 커밋 (이 세션)
- `9aa4d43` fix: 피드 카드 리믹스 버튼 실동작 연결 및 업로드 필수 라벨 수정
- `406a72f` fix: 로그인 유저에게 가짜 팔로잉 목 상태 깜빡임 제거
- `24e61a1` fix: 알림 시간에 '전' 이중 표기 제거 및 반응 라벨 통일
- `03c90ea` refactor: post-mapper의 relativeTime을 social.ts 공통 함수로 통일

---

## 세션 7 — 2026-05-16

### 완료 내역

#### "저장" DB 퍼시스턴스 (`src/contexts/SavedContext.tsx`)
- 기존: 세션 메모리만 유지 → 새로고침 시 북마크 사라짐
- 개선: 로그인 시 `saved_posts` 테이블에서 저장 목록 로드, toggle 시 실시간 DB 반영 (낙관적 업데이트 + 에러 시 롤백)
- `isUuid(post.id)` 가드: mock 포스트는 여전히 로컬 상태만, 실 UUID 포스트만 DB 기록
- `supabase/schema.sql`, `src/lib/supabase/types.ts`에 `saved_posts` 테이블 추가

**⚠️ Supabase 마이그레이션 필요** — SQL Editor에서 아래 실행:
```sql
create table if not exists public.saved_posts (
  user_id    uuid references public.users(id) on delete cascade not null,
  post_id    uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists saved_posts_user_idx on public.saved_posts(user_id, created_at desc);
alter table public.saved_posts enable row level security;
create policy "saved_posts_select_own" on public.saved_posts for select using (auth.uid() = user_id);
create policy "saved_posts_insert_own" on public.saved_posts for insert with check (auth.uid() = user_id);
create policy "saved_posts_delete_own" on public.saved_posts for delete using (auth.uid() = user_id);
```

#### "좋아요" 탭 실 DB 데이터 연동 (`src/app/profile/[username]/page.tsx`)
- 기존: `mockPosts.filter(p.stats.likes > 1000)` 고정 4개
- 개선: 내 프로필(`isMe`)일 때 `post_reactions` 테이블에서 반응 남긴 포스트 최대 20개 조회
- `getLikedPosts()` 서버 함수 추가, `getProfileData` 반환 타입에 `likedPosts` 추가

---

## 세션 6 — 2026-05-16

### 완료 내역

#### Studio 티어 라벨 버그 수정 (`src/app/studio/page.tsx`)
- `프로 파트너까지` 하드코딩 → `{next.label} 파트너까지` 동적 렌더링 (새싹 유저에게도 정확한 다음 티어 표시)

#### Profile 편집 버튼 연결 (`src/app/profile/[username]/page.tsx`)
- "프로필 편집" `<button>` (아무 동작 없음) → `<Link href="/settings">` 으로 교체

#### Post Detail 헤더 데드 버튼 제거 (`src/app/post/[id]/page.tsx`)
- 헤더의 공유 버튼은 서버 컴포넌트라 동작 불가. PostDetailClient 내에 이미 작동하는 공유 버튼(clipboard + "복사됨" 피드백)이 있으므로 중복 제거.

#### SavedContext 실 DB 포스트 지원 (`src/contexts/SavedContext.tsx`)
- 기존: `savedIds: Set<string>` → mockPosts 필터링 → 실 UUID 포스트는 저장해도 "저장" 탭에 안 나타남
- 개선: `savedMap: Map<string, Post>` → 전체 Post 객체 저장 → `savedPosts: Post[]` 반환
- 연동: `PostCard`, `PostDetailClient` 에서 `toggleSave(post.id)` → `toggleSave(post)` 로 변경
- `ProfileTabsClient`: `mockPosts.filter(...)` 제거 → `useSaved().savedPosts` 직접 사용

---

## 세션 5 — 2026-05-16

### 완료 내역

#### Settings 실사용 버그 수정 (`src/app/settings/SettingsClient.tsx`)
- **프로필 카드 하드코딩 제거**: "민수 @minsu_lab" → `useAuth().profile` 사용 (display_name, handle, avatar_emoji, avatar_bg)
- **로그아웃 연결**: `href="#"` → `signOut()` + `router.push('/login')`
- **Seed 버튼 피드 이동**: 성공 후 상태 메시지만 보여주던 것 → 800ms 뒤 `router.push('/')` 자동 이동. 버튼 텍스트도 "피드로 이동 중..." 으로 바뀜

#### 소셜 UX 버그 수정
- **FollowButton** (`src/components/profile/FollowButton.tsx`): 자기 자신 포스트에도 "팔로우" 버튼이 노출되던 문제 수정. `user?.id === authorId`이면 `null` 반환.
- **CommentSection** (`src/components/post/CommentSection.tsx`): 댓글 입력창 왼쪽 아바타가 😸 하드코딩. `profile?.avatar_emoji` / `profile?.avatar_bg`로 교체.

### 커밋 (이 세션)
- `a4b9451` fix: Settings 실제 유저 프로필 연결 + 로그아웃 + seed 후 피드 자동 이동
- `0545afc` fix: 자기 자신 팔로우 버튼 숨김 + 댓글 입력창 실 아바타 표시

### 이어받자마자 할 일 (우선순위 순)

#### 1. Seed 버튼 E2E QA (10분)
- 배포 URL 접속 → 로그인 → `/settings` → "데모 앱 3개 생성" 클릭
- 성공 시 피드로 자동 이동, 포스트 3개 확인
- 포스트 카드 탭 → 인라인 확장 → "탭해서 바로 해보기" → iframe 실행 확인

#### 2. 소셜 E2E QA (20분)
- 댓글 작성 → 새로고침 후 유지 확인
- 반응(😂🧠) 선택 → 새로고침 후 유지 확인
- 다른 유저 포스트에서 "팔로우" 클릭 → 팔로잉 상태 변경 확인
- 자기 포스트에서 팔로우 버튼 없는지 확인

#### 3. 업로드 E2E QA (10분)
- `/upload` → 외부 앱 URL 입력 → 미리보기 확인 → 게시 → 피드에 표시 확인

#### 4. /studio 체험 수치 확인
- 포스트 iframe 실행 후 `/studio` 방문 → 체험 세션/분 증가 확인

---

## 세션 3 — 2025-05-15

### 완료 내역

#### 소셜 컨텍스트
- **SavedContext** (`src/contexts/SavedContext.tsx`): 북마크 전역 상태. `savedIds: Set<string>`, `toggle(postId)`, `isSaved(postId)`.
- **NotificationContext** (`src/contexts/NotificationContext.tsx`): Supabase `notifications` 테이블 연동. `unreadCount` 실시간 조회, `markAllRead()` DB 업데이트.
- **FollowContext** (`src/contexts/FollowContext.tsx`): Supabase `follows` 테이블 연동. 실 UUID 포스트/유저일 때만 DB write (mock ID는 로컬 상태만).
- **AuthContext** (`src/contexts/AuthContext.tsx`): `supabase.auth.getSession()` → `user` 전역 제공. `useAuth()` 훅.
- `layout.tsx`에 `AuthProvider > NotificationProvider > SavedProvider > FollowProvider` 순서로 감쌈.

#### UI 개선
- **BottomNav** 알림 뱃지: `useNotifications().unreadCount` 연동, 9+ 표시.
- **PostCard**: 북마크 BigBtn 추가 (SavedContext).
- **PostDetailClient**: 북마크 ActionBtn, 댓글 버튼 → 스크롤+포커스(`commentRef`, `commentInputRef`).
- **CommentSection**: 답글 버튼 → `@handle ` 프리필, `inputRef` 외부 제어 지원.
- **ProfileTabsClient**: `isMe` prop → "저장" 탭 조건 표시, `savedIds` 필터링.
- **upload/page.tsx**: Phase 2 "AI로 직접 만들기" BETA 진입점 추가.

#### Supabase 인프라 (T1)
- `src/lib/supabase/client.ts`: `createBrowserClient` 래퍼.
- `src/lib/supabase/server.ts`: `createServerClient` + cookies async 래퍼.
- `src/lib/supabase/types.ts`: 전체 DB 타입 (`users`, `posts`, `notifications`, `experience_events`, `payout_requests`, `follows`, `comments`, `post_reactions`, WES views).
- `supabase/schema.sql`: 전체 DDL + RLS + 신규 유저 트리거.
- `middleware.ts`: 세션 갱신 + 보호된 라우트 리다이렉트 (`/upload`, `/studio`, `/settings`, `/profile/me`).
- `.env.local` 생성 (git 제외, `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Supabase 프로젝트: `oheesbcpxxabkenpqiry.supabase.co`.

#### 인증 (T2–T4)
- `src/app/login/page.tsx`: Google OAuth 로그인 버튼, `?next=` 보존.
- `src/app/auth/callback/route.ts`: OAuth 코드 교환 → 프로필 미완성 시 `/setup?next=...` 리다이렉트.
- `src/app/setup/page.tsx`: handle, displayName, avatarEmoji 입력 → `users` 테이블 upsert → 목적지 복귀.

#### 실 데이터 피드/업로드/리믹스 (T5–T9)
- `src/app/page.tsx`: Supabase `posts` 조회 → `mockPosts` fallback.
- `src/app/explore/page.tsx`: Supabase 포스트 조회 → 검색/태그 클라이언트 필터.
- `src/app/upload/page.tsx`: 게시 버튼 → `posts` insert (author_id, remix_of, remixable).
- 리믹스: `?remix={postId}` → 원본 포스트 DB 조회, `remixable=false` 시 비활성화.
- 리믹스 알림: `src/lib/notification-events.ts` `createNotification()` 헬퍼.

#### 프로필 (T10–T11)
- `src/app/profile/[username]/page.tsx`: handle로 유저 + 포스트 DB 조회. `me`는 auth 유저로 처리.

#### 수익/WES/정산 (MVP 이후 단계이나 스키마/API 완성)
- `src/lib/wes.ts`: WES 상수, 티어 계산 로직.
- `src/lib/payout.ts`: 정산 정책 상수.
- `src/app/api/payout-requests/route.ts`: 월별 정산 요청 POST API.
- `src/app/api/tier-sync/route.ts`: WES 기준 티어 자동 승급 API.
- `src/app/studio/page.tsx`: 로그인 유저 WES 실 데이터, 예상 수익, 정산 패널.
- `src/components/studio/TierSyncNotice.tsx`: 진입 시 tier-sync 호출.
- `src/components/studio/PayoutRequestPanel.tsx`: 정산 요청 UI.

#### Seed 콘텐츠
- `src/lib/demo-seed-posts.ts`: seed 포스트 데이터 3개 (밈 생성기, 챗봇, 판정 게임).
- `src/app/api/seed-demo-posts/route.ts`: 로그인 유저에게 seed 포스트 INSERT API.
- `src/app/settings/SettingsClient.tsx`: "MVP 데모 앱 생성" 버튼 추가.

#### 기타
- `src/lib/social.ts`: `isUuid()`, `countReactions()`, `relativeTime()` 헬퍼.
- `src/lib/safe-next-path.ts`: 안전한 리다이렉트 경로 검증.
- `src/lib/embed-url.ts`: iframe URL 유효성 검사.
- `src/lib/experience-metrics.ts`: 체험 이벤트 집계 헬퍼.
- `src/lib/post-mapper.ts`: DB `PostRow` → 프론트 `Post` 타입 변환.
- `src/components/post/InteractiveDemo.tsx`: iframe onLoad 시 `experience_events` insert, unmount/visibility hidden 시 duration update.

### 품질 게이트 (2025-05-15 기준)
- TypeScript: ✅ 에러 0
- ESLint: ✅ 경고 0
- next build: ✅ 성공

### 커밋
- `443865f` Build working MVP foundation
- `3a64e13` feat: MVP 소셜/알림/인증 기능 완성

---

## 세션 4 — 2026-05-15

### 완료 내역

#### 인증 인프라 활성화
- **Google Cloud Console OAuth 앱 생성 완료**
  - OAuth consent screen (External, app name: `nuevo`)
  - OAuth 2.0 Client ID (Web application)
  - Authorized redirect URI: `https://oheesbcpxxabkenpqiry.supabase.co/auth/v1/callback`
- **Supabase Authentication → Providers → Google 활성화**
  - Client ID / Client Secret 입력 + Save 완료
  - `http://localhost:3000/login`에서 Google 로그인 정상 동작 확인

#### Vercel 배포
- 프로젝트 연결 확인: `nuevo-instagram-test` (orgId `team_zILys31bpEmbDACtdVr6p9Du`)
- production 환경변수 등록:
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://oheesbcpxxabkenpqiry.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (`.env.local`과 동일)
- `vercel --prod --yes` 실행 → 이후 git push로 자동 재배포 트리거
- **최신 배포 (Ready)**: `https://nuevo-instagram-test-oh6jearjh-hole81-2757s-projects.vercel.app` (빌드 32초)
- 이전 배포 inspect: `https://vercel.com/hole81-2757s-projects/nuevo-instagram-test/DgzxH8h9SaiFuBCR4e9xVwVZ6rkS`

#### 로컬 환경 복원
- `.env.local` 재생성 (다른 PC에서 이어받기 위해 — git 제외)
- `npm run dev` 정상 동작 확인 (`.env.local` 인식, 모든 라우트 200 응답)

### 커밋 (이 세션 — 시간순)
- `b0cb2cb` docs: 세션 4 — Google OAuth 활성화 + Vercel 배포 트리거
- `1053006` docs: WORKLOG — Vercel 배포 성공 URL 업데이트
- `e719c1f` fix: turbopack workspace root 명시 (상위 디렉토리 lockfile 워닝 제거)
- `75e6c98` fix: setup 페이지 `user_` 핸들 차단 + upload 검증 깊이 방어
- `1f7d0c3` fix: 존재하지 않는 프로필 핸들에서 mock 유저로 잘못 fallback
- `2edf967` docs: WORKLOG — E2E QA 결과 + 버그 4개 수정 기록
- `4ad03e8` chore: 홈·explore 피드 fallback 시 supabase 에러 로깅 추가
- `3cc93ab` chore: 임시 디버그 엔드포인트 (홈 피드 fallback 원인 진단용)
- `e704fe1` fix: 홈 피드 mock fallback 원인 = Vercel env URL의 BOM 문자
- `9c98370` docs: 배포 QA 섹션에 검증 완료 항목 체크

### E2E QA로 발견·수정한 버그 (배포 URL 검증 중)
1. **`/setup` 무한 리다이렉트 루프 가능성**: 유저가 `user_xxx` 핸들을 직접 고르면 콜백이 미완성으로 판정. 클라이언트 검증 추가.
2. **업로드 시 검증 우회 가능**: `validateEmbedUrl().ok`를 체크 안 하고 `normalizedUrl`만 사용. `handlePublish`에 가드 추가.
3. **존재하지 않는 프로필 → 민수 표시**: `?? mockAuthors.minsu` 강제 fallback. notFound()로 변경.
4. **Turbopack 워크스페이스 root 워닝**: 부모 디렉토리 lockfile 오인. `next.config.ts`에 root 명시.

### 검증 통과한 항목 (배포 URL 기준)
- `/`, `/explore`, `/onboarding`, `/leaderboard`, `/brand` 페이지 렌더링 정상
- 미들웨어 보호 라우트 (`/upload`, `/studio`, `/settings`) → 307 → `/login?next=...`
- API 라우트 (`/api/tier-sync`, `/api/payout-requests`, `/api/seed-demo-posts`) 미인증 → 401
- 잘못된 post ID → 404, 잘못된 demo ID → 404
- 빌드/lint/tsc 모두 통과

### Vercel 환경변수 BOM 이슈 (중요 — 재발 방지)
- 증상: 홈/explore 페이지가 항상 mock 데이터로 fallback. DB는 비어있는데 mock이 나옴.
- 원인: PowerShell에서 `"value" | vercel env add ...` 형태로 파이프 입력하면
        문자열 앞에 UTF-16 BOM (`﻿`, 0xFEFF, 65279)이 붙는다.
        Supabase URL이 `﻿https://...`가 되어 `fetch()`가 ByteString 변환에서 실패.
- 해결: `vercel env add NAME production --value "..." --yes` 형태로 직접 인자 전달.
- 진단 도구: 임시로 `/api/debug-feed` 엔드포인트를 만들어 `urlPrefix`와 에러 메시지를 노출.
            이 슬라이스에서 BOM이 보였음. 이후 삭제.

### 마지막 검증 결과 (BOM 수정 후)
- `/api/debug-feed`: `urlPrefix: "https://..."` (BOM 없음), `query.ok: true`, `dataLength: 0`
- 홈 페이지: "아직 올라온 앱이 없어요" + "첫 앱 올리기" CTA 정상 표시

---

## 🔁 핸드오버 (다른 PC에서 이어받을 때 가장 먼저 읽기)

### 현재 상태 한 줄 요약
**MVP 코어 플로우 + Fame/Play loop + Studio Fame dashboard + 공유 딥링크/OG + WES raw export까지 구현 및 `origin/main`에 push 완료. 다음 작업은 N1 모바일 LCP 실측 QA 또는 Phase 2로 미룬 항목 정리.**

### 마지막 세션 종료 시점 (2026-05-18, 세션 9)
- ✅ Google 로그인 → /setup → 홈 이동
- ✅ 피드/탐색/프로필: 실 DB 포스트 로드
- ✅ 댓글: DB 저장, 낙관적 업데이트, 롤백
- ✅ 반응 (funny/weird/genius/wtf): DB upsert
- ✅ 팔로우: DB 저장 + 알림 생성, 자기 자신 버튼 숨김
- ✅ 알림: DB 조회, mark all read, 시간 표기 통일
- ✅ 저장 (saved_posts): DB 퍼시스턴스
- ✅ 업로드: DB insert, remix_of lineage
- ✅ 스튜디오: 실 WES 수치 조회
- ✅ Settings: 실제 유저 프로필, 로그아웃, seed 버튼
- ✅ FollowContext: 로그인 유저에게 mock 팔로잉 깜빡임 제거
- ✅ 리믹스 버튼 (compact card): `/upload?remix=` 실 연결
- ✅ relativeTime: `social.ts` 단일 소스로 통일 ("방금" 지원)
- ✅ 공유 딥링크: `@handle/app-slug--postId` → `/post/{id}` redirect
- ✅ 포스트 상세 OG/Twitter metadata fallback
- ✅ 일반 상세 iframe 지연 실행 + `?autoplay=true` 즉시 실행
- ✅ Studio Fame dashboard: 체험/시간/반응/댓글/저장/공유/리믹스/유입 채널
- ✅ WES breakdown + raw CSV export
- ✅ 정산/티어 UX 전면 노출 축소
- ✅ lint/tsc/test/build 품질 게이트 통과

### 알려진 MVP 한계 (의도적 미구현)
- **좋아요 버튼**: `post_likes` 테이블 없음, 로컬 토글만 (세션 내 유지)
- **오디오/이미지 포스트**: 실제 파일 미지원, 제목+설명만 저장
- **피드 50개 제한**, 실시간 업데이트 없음
- **온보딩 추천 창작자**: mock 계정만, 팔로우 미지속
- **설정 토글**: UI only, 백엔드 미연동

### 이어받자마자 할 일 (우선순위 순)

#### 1. 로컬 환경 복원 (5분)
```bash
git clone https://github.com/hole81-droid/nuevo-mvp.git
cd nuevo-mvp
npm install
# .env.local 생성 (Supabase URL/ANON KEY는 기존 로컬 또는 Vercel 환경변수 참고)
npm run dev
```

#### 2. 다음 개선 후보 (우선순위 순)
- **N1 모바일 LCP QA**: 실제 모바일/프로덕션에서 상세 페이지 LCP 3초 이하 측정. 일반 진입은 iframe 지연 실행, autoplay 딥링크는 즉시 실행이므로 두 케이스를 나눠 측정.
- **Phase 2 제외 항목 정리**: 브랜드 셀프서브 마켓플레이스, AI 앱 생성기 항목을 문서/태스크에서 명시적으로 Phase 2 유지 처리.
- **좋아요 DB 퍼시스턴스**: `post_likes(post_id, user_id)` 테이블 추가 + RLS + API.
- **피드 무한 스크롤**: 50개 제한 → cursor-based pagination.
- **실시간 알림**: Supabase Realtime subscription.
- **Phase 2 진입점**: `/create` 페이지 활성화 (AI 창작 플로우).

#### 3. 현재 남은 TASK 핵심
- `N1. 앱 상세 딥링크 라우트 정리` 중 **모바일 LCP 3초 이하 목표 QA**만 미완료.
- Supabase Auth Google OAuth 설정/커스텀 도메인 연결은 대시보드/운영 작업.
- Phase 2 "만들기" 관련 항목은 의도적으로 MVP 이후로 남김.

### 알려진 잠재 이슈 (예방적 메모)

#### 1. PowerShell + Vercel CLI BOM 함정
- `"value" | vercel env add` 절대 금지. 항상 `vercel env add NAME env --value "..." --yes` 사용.
- WSL/bash에서는 파이프 OK. PowerShell만 문제.

#### 2. `.env.local`은 git 제외
- 다른 PC에서 시작 시 반드시 직접 만들어야 함. 형식은 하단 "환경 정보" 참조.

#### 3. Vercel 배포 URL 패턴
- production alias: `https://nuevo-instagram-test.vercel.app` (이게 안정적)
- 매 deploy마다 unique URL도 추가 생성됨 (`-xxxxx-hole81-...`).
- Supabase Redirect URL에 wildcard `https://nuevo-instagram-test-*.vercel.app/auth/callback`도 등록 추천.

#### 4. 로컬 untracked 자료
- 현재 작업 PC에는 `meeting/`, `meeting2/`, `prd_v2.md`가 untracked로 남아 있음.
- 다른 PC에서 새로 clone하면 이 자료는 내려오지 않음.
- 이 자료가 필요하면 별도로 복사하거나, 원본 transcript/customer insights 위치에서 다시 가져올 것.

---

## 환경 정보

| 항목 | 값 |
|------|-----|
| Supabase 프로젝트 URL | `https://oheesbcpxxabkenpqiry.supabase.co` |
| Supabase OAuth callback | `https://oheesbcpxxabkenpqiry.supabase.co/auth/v1/callback` |
| GitHub repo | `https://github.com/hole81-droid/nuevo-instagram` |
| 브랜치 | `main` |
| Node 버전 | 프로젝트 루트 `.nvmrc` 또는 `package.json` engines 참고 |
| 패키지 매니저 | npm |
| Vercel project | `nuevo-instagram-test` (org `hole81-2757s-projects`) |
| Vercel production alias (안정) | `https://nuevo-instagram-test.vercel.app` |
| Google OAuth | ✅ 활성화 완료 (Supabase Authentication → Providers → Google) |
| Supabase Redirect URLs | ✅ 등록 완료 (localhost + Vercel 도메인) |
| Vercel Deployment Protection | ✅ 해제 완료 (외부 접근 가능) |

### 로컬 개발 시작
```bash
git clone https://github.com/hole81-droid/nuevo-instagram.git
cd nuevo-instagram
npm install
# .env.local 파일 생성 (별도 전달 필요 — git에 포함 안 됨)
npm run dev
```

### .env.local 형식
```
NEXT_PUBLIC_SUPABASE_URL=https://oheesbcpxxabkenpqiry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<키값>
```

> 키값은 Supabase 대시보드 → Project Settings → API → `anon public` 키 참고.
# nuevo 작업 로그

## Session 31 - 2026-05-18

### 다음 단계 개발: QA target link bundle

- `/qa`에서 현재 QA Target 기준의 실행 URL 묶음을 Markdown으로 복사/다운로드할 수 있게 했다.
  - 실기기 QA 전에 YouTube/Instagram/TikTok/LCP/WES/visual QA 링크만 빠르게 폰이나 메신저로 보낼 수 있다.
- `buildQaTargetLinksMarkdown()`를 추가했다.
  - 각 항목 title, area, runnable target URL을 compact Markdown list로 만든다.
- README/TASK/WORKLOG에 target-link bundle 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 30 - 2026-05-18

### 다음 단계 개발: QA Target localStorage 저장

- `/qa` QA Target 입력값을 브라우저 localStorage에 저장하도록 했다.
  - Base URL, handle, app slug, post ID, month가 새로고침 후에도 유지된다.
  - 다른 탭/브라우저 storage 이벤트에도 동기화된다.
- `getDefaultMvpQaTarget()`와 `normalizeMvpQaTarget()`를 추가했다.
  - 저장된 target 값이 일부 비어 있거나 오래된 형태여도 안전한 기본값으로 보정한다.
  - handle은 `@` prefix를 정규화하고 base URL trailing slash를 제거한다.
- README/TASK/WORKLOG에 QA target local persistence를 반영했다.

### 검증

- `node --test src\lib\mvp-qa-checklist.test.mjs` RED/GREEN 확인.
- `npm run lint -- --format stylish` 통과.
- `npx tsc --noEmit --pretty false` 통과.

## Session 29 - 2026-05-18

### 다음 단계 개발: QA report target 복원

- `/qa` JSON report import가 진행상태뿐 아니라 saved QA Target 값도 복원하도록 했다.
  - 다른 브라우저/PC에서 리포트를 붙여넣으면 Base URL, handle, app slug, post ID, month가 함께 복원된다.
  - month 복원 시 WES CSV import month 입력도 같은 값으로 동기화한다.
- `importQaProgressReport()`가 report `target` 객체를 반환하도록 확장했다.
- README/TASK/WORKLOG에 target 복원 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 28 - 2026-05-18

### 다음 단계 개발: QA 리포트 target URL 포함

- `/qa` JSON 리포트에 현재 QA Target 값과 항목별 `targetUrl`을 포함했다.
- `/qa` Markdown 리포트 표에 Target URL 컬럼을 추가했다.
  - QA 결과 공유 시 어떤 실제 URL로 검증했는지 evidence note와 함께 남는다.
- `buildQaProgressReport()`와 `buildQaMarkdownReport()`가 target 옵션을 받도록 확장했다.
- README/TASK/WORKLOG에 target URL 포함 리포트 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 27 - 2026-05-18

### 다음 단계 개발: QA target URL 생성

- `/qa`에 QA Target 입력을 추가했다.
  - Base URL, creator handle, app slug, post ID, month를 입력하면 각 체크리스트 route placeholder가 실제 실행 URL로 바뀐다.
  - 실기기 딥링크, 모바일 LCP, WES CSV export, 시각 QA를 같은 target 기준으로 바로 열 수 있다.
- `buildMvpQaTargetUrl()`를 추가했다.
  - `/@creator/app-slug--postId`, `/post/[id]`, `YYYY-MM` placeholder를 치환한다.
  - base URL trailing slash를 정리하고 handle의 `@` 중복을 방지한다.
- README/TASK/WORKLOG에 runnable target URL 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-checklist.test.mjs` RED/GREEN 확인.

## Session 26 - 2026-05-18

### 다음 단계 개발: WES CSV QA import

- `/qa`에서 live WES CSV 원문과 `YYYY-MM` month를 붙여넣어 WES QA 항목에 반영할 수 있게 했다.
  - CSV 컬럼 검증 결과는 `wes-live-columns` 항목으로 매핑한다.
  - `occurred_at` month 범위 검증 결과는 `wes-live-month` 항목으로 매핑한다.
  - row count, month, 컬럼/month 판정, 실패 사유를 evidence note로 저장한다.
- `importWesExportCsvQa()`를 추가하고 기존 `validateWesExportCsv()`를 재사용했다.
- README/TASK/WORKLOG에 WES CSV import 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 25 - 2026-05-18

### 다음 단계 개발: LCP QA 결과 import

- `/qa`에서 `npm run qa:lcp` 출력 JSON을 붙여넣어 모바일 LCP 항목에 반영할 수 있게 했다.
  - 일반 `/post/[id]` 측정 결과는 `lcp-detail` 항목으로 매핑한다.
  - `?autoplay=true` 측정 결과는 `lcp-autoplay` 항목으로 매핑한다.
  - LCP 값, target, network failure, runtime exception, autoplay iframe mount 여부, 실패 사유를 evidence note로 저장한다.
- `importMobileLcpQaReport()`를 추가했다.
- README/TASK/WORKLOG에 LCP JSON import 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 24 - 2026-05-18

### 다음 단계 개발: QA 실행 런북

- `/qa` 체크리스트 항목마다 실행 절차, evidence hint, PASS 기준을 추가했다.
  - 실기기 딥링크, 모바일 LCP, live WES export, 시각 QA를 다음 작업자가 바로 수행할 수 있게 했다.
  - 증거 메모 placeholder가 항목별 evidence hint를 사용하도록 바꿨다.
- `/qa` UI에 Runbook 섹션과 PASS 기준 박스를 추가했다.
- Markdown QA 리포트 표에 PASS 기준 컬럼을 포함했다.
- README/TASK/WORKLOG에 QA runbook 기능을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-checklist.test.mjs` RED/GREEN 확인.
- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 23 - 2026-05-18

### 다음 단계 개발: QA 증거 누락 필터

- `/qa`에 `evidence` 필터를 추가했다.
  - PASS 상태지만 evidence-required 메모가 비어 있는 항목만 보여준다.
  - release gate가 BLOCKED일 때 어떤 항목 때문에 막혔는지 빠르게 찾기 위한 기능이다.
- `filterQaItemsByStatus(..., 'evidence-missing')`를 추가했다.
- README/TASK/WORKLOG에 evidence-missing filter를 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 22 - 2026-05-18

### 다음 단계 개발: Markdown QA 리포트

- `buildQaMarkdownReport()`를 추가했다.
  - release gate, summary, 항목별 status/note를 Markdown 표로 출력한다.
  - GitHub issue, Slack, 작업로그에 바로 붙일 수 있는 사람 읽기용 리포트다.
- `/qa`에 Markdown 복사와 `.md` 다운로드 버튼을 추가했다.
- README/TASK/WORKLOG에 Markdown report 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 21 - 2026-05-18

### 다음 단계 개발: QA 증거 메모 gate

- 실기기/LCP/live WES/시각 QA 항목에 `evidenceRequired`를 추가했다.
- PASS 상태여도 증거 메모가 비어 있으면 release gate가 `MVP QA BLOCKED`로 남도록 했다.
- `/qa` UI에 `EVIDENCE REQUIRED` 배지와 증거 메모 placeholder를 추가했다.
- README/TASK/WORKLOG에 evidence-required 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 20 - 2026-05-18

### 다음 단계 개발: QA 리포트 import

- `/qa`에서 다운로드/복사한 JSON 리포트를 다시 붙여넣어 진행상태를 복원할 수 있게 했다.
- `importQaProgressReport()`를 추가했다.
  - 현재 체크리스트에 없는 항목 id는 무시한다.
  - 알 수 없는 status는 `pending`으로 안전하게 처리한다.
  - 잘못된 JSON은 기존 진행상태를 덮어쓰지 않고 오류 메시지를 반환한다.
- README/TASK/WORKLOG에 import 가능한 QA report 흐름을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.

## Session 19 - 2026-05-18

### 다음 단계 5개 연속 개발

1. QA 진행상태 리포트 헬퍼를 추가했다.
   - `buildQaProgressReport()`가 summary, item status, note를 포함한 portable report를 만든다.
2. QA 상태 필터를 추가했다.
   - `/qa`에서 all / pending / pass / fail 필터로 항목을 좁혀 볼 수 있다.
3. MVP release gate 판정을 추가했다.
   - FAIL 또는 PENDING이 남아 있으면 `MVP QA BLOCKED`, 모두 PASS면 `MVP QA READY`를 보여준다.
4. QA 리포트 액션을 추가했다.
   - 현재 진행상태를 클립보드에 복사하거나 JSON 파일로 다운로드할 수 있다.
5. 문서와 작업로그를 갱신했다.
   - README/TASK에 `/qa`의 실행형 기능을 반영했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.
- `npm run lint -- --format stylish` 통과.
- `npx tsc --noEmit --pretty false` 통과.

## Session 18 - 2026-05-18

### 다음 단계 개발: QA 실행판 진행상태 저장

- `/qa`를 정적 체크리스트에서 실제 실행 도구로 개선했다.
  - 각 QA 항목에 PASS / FAIL / PENDING 버튼 추가.
  - 항목별 결과 메모 입력 추가.
  - 진행률, PASS, FAIL, PENDING, TOTAL 카운터 표시.
  - 브라우저 `localStorage`에 진행상태를 저장한다.
- React 19 lint 규칙에 맞춰 `useSyncExternalStore`로 localStorage snapshot을 구독하도록 구현했다.

### 검증

- `node --test src\lib\mvp-qa-progress.test.mjs` RED/GREEN 확인.
- `npm run lint` 통과.
- `npx tsc --noEmit --pretty false` 통과.

## Session 17 - 2026-05-18

### 다음 단계 개발: MVP QA 실행판

- 실제 기기에서 닫아야 하는 남은 QA를 앱 안에서 바로 실행할 수 있도록 `/qa` 페이지를 추가했다.
- QA 체크리스트 데이터는 `src/lib/mvp-qa-checklist.js`로 분리했다.
  - YouTube/Instagram/TikTok 딥링크 진입.
  - 일반 상세/autoplay 상세 모바일 LCP.
  - live WES CSV 컬럼/month 필터.
  - `/ux-prototype`, `/ux-flow` 시각 QA.
- `/settings` MVP 테스트 섹션에 `MVP QA 실행판` 링크를 추가했다.

### 검증

- `node --test src\lib\mvp-qa-checklist.test.mjs` RED/GREEN 확인.

## Session 16 - 2026-05-18

### 다음 단계 개발: WES CSV export 자동 검증

- WES CSV export가 기대 컬럼을 유지하는지 자동 검증하는 `validateWesExportCsv()`를 추가했다.
- 요청 월(`YYYY-MM`) 밖의 `occurred_at` 행을 실패로 판정한다.
- 데이터가 없는 CSV도 헤더만 올바르면 유효한 export로 판정한다.
- live Supabase 데이터로 실제 다운로드 파일을 확인하는 QA는 아직 남아 있다.

### 검증

- `node --test src\lib\wes-export.test.mjs` RED/GREEN 확인.

## Session 15 - 2026-05-18

### 다음 단계 개발: 모바일 LCP QA 판정 출력

- `npm run qa:lcp` 결과를 사람이 수동 해석하지 않아도 되도록 pass/fail summary를 추가했다.
  - 3초 LCP target 초과 여부.
  - 네트워크 실패/런타임 예외 여부.
  - `?autoplay=true` 딥링크 진입에서 iframe이 즉시 mount 되었는지 여부.
- `src/lib/mobile-qa-report.js`와 테스트를 추가했다.
- `scripts/lcp-check.mjs`가 `summary`와 `targetMs`를 JSON 출력에 포함하도록 연결했다.
- README/TASK에 LCP QA 출력 방식과 남은 실제 기기 QA 범위를 정리했다.

### 검증

- `node --test src\lib\mobile-qa-report.test.mjs` RED/GREEN 확인.

## Session 14 - 2026-05-18

### 다음 단계 3개 동시 진행

- `/explore` empty/no-result UX를 정리했다.
  - 전체 피드가 비었을 때는 `/upload` CTA를 보여준다.
  - 검색 결과 없음, 카테고리 결과 없음, 태그 결과 없음 상태는 각각 복구 버튼을 제공한다.
  - `src/lib/explore-empty-state.js`와 테스트를 추가했다.
- OAuth callback 실패 상태를 로그인 화면까지 전달한다.
  - `missing_code`, `exchange_failed`, `missing_user` reason을 `/login?auth_error=...&next=...`로 전달한다.
  - 로그인 화면에서 사용자가 다시 시도할 수 있는 한국어 안내를 보여준다.
  - `src/lib/auth-callback-redirect.js`와 테스트를 추가했다.
- Studio WES CSV export의 month 파라미터를 안정화했다.
  - `YYYY-MM` 형식만 허용하고, 누락/오염된 값은 현재 월 fallback으로 처리한다.
  - 비어 있는 CSV 응답도 동일한 month fallback 및 header 정책을 따른다.
  - `src/lib/wes-export-month.js`와 테스트를 추가했다.

### 이번 커밋에 함께 포함된 이전 진행분

- `/upload` 외부 자료 링크 UX에 YouTube, Instagram, TikTok, GitHub 예시를 명확히 반영했다.
- URL 검사 API/헬퍼 메시지를 한국어로 읽기 쉽게 정리했다.
- `/upload?remix=...` 상태 판단을 `upload-remix-state`로 분리하고, 원본 없음/삭제/리믹스 금지 상태에서 다음 단계와 게시를 차단한다.

### 검증

- `npm run lint` 통과.
- `npx tsc --noEmit --pretty false` 통과.
- `node --test src\lib\*.test.mjs` 통과, 51 tests.
- placeholder Supabase env로 `npm run build` 통과.

### 다음 PC 인수인계

- 최신 `main`을 pull한 뒤 `.env.local`을 준비하고 `npm run dev`를 실행하면 된다.
- 아직 실제 모바일 인앱 브라우저 LCP/딥링크 QA와 live data 기반 WES export 확인은 남아 있다.

## Session 13 - 2026-05-18

### 다음 단계 개발: 리믹스 차단/누락 상태 UX

- `/upload?remix=...` 상태 판단을 `src/lib/upload-remix-state.js`로 분리.
- `src/lib/upload-remix-state.test.mjs` 추가.
  - remix param 없음: 일반 업로드
  - 잘못된 remix id: 차단
  - 원본 조회 중: 차단/대기
  - 원본 삭제/누락: 차단
  - `remixable=false`: 차단
  - 정상 원본: 리믹스 허용
  - mock demo 원본: non-UUID여도 원본이 있으면 허용
- `/upload`에 리믹스 상태를 연결.
  - 원본 조회 중/누락/차단 배너를 표시.
  - 차단 상태에서는 다음 단계 이동과 게시를 막고 상태 메시지를 보여준다.
  - invalid/missing 상태에서도 일반 업로드로 조용히 넘어가지 않도록 변경.
- `TASK.md`에서 리믹스 QA 항목 완료 처리.

### 검증

- `node --test src\lib\upload-remix-state.test.mjs` RED/GREEN 확인.
- `npm run lint` 통과.
- `npx tsc --noEmit --pretty false` 통과.
- `node --test src\lib\*.test.mjs` 통과, 44 tests.
- placeholder env로 `npm run build` 통과.

### 다음 후보

- 실제 모바일/인앱 브라우저에서 딥링크 + iframe 실행 QA.
- `/explore` empty/no-result 상태 UX 점검.

---

## Session 12 - 2026-05-18

### 다음 단계 개발: 업로드 외부 링크/URL 검사 UX

- `/upload`의 외부 자료 링크 입력 영역을 MVP 프로토타입과 맞췄다.
  - YouTube, Instagram, TikTok, GitHub 예시 버튼 추가.
  - 예시 버튼은 가짜 URL을 저장하지 않고 라벨만 채워 실제 URL 입력을 유도한다.
  - 외부 링크 설명 문구를 “제작 맥락/데모 영상/코드 저장소” 중심으로 보강.
- URL 검사 관련 문구를 읽히는 한국어로 정리했다.
  - `src/lib/embed-url.ts`
  - `src/lib/embed-check.js`
  - `src/app/api/check-url/route.ts`
- `src/lib/embed-check.test.mjs`에 한국어 label/message 기대값을 추가했다.
- `TASK.md`에서 업로드 외부 링크 production copy와 URL check copy 항목을 완료 처리.

### 검증

- `npm run lint` 통과.
- `npx tsc --noEmit --pretty false` 통과.
- `node --test src\lib\*.test.mjs` 통과, 37 tests.
- placeholder env로 `npm run build` 통과.

### 다음 후보

- 리믹스 QA: `remixable=false`, 원본 없음, 삭제된 원본 상태의 안내 문구와 차단 UX 확인.
- 실제 모바일/인앱 브라우저에서 딥링크 + iframe 실행 QA.

---

## 다른 PC 인수인계 요약 - 2026-05-18

### 저장소

- Remote: `https://github.com/hole81-droid/nuevo-mvp`
- Branch: `main`
- 이번 세션 목표: 현재 MVP 앱과 UX 상황판/프로토타입의 정합성을 맞추고, PRD/Spec/Task/Design 문서를 읽히는 형태로 정리.

### 이번에 반영한 핵심 변경

- `/ux-flow`: 현재 MVP 앱 구현 상태와 프로토타입 반영 상태를 비교하는 UX Flow 점검판.
- `/ux-prototype`: 외부 딥링크, 바로 체험, 피드 발견, 외부 자료 링크 첨부, 리믹스, Fame Studio, 운영 점검을 보는 화면형 모바일 프로토타입.
- `PRD.md`: MVP PRD를 Fame loop + Play loop 기준으로 재정리.
- `PRD_V3.md`: 구현 지향 Product Spec으로 정리.
- `TASK.md`: 현재 MVP 완료/남은 QA 항목 기준으로 재정리.
- `Design Ref.md`: UI/UX 디자인 기준 문서로 재정리.
- `README.md`: 라우트, UX 점검 페이지, 검증 명령 정리.
- `scripts/lcp-check.mjs`: 모바일 LCP 측정용 스크립트 추가.
- `.env.local.example`: Supabase 공개 환경변수 템플릿 추가.

### 검증 완료

- `npm run lint` 통과.
- `npx tsc --noEmit --pretty false` 통과.
- `node --test src\lib\*.test.mjs` 통과, 37 tests.
- placeholder env로 `npm run build` 통과.
- 최신 빌드 서버 확인: `http://127.0.0.1:3002/ux-prototype`, `http://127.0.0.1:3002/ux-flow` 모두 200.

### 다음 PC에서 바로 할 일

```bash
git pull origin main
npm install
cp .env.local.example .env.local
npm run dev
```

Supabase 실제 값은 `.env.local`에 별도로 채워야 한다. `.env.local`은 git에 포함하지 않는다.

### 남은 MVP QA

- 실제 모바일 또는 정상 Chrome 환경에서 `/post/[id]`, `/post/[id]?autoplay=true` LCP 3초 목표 실측.
- Instagram/TikTok/YouTube 인앱 브라우저에서 딥링크 및 iframe 실행 확인.
- live Supabase 스키마가 `posts.tags`, `posts.external_links`, traffic source, remix notification 필드를 모두 반영하는지 확인.

---

## Session 11 - 2026-05-18

### UX/PRD/Spec 정합성 점검

- 현재 MVP 앱과 내부 UX 점검판을 비교했다.
  - 딥링크 즉시 체험: `src/lib/deep-link.js`, `src/app/[handle]/[slug]/page.tsx`, `src/app/post/[id]/page.tsx`, `InteractiveDemo` 기준으로 구현 확인.
  - 외부 자료 링크 첨부: `/upload`, `posts.external_links`, `normalizeExternalLinks`, PostCard/PostDetail 노출 기준으로 구현 확인.
  - 리믹스 UX: `/upload?remix=`, `posts.remix_of`, `remixable`, 리믹스 카운트, 원본 상세의 리믹스 목록, 알림 흐름 기준으로 구현 확인.
  - Fame/WES: `/studio`, traffic source, WES breakdown, `/api/studio/wes-export` 기준으로 구현 확인.
- `/ux-flow`를 깨진 문구 없이 다시 작성하고, 현재 앱 구현 상태와 프로토타입 반영 상태를 나란히 비교하도록 개선.
- `/ux-prototype`를 화면형 모바일 목업으로 다시 작성하고, 외부 딥링크, 즉시 체험, 업로드 외부 링크, 리믹스, Studio, 설정 점검 흐름을 핵심 화면으로 구성.
- `PRD.md`를 읽히는 MVP PRD로 재작성.
- `PRD_V3.md`를 구현 지향 Product Spec으로 재작성.
- `Design Ref.md`를 UI/UX 기준 문서로 재작성.
- `TASK.md`를 현재 MVP 체크리스트로 재작성하고 누락 QA 항목을 추가.
- `README.md`를 현재 라우트, UX 점검 페이지, 검증 명령 기준으로 정리.

### 남은 확인 항목

- 실제 모바일 또는 정상 Chrome 환경에서 `/post/[id]`, `/post/[id]?autoplay=true` LCP 3초 목표 실측.
- Instagram/TikTok/YouTube 인앱 브라우저에서 딥링크와 iframe 실행 확인.
- live Supabase 스키마가 `posts.tags`, `posts.external_links`, traffic source, remix notification 필드를 모두 반영하는지 확인.

---

# 이전 작업 로그 원문
