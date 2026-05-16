# nuevo-instagram

AI로 만든 앱을 URL로 올리고, 사람들이 피드 안에서 바로 실행해보는 모바일-first 경험 플랫폼입니다.

## 핵심 UX

- 창작자: 배포된 앱 URL 입력 → iframe 미리보기 → 게시
- 유저: 피드 카드 탭 → 페이지 이동 없이 인라인 확장 → 바로 체험 / 댓글 / 반응 / 리믹스
- 수익: 체험 세션, 체험 시간, 반응, 댓글, 리믹스 기반 WES로 창작자 수익 배분

## 기술 스택

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth + PostgreSQL
- Vercel 배포 완료 (`https://nuevo-instagram-test.vercel.app`)

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 환경변수

Supabase Dashboard > Settings > API에서 값을 복사합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Google OAuth를 사용할 때 Supabase Auth Redirect URL에 아래 주소를 추가합니다.

```text
http://localhost:3000/auth/callback
https://nuevo-instagram-test.vercel.app/auth/callback
```

## DB 스키마

`supabase/schema.sql`을 Supabase SQL Editor에서 실행합니다.

주요 테이블:

- `users`
- `posts`
- `notifications`
- `experience_events`
- `payout_requests`
- `follows`
- `comments`
- `post_reactions`

주요 View:

- `post_monthly_wes`
- `creator_monthly_wes`

## 검증 명령

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
npm run build
```

## 문서

- `PRD.md`: 제품 요구사항
- `TASK.md`: 개발 태스크와 진행 상태
- `CLAUDE.md`: 구현 패턴과 프로젝트 컨텍스트
