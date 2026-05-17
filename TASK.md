# nuevo — 개발 태스크

## MVP 슬로건

**"올리고 → 바로 놀아보는"**

창작자는 이미 AI로 앱을 만든다 (Claude Code, Cursor, Replit 등).
nuevo MVP는 그 앱을 **올리고**, 외부 SNS에서 온 사용자가 **바로 실행**하고, 반응/저장/공유/리믹스로 창작자가 **Fame과 검증 데이터를 얻는 것**에 집중한다.

> **MVP 범위 재정의**: SNS 딥링크 즉시 실행 + URL 업로드/미리보기 + 비로그인 체험 + 태그 검색 + 리믹스 소셜 증명 + 창작자 Fame 대시보드
> **수익배분**: MVP의 메인 약속이 아니라 WES breakdown/raw data export 기반 신뢰 장치로 둔다.

→ 상세 제품 스펙: **PRD.md** 참조

---

## 🚩 PRD 1.0 재정의 후 최우선 MVP 태스크

> 기존 실 데이터/정산 구현은 유지하되, 신규 작업 우선순위는 **Fame loop + Play loop**에 맞춘다.

### P0 — SNS 딥링크 / 비로그인 즉시 체험

- [ ] **N1. 앱 상세 딥링크 라우트 정리**
  - [x] `@handle/app-slug` 형태의 공유 URL 설계 또는 현재 라우트와 매핑
  - [x] `?autoplay=true` 지원
  - [x] 딥링크 진입 시 iframe 자동 전개
  - [ ] 모바일 LCP 3초 이하 목표로 QA

- [x] **N2. 공유 미리보기 / 공유 버튼**
  - [x] 앱 상세별 OG title / description / image 설정
  - [x] 앱 미리보기 이미지 fallback 정의
  - [x] 딥링크 복사 버튼
  - [x] Instagram / TikTok / YouTube / Reddit용 공유 문구 템플릿

- [x] **N3. 비로그인 체험 경계 정리**
  - [x] 비로그인: 피드 탐색, 태그 검색, 앱 체험 허용
  - [x] 로그인 필요: 반응, 댓글, 저장, 리믹스, 업로드
  - [x] 로그인 유도는 체험을 막지 않고 액션 시점에 표시

### P0 — 업로드 / 발견성

- [x] **N4. iframe 호환성 진단**
  - [x] `POST /api/check-url` 추가
  - [x] X-Frame-Options 체크
  - [x] CSP `frame-ancestors` 체크
  - [x] HTTPS / 공개 접근 체크
  - [x] 업로드 폼에 초록/노랑/빨강 결과 표시

- [x] **N5. 업로드 메타데이터 확장**
  - [x] `posts.tags` 추가
  - [x] `posts.external_links` JSON 추가
  - [x] 업로드 폼에서 태그 최대 5개 입력
  - [x] 외부 링크 최대 3개 입력 (YouTube, GitHub, 원본 영상 등)
  - [x] 게시 완료 후 "탐색 탭에 노출됐어요" 피드백

- [x] **N6. 태그 검색 / 카테고리 탐색 고도화**
  - [x] 탐색 페이지 검색을 DB 태그/텍스트 기준으로 정리
  - [x] 기본 카테고리: 게임, 퀴즈, 필터, 음악, 생산성, 이상한 앱
  - [x] 앱 상세 하단에 같은 태그 앱 노출
  - [x] 신규 창작자 첫 작품 노출 보장 로직 검토

### P0 — 리믹스 Fame Loop

- [x] **N7. 리믹스 소셜 증명**
  - [x] 피드 카드에 `N회 리믹스됨` 표시
  - [x] 리믹스 0개일 때는 미노출
  - [x] 원본 상세에 "이 앱의 리믹스들" 섹션 추가

- [x] **N8. 리믹스 알림/노출 확장**
  - [x] 원본 창작자 알림 유지
  - [x] 원본 창작자 팔로워 피드에 리믹스 알림 카드 검토
  - [x] "이 앱을 더 웃기게 바꿔보세요" CTA 추가

### P1 — Play Retention

- [x] **N9. 일반 사용자 체류 기능**
  - [x] Daily playable feed 섹션
  - [x] 가장 많이 리믹스된 앱
  - [x] 오늘 가장 오래 체험된 앱
  - [x] 비슷한 앱 더 보기

