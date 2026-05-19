@AGENTS.md

# nuevo — AI 앱 체험 / 리믹스 플랫폼

## 핵심 비전 (MVP)

**"올리고 → 바로 놀아보는"**

창작자가 AI로 만든 앱을 올리면, 유저가 SNS 딥링크나 피드에서 탭 한 번으로 직접 체험한다.
MVP의 중심은 수익배분이 아니라 **Fame loop + Play loop**다.

- 창작자는 앱이 발견되고, 실행되고, 반응/저장/공유/리믹스되는 경험을 원한다.
- 일반 사용자는 짧고 재밌는 앱을 가입 없이 만지고, 저장하고, 친구에게 보내고, 리믹스한다.
- WES와 수익배분은 "큰돈 보장"이 아니라 성과/신뢰/향후 정산 근거로 다룬다.

> **MVP 범위**: SNS 딥링크 즉시 실행 + URL 업로드/미리보기 + 비로그인 체험 + 태그 검색 + 리믹스 소셜 증명 + 창작자 Fame 대시보드
> **"만들기"** (플랫폼 내 AI 생성) 기능은 Phase 2. `/create` 코드는 남아 있지만 MVP UI 진입점은 없다.

전체 제품 상세: PRD.md | 구현 스펙: PRD_V3.md | 디자인: Design Ref.md | 태스크: TASK.md

## 제품 우선순위

1. SNS 딥링크 즉시 실행: `nuevo.app/@handle/app?autoplay=true`
2. URL 업로드 + iframe 호환성 진단 + 모바일 미리보기
3. 비로그인 앱 체험
4. 태그 검색 / 카테고리 탐색
5. 리믹스 생성 + 원본 상세 노출 + `N회 리믹스됨` 소셜 증명
6. 반응 / 댓글 / 저장 / 공유
7. 창작자 Fame 대시보드: 체험 수, 평균 체험 시간, 반응, 저장, 공유, 리믹스, 유입 채널
8. WES breakdown / raw event log export

## WES / 수익 모델 원칙

WES는 MVP에서 즉시 큰 수익을 보장하기 위한 지표가 아니라, 창작자의 체험 성과와 향후 수익배분의 근거가 되는 신뢰 지표다.

```text
WES = (유효 체험 세션 × 1.0)
    + (체험 시간(분) × 0.8)
    + (반응 × 1.5)
    + (댓글 × 2.0)
    + (리믹스 × 5.0)
```

MVP에서는 실제 출금/복잡한 파트너 티어/브랜드 셀프서브 마켓플레이스를 핵심 플로우로 밀지 않는다. 이미 구현된 정산 UI/API는 유지할 수 있지만, 제품 메시지와 신규 작업 우선순위는 Fame/Play 중심으로 맞춘다.

## 기술 스택

- **Framework**: Next.js 16.2.6 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **Mock data**: `src/lib/mock-data.ts` (UI 개발/데모용, 실 데이터로 점진 교체)

## Supabase 패턴

### 클라이언트 생성
```typescript
// 서버 컴포넌트 (app/, page.tsx 등)
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// 클라이언트 컴포넌트 ('use client')
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### DB 타입
```typescript
import { Database } from '@/lib/supabase/types';
// 또는 자주 쓰는 Row 타입 직접 import
import type { UserRow, PostRow } from '@/lib/supabase/types';
```

### 환경변수
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Auth 패턴
```typescript
// 현재 유저 가져오기 (서버 컴포넌트)
const { data: { user } } = await supabase.auth.getUser();

// 현재 유저 가져오기 (클라이언트 컴포넌트)
const { user } = useAuth(); // AuthContext 사용

// Google 로그인
await supabase.auth.signInWithOAuth({ provider: 'google' });
```

## DB 스키마 요약

```sql
users(id, email, handle, display_name, avatar_emoji, avatar_bg, bio, partner_tier)
posts(id, author_id, title, text, content_type, iframe_url, cover_emoji, bg_gradient, remixable, remix_of)
notifications(id, recipient_id, type, actor_id, post_id, remix_post_id, read)
experience_events(id, post_id, viewer_id, client_session_id, started_at, ended_at, duration_seconds)
payout_requests(id, creator_id, month, amount_krw, status, requested_at, processed_at, rejection_reason)
follows(follower_id, following_id, created_at)
comments(id, post_id, author_id, text, created_at)
post_reactions(post_id, user_id, reaction, created_at)

