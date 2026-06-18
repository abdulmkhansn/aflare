-- GitHub Verified Builder metadata columns.
-- Run in Supabase SQL editor. Safe to re-run.

alter table public.profiles
  add column if not exists github_username text,
  add column if not exists verified_at timestamptz,
  add column if not exists github_public_repo_count integer,
  add column if not exists github_account_created_at timestamptz;

-- verified_builder and github_username should already exist.
comment on column public.profiles.verified_builder is
  'Trust signal: confirmed public GitHub building activity. Optional; never gates participation.';
comment on column public.profiles.github_username is
  'Public GitHub login stored after verification. Metadata only — no tokens, no code.';
comment on column public.profiles.verified_at is
  'When GitHub verification last succeeded.';
comment on column public.profiles.github_public_repo_count is
  'Public repo count from GitHub /user at verification time.';
comment on column public.profiles.github_account_created_at is
  'GitHub account created_at from public metadata at verification time.';
