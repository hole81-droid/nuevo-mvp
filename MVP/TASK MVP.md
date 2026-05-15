# TASK MVP

작동하는 MVP를 만들기 위한 작업 목록이다. 기존 `TASK.md`는 프로토타입 포함 전체 로드맵이고, 이 문서는 **실제 배포 가능한 MVP 체크리스트**다.

---

## 0. MVP 완료 기준

- [ ] 배포 URL에서 Google 로그인 가능
- [ ] 신규 유저가 프로필 설정 가능
- [ ] 창작자가 앱 URL을 업로드 가능
- [ ] 업로드한 앱이 홈 피드에 표시됨
- [ ] 피드에서 카드 터치 시 인라인 확장됨
- [ ] iframe으로 앱이 실행됨
- [ ] 댓글/반응/팔로우가 DB에 저장됨
- [ ] 체험 이벤트가 DB에 저장됨
- [ ] 최소 3개 실제 앱 URL seed content 등록

---

## 1. 환경 설정

- [x] Supabase 프로젝트 확인 (`oheesbcpxxabkenpqiry.supabase.co`)
- [x] `supabase/schema.sql` 실제 Supabase SQL Editor에 적용
- [x] 테이블 생성 확인
  - [x] `users`
  - [x] `posts`
  - [x] `comments`
  - [x] `post_reactions`
  - [x] `follows`
  - [x] `experience_events`
  - [x] `notifications`
  - [x] `payout_requests`
- [x] View 생성 확인
  - [x] `post_monthly_wes`
  - [x] `creator_monthly_wes`
- [x] `.env.local` 생성 (로컬 개발용 — git 제외)
- [x] Vercel 환경변수 설정 (production) — 2026-05-15
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. 인증 QA

- [x] OAuth callback route 추가: `/auth/callback`
- [x] 로그인 후 `next` 목적지 보존
- [x] 프로필 미완성 유저는 `/setup?next=...`로 이동
- [x] 프로필 저장 후 원래 목적지로 복귀
- [x] `/upload` 미로그인 접근 시 `/login?next=/upload` 리다이렉트
- [x] `/studio` 미로그인 접근 시 `/login?next=/studio` 리다이렉트
- [x] Supabase Google OAuth provider 활성화 — 2026-05-15
- [x] Google Cloud OAuth Client ID/Secret 발급 → Supabase 입력 — 2026-05-15
- [ ] Supabase URL Configuration → Redirect URLs 등록 (배포 URL 확정 후)
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://{vercel-final-domain}/auth/callback`
- [x] `/login`에서 Google 로그인 테스트 (로컬) — 2026-05-15
- [ ] 첫 로그인 후 `/setup` 이동 확인 (E2E)
- [ ] 프로필 저장 후 `/` 이동 확인 (E2E)
- [x] `/upload` 미로그인 접근 시 `/login?next=/upload` 리다이렉트 구현
- [x] `/studio` 미로그인 접근 시 로그인 유도 구현

---

## 3. 업로드 플로우

- [x] URL 검증 helper 추가: `src/lib/embed-url.ts`
- [x] 업로드 화면에서 잘못된 protocol 차단
- [x] 업로드 화면에서 iframe 미리보기 지연/실패 안내
- [ ] 실제 공개 앱 URL로 업로드 테스트
- [ ] 업로드 후 `posts` 테이블 row 생성 확인
- [ ] 업로드 성공 후 홈 피드에 새 포스트 표시 확인
- [ ] iframe 차단 URL을 넣었을 때 실패 안내 확인
- [ ] `localhost` URL은 로컬 테스트에서만 허용되는지 확인

---

## 4. 피드 체험 플로우

- [x] 카드 인라인 확장
- [x] `InteractiveDemo` iframe 실행
- [x] iframe 실행 실패/지연 상태 UI
- [x] 실 DB 포스트 직접 URL(`/post/{uuid}`) 조회 지원
- [ ] 실제 DB 포스트 카드 터치 QA
- [ ] 인라인 확장 시 기존 피드 위치 유지 확인
- [ ] 확장 영역 상단에서 iframe 실행 확인
- [ ] 새 탭 열기 fallback 확인
- [ ] 여러 카드 중 하나만 확장되는지 확인

