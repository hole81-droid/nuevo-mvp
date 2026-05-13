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
  iframe_url    text,
  cover_emoji   text,
  bg_gradient   text not null default 'from-gray-100 to-gray-200',
  remixable     boolean not null default true,
  remix_of      uuid references public.posts(id) on delete set null,
  created_at    timestamptz default now()
);

-- 피드 정렬 인덱스
create index posts_created_at_idx on public.posts(created_at desc);
-- 리믹스 lineage 조회 인덱스
create index posts_remix_of_idx on public.posts(remix_of);
-- 프로필 조회 인덱스
create index posts_author_id_idx on public.posts(author_id);

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
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  duration_seconds  integer not null default 0 check (duration_seconds >= 0),
  created_at        timestamptz default now()
);

create index experience_events_post_idx on public.experience_events(post_id, started_at desc);
create index experience_events_viewer_idx on public.experience_events(viewer_id, started_at desc);
create index experience_events_session_idx on public.experience_events(client_session_id);

-- ============================================================
-- 5. Row Level Security (RLS)
-- ============================================================
alter table public.users         enable row level security;
alter table public.posts         enable row level security;
alter table public.notifications enable row level security;
alter table public.experience_events enable row level security;

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

-- ============================================================
-- 6. 신규 가입 시 users 행 자동 생성 트리거
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
