-- Supabase schema for PollApp
-- Run this in the Supabase SQL editor or via `supabase db push`

-- Extensions
create extension if not exists pgcrypto;

-- Profiles: optional user profile linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Polls
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  description text,
  is_public boolean not null default true,
  allow_multiple_votes boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists trg_polls_updated_at on public.polls;
create trigger trg_polls_updated_at
before update on public.polls
for each row execute function public.set_updated_at();

-- Poll options
create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_text text not null check (char_length(option_text) <= 100),
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (poll_id, option_text)
);

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  voter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Ensure option belongs to poll and keep poll_id consistent
create or replace function public.sync_vote_poll_id()
returns trigger language plpgsql as $$
declare
  opt_poll_id uuid;
begin
  select poll_id into opt_poll_id from public.poll_options where id = new.option_id;
  if opt_poll_id is null then
    raise exception 'Invalid option_id %', new.option_id;
  end if;
  -- overwrite poll_id from option's poll
  new.poll_id := opt_poll_id;
  return new;
end;$$;

drop trigger if exists trg_votes_sync_poll on public.votes;
create trigger trg_votes_sync_poll
before insert or update of option_id on public.votes
for each row execute function public.sync_vote_poll_id();

-- Prevent multiple votes when allow_multiple_votes = false
create or replace function public.enforce_single_vote()
returns trigger language plpgsql as $$
declare
  allow_multi boolean;
  existing_count int;
begin
  select allow_multiple_votes into allow_multi from public.polls where id = new.poll_id;
  if allow_multi is null then
    raise exception 'Poll % not found', new.poll_id;
  end if;
  if allow_multi = false then
    select count(*) into existing_count from public.votes
      where poll_id = new.poll_id and voter_id = new.voter_id
      and (tg_op = 'INSERT' or id <> new.id);
    if existing_count > 0 then
      raise exception 'Multiple votes are not allowed for this poll';
    end if;
  end if;
  return new;
end;$$;

drop trigger if exists trg_votes_single_rule on public.votes;
create trigger trg_votes_single_rule
before insert or update on public.votes
for each row execute function public.enforce_single_vote();

-- Prevent voting on expired polls
create or replace function public.prevent_expired_votes()
returns trigger language plpgsql as $$
declare
  expired boolean;
begin
  select (expires_at is not null and expires_at <= now()) into expired from public.polls where id = new.poll_id;
  if expired then
    raise exception 'This poll has expired';
  end if;
  return new;
end;$$;

drop trigger if exists trg_votes_no_expired on public.votes;
create trigger trg_votes_no_expired
before insert on public.votes
for each row execute function public.prevent_expired_votes();

-- Indexes
create index if not exists idx_polls_author on public.polls(author_id);
create index if not exists idx_polls_created_at on public.polls(created_at desc);
create index if not exists idx_options_poll on public.poll_options(poll_id);
create index if not exists idx_votes_poll on public.votes(poll_id);
create index if not exists idx_votes_option on public.votes(option_id);
create index if not exists idx_votes_voter on public.votes(voter_id);

-- Aggregation views
create or replace view public.poll_option_stats as
  select o.id as option_id,
         o.poll_id,
         o.option_text,
         count(v.id) as vote_count
  from public.poll_options o
  left join public.votes v on v.option_id = o.id
  group by o.id;

create or replace view public.poll_stats as
  select p.id as poll_id,
         p.title,
         p.author_id,
         p.is_public,
         p.allow_multiple_votes,
         p.expires_at,
         p.created_at,
         sum(pos.vote_count)::int as total_votes
  from public.polls p
  left join public.poll_option_stats pos on pos.poll_id = p.id
  group by p.id;

-- RLS
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;
alter table public.profiles enable row level security;

-- Profiles policies
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Polls policies
drop policy if exists polls_select_public_or_owner on public.polls;
create policy polls_select_public_or_owner on public.polls
  for select using (
    is_public = true or author_id = auth.uid()
  );

drop policy if exists polls_insert_owner on public.polls;
create policy polls_insert_owner on public.polls
  for insert with check (author_id = auth.uid());

drop policy if exists polls_update_owner on public.polls;
create policy polls_update_owner on public.polls
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists polls_delete_owner on public.polls;
create policy polls_delete_owner on public.polls
  for delete using (author_id = auth.uid());

-- Poll options policies (mirror poll visibility and ownership)
drop policy if exists options_select_public_or_owner on public.poll_options;
create policy options_select_public_or_owner on public.poll_options
  for select using (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and (p.is_public = true or p.author_id = auth.uid())
    )
  );

drop policy if exists options_insert_owner on public.poll_options;
create policy options_insert_owner on public.poll_options
  for insert with check (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.author_id = auth.uid()
    )
  );

drop policy if exists options_update_owner on public.poll_options;
create policy options_update_owner on public.poll_options
  for update using (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.author_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.author_id = auth.uid()
    )
  );

drop policy if exists options_delete_owner on public.poll_options;
create policy options_delete_owner on public.poll_options
  for delete using (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.author_id = auth.uid()
    )
  );

-- Votes policies
-- Anyone can read votes for public polls; authors can read all their polls' votes; users can read their own votes
drop policy if exists votes_select_access on public.votes;
create policy votes_select_access on public.votes
  for select using (
    voter_id = auth.uid() or
    exists (
      select 1 from public.polls p where p.id = poll_id and (p.is_public = true or p.author_id = auth.uid())
    )
  );

-- Insert: authenticated users may vote in public (and non-expired) polls
drop policy if exists votes_insert_public on public.votes;
create policy votes_insert_public on public.votes
  for insert with check (
    auth.uid() = voter_id and
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.is_public = true and (p.expires_at is null or p.expires_at > now())
    )
  );

-- Delete: voters can remove their own vote; authors can moderate
drop policy if exists votes_delete_self_or_author on public.votes;
create policy votes_delete_self_or_author on public.votes
  for delete using (
    voter_id = auth.uid() or
    exists (
      select 1 from public.polls p where p.id = poll_id and p.author_id = auth.uid()
    )
  );

-- Optional: prevent updates (delete+insert instead)
revoke update on table public.votes from anon, authenticated;


