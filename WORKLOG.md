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

## 다음에 할 일 (T12 — Vercel 배포)

> 코드 작업은 완료. 이후는 대시보드/인프라 작업.

### 1. Supabase 대시보드 (수동)
1. `Authentication → Providers → Google` 활성화
2. Client ID / Secret 입력 (Google Cloud Console에서 발급)
3. Redirect URL 등록:
   - `http://localhost:3000/auth/callback` (로컬)
   - `https://{vercel-domain}.vercel.app/auth/callback` (배포)

### 2. Vercel 배포 (수동)
1. `vercel.com` → New Project → GitHub `hole81-droid/nuevo-instagram` import
2. Environment Variables 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://oheesbcpxxabkenpqiry.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (`.env.local`의 값)
3. Deploy

### 3. 배포 후 E2E QA
- [ ] 배포 URL에서 Google 로그인 → `/setup` 이동 → 프로필 저장 → `/` 이동
- [ ] `/upload`에서 앱 URL 입력 → 게시 → 피드에 표시
- [ ] 피드 카드 탭 → 인라인 확장 → iframe 실행
- [ ] 댓글 작성 → 새로고침 유지 확인
- [ ] Settings → "MVP 데모 앱 생성" → 피드에 seed 포스트 표시

---

## 환경 정보

| 항목 | 값 |
|------|-----|
| Supabase 프로젝트 URL | `https://oheesbcpxxabkenpqiry.supabase.co` |
| GitHub repo | `https://github.com/hole81-droid/nuevo-instagram` |
| 브랜치 | `main` |
| Node 버전 | 프로젝트 루트 `.nvmrc` 또는 `package.json` engines 참고 |
| 패키지 매니저 | npm |

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