- [x] **N10. 저장 / 컬렉션 / 공유 지표**
  - [x] 저장 수 DB 집계 또는 기존 SavedContext의 실 데이터화
  - [x] 공유 버튼 클릭 이벤트 기록
  - [x] 창작자 대시보드에 저장/공유 수 노출

### P1 — Creator Fame Dashboard

- [x] **N11. `/studio`를 Fame 대시보드 중심으로 재정렬**
  - [x] 체험 수
  - [x] 평균 체험 시간
  - [x] 반응 수
  - [x] 댓글 수
  - [x] 저장 수
  - [x] 공유 수
  - [x] 리믹스 수
  - [x] 유입 채널
  - [x] 예상 수익은 보조 정보로 이동

- [x] **N12. 유입 채널 분석**
  - [x] 딥링크에 `utm_source` 또는 referrer 기반 source 기록
  - [x] Instagram / TikTok / YouTube / Reddit / Direct 분류
  - [x] 앱별 유입 채널 breakdown 표시

### P1 — WES 신뢰 장치

- [x] **N13. WES breakdown / raw event export**
  - [x] 세션/시간/반응/댓글/리믹스 항목별 WES 분해 표시
  - [x] 월별 raw event log CSV export
  - [x] "예상 수익"과 "확정 수익" 문구 분리

### MVP에서 후순위로 내릴 것

- [ ] 실제 출금 UX 전면 노출 축소 검토
- [ ] 복잡한 파트너 등급 카피 축소
- [ ] 브랜드 셀프서브 마켓플레이스는 Phase 2로 유지
- [ ] AI 앱 생성기는 Phase 2로 유지

---

## ✅ 완료 — 프론트엔드 (목업)

> 모든 UI/UX 완성. 현재는 mock 데이터로 동작. 아래 MVP 백엔드 태스크로 실 데이터 연결 예정.

### 피드 & 체험
- [x] 피드 인라인 확장
- [x] FeedClient expandedId 관리 (한 번에 하나)
- [x] 팔로우/팔로잉 탭 피드
- [x] 인터랙티브 iframe 실행 / 반응 / 댓글 / 좋아요 / 리믹스 / 저장
- [x] 컴팩트 카드 썸네일 "탭해서 바로 해보기"

### 인터랙티브 앱 임베딩
- [x] `InteractiveDemo.tsx` — iframe 렌더러
- [x] `/demo/1` 밈 생성기 / `/demo/4` 철학 고양이 / `/demo/6` 전생 직업 / `/demo/7` 시 생성기
- [x] `/demo/8` 감정 위로 / `/demo/9` 서울 2호선 판타지 퀴즈

### 올리기
- [x] `/upload` 3단계 플로우 (타입 선택 → 기본정보 → 게시)
- [x] URL 입력 + 실시간 iframe 미리보기
- [x] 리믹스 플로우 (`/upload?remix={postId}`, 원본 배너)
- [x] MVP에서 "만들기" UI 진입점 제거 (`+` → `/upload` 직접 이동)

### 프로필 & 소셜
- [x] 프로필 탭 전환 (작품 / 리믹스 / 좋아요 / 저장)
- [x] 파트너 배지 (✦~✦✦✦✦) + 수익 요약
- [x] FollowContext (전역 팔로우 상태)
- [x] SavedContext (북마크)

### 알림 & 탐색
- [x] 알림 페이지 (6가지 타입 mock)
- [x] NotificationContext + BottomNav 뱃지
- [x] 탐색 페이지 (검색, 핫한 체험, 트렌딩 태그, 창작자 섹션)

### 수익 & 리더보드
- [x] 크리에이터 스튜디오 (`/studio`) — WES 대시보드, 리믹스맵 SVG
- [x] 리더보드 (`/leaderboard`) — WES 랭킹, TOP3 포디움

### 온보딩 & 기타
- [x] 온보딩 3단계 (`/onboarding`)
- [x] 온보딩 배너 (피드, localStorage)
- [x] 설정 페이지 (`/settings`)
- [x] 브랜드 파트너십 페이지 (`/brand`)
- [x] 창작자 가이드 페이지 (`/guide`)
- [x] 댓글 답글 (@mention 프리필)
- [x] 댓글 버튼 → 스크롤 + 포커스

