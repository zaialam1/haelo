-- Professional profile extension for Haelo professional accounts.
-- account_role remains on public.profiles ('user' | 'professional').
-- UI copy may say "Personal" for role = user.

create table if not exists public.professional_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null,
  professional_type text not null
    check (
      professional_type in (
        'school_counselor',
        'therapist',
        'psychologist',
        'educator',
        'coach_or_mentor',
        'other'
      )
    ),
  organization_name text,
  verification_status text not null default 'verified'
    check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professional_profiles_verification_idx
  on public.professional_profiles (verification_status);

alter table public.professional_profiles enable row level security;

-- Professionals can read their own professional profile.
create policy "Professionals can select own professional profile"
  on public.professional_profiles
  for select
  using (auth.uid() = user_id);

-- Updates to verification_status are blocked for clients (see trigger).
create policy "Professionals can update own professional profile fields"
  on public.professional_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No direct client inserts — use complete_professional_signup RPC.
create or replace function public.professional_profiles_guard()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();

  if tg_op = 'UPDATE'
     and new.verification_status is distinct from old.verification_status
     and coalesce(auth.role(), '') = 'authenticated'
     and coalesce(current_setting('haelo.bypass_profile_guard', true), '') <> 'on'
  then
    raise exception 'verification_status cannot be changed by clients';
  end if;

  if tg_op = 'UPDATE'
     and new.user_id is distinct from old.user_id then
    raise exception 'user_id cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists professional_profiles_guard on public.professional_profiles;
create trigger professional_profiles_guard
  before update on public.professional_profiles
  for each row
  execute function public.professional_profiles_guard();

-- Allow trusted RPCs to set account_role / verification during provisioning.
create or replace function public.profiles_guard_update()
returns trigger
language plpgsql
as $$
begin
  if coalesce(current_setting('haelo.bypass_profile_guard', true), '') = 'on' then
    new.updated_at := now();
    return new;
  end if;

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

-- Atomically finish professional signup for the authenticated user.
create or replace function public.complete_professional_signup(
  p_display_name text,
  p_professional_type text,
  p_organization_name text default null,
  p_raw_username text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  normalized text;
  claim_result jsonb;
  org text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  if p_display_name is null or length(trim(p_display_name)) < 1 then
    return jsonb_build_object('ok', false, 'error', 'display_name_required');
  end if;

  if p_professional_type is null
     or p_professional_type not in (
       'school_counselor',
       'therapist',
       'psychologist',
       'educator',
       'coach_or_mentor',
       'other'
     ) then
    return jsonb_build_object('ok', false, 'error', 'invalid_professional_type');
  end if;

  -- Ensure a base profile row exists.
  insert into public.profiles (id, account_role)
  values (uid, 'user')
  on conflict (id) do nothing;

  perform set_config('haelo.bypass_profile_guard', 'on', true);

  update public.profiles
  set account_role = 'professional', updated_at = now()
  where id = uid;

  org := nullif(trim(coalesce(p_organization_name, '')), '');

  insert into public.professional_profiles (
    user_id,
    display_name,
    professional_type,
    organization_name,
    verification_status
  )
  values (
    uid,
    trim(p_display_name),
    p_professional_type,
    org,
    'verified'
  )
  on conflict (user_id) do update
  set
    display_name = excluded.display_name,
    professional_type = excluded.professional_type,
    organization_name = excluded.organization_name,
    verification_status = 'verified',
    updated_at = now();

  if p_raw_username is not null and length(trim(p_raw_username)) > 0 then
    claim_result := public.claim_username(p_raw_username);
    if coalesce((claim_result->>'ok')::boolean, false) is not true
       and coalesce(claim_result->>'error', '') not in ('already_set') then
      return jsonb_build_object(
        'ok', false,
        'error', coalesce(claim_result->>'error', 'username_failed'),
        'claim', claim_result
      );
    end if;
    normalized := coalesce(claim_result->>'username', public.normalize_haelo_username(p_raw_username));
  end if;

  return jsonb_build_object(
    'ok', true,
    'username', normalized,
    'verification_status', 'verified'
  );
end;
$$;

revoke all on function public.complete_professional_signup(text, text, text, text) from public;
grant execute on function public.complete_professional_signup(text, text, text, text) to authenticated;

-- Helper: is this professional verified?
create or replace function public.is_verified_professional(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.professional_profiles pp on pp.user_id = p.id
    where p.id = uid
      and p.account_role = 'professional'
      and pp.verification_status = 'verified'
  );
$$;

revoke all on function public.is_verified_professional(uuid) from public;
grant execute on function public.is_verified_professional(uuid) to authenticated;

-- Tighten connection search / requests to verified professionals going forward.
-- Keep is_professional_account for role checks; add verified gate for teen-facing actions.
create or replace function public.is_verified_professional_account(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_verified_professional(uid);
$$;

revoke all on function public.is_verified_professional_account(uuid) from public;
grant execute on function public.is_verified_professional_account(uuid) to authenticated;

-- Update search to require verified professional.
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

  if not public.is_verified_professional(auth.uid()) then
    return jsonb_build_object('ok', false, 'error', 'verification_pending');
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

  if found_id is null or found_id = auth.uid() then
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

-- Connection insert policy: require verified professional.
drop policy if exists "Professionals can insert connection requests"
  on public.professional_connections;

create policy "Verified professionals can insert connection requests"
  on public.professional_connections
  for insert
  with check (
    auth.uid() = professional_user_id
    and public.is_verified_professional(auth.uid())
    and status = 'pending'
  );

drop policy if exists "Professionals can update own connection requests"
  on public.professional_connections;

create policy "Verified professionals can update own connection requests"
  on public.professional_connections
  for update
  using (
    auth.uid() = professional_user_id
    and public.is_verified_professional(auth.uid())
  )
  with check (
    auth.uid() = professional_user_id
    and public.is_verified_professional(auth.uid())
  );

-- Guard trigger: only verified professionals may create/reopen requests.
create or replace function public.professional_connections_guard()
returns trigger
language plpgsql
as $$
declare
  cooldown interval := interval '7 days';
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    if not public.is_verified_professional(new.professional_user_id) then
      raise exception 'only verified professionals can create connection requests';
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

  if auth.uid() = old.user_id then
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
    if not public.is_verified_professional(auth.uid()) then
      raise exception 'only verified professionals can update connection requests';
    end if;
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
    if old.status = 'pending' and new.status = 'removed' then
      new.removed_at := now();
      return new;
    end if;
    raise exception 'invalid connection status transition for professional';
  end if;

  raise exception 'not allowed to update this connection';
end;
$$;

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
    join public.professional_profiles pp on pp.user_id = c.professional_user_id
    where c.professional_user_id = professional_id
      and c.user_id = target_user_id
      and c.status = 'accepted'
      and p.account_role = 'professional'
      and pp.verification_status = 'verified'
  );
$$;