planned / PRD-required additions:
post tags, external_links, share_count, save_count, traffic_source
event export support for raw WES logs

views:
post_monthly_wes(post_id, author_id, title, content_type, month, sessions, minutes, reactions, comments, remixes, wes)
creator_monthly_wes(author_id, month, sessions, minutes, reactions, comments, remixes, wes)
```

전체 DDL: `supabase/schema.sql`

## 디자인 토큰

MVP UI는 모노크롬 black/sheet 시스템을 사용한다. 전체 디자인 원칙은 **Design Ref.md** 참조.

| CSS 변수 | 값 | 용도 |
|----------|----|------|
| `--nuevo-black` | `#000000` | 배경 스테이지, primary CTA, 선택 상태 |
| `--nuevo-sheet` | `#F8F8F3` | 메인 시트 배경 |
| `--nuevo-soft` | `#EFEFE8` | 보조 서피스 / 비활성 그룹 |
| `--nuevo-line` | `#D7D7CF` | 테두리 / 구분선 |
| `--nuevo-ink` | `#050505` | 본문 텍스트 |
| `--nuevo-muted` | `#7D7D78` | 보조 텍스트 / 메타데이터 |

`@theme inline`에서 `--color-warm`과 `--color-cool`은 모두 `#000000`으로 매핑된다.
`text-warm` / `bg-warm` Tailwind 클래스는 MVP UI에서 검정색으로 렌더링된다.
오렌지/퍼플 색상(`#E8511A`, `#5B3FD4`)은 `/create` Phase 2 페이지에서만 인라인 스타일로 사용된다.

모바일 우선: `max-w-[430px] mx-auto`, iPhone 기준.

## 핵심 UX 패턴

### 피드 인라인 확장
```tsx
// FeedClient.tsx
const [expandedId, setExpandedId] = useState<string | null>(null);
// PostCard에 expanded + onToggle prop 전달
```

### 인터랙티브 앱 임베딩
```tsx
<iframe
  src={iframeUrl}
  sandbox="allow-scripts allow-forms allow-popups"
  allow="camera; microphone"
/>
```

`allow-same-origin`은 `allow-scripts`와 함께 쓰지 않는다. 앱 임베딩은 격리된 iframe/origin을 전제로 한다.

`InteractiveDemo`는 iframe `onLoad` 시 `experience_events`에 세션을 만들고, 접힘/unmount/visibility hidden 시 `duration_seconds`를 업데이트한다. 피드/탐색/프로필 서버 조회는 `getExperienceMetrics()`로 세션 수와 체험 시간을 집계한다. 정밀 체험 시간/내부 인터랙션은 향후 SDK/postMessage 기반으로 보강한다.

### SNS 딥링크 / 비로그인 체험

MVP 핵심 진입은 외부 SNS에서 오는 딥링크다.

- 앱 상세 URL은 `?autoplay=true`를 지원해야 한다.
- 비로그인 사용자는 피드 탐색, 태그 검색, 앱 체험까지 가능해야 한다.
- 반응, 댓글, 저장, 리믹스, 업로드는 로그인 유도 지점이다.
- Instagram/TikTok/YouTube/Reddit 공유 미리보기를 고려해 OG 메타를 유지한다.

### Fame 대시보드 / WES 집계

WES 계산 상수와 티어 로직은 `src/lib/wes.ts`에 둔다. Supabase SQL view `post_monthly_wes`, `creator_monthly_wes`가 월간 집계를 담당한다. `/studio`는 "수익 정산표"보다 먼저 Fame 대시보드로 보여야 한다: 체험 수, 평균 체험 시간, 반응, 댓글, 저장, 공유, 리믹스, 유입 채널을 우선 노출한다.

### 정산 요청

정산 정책은 `src/lib/payout.ts`에 둔다. 다만 PRD 1.0 기준으로 실제 출금은 MVP의 핵심 약속이 아니다. 구현이 남아 있더라도 제품 카피와 신규 작업 우선순위에서는 "예상 수익"보다 "Fame/성과 데이터"를 앞세운다.

### 티어 자동 승급

티어 기준은 `src/lib/wes.ts`의 `TIERS`를 단일 출처로 사용한다. `POST /api/tier-sync`는 현재 월 `creator_monthly_wes.sessions`를 기준으로 계산한 티어가 `users.partner_tier`보다 높을 때만 승급시키고 `tier_up` 알림을 생성한다. `/studio`는 진입 시 `TierSyncNotice`를 통해 이 API를 호출한다.