---

## 🔄 진행 중 — MVP 백엔드 (실 데이터)

### Phase 1 — 인프라

- [x] **T1. Supabase 프로젝트 설정 + 스키마 정의**
  - [x] `@supabase/ssr`, `@supabase/supabase-js` 패키지 설치
  - [x] `src/lib/supabase/client.ts` — 브라우저 클라이언트
  - [x] `src/lib/supabase/server.ts` — 서버 컴포넌트 클라이언트
  - [x] `src/lib/supabase/types.ts` — DB 타입 정의
  - [x] `supabase/schema.sql` — 마이그레이션 SQL
  - [x] `middleware.ts` — 세션 갱신
  - [x] `.env.local.example` — 환경변수 템플릿

### Phase 2 — 인증

- [x] **T2. Google 소셜 로그인**
  - [ ] Supabase Auth Google OAuth 설정 (Supabase 대시보드 작업)
  - [x] `/login` 페이지 — "Google로 계속하기" 버튼
  - [x] `AuthContext` — 현재 유저 전역 관리
  - [x] layout.tsx에 `AuthProvider` 추가

- [x] **T3. 신규 가입자 프로필 설정**
  - [x] `/setup` 페이지 — handle, displayName, avatarEmoji 입력
  - [x] `users` 테이블에 저장
  - [x] 첫 로그인 후 OAuth redirect → `/setup`

- [x] **T4. 보호된 라우트**
  - [x] 미로그인 시 업로드 접근 → `/login` 리다이렉트
  - [x] 미로그인 시 리믹스 URL 접근 → `/login` 리다이렉트
  - [x] BottomNav 프로필 아이콘 → 실제 내 아바타 표시

### Phase 3 — 실 데이터 피드

- [x] **T5. 피드 — DB 포스트 읽기**
  - [x] `page.tsx` 서버 컴포넌트에서 Supabase fetch
  - [x] `mockPosts` fallback 처리
  - [x] 빈 피드 상태 UI
  - [x] 리믹스 포스트에 "🔁 원본 작품 리믹스" 배지

- [x] **T6. 탐색 페이지 — 실 데이터 연동**
  - [x] Supabase 포스트 조회 → 검색 / 태그 필터 클라이언트 처리

### Phase 4 — 업로드 + 리믹스

- [x] **T7. 업로드 플로우 — DB 저장**
  - [x] 게시 버튼 → `posts` insert (author_id, remix_of, remixable 포함)
  - [x] 성공 → 피드 리다이렉트 (실 포스트 보임)

- [x] **T8. 리믹스 — 실 데이터 연결**
  - [x] `/upload?remix={postId}` → Supabase에서 원본 포스트 조회
  - [x] `remixable = false` 이면 리믹스 버튼 비활성화
  - [x] 리믹스 카운트 집계 (`COUNT WHERE remix_of = id`)

- [x] **T9. 리믹스 알림**
  - [x] 리믹스 게시 시 → `notifications` 테이블 insert (recipient = 원본 창작자)
  - [x] 알림 페이지에서 실 알림 읽기 (remix 타입 우선)

### Phase 5 — 프로필

- [x] **T10. 내 프로필 — 실 데이터**
  - [x] `/profile/me` → 로그인 유저 포스트 DB 조회
  - [x] "작품" 탭: `remix_of IS NULL` / "리믹스" 탭: `remix_of IS NOT NULL`

- [x] **T11. 타인 프로필 — 실 데이터**
  - [x] `/profile/[handle]` → handle로 유저 + 포스트 조회

### Phase 6 — 배포

- [x] **T12. Vercel 배포** ← **완료 2026-05-15**
  - [x] 배포 전 품질 게이트 정리 — tsc ✅ / eslint ✅ / next build ✅
  - [x] Supabase Google OAuth provider 활성화
  - [x] Redirect URL 등록 (`/auth/callback`)
  - [x] Vercel 환경변수 주입 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - [x] Vercel 배포 후 Google 로그인 E2E 테스트
  - [ ] 커스텀 도메인 연결 (선택 — 현재 `nuevo-instagram-test.vercel.app` 사용 중)

---

