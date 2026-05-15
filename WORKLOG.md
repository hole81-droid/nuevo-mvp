# nuevo — 작업 로그

다른 PC로 이어받아 작업할 수 있도록 세션별 작업 내용을 기록한다.

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
**코드 완료 + 배포 완료. Settings 하드코딩 제거, 로그아웃/seed 버튼 정상화, 팔로우 자기 자신 버그 수정까지 완료. 남은 건 배포 URL에서 E2E QA (seed→피드→iframe→댓글→반응→업로드) 뿐.**

### 마지막 세션 종료 시점 (2026-05-16)
- ✅ Google 로그인 → /setup → 홈 이동 (세션 4에서 검증 완료)
- ✅ Settings 프로필 → 실제 로그인 유저로 표시
- ✅ 로그아웃 → signOut() 연결
- ✅ Seed 버튼 → 성공 시 피드 자동 이동
- ✅ FollowButton → 자기 자신 글에 숨김
- ✅ 댓글 입력창 아바타 → 실 유저 아바타
- 🟡 **E2E QA 미완** — 배포 URL에서 직접 인터랙션 테스트 필요

### 이어받자마자 할 일 (우선순위 순)

#### 1. 로컬 환경 복원 (5분)
```bash
git clone https://github.com/hole81-droid/nuevo-instagram.git
cd nuevo-instagram
npm install
# .env.local 생성 (아래 "환경 정보" 섹션의 ANON KEY 사용)
npm run dev
```

#### 2. Seed 버튼 디버깅 (10분)
- 배포 URL `/settings` 접속 → "데모 앱 3개 생성" 버튼 클릭
- **브라우저 개발자 도구 → Network 탭** 열어두고 클릭
- `/api/seed-demo-posts` 요청의 응답 코드와 body 확인
- 또는 버튼 아래에 작은 회색 글씨로 나오는 상태 메시지 확인
- 가능성:
  - **201**: 성공 → 홈으로 가서 `Cmd+Shift+R` 강제 새로고침 (캐시 무시)
  - **401**: 세션 만료. 다시 로그인
  - **500 + RLS 에러**: posts 테이블 RLS 정책 문제. `supabase/schema.sql` 158라인 확인
  - **응답은 OK인데 피드 빔**: 홈 페이지 `force-dynamic`이지만 클라이언트 사이드 캐싱일 수 있음

#### 3. 나머지 E2E QA (각 5분씩)
- [ ] Seed 포스트 생성 후 피드에 표시 → 카드 탭 → 인라인 확장 → iframe 실행
- [ ] 카드에서 댓글 작성 → 새로고침 후 유지
- [ ] 반응(❤️🔥) 선택 → 새로고침 후 유지
- [ ] 다른 유저(seed 포스트는 같은 author지만) 카드에서 리믹스 → 알림 확인
- [ ] `/upload`에서 외부 앱 URL 직접 입력 → 게시 → 피드 등장
- [ ] `/studio`에서 체험 수치 표시 확인
- [ ] 모바일 브라우저(390px) 또는 Chrome DevTools 모바일 모드에서 전체 흐름 테스트

### 알려진 잠재 이슈 (예방적 메모)

#### 1. `/settings` 페이지 상단 프로필 카드가 하드코딩
- `src/app/settings/SettingsClient.tsx` 134-148라인이 `민수 @minsu_lab`로 고정.
- 로그인한 실제 유저로 표시되도록 `AuthContext`의 `profile` 사용으로 변경 필요.
- Priority: Low (디자인 데모용으로 보이지만 production에선 혼동 유발).

#### 2. PowerShell + Vercel CLI BOM 함정
- `"value" | vercel env add` 절대 금지. 항상 `vercel env add NAME env --value "..." --yes` 사용.
- WSL/bash에서는 파이프 OK. PowerShell만 문제.

#### 3. `.env.local`은 git 제외
- 다른 PC에서 시작 시 반드시 직접 만들어야 함. 형식은 하단 "환경 정보" 참조.

#### 4. Vercel 배포 URL 패턴
- production alias: `https://nuevo-instagram-test.vercel.app` (이게 안정적)
- 매 deploy마다 unique URL도 추가 생성됨 (`-xxxxx-hole81-...`).
- Supabase Redirect URL에 wildcard `https://nuevo-instagram-test-*.vercel.app/auth/callback`도 등록 추천.

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