### 소셜 액션 저장

팔로우, 댓글, 반응은 Supabase에 저장한다. 단, `mockPosts` fallback의 짧은 문자열 ID(`1`, `minsu` 등)는 DB FK와 맞지 않으므로 클라이언트 로컬 상태로만 처리한다. 실 DB UUID 포스트/유저일 때만 `follows`, `comments`, `post_reactions`에 기록한다.

저장, 공유, 유입 채널, 리믹스 소셜 증명은 PRD 1.0 기준 MVP 핵심 지표다. 구현 시 mock fallback과 실 DB UUID 포스트를 분리해 처리한다.

### 컨텐츠 타입
| 타입 | 컬러 | 표시 방식 |
|------|------|-----------|
| `interactive` | black (warm 토큰 → `#000000`) | iframe 실행 |
| `audio` | black (cool 토큰 → `#000000`) | AudioPlayer |
| `image` | black | 이미지 갤러리 |

## 주요 파일 구조

```
src/
├── app/
│   ├── page.tsx                        # 피드
│   ├── [handle]/[slug]/page.tsx        # SNS 딥링크 (@handle 필수) → /post/[id] 리다이렉트
│   ├── post/[id]/page.tsx              # 앱 상세 / 바로 체험 (?autoplay=true)
│   ├── upload/page.tsx                 # 올리기 플로우 (?remix=[postId] 포함)
│   ├── login/page.tsx                  # Google 로그인
│   ├── setup/page.tsx                  # 첫 가입 프로필 설정
│   ├── onboarding/page.tsx             # 온보딩
│   ├── explore/page.tsx
│   ├── notifications/page.tsx
│   ├── leaderboard/page.tsx
│   ├── studio/page.tsx                 # Fame 대시보드 / WES
│   ├── profile/[username]/page.tsx
│   ├── settings/page.tsx
│   ├── settings/delete-account/        # 계정 삭제 요청
│   ├── terms/page.tsx                  # 공개 이용약관
│   ├── privacy/page.tsx                # 공개 개인정보처리방침
│   ├── report/post/[id]/page.tsx       # 게시물 신고
│   ├── qa/page.tsx                     # 실기기 MVP QA 체크리스트
│   ├── ux-flow/page.tsx                # 내부 UX 흐름 점검
│   ├── ux-prototype/page.tsx           # 내부 모바일 프로토타입
│   ├── create/page.tsx                 # Phase 2 (MVP UI 진입점 없음)
│   ├── demo/[id]/                      # iframe 독립 앱 (데모용)
│   ├── brand/page.tsx
│   └── guide/page.tsx
├── components/
│   ├── feed/FeedClient.tsx             # expandedId 관리
│   ├── layout/BottomNav.tsx            # 알림 뱃지 포함
│   ├── post/PostCard.tsx               # compact ↔ expanded
│   ├── post/PostDetailClient.tsx
│   ├── post/CommentSection.tsx         # DB 댓글 + inputRef, replyTo(@mention)
│   └── profile/ProfileTabsClient.tsx
├── contexts/
│   ├── AuthContext.tsx                 # 현재 유저
│   ├── FollowContext.tsx               # 팔로우 상태
│   ├── NotificationContext.tsx         # 알림 뱃지
│   └── SavedContext.tsx                # 저장하기
└── lib/
    ├── supabase/
    │   ├── client.ts                   # 브라우저 클라이언트
    │   ├── server.ts                   # 서버 클라이언트
    │   └── types.ts                    # DB 타입
    ├── social.ts                       # UUID 판별, 댓글/반응 변환 헬퍼
    ├── types.ts                        # Post, Author 등 프론트 타입
    └── mock-data.ts                    # 목업 데이터 (데모/fallback용)
```

## 코딩 규칙

- `'use client'` 지시어: 상태나 이벤트가 있으면 반드시 추가
- 서버 컴포넌트에서 `params`는 `Promise<{...}>` 타입, `await params` 사용
- Tailwind 클래스만 사용 (인라인 style은 `--nuevo-black` 같은 CSS 변수 참조나 동적 값이 필요할 때만)
- `stopPropagation()`: 카드 내 버튼들은 반드시 추가 (카드 확장 이벤트 막기)
- Supabase 서버 클라이언트는 `await createClient()` (cookies() async)
- 실 데이터 없을 때 graceful fallback: mock-data 사용 가능하나 명시적 주석 필요