## ⏳ MVP 이후 — Phase 2 "만들기"

> MVP 검증 후 진행. 창작자가 nuevo 안에서 AI로 앱을 직접 만들 수 있게 한다.

- [ ] 인터랙티브 생성: 프롬프트 → AI가 React 코드 생성 → 자동 배포
- [ ] 오디오 생성: Udio/Suno API 연동
- [ ] 이미지 생성: Midjourney/DALL-E 연동
- [ ] BottomNav에 "만들기" 옵션 재추가
- [ ] `/create` 페이지 UI 진입점 복원

## ✅ 기존 구현 — WES / 정산 인프라

> 아래 기능은 이미 구현되어 있지만, PRD 1.0 기준으로는 MVP의 전면 가치 제안이 아니다. 신규 UX에서는 실제 출금/예상 수익보다 Fame 대시보드와 WES 신뢰 장치를 먼저 보여준다.

- [x] 체험 세션 실 트래킹 (iframe onLoad/unload)
  - [x] `experience_events` 테이블 스키마 추가
  - [x] `InteractiveDemo` iframe 로드 시 세션 생성
  - [x] 컴포넌트 unmount / visibility hidden 시 체험 시간 저장
  - [x] 피드 / 탐색 / 프로필에서 세션 수와 체험 시간을 집계해 표시
- [x] WES 서버사이드 계산 + 월별 집계
  - [x] `post_monthly_wes` view: 작품별 월간 세션/분/리믹스/WES 집계
  - [x] `creator_monthly_wes` view: 창작자별 월간 WES 집계
  - [x] `/studio`에서 로그인 유저의 월간 WES 실 데이터 조회
  - [x] 플랫폼 전체 WES 대비 내 점유율 기반 예상 수익 표시
- [x] 창작자 정산 API (출금 처리 인프라)
  - [x] `payout_requests` 테이블 스키마 추가
  - [x] `POST /api/payout-requests` 정산 요청 생성
  - [x] 월별 중복 요청 방지
  - [x] 최소 정산 금액 10,000원 검증
  - [x] `/studio` 정산 요청 패널 연결
- [x] 티어 자동 승급 (월별 WES 기준)
  - [x] `POST /api/tier-sync` 추가
  - [x] 현재 월 `creator_monthly_wes.sessions` 기준 티어 계산
  - [x] 현재 `users.partner_tier`보다 높은 경우에만 승급
  - [x] 승급 시 `tier_up` 알림 생성
  - [x] `/studio` 진입 시 티어 동기화 및 승급 안내 표시
- [x] 팔로우 / 댓글 / 반응 DB 저장
  - [x] `follows` 테이블: 로그인 유저 팔로우/언팔로우 저장
  - [x] `comments` 테이블: 실 포스트 댓글 로드/작성 저장
  - [x] `post_reactions` 테이블: 반응 upsert/delete 및 내 반응 복원
  - [x] WES view가 실제 댓글/반응 테이블 집계를 사용

---

## 아키텍처 메모

### 기술 스택
- **Frontend**: Next.js 16.2.6 App Router, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel

### DB 스키마 요약
```
users(id, email, handle, display_name, avatar_emoji, avatar_bg, bio, partner_tier)
posts(id, author_id, title, text, content_type, iframe_url, cover_emoji, bg_gradient, remixable, remix_of)
notifications(id, recipient_id, type, actor_id, post_id, remix_post_id, read)
experience_events(id, post_id, viewer_id, client_session_id, started_at, ended_at, duration_seconds)
payout_requests(id, creator_id, month, amount_krw, status, requested_at, processed_at, rejection_reason)
follows(follower_id, following_id, created_at)
comments(id, post_id, author_id, text, created_at)
post_reactions(post_id, user_id, reaction, created_at)

PRD 1.0 planned additions:
posts.tags
posts.external_links
post save/share counters or event tables
traffic source on experience/share events
raw WES event export endpoint
```

### Supabase 클라이언트 패턴
- 서버 컴포넌트: `import { createClient } from '@/lib/supabase/server'`
- 클라이언트 컴포넌트: `import { createClient } from '@/lib/supabase/client'`

### WES 계산식
```
WES = sessions×1.0 + minutes×0.8 + reactions×1.5 + comments×2.0 + remixes×5.0
```
