-- ============================================================
-- nuevo — Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

-- UUID 확장
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. users 테이블
-- ============================================================
create table public.users (
  id            uuid references auth.users on delete cascade primary key,
  email         text,
  handle        text unique not null,
  display_name  text not null,
  avatar_emoji  text not null default '😊',
  avatar_bg     text not null default '#FFE4D6',
  bio           text,
  partner_tier  text check (partner_tier in ('seedling', 'growth', 'pro', 'champion')),
  created_at    timestamptz default now()
);

-- ============================================================
-- 2. posts 테이블
-- ============================================================
create table public.posts (
  id            uuid primary key default uuid_generate_v4(),
  author_id     uuid references public.users(id) on delete cascade not null,
  title         text not null,
  text          text not null default '',
  content_type  text not null check (content_type in ('interactive', 'audio', 'image')),
  iframe_url          text,
  cover_emoji         text,
  bg_gradient         text not null default 'from-gray-100 to-gray-200',
  detail_description  text,
  tool_used           text,
  tags                text[] default '{}',
  external_links      jsonb default '[]'::jsonb,
  remixable           boolean not null default true,
  remix_of            uuid references public.posts(id) on delete set null,
  created_at          timestamptz default now()
);

-- 피드 정렬 인덱스
create index posts_created_at_idx on public.posts(created_at desc);
-- 리믹스 lineage 조회 인덱스
create index posts_remix_of_idx on public.posts(remix_of);
-- 프로필 조회 인덱스
create index posts_author_id_idx on public.posts(author_id);
-- 태그 탐색 인덱스
create index posts_tags_idx on public.posts using gin(tags);

-- ============================================================
-- 3. notifications 테이블
-- ============================================================
create table public.notifications (
  id            uuid primary key default uuid_generate_v4(),
  recipient_id  uuid references public.users(id) on delete cascade not null,
  type          text not null check (type in (
    'remix', 'like', 'follow', 'comment', 'reaction',
    'revenue', 'tier_up', 'remix_revenue'
  )),
  actor_id      uuid references public.users(id) on delete cascade,
  post_id       uuid references public.posts(id) on delete cascade,
  remix_post_id uuid references public.posts(id) on delete cascade,
  read          boolean not null default false,
  created_at    timestamptz default now()
);

create index notifications_recipient_idx on public.notifications(recipient_id, created_at desc);

-- ============================================================
-- 4. 체험 세션 이벤트
-- ============================================================
create table public.experience_events (
  id                uuid primary key default uuid_generate_v4(),
  post_id           uuid references public.posts(id) on delete cascade not null,
  viewer_id         uuid references public.users(id) on delete set null,
  client_session_id text not null,
  traffic_source    text not null default 'direct' check (traffic_source in ('instagram', 'tiktok', 'youtube', 'reddit', 'direct')),
  referrer          text,
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  duration_seconds  integer not null default 0 check (duration_seconds >= 0),
  created_at        timestamptz default now()
);

create index experience_events_post_idx on public.experience_events(post_id, started_at desc);
create index experience_events_viewer_idx on public.experience_events(viewer_id, started_at desc);
create index experience_events_session_idx on public.experience_events(client_session_id);
create index experience_events_source_idx on public.experience_events(traffic_source, started_at desc);

-- ============================================================
-- 5. 정산 요청
-- ============================================================
create table public.payout_requests (
  id              uuid primary key default uuid_generate_v4(),
  creator_id      uuid references public.users(id) on delete cascade not null,
  month           date not null,
  amount_krw      integer not null check (amount_krw >= 0),
  status          text not null default 'requested' check (status in ('requested', 'reviewing', 'approved', 'paid', 'rejected')),
  requested_at    timestamptz not null default now(),
  processed_at    timestamptz,
  rejection_reason text,
  unique (creator_id, month)
);

create index payout_requests_creator_idx on public.payout_requests(creator_id, requested_at desc);
create index payout_requests_status_idx on public.payout_requests(status, requested_at desc);

-- ============================================================
-- 6. 소셜 액션
-- ============================================================
create table public.follows (
  follower_id  uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid references public.posts(id) on delete cascade not null,
  author_id  uuid references public.users(id) on delete cascade not null,
  text       text not null check (char_length(trim(text)) > 0 and char_length(text) <= 1000),
  created_at timestamptz not null default now()
);

