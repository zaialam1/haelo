-- Profiles (Haelo username + account role), professional connections,
-- and reusable in-app notifications. Foundation for future Orbit recommendations.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  username_normalized text,
  account_role text not null default 'user'
    check (account_role in ('user', 'professional')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_normalized_format check (
    username_normalized is null
    or username_normalized ~ '^[a-z0-9]([a-z0-9_]{1,18}[a-z0-9])?$'
  ),
  constraint profiles_username_pair check (
    (username is null and username_normalized is null)
    or (
      username is not null
      and username_normalized is not null
      and lower(username) = username_normalized
    )
  )
);

-- Case-insensitive uniqueness via normalized column.
create unique index if not exists profiles_username_normalized_uidx
  on public.profiles (username_normalized)
  where username_normalized is not null;

create index if not exists profiles_account_role_idx
  on public.profiles (account_role);

alter table public.profiles enable row level security;

-- Users can read only their own profile (no teen directory).
create policy "Users can select own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Backfill-safe: user may create their own default profile row if missing.
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (
    auth.uid() = id
    and account_role = 'user'
    and username is null
    and username_normalized is null
  );

create policy "Users can update own profile fields"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep account_role immutable for clients; username settable only when unset.
-- Service role / SQL editor may change account_role for verified professionals.
create or replace function public.profiles_guard_update()
returns trigger
language plpgsql
as $$
begin
  if new.account_role is distinct from old.account_role
     and coalesce(auth.role(), '') = 'authenticated' then
    raise exception 'account_role cannot be changed by clients';
  end if;

  if old.username_normalized is not null
     and new.username_normalized is distinct from old.username_normalized
     and coalesce(auth.role(), '') = 'authenticated' then
    raise exception 'username cannot be changed once set';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row
  execute function public.profiles_guard_update();

-- Auto-create a profile row for every new auth user.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, account_role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- Backfill profiles for existing auth users.
insert into public.profiles (id, account_role)
select id, 'user'
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Reserved usernames (DB-side enforcement; keep in sync with app list)
-- ---------------------------------------------------------------------------

create or replace function public.is_reserved_username(candidate text)
returns boolean
language sql
immutable
as $$
  select lower(candidate) = any (array[
    'admin',
    'administrator',
    'haelo',
    'support',
    'help',
    'moderator',
    'system',
    'official',
    'staff',
    'counselor',
    'counsellor',
    'professional',
    'root',
    'null',
    'undefined'
  ]);
$$;

-- ---------------------------------------------------------------------------
-- Username helpers (secure RPCs — no profile directory exposure)
-- ---------------------------------------------------------------------------

create or replace function public.normalize_haelo_username(raw text)
returns text
language sql
immutable
as $$
  select nullif(lower(trim(both from regexp_replace(coalesce(raw, ''), '^@+', ''))), '');
$$;

create or replace function public.is_valid_haelo_username(candidate text)
returns boolean
language sql
immutable
as $$
  select
    candidate is not null
    and candidate ~ '^[a-z0-9]([a-z0-9_]{1,18}[a-z0-9])?$'
    and char_length(candidate) between 3 and 20
    and not public.is_reserved_username(candidate);
$$;

