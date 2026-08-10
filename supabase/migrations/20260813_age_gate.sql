-- Age gate + parental consent for personal accounts.
-- Status lives on profiles; approval tokens in parental_consent_requests.

-- ---------------------------------------------------------------------------
-- profiles columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists age_gate_status text not null default 'unverified',
  add column if not exists age_gate_cleared_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_age_gate_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_age_gate_status_check
      check (
        age_gate_status in (
          'unverified',
          'cleared_13_plus',
          'awaiting_parent',
          'parent_approved'
        )
      );
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- parental_consent_requests
-- ---------------------------------------------------------------------------
create table if not exists public.parental_consent_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint parental_consent_requests_token_hash_key unique (token_hash)
);

create index if not exists parental_consent_requests_user_pending_idx
  on public.parental_consent_requests (user_id, created_at desc)
  where approved_at is null;

alter table public.parental_consent_requests enable row level security;

-- No direct client access to token_hash; use RPCs for metadata / approve.
revoke all on table public.parental_consent_requests from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Guard: clients cannot set age gate fields
-- ---------------------------------------------------------------------------
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

  if (
       new.age_gate_status is distinct from old.age_gate_status
       or new.age_gate_cleared_at is distinct from old.age_gate_cleared_at
     )
     and coalesce(auth.role(), '') = 'authenticated' then
    raise exception 'age_gate fields cannot be changed by clients';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

create or replace function public.hash_parental_consent_token(token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(digest(convert_to(token, 'utf8'), 'sha256'), 'hex');
$$;

create or replace function public.is_age_gate_cleared(status text)
returns boolean
language sql
immutable
as $$
  select status in ('cleared_13_plus', 'parent_approved');
$$;

-- ---------------------------------------------------------------------------
-- clear_age_gate_13_plus
-- ---------------------------------------------------------------------------
create or replace function public.clear_age_gate_13_plus()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  current_status text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select age_gate_status into current_status
  from public.profiles
  where id = uid;

  if current_status is null then
    insert into public.profiles (id, account_role, age_gate_status)
    values (uid, 'user', 'unverified')
    on conflict (id) do nothing;
    current_status := 'unverified';
  end if;

  if public.is_age_gate_cleared(current_status) then
    return jsonb_build_object('ok', true, 'status', current_status, 'already_cleared', true);
  end if;

  if current_status not in ('unverified', 'awaiting_parent') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status', 'status', current_status);
  end if;

  perform set_config('haelo.bypass_profile_guard', 'on', true);

  update public.profiles
  set
    age_gate_status = 'cleared_13_plus',
    age_gate_cleared_at = now(),
    updated_at = now()
  where id = uid;

  return jsonb_build_object('ok', true, 'status', 'cleared_13_plus');
end;
$$;

revoke all on function public.clear_age_gate_13_plus() from public;
grant execute on function public.clear_age_gate_13_plus() to authenticated;

-- ---------------------------------------------------------------------------
-- request_parental_consent
-- ---------------------------------------------------------------------------
create or replace function public.request_parental_consent(parent_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  email_clean text;
  current_status text;
  account text;
  token text;
  token_digest text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  email_clean := lower(trim(coalesce(parent_email, '')));
  if email_clean !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;

  select age_gate_status, account_role
  into current_status, account
  from public.profiles
  where id = uid;

  if current_status is null then
    insert into public.profiles (id, account_role, age_gate_status)
    values (uid, 'user', 'unverified')
    on conflict (id) do nothing;
    current_status := 'unverified';
    account := 'user';
  end if;

  if account is distinct from 'user' then
    return jsonb_build_object('ok', false, 'error', 'not_personal_account');
  end if;

  if public.is_age_gate_cleared(current_status) then
    return jsonb_build_object('ok', false, 'error', 'already_cleared', 'status', current_status);
  end if;

  -- Invalidate prior pending requests for this user.
  delete from public.parental_consent_requests
  where user_id = uid
    and approved_at is null;

  token := replace(gen_random_uuid()::text, '-', '')
        || replace(gen_random_uuid()::text, '-', '');
  token_digest := public.hash_parental_consent_token(token);

  insert into public.parental_consent_requests (
    user_id,
    parent_email,
    token_hash,
    expires_at
  )
  values (
    uid,
    email_clean,
    token_digest,
    now() + interval '7 days'
  );

  perform set_config('haelo.bypass_profile_guard', 'on', true);

  update public.profiles
  set
    age_gate_status = 'awaiting_parent',
    updated_at = now()
  where id = uid;

  -- Plaintext token returned once for the email sender.
  return jsonb_build_object(
    'ok', true,
    'status', 'awaiting_parent',
    'token', token,
    'parent_email', email_clean,
    'expires_at', (now() + interval '7 days')
  );
end;
$$;

revoke all on function public.request_parental_consent(text) from public;
grant execute on function public.request_parental_consent(text) to authenticated;

-- ---------------------------------------------------------------------------
-- approve_parental_consent (parent may be anonymous)
-- ---------------------------------------------------------------------------
create or replace function public.approve_parental_consent(token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  token_clean text := trim(coalesce(token, ''));
  token_digest text;
  req record;
begin
  if length(token_clean) < 32 then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  token_digest := public.hash_parental_consent_token(token_clean);

  select *
  into req
  from public.parental_consent_requests
  where token_hash = token_digest
  limit 1;

  if req.id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  if req.approved_at is not null then
    return jsonb_build_object(
      'ok', true,
      'status', 'parent_approved',
      'already_approved', true,
      'user_id', req.user_id
    );
  end if;

  if req.expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  update public.parental_consent_requests
  set approved_at = now()
  where id = req.id
    and approved_at is null;

  perform set_config('haelo.bypass_profile_guard', 'on', true);

  update public.profiles
  set
    age_gate_status = 'parent_approved',
    age_gate_cleared_at = coalesce(age_gate_cleared_at, now()),
    updated_at = now()
  where id = req.user_id
    and age_gate_status is distinct from 'parent_approved';

  return jsonb_build_object(
    'ok', true,
    'status', 'parent_approved',
    'user_id', req.user_id
  );
end;
$$;

revoke all on function public.approve_parental_consent(text) from public;
grant execute on function public.approve_parental_consent(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_own_pending_parental_consent (no token_hash)
-- ---------------------------------------------------------------------------
create or replace function public.get_own_pending_parental_consent()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  req record;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select parent_email, expires_at, created_at, approved_at
  into req
  from public.parental_consent_requests
  where user_id = uid
    and approved_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if req.parent_email is null then
    return jsonb_build_object('ok', true, 'pending', null);
  end if;

  return jsonb_build_object(
    'ok', true,
    'pending', jsonb_build_object(
      'parent_email', req.parent_email,
      'expires_at', req.expires_at,
      'created_at', req.created_at
    )
  );
end;
$$;

revoke all on function public.get_own_pending_parental_consent() from public;
grant execute on function public.get_own_pending_parental_consent() to authenticated;
