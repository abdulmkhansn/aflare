-- Bookmarks: composite primary key (user_id + one target column).
-- RLS: users can read/write only their own rows.

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  flare_id uuid references public.flares (id) on delete cascade,
  article_id uuid references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint bookmarks_one_target check (
    num_nonnulls(post_id, flare_id, article_id) = 1
  )
);

create unique index if not exists bookmarks_user_post_idx
  on public.bookmarks (user_id, post_id)
  where post_id is not null;

create unique index if not exists bookmarks_user_flare_idx
  on public.bookmarks (user_id, flare_id)
  where flare_id is not null;

create unique index if not exists bookmarks_user_article_idx
  on public.bookmarks (user_id, article_id)
  where article_id is not null;

create index if not exists bookmarks_user_created_idx
  on public.bookmarks (user_id, created_at desc);

alter table public.bookmarks enable row level security;

create policy "Users read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);
