-- PokeTrade — user accounts
--
-- Supabase Auth owns the credentials (auth.users: email, hashed password,
-- sessions). This migration adds the public-facing half: one profile row per
-- auth user, created automatically on sign-up.
--
-- Run it in the Supabase dashboard under SQL Editor, or with
--   supabase db push
-- if you have the CLI linked to the project.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint profiles_username_length check (char_length(username) between 3 and 24),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]+$')
);

comment on table public.profiles is
  'Public profile for each auth.users row. Credentials stay in auth.users.';

-- Usernames are compared case-insensitively so "Ash" and "ash" cannot coexist.
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy on purpose: a profile disappears only when its auth.users
-- row is deleted, via the cascade above.

-- ---------------------------------------------------------------------------
-- Auto-create a profile whenever someone signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    -- The client sends `username` in the sign-up metadata; fall back to a
    -- generated handle so the insert can never fail and block the sign-up.
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      'trainer_' || replace(substr(new.id::text, 1, 8), '-', '')
    ),
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Keep updated_at honest
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