---

## 5. 소셜 액션 저장

- [x] `comments` 테이블 연결
- [x] `post_reactions` 테이블 연결
- [x] `follows` 테이블 연결
- [x] 서버 조회 시 댓글/반응 집계 표시
- [x] 댓글 작성 시 원본 창작자 알림 생성
- [x] 반응 선택 시 원본 창작자 알림 생성
- [x] 팔로우 시 대상 창작자 알림 생성
- [ ] 실제 로그인 유저로 댓글 작성 QA
- [ ] 댓글 새로고침 후 유지 확인
- [ ] 반응 선택 후 새로고침 유지 확인
- [ ] 반응 변경/해제 확인
- [ ] 팔로우/언팔로우 후 DB 반영 확인
- [ ] mock post에서는 DB write를 시도하지 않는지 확인

---

## 6. 체험 이벤트 저장

- [x] iframe `onLoad` 시 `experience_events` insert
- [x] unmount/visibility hidden 시 duration update
- [ ] 실제 DB post에서 iframe 실행 후 event row 생성 확인
- [ ] 피드 카드 접기 후 duration 업데이트 확인
- [ ] 브라우저 탭 background 전환 시 duration 업데이트 확인
- [ ] `/studio`에서 체험 수치 표시 확인

---

## 7. 리믹스

- [x] `/upload?remix={postId}` 플로우
- [x] `posts.remix_of` 저장
- [x] 리믹스 알림 생성
- [x] 알림 페이지가 실제 notification 타입 전체 조회
- [x] 알림 읽음 상태를 DB와 동기화
- [ ] 실제 DB 포스트에서 리믹스 버튼 테스트
- [ ] 리믹스 게시 후 원본 창작자 알림 확인
- [ ] 리믹스 카운트가 피드/프로필에 반영되는지 확인

---

## 8. Seed Content

MVP 테스트용 실제 앱 URL을 최소 3개 준비한다.

- [x] `/api/seed-demo-posts`로 로그인 계정에 seed 포스트 생성
- [x] 설정 화면에 MVP 데모 앱 생성 버튼 추가
- [x] 앱 1: 짧은 밈/텍스트 생성기
- [x] 앱 2: 챗봇/상호작용 실험
- [x] 앱 3: 작은 판정/게임형 실험

각 앱 요구사항:

- [x] 인증 없이 접근 가능
- [x] 모바일 390px 폭에서 사용 가능
- [x] iframe에서 로드 가능
- [x] 첫 화면 3초 안에 이해 가능

---

## 9. 배포 QA

- [x] Vercel 배포 트리거 — 2026-05-15 (production URL: `https://nuevo-instagram-test-ad08xanlk-hole81-2757s-projects.vercel.app`)
- [ ] Vercel 빌드 성공 확인 (Inspect URL로 상태 확인)
- [ ] 배포 URL에서 `/` 접속 가능
- [ ] 배포 URL에서 `/upload` 로그인 보호 확인
- [ ] 배포 URL에서 Google 로그인 가능 (Supabase Redirect URL 등록 후)
- [ ] 배포 URL에서 앱 업로드 가능
- [ ] 배포 URL에서 iframe 실행 가능
- [ ] 모바일 브라우저에서 핵심 루프 테스트

---

## 10. 품질 게이트

작업 완료 전 매번 실행한다.

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
npm run build
```

- [x] TypeScript 통과 (2025-05-15 기준 에러 0개)
- [x] ESLint 통과 (2025-05-15 기준 경고 0개)
- [x] Production build 통과 (2025-05-15 기준)

---

## 11. MVP 이후로 미루는 것

- [ ] 플랫폼 내 AI 앱 만들기
- [ ] 코드 생성/자동 배포
- [ ] 실제 광고 송출
- [ ] 실제 송금 처리
- [ ] 복잡한 추천 알고리즘
- [ ] 네이티브 앱
- [ ] PC 최적화
