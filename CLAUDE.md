@AGENTS.md

# nuevo — AI 창작물 공유 플랫폼

## 핵심 비전 (MVP)

**"올리고 → 바로 놀아보는"**

창작자가 AI로 만든 앱을 올리면, 유저가 피드에서 탭 한 번으로 직접 체험한다.
리믹스로 창작 생태계가 형성되고, 체험 시간 기반으로 창작자에게 수익이 돌아간다.

> **MVP 범위**: 인증(Google 로그인) + 실 데이터 피드/업로드 + 리믹스 lineage
> **"만들기"** (플랫폼 내 AI 생성) 기능은 Phase 2. `/create` 코드는 남아 있지만 MVP UI 진입점은 없다.

전체 제품 상세: PRD.md | 태스크: TASK.md

## 수익 모델 요약

```
WES = (체험 세션 × 1.0) + (체험 시간(분) × 0.8) + (반응 × 1.5) + (댓글 × 2.0) + (리믹스 × 5.0)
창작자 수익 = 플랫폼 월 배분 수익 × (내 WES / 전체 WES 합)
```

파트너 티어: 새싹(60%) → 성장(70%) → 프로(75%) → 챔피언(80%)
리믹스 수익 공유: 원본 창작자에게 리믹스 수익의 10% 귀속

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

views:
post_monthly_wes(post_id, author_id, title, content_type, month, sessions, minutes, reactions, comments, remixes, wes)
creator_monthly_wes(author_id, month, sessions, minutes, reactions, comments, remixes, wes)
```

전체 DDL: `supabase/schema.sql`

## 디자인 토큰

| 이름 | 값 | 용도 |
|------|-----|------|
| `--color-warm` | `#E8511A` | 주 브랜드 색 (인터랙티브 컨텐츠, CTA) |
| `--color-cool` | `#5B3FD4` | 보조 색 (오디오 컨텐츠) |
| `text-warm` / `bg-warm` | Tailwind 커스텀 클래스 | globals.css에 정의 |

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
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  allow="camera; microphone"
/>
```

`InteractiveDemo`는 iframe `onLoad` 시 `experience_events`에 세션을 만들고, 접힘/unmount/visibility hidden 시 `duration_seconds`를 업데이트한다. 피드/탐색/프로필 서버 조회는 `getExperienceMetrics()`로 세션 수와 체험 시간을 집계한다.

### WES 집계

WES 계산 상수와 티어 로직은 `src/lib/wes.ts`에 둔다. Supabase SQL view `post_monthly_wes`, `creator_monthly_wes`가 월간 집계를 담당하고, `/studio`는 현재 로그인 유저의 view row를 읽어 예상 수익을 계산한다.

### 정산 요청

정산 정책은 `src/lib/payout.ts`에 둔다. MVP에서는 실제 송금이 아니라 `payout_requests`에 월별 정산 요청을 남기고 상태(`requested`, `reviewing`, `approved`, `paid`, `rejected`)를 추적한다. `POST /api/payout-requests`는 로그인 유저만 호출 가능하며, 같은 달 중복 요청과 10,000원 미만 요청을 막는다.

### 티어 자동 승급

티어 기준은 `src/lib/wes.ts`의 `TIERS`를 단일 출처로 사용한다. `POST /api/tier-sync`는 현재 월 `creator_monthly_wes.sessions`를 기준으로 계산한 티어가 `users.partner_tier`보다 높을 때만 승급시키고 `tier_up` 알림을 생성한다. `/studio`는 진입 시 `TierSyncNotice`를 통해 이 API를 호출한다.

### 컨텐츠 타입
| 타입 | 컬러 | 표시 방식 |
|------|------|-----------|
| `interactive` | warm (orange) | iframe 실행 |
| `audio` | cool (purple) | AudioPlayer |
| `image` | pink | 이미지 갤러리 |

## 주요 파일 구조

```
src/
├── app/
│   ├── page.tsx                  # 피드
│   ├── upload/page.tsx           # 올리기 플로우 (3단계)
│   ├── login/page.tsx            # Google 로그인 ← 신규
│   ├── setup/page.tsx            # 첫 가입 프로필 설정 ← 신규
│   ├── create/page.tsx           # Phase 2 (MVP UI 진입점 없음)
│   ├── demo/[id]/                # iframe 독립 앱 (1,4,6,7,8,9)
│   ├── explore/page.tsx
│   ├── notifications/page.tsx
│   ├── leaderboard/page.tsx
│   ├── studio/page.tsx
│   ├── profile/[username]/page.tsx
│   ├── settings/page.tsx
│   ├── brand/page.tsx
│   └── guide/page.tsx
├── components/
│   ├── feed/FeedClient.tsx       # expandedId 관리
│   ├── layout/BottomNav.tsx      # 알림 뱃지 포함
│   ├── post/PostCard.tsx         # compact ↔ expanded
│   ├── post/PostDetailClient.tsx
│   ├── post/CommentSection.tsx   # inputRef, replyTo(@mention)
│   └── profile/ProfileTabsClient.tsx
├── contexts/
│   ├── AuthContext.tsx           # 현재 유저 ← 신규
│   ├── FollowContext.tsx         # 팔로우 상태
│   ├── NotificationContext.tsx   # 알림 뱃지
│   └── SavedContext.tsx          # 저장하기
└── lib/
    ├── supabase/
    │   ├── client.ts             # 브라우저 클라이언트 ← 신규
    │   ├── server.ts             # 서버 클라이언트 ← 신규
    │   └── types.ts              # DB 타입 ← 신규
    ├── types.ts                  # Post, Author 등 프론트 타입
    └── mock-data.ts              # 목업 데이터 (데모/fallback용)
```

## 코딩 규칙

- `'use client'` 지시어: 상태나 이벤트가 있으면 반드시 추가
- 서버 컴포넌트에서 `params`는 `Promise<{...}>` 타입, `await params` 사용
- Tailwind 클래스만 사용 (인라인 style은 `--color-warm` 같은 커스텀 값일 때만)
- `stopPropagation()`: 카드 내 버튼들은 반드시 추가 (카드 확장 이벤트 막기)
- Supabase 서버 클라이언트는 `await createClient()` (cookies() async)
- 실 데이터 없을 때 graceful fallback: mock-data 사용 가능하나 명시적 주석 필요
