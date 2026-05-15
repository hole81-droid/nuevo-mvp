# nuevo — 작업 로그

다른 PC로 이어받아 작업할 수 있도록 세션별 작업 내용을 기록한다.

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

### 커밋 (이 세션)
- `b0cb2cb` docs: 세션 4 — Google OAuth 활성화 + Vercel 배포 트리거
- `1053006` docs: WORKLOG — Vercel 배포 성공 URL 업데이트
- `e719c1f` fix: turbopack workspace root 명시 (상위 디렉토리 lockfile 워닝 제거)
- `75e6c98` fix: setup 페이지 `user_` 핸들 차단 + upload 검증 깊이 방어
- `1f7d0c3` fix: 존재하지 않는 프로필 핸들에서 mock 유저로 잘못 fallback

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

---

## 다음에 할 일 (배포 완료 후 — T13 OAuth 콜백 URL 등록 + E2E QA)

### 1. Vercel 배포 URL 확정 후 OAuth 리다이렉트 등록 (수동)

Vercel 배포가 완료되면 production URL이 확정된다. 그 후:

1. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client ID
   - Authorized redirect URIs에 **추가 등록 불필요** (Supabase가 중계)
2. **Supabase 대시보드** → Authentication → URL Configuration
   - **Site URL**: `https://nuevo-instagram-test-ad08xanlk-hole81-2757s-projects.vercel.app` (또는 최종 확정 도메인)
   - **Redirect URLs**에 추가:
     - `http://localhost:3000/auth/callback`
     - `https://{vercel-final-domain}/auth/callback`

### 2. 배포 후 E2E QA
- [ ] 배포 URL `/`에서 피드 로드 (Supabase 실 데이터)
- [ ] 배포 URL에서 Google 로그인 → `/setup` 이동 → 프로필 저장 → `/` 이동
- [ ] Settings → "MVP 데모 앱 생성" → 피드에 seed 포스트 표시
- [ ] `/upload`에서 앱 URL 입력 → 게시 → 피드에 표시
- [ ] 피드 카드 탭 → 인라인 확장 → iframe 실행
- [ ] 댓글 작성 → 새로고침 유지 확인
- [ ] 리믹스 → 원본 창작자 알림 확인
- [ ] 모바일 브라우저(390px)에서 핵심 루프 테스트

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
| Vercel production URL (최신 배포) | `https://nuevo-instagram-test-oh6jearjh-hole81-2757s-projects.vercel.app` |
| Google OAuth | 활성화 완료 (Supabase Authentication → Providers → Google) |

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