-- Availability check for claiming a name (works signed-out for signup).
-- Returns: 'available' | 'invalid' | 'reserved' | 'taken'
create or replace function public.check_username_availability(raw_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  existing_id uuid;
begin
  normalized := public.normalize_haelo_username(raw_username);

  if normalized is null
     or char_length(normalized) < 3
     or char_length(normalized) > 20
     or normalized !~ '^[a-z0-9]([a-z0-9_]{1,18}[a-z0-9])?$' then
    return 'invalid';
  end if;

  if public.is_reserved_username(normalized) then
    return 'reserved';
  end if;

  select id into existing_id
  from public.profiles
  where username_normalized = normalized
  limit 1;

  if existing_id is not null
     and (auth.uid() is null or existing_id <> auth.uid()) then
    return 'taken';
  end if;

  return 'available';
end;
$$;

revoke all on function public.check_username_availability(text) from public;
grant execute on function public.check_username_availability(text) to anon, authenticated;

-- Atomically claim a username (once). Race-safe via unique index.
create or replace function public.claim_username(raw_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  availability text;
  updated_rows int;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  availability := public.check_username_availability(raw_username);
  if availability <> 'available' then
    return jsonb_build_object('ok', false, 'error', availability);
  end if;

  normalized := public.normalize_haelo_username(raw_username);

  update public.profiles
  set
    username = normalized,
    username_normalized = normalized,
    updated_at = now()
  where id = auth.uid()
    and username_normalized is null;

  get diagnostics updated_rows = row_count;

  if updated_rows = 0 then
    -- Already has a username, or profile missing.
    if exists (
      select 1 from public.profiles
      where id = auth.uid() and username_normalized is not null
    ) then
      return jsonb_build_object('ok', false, 'error', 'already_set');
    end if;

    insert into public.profiles (id, username, username_normalized, account_role)
    values (auth.uid(), normalized, normalized, 'user')
    on conflict (id) do update
      set
        username = excluded.username,
        username_normalized = excluded.username_normalized,
        updated_at = now()
      where public.profiles.username_normalized is null;

    get diagnostics updated_rows = row_count;
    if updated_rows = 0 then
      return jsonb_build_object('ok', false, 'error', 'already_set');
    end if;
  end if;

  return jsonb_build_object('ok', true, 'username', normalized);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'taken');
end;
$$;

revoke all on function public.claim_username(text) from public;
grant execute on function public.claim_username(text) to authenticated;

-- Professional-only exact username lookup. Returns minimal fields.
create or replace function public.search_haelo_username(raw_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  caller_role text;
  found_id uuid;
  found_username text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select account_role into caller_role
  from public.profiles
  where id = auth.uid();

  if caller_role is distinct from 'professional' then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  normalized := public.normalize_haelo_username(raw_username);
  if normalized is null or not public.is_valid_haelo_username(normalized) then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select id, username into found_id, found_username
  from public.profiles
  where username_normalized = normalized
    and account_role = 'user'
  limit 1;

  if found_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if found_id = auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  return jsonb_build_object(
    'ok', true,
    'user', jsonb_build_object(
      'id', found_id,
      'username', found_username
    )
  );
end;
$$;

revoke all on function public.search_haelo_username(text) from public;
grant execute on function public.search_haelo_username(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Professional connections
-- ---------------------------------------------------------------------------

create table if not exists public.professional_connections (
  id uuid primary key default gen_random_uuid(),
  professional_user_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'removed')),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_connections_distinct_users check (
    professional_user_id <> user_id
  ),
  constraint professional_connections_pair_unique unique (
    professional_user_id,
    user_id
  )
);

create index if not exists professional_connections_professional_status_idx
  on public.professional_connections (professional_user_id, status);

create index if not exists professional_connections_user_status_idx
  on public.professional_connections (user_id, status);

alter table public.professional_connections enable row level security;

create or replace function public.is_professional_account(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = uid
      and account_role = 'professional'
  );
$$;

revoke all on function public.is_professional_account(uuid) from public;
grant execute on function public.is_professional_account(uuid) to authenticated;

-- Participants can see their own connection rows.
create policy "Participants can select own connections"
  on public.professional_connections
  for select
  using (
    auth.uid() = professional_user_id
    or auth.uid() = user_id
  );

-- Only professionals may create requests as themselves.
create policy "Professionals can insert connection requests"
  on public.professional_connections
  for insert
  with check (
    auth.uid() = professional_user_id
    and public.is_professional_account(auth.uid())
    and status = 'pending'
  );

-- Users respond / remove; professionals may not forge acceptance.
create policy "Users can update own connection responses"
  on public.professional_connections
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Professionals may re-request after cooldown (status → pending) on their rows.
create policy "Professionals can update own connection requests"
  on public.professional_connections
  for update
  using (
    auth.uid() = professional_user_id
    and public.is_professional_account(auth.uid())
  )
  with check (
    auth.uid() = professional_user_id
    and public.is_professional_account(auth.uid())
  );

create or replace function public.professional_connections_guard()
returns trigger
language plpgsql
as $$
declare
  cooldown interval := interval '7 days';
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    if not public.is_professional_account(new.professional_user_id) then
      raise exception 'only professionals can create connection requests';
    end if;
    if not exists (
      select 1 from public.profiles
      where id = new.user_id and account_role = 'user'
    ) then
      raise exception 'connection target must be a Haelo user';
    end if;
    new.status := 'pending';
    new.requested_at := coalesce(new.requested_at, now());
    new.responded_at := null;
    new.removed_at := null;
    return new;
  end if;

  -- UPDATE
  if auth.uid() = old.user_id then
    -- Teen may accept / decline pending, or remove accepted.
    if old.status = 'pending' and new.status in ('accepted', 'declined') then
      new.responded_at := now();
      new.removed_at := null;
      return new;
    end if;
    if old.status = 'accepted' and new.status = 'removed' then
      new.removed_at := now();
      return new;
    end if;
    raise exception 'invalid connection status transition for user';
  end if;

  if auth.uid() = old.professional_user_id then
    -- Professional may re-open declined/removed after cooldown → pending.
    if old.status in ('declined', 'removed') and new.status = 'pending' then
      if old.status = 'declined'
         and old.responded_at is not null
         and old.responded_at > now() - cooldown then
        raise exception 'connection request cooldown active';
      end if;
      if old.status = 'removed'
         and old.removed_at is not null
         and old.removed_at > now() - cooldown then
        raise exception 'connection request cooldown active';
      end if;
      new.requested_at := now();
      new.responded_at := null;
      new.removed_at := null;
      return new;
    end if;
    -- Professional may cancel their own pending request → removed.
    if old.status = 'pending' and new.status = 'removed' then
      new.removed_at := now();
      return new;
    end if;
    raise exception 'invalid connection status transition for professional';
  end if;

  raise exception 'not allowed to update this connection';
end;
$$;

drop trigger if exists professional_connections_guard on public.professional_connections;
create trigger professional_connections_guard
  before insert or update on public.professional_connections
  for each row
  execute function public.professional_connections_guard();

-- Authorization helper for future Orbit recommendations.
create or replace function public.can_professional_recommend_to(
  professional_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.professional_connections c
    join public.profiles p on p.id = c.professional_user_id
    where c.professional_user_id = professional_id
      and c.user_id = target_user_id
      and c.status = 'accepted'
      and p.account_role = 'professional'
  );
$$;

revoke all on function public.can_professional_recommend_to(uuid, uuid) from public;
grant execute on function public.can_professional_recommend_to(uuid, uuid) to authenticated;

-- Connection list with counterpart username only (no private profile fields).
create or replace function public.list_my_connections()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(row_data order by sort_ts desc)
      from (
        select
          jsonb_build_object(
            'id', c.id,
            'professional_user_id', c.professional_user_id,
            'user_id', c.user_id,
            'status', c.status,
            'requested_at', c.requested_at,
            'responded_at', c.responded_at,
            'removed_at', c.removed_at,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'counterpart_username', p.username
          ) as row_data,
          c.updated_at as sort_ts
        from public.professional_connections c
        join public.profiles p
          on p.id = case
            when c.professional_user_id = uid then c.user_id
            else c.professional_user_id
          end
        where (c.professional_user_id = uid or c.user_id = uid)
          and c.status in ('pending', 'accepted')
      ) ranked
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.list_my_connections() from public;
grant execute on function public.list_my_connections() to authenticated;

-- Pending connection request details for the recipient (Universe notification).
create or replace function public.get_pending_connection_request(connection_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  c public.professional_connections%rowtype;
  pro_username text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select * into c
  from public.professional_connections
  where id = connection_id;

  if not found or c.user_id <> uid or c.status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select username into pro_username
  from public.profiles
  where id = c.professional_user_id;

  return jsonb_build_object(
    'ok', true,
    'connection', jsonb_build_object(
      'id', c.id,
      'status', c.status,
      'professional_user_id', c.professional_user_id,
      'professional_username', pro_username,
      'requested_at', c.requested_at
    )
  );
end;
$$;

revoke all on function public.get_pending_connection_request(uuid) from public;
grant execute on function public.get_pending_connection_request(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications (reusable foundation)
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null
    check (type in ('connection_request')),
  reference_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

create index if not exists notifications_reference_idx
  on public.notifications (type, reference_id);

alter table public.notifications enable row level security;

create policy "Users can select own notifications"
  on public.notifications
  for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts via security definer trigger / functions only (no direct client insert).
create or replace function public.create_connection_request_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    insert into public.notifications (user_id, type, reference_id)
    values (new.user_id, 'connection_request', new.id);
  elsif tg_op = 'UPDATE'
       and new.status = 'pending'
       and old.status is distinct from 'pending' then
    insert into public.notifications (user_id, type, reference_id)
    values (new.user_id, 'connection_request', new.id);
  elsif tg_op = 'UPDATE'
       and old.status = 'pending'
       and new.status is distinct from 'pending' then
    delete from public.notifications
    where type = 'connection_request'
      and reference_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists connection_request_notification on public.professional_connections;
create trigger connection_request_notification
  after insert or update on public.professional_connections
  for each row
  execute function public.create_connection_request_notification();
