-- TrekLog initial schema, storage bucket and row level security policies.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trip_status') then
    create type trip_status as enum ('draft', 'published');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 32),
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  description text,
  tips text,
  location text,
  travel_style text check (travel_style in ('road-trip', 'trek', 'backpacking', 'family', 'solo', 'weekend')),
  difficulty text check (difficulty in ('easy', 'moderate', 'hard')),
  season text check (season in ('spring', 'summer', 'monsoon', 'autumn', 'winter')),
  start_date date,
  end_date date,
  cover_image text,
  status trip_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  position integer not null check (position >= 0),
  arrival_date date,
  notes text,
  created_at timestamptz not null default now(),
  unique (trip_id, position)
);

create table if not exists public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  date date,
  title text,
  description text,
  created_at timestamptz not null default now(),
  unique (trip_id, day_number)
);

create table if not exists public.trip_media (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_id uuid references public.trip_days (id) on delete set null,
  storage_path text,
  public_url text not null,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, trip_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists trips_user_id_idx on public.trips (user_id);
create index if not exists trips_status_created_at_idx on public.trips (status, created_at desc);
create index if not exists trips_title_trgm_idx on public.trips using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(location, '')));
create index if not exists trip_stops_trip_id_position_idx on public.trip_stops (trip_id, position);
create index if not exists trip_days_trip_id_day_number_idx on public.trip_days (trip_id, day_number);
create index if not exists trip_media_trip_id_idx on public.trip_media (trip_id);
create index if not exists saved_trips_user_id_idx on public.saved_trips (user_id);
create index if not exists follows_following_id_idx on public.follows (following_id);

-- keep trips.updated_at accurate
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

-- create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  suffix integer := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'traveler'),
    '[^a-z0-9_]', '', 'g'
  ));

  if char_length(base_username) < 3 then
    base_username := 'traveler';
  end if;

  candidate := left(base_username, 32);

  while exists (select 1 from public.profiles p where p.username = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_username, 28) || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    candidate,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- helper: is the given trip readable by the current user?
create or replace function public.trip_is_visible(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips t
    where t.id = target_trip_id
      and (t.status = 'published' or t.user_id = auth.uid())
  );
$$;

create or replace function public.trip_is_owned(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trips t where t.id = target_trip_id and t.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.trip_days enable row level security;
alter table public.trip_media enable row level security;
alter table public.saved_trips enable row level security;
alter table public.follows enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone" on public.profiles
  for select using (true);

drop policy if exists "users insert their own profile" on public.profiles;
create policy "users insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "published trips are readable" on public.trips;
create policy "published trips are readable" on public.trips
  for select using (status = 'published' or user_id = auth.uid());

drop policy if exists "users create their own trips" on public.trips;
create policy "users create their own trips" on public.trips
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update their own trips" on public.trips;
create policy "users update their own trips" on public.trips
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete their own trips" on public.trips;
create policy "users delete their own trips" on public.trips
  for delete using (auth.uid() = user_id);

drop policy if exists "trip stops follow trip visibility" on public.trip_stops;
create policy "trip stops follow trip visibility" on public.trip_stops
  for select using (public.trip_is_visible(trip_id));

drop policy if exists "trip stops are writable by owner" on public.trip_stops;
create policy "trip stops are writable by owner" on public.trip_stops
  for all using (public.trip_is_owned(trip_id)) with check (public.trip_is_owned(trip_id));

drop policy if exists "trip days follow trip visibility" on public.trip_days;
create policy "trip days follow trip visibility" on public.trip_days
  for select using (public.trip_is_visible(trip_id));

drop policy if exists "trip days are writable by owner" on public.trip_days;
create policy "trip days are writable by owner" on public.trip_days
  for all using (public.trip_is_owned(trip_id)) with check (public.trip_is_owned(trip_id));

drop policy if exists "trip media follow trip visibility" on public.trip_media;
create policy "trip media follow trip visibility" on public.trip_media
  for select using (public.trip_is_visible(trip_id));

drop policy if exists "trip media are writable by owner" on public.trip_media;
create policy "trip media are writable by owner" on public.trip_media
  for all using (public.trip_is_owned(trip_id)) with check (public.trip_is_owned(trip_id));

drop policy if exists "users read their own saves" on public.saved_trips;
create policy "users read their own saves" on public.saved_trips
  for select using (auth.uid() = user_id);

drop policy if exists "users manage their own saves" on public.saved_trips;
create policy "users manage their own saves" on public.saved_trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "follows are readable by everyone" on public.follows;
create policy "follows are readable by everyone" on public.follows
  for select using (true);

drop policy if exists "users manage their own follows" on public.follows;
create policy "users manage their own follows" on public.follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- public bucket for trip photography
insert into storage.buckets (id, name, public)
values ('trip-media', 'trip-media', true)
on conflict (id) do update set public = true;

drop policy if exists "trip media is publicly readable" on storage.objects;
create policy "trip media is publicly readable" on storage.objects
  for select using (bucket_id = 'trip-media');

drop policy if exists "users upload their own trip media" on storage.objects;
create policy "users upload their own trip media" on storage.objects
  for insert with check (
    bucket_id = 'trip-media' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "users delete their own trip media" on storage.objects;
create policy "users delete their own trip media" on storage.objects
  for delete using (
    bucket_id = 'trip-media' and auth.uid()::text = (storage.foldername(name))[1]
  );