create table public.post_reactions (
  post_id    uuid references public.posts(id) on delete cascade not null,
  user_id    uuid references public.users(id) on delete cascade not null,
  reaction   text not null check (reaction in ('funny', 'weird', 'genius', 'wtf')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.saved_posts (
  user_id    uuid references public.users(id) on delete cascade not null,
  post_id    uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.post_share_events (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid references public.posts(id) on delete cascade not null,
  sharer_id  uuid references public.users(id) on delete set null,
  source     text not null default 'copy_link',
  traffic_source text not null default 'direct' check (traffic_source in ('instagram', 'tiktok', 'youtube', 'reddit', 'direct')),
  referrer   text,
  created_at timestamptz not null default now()
);

create index follows_following_idx on public.follows(following_id, created_at desc);
create index comments_post_idx on public.comments(post_id, created_at asc);
create index comments_author_idx on public.comments(author_id, created_at desc);
create index post_reactions_post_idx on public.post_reactions(post_id, reaction);
create index saved_posts_user_idx on public.saved_posts(user_id, created_at desc);
create index saved_posts_post_idx on public.saved_posts(post_id, created_at desc);
create index post_share_events_post_idx on public.post_share_events(post_id, created_at desc);
create index post_share_events_source_idx on public.post_share_events(traffic_source, created_at desc);

-- ============================================================
-- 7. Row Level Security (RLS)
-- ============================================================
alter table public.users         enable row level security;
alter table public.posts         enable row level security;
alter table public.notifications enable row level security;
alter table public.experience_events enable row level security;
alter table public.payout_requests enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.saved_posts enable row level security;
alter table public.post_share_events enable row level security;

-- users: 누구나 읽기 / 본인만 쓰기
create policy "users_select_all"
  on public.users for select using (true);

create policy "users_insert_own"
  on public.users for insert with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update using (auth.uid() = id);

-- posts: 누구나 읽기 / 로그인 유저 작성 / 본인만 수정·삭제
create policy "posts_select_all"
  on public.posts for select using (true);

create policy "posts_insert_auth"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "posts_update_own"
  on public.posts for update using (auth.uid() = author_id);

create policy "posts_delete_own"
  on public.posts for delete using (auth.uid() = author_id);

-- notifications: 수신자만 읽기 / 누구나 생성(리믹스 시 상대방 알림)
create policy "notifications_select_own"
  on public.notifications for select using (auth.uid() = recipient_id);

create policy "notifications_insert_auth"
  on public.notifications for insert with check (auth.uid() is not null);

create policy "notifications_update_own"
  on public.notifications for update using (auth.uid() = recipient_id);

-- experience_events: 누구나 체험 시작 기록 / 본인 또는 익명 세션 업데이트 허용
-- MVP에서는 공개 피드 체험을 로그인 없이도 측정해야 하므로 insert/update를 열어둔다.
-- 정산 전에는 서버 함수 기반 검증으로 강화 필요.
create policy "experience_events_select_all"
  on public.experience_events for select using (true);

create policy "experience_events_insert_public"
  on public.experience_events for insert with check (true);

create policy "experience_events_update_public"
  on public.experience_events for update using (true);

-- payout_requests: 창작자는 본인 요청만 읽기/생성, 처리는 관리자/service role에서 수행
create policy "payout_requests_select_own"
  on public.payout_requests for select using (auth.uid() = creator_id);

create policy "payout_requests_insert_own"
  on public.payout_requests for insert with check (auth.uid() = creator_id);

-- follows: 누구나 관계 조회 / 본인 팔로우만 생성·삭제
create policy "follows_select_all"
  on public.follows for select using (true);

create policy "follows_insert_own"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "follows_delete_own"
  on public.follows for delete using (auth.uid() = follower_id);

-- comments: 누구나 읽기 / 로그인 유저 작성 / 작성자 삭제
create policy "comments_select_all"
  on public.comments for select using (true);

create policy "comments_insert_own"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "comments_delete_own"
  on public.comments for delete using (auth.uid() = author_id);

-- post_reactions: 누구나 읽기 / 본인 반응만 upsert·삭제
create policy "post_reactions_select_all"
  on public.post_reactions for select using (true);


create policy "post_reactions_insert_own"
  on public.post_reactions for insert with check (auth.uid() = user_id);

create policy "post_reactions_update_own"
  on public.post_reactions for update using (auth.uid() = user_id);

create policy "post_reactions_delete_own"
  on public.post_reactions for delete using (auth.uid() = user_id);

-- saved_posts: 본인 저장 목록과 내 작품의 저장 지표만 읽기 / 본인만 쓰기·삭제
create policy "saved_posts_select_own"
  on public.saved_posts for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.posts
      where posts.id = saved_posts.post_id
      and posts.author_id = auth.uid()
    )
  );

create policy "saved_posts_insert_own"
  on public.saved_posts for insert with check (auth.uid() = user_id);

create policy "saved_posts_delete_own"
  on public.saved_posts for delete using (auth.uid() = user_id);

-- post_share_events: 공개 공유 클릭을 집계하기 위해 누구나 기록 가능 / 조회는 공개
create policy "post_share_events_select_all"
  on public.post_share_events for select using (true);

create policy "post_share_events_insert_public"
  on public.post_share_events for insert with check (true);

-- ============================================================
-- 8. WES 월별 집계 View
-- ============================================================
create or replace view public.post_monthly_wes as
with event_rollup as (
  select
    post_id,
    date_trunc('month', started_at)::date as month,
    count(*)::integer as sessions,
    ceil(coalesce(sum(duration_seconds), 0) / 60.0)::integer as minutes
  from public.experience_events
  group by post_id, date_trunc('month', started_at)::date
),
remix_rollup as (
  select
    remix_of as post_id,
    date_trunc('month', created_at)::date as month,
    count(*)::integer as remixes
  from public.posts
  where remix_of is not null
  group by remix_of, date_trunc('month', created_at)::date
),
reaction_rollup as (
  select
    post_id,
    date_trunc('month', created_at)::date as month,
    count(*)::integer as reactions
  from public.post_reactions
  group by post_id, date_trunc('month', created_at)::date
),
comment_rollup as (
  select
    post_id,
    date_trunc('month', created_at)::date as month,
    count(*)::integer as comments
  from public.comments
  group by post_id, date_trunc('month', created_at)::date
),
post_months as (
  select id as post_id, date_trunc('month', created_at)::date as month
  from public.posts
  union
  select post_id, month from event_rollup
  union
  select post_id, month from remix_rollup
  union
  select post_id, month from reaction_rollup
  union
  select post_id, month from comment_rollup
)
select
  p.id as post_id,
  p.author_id,
  p.title,
  p.content_type,
  pm.month,
  coalesce(e.sessions, 0)::integer as sessions,
  coalesce(e.minutes, 0)::integer as minutes,
  coalesce(pr.reactions, 0)::integer as reactions,
  coalesce(c.comments, 0)::integer as comments,
  coalesce(r.remixes, 0)::integer as remixes,
  (
    coalesce(e.sessions, 0) * 1.0 +
    coalesce(e.minutes, 0) * 0.8 +
    coalesce(pr.reactions, 0) * 1.5 +
    coalesce(c.comments, 0) * 2.0 +
    coalesce(r.remixes, 0) * 5.0
  )::numeric(12, 2) as wes
from public.posts p
join post_months pm on pm.post_id = p.id
left join event_rollup e on e.post_id = p.id and e.month = pm.month
left join remix_rollup r on r.post_id = p.id and r.month = pm.month
left join reaction_rollup pr on pr.post_id = p.id and pr.month = pm.month
left join comment_rollup c on c.post_id = p.id and c.month = pm.month;

create or replace view public.creator_monthly_wes as
select
  author_id,
  month,
  sum(sessions)::integer as sessions,
  sum(minutes)::integer as minutes,
  sum(reactions)::integer as reactions,
  sum(comments)::integer as comments,
  sum(remixes)::integer as remixes,
  sum(wes)::numeric(12, 2) as wes
from public.post_monthly_wes
group by author_id, month;

-- ============================================================
-- 9. 신규 가입 시 users 행 자동 생성 트리거
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- handle과 display_name은 /setup 페이지에서 업데이트
  -- 여기서는 id, email만 미리 삽입
  insert into public.users (id, email, handle, display_name)
  values (
    new.id,
    new.email,
    'user_' || substr(new.id::text, 1, 8),   -- 임시 handle
    coalesce(new.raw_user_meta_data->>'name', '새 창작자')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
