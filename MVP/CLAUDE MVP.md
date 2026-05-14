# CLAUDE MVP

이 문서는 nuevo의 **작동하는 MVP** 개발을 위한 에이전트 작업 지침이다. 기존 프로토타입 문서(`CLAUDE.md`)보다 이 문서를 우선한다.

---

## 1. MVP 원칙

**핵심 루프만 완성한다.**

```text
앱 URL 업로드 → 피드 노출 → 인라인 iframe 실행 → 댓글/반응/팔로우 저장 → 체험 이벤트 저장
```

MVP에서 “만들기”는 하지 않는다. `/create`는 프로토타입 산출물이며, MVP UI 진입점으로 복원하지 않는다.

---

## 2. 현재 폴더 기준

```text
MVP/
  PRD MVP.md       # MVP 제품 요구사항
  CLAUDE MVP.md    # MVP 개발 지침
  TASK MVP.md      # MVP 작업 체크리스트

Prototype/
  README.md        # 지금까지 만든 프로토타입의 역할과 보관 기준

src/
  현재 Next.js 앱 코드. 프로토타입에서 출발했지만 MVP 구현도 여기서 진행한다.
```

코드를 별도 폴더로 무리하게 이동하지 않는다. Next.js import, routing, build가 깨질 수 있다. 대신 문서와 작업 범위로 프로토타입/MVP를 분리한다.

---

## 3. 기술 스택

- Next.js 16 App Router
- TypeScript strict
- Tailwind CSS v4
- Supabase Auth + PostgreSQL
- Vercel 배포

---

## 4. MVP에서 중요한 파일

### Product Flow

- `src/app/page.tsx`: 홈 피드, Supabase posts 조회
- `src/components/feed/FeedClient.tsx`: 피드 인라인 확장 상태
- `src/components/post/PostCard.tsx`: 피드 카드, 확장 영역, 반응/댓글 진입
- `src/components/post/InteractiveDemo.tsx`: iframe 실행, 체험 이벤트 저장
- `src/app/upload/page.tsx`: URL 업로드, 미리보기, DB 저장

### Data

- `src/lib/supabase/client.ts`: 브라우저 Supabase client
- `src/lib/supabase/server.ts`: 서버 Supabase client
- `src/lib/supabase/types.ts`: DB 타입
- `src/lib/post-mapper.ts`: DB post → UI post 변환
- `src/lib/embed-url.ts`: iframe URL 검증
- `src/lib/social.ts`: 댓글/반응/팔로우 helper
- `supabase/schema.sql`: 실제 DB schema

### Auth

- `src/contexts/AuthContext.tsx`: 로그인 유저/프로필 상태
- `src/app/login/page.tsx`: 로그인 화면
- `src/app/setup/page.tsx`: 신규 프로필 설정
- `middleware.ts`: 보호 라우트

---

## 5. Supabase 데이터 모델

MVP 필수 테이블:

```sql
users(id, email, handle, display_name, avatar_emoji, avatar_bg, bio, partner_tier)
posts(id, author_id, title, text, content_type, iframe_url, cover_emoji, bg_gradient, remixable, remix_of, created_at)
comments(id, post_id, author_id, text, created_at)
post_reactions(post_id, user_id, reaction, created_at)
follows(follower_id, following_id, created_at)
experience_events(id, post_id, viewer_id, client_session_id, started_at, ended_at, duration_seconds)
notifications(id, recipient_id, type, actor_id, post_id, remix_post_id, read, created_at)
```

MVP에서는 `payout_requests`, WES view, studio UI가 있어도 좋지만, 실제 MVP 판단 기준은 업로드/실행/소셜/체험 이벤트다.

---

## 6. 구현 규칙

### URL 업로드

- `validateEmbedUrl()`을 사용한다.
- `javascript:`, `data:`, 빈 문자열은 저장하지 않는다.
- 공개 URL은 `https`를 권장한다.
- 로컬 테스트용 `localhost`는 허용한다.
- iframe 미리보기 실패 시 사용자가 새 탭으로 확인할 수 있어야 한다.

### iframe 실행

```tsx
<iframe
  src={playableUrl}
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  allow="camera; microphone"
/>
```

- iframe `onLoad`에서 체험 세션을 시작한다.
- unmount 또는 `visibilitychange`에서 체험 시간을 저장한다.
- 10~12초 이상 로딩되면 실패 안내와 새 탭 열기 버튼을 보여준다.

### mock fallback

- DB가 비었거나 Supabase 오류가 있을 때만 mock을 fallback으로 쓴다.
- mock ID(`1`, `minsu`)는 UUID가 아니므로 DB FK 작업을 하지 않는다.
- 실 UUID 포스트/유저에만 DB 댓글/반응/팔로우를 저장한다.

### UX

- 모바일-first만 고려한다.
- 카드 터치 시 상세 페이지로 이동하지 않고 인라인 확장한다.
- 상단에 앱 실행 영역을 둔다.
- 메타데이터/기술 정보는 뒤로 물린다.
- primary CTA는 검정 pill 버튼을 사용한다.

---

## 7. 검증 명령

작업 후 반드시 실행한다.

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
npm run build
```

`npm run build`는 Turbopack이 로컬 포트를 bind하므로 sandbox 밖 실행 권한이 필요할 수 있다.

---

## 8. MVP 완료 정의

배포 URL에서 아래가 실제로 된다.

- Google 로그인
- 프로필 설정
- 앱 URL 업로드
- 피드에서 새 포스트 확인
- 카드 인라인 확장
- iframe 앱 실행
- 댓글 DB 저장
- 반응 DB 저장
- 팔로우 DB 저장
- 체험 이벤트 DB 저장

---

## 9. 프로토타입 보존 규칙

기존 visual/UI 프로토타입은 버리지 않는다.

- 디자인 감각은 `Design Ref.md`를 따른다.
- 실험적 페이지(`/brand`, `/guide`, `/leaderboard`, `/onboarding`, `/create`)는 MVP 핵심 루프를 방해하지 않으면 유지한다.
- 단, MVP 작업 우선순위에서는 제외한다.
