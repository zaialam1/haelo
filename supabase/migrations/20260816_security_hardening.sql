-- Security hardening:
-- 1) Stardust: service-role-only credits + server-side cosmetic prices
-- 2) Orbit recommendation completion: require caller owns the progress row
-- 3) Professional signup: create as pending (not auto-verified)
-- 4) Remove retired age-gate / parental-consent objects

-- ===========================================================================
-- 1) Cosmetics catalog (authoritative prices) + locked RPCs
-- ===========================================================================

create table if not exists public.cosmetics_catalog (
  cosmetic_key text primary key,
  price integer not null check (price >= 0),
  active boolean not null default true
);

alter table public.cosmetics_catalog enable row level security;

drop policy if exists "Anyone authenticated can read cosmetics catalog"
  on public.cosmetics_catalog;
create policy "Anyone authenticated can read cosmetics catalog"
  on public.cosmetics_catalog
  for select
  to authenticated
  using (active = true);

revoke all on table public.cosmetics_catalog from public, anon;
grant select on table public.cosmetics_catalog to authenticated;

insert into public.cosmetics_catalog (cosmetic_key, price) values
  ('alien_soft', 8),
  ('alien_glow', 18),
  ('fireflies', 12),
  ('whisper_wisp', 15),
  ('tide_creature', 22),
  ('cloud_sheep', 20),
  ('lantern_ground', 10),
  ('crystal_cluster', 16),
  ('tide_pool', 14),
  ('moss_bloom', 9),
  ('garden_stone', 7),
  ('star_lily', 24),
  ('glow_fern', 19),
  ('silver_moon', 12),
  ('ember_moon', 20),
  ('pearl_moon', 28),
  ('mirror_moon', 32),
  ('quiet_satellite', 11),
  ('soft_ring', 14),
  ('ember_ring', 21),
  ('aurora_ring', 30),
  ('halo_ring', 35),
  ('mist_sky', 8),
  ('aurora_veil', 26),
  ('sparkle_sky', 13),
  ('dust_trail', 10),
  ('pulse_orb', 17),
  ('distant_comet', 15),
  ('ribbon_comet', 28),
  ('nebula_haze_item', 18),
  ('friend_beacon', 16),
  ('orbit_spark', 25)
on conflict (cosmetic_key) do update
set
  price = excluded.price,
  active = true;

-- credit_stardust: service_role only (never callable with user JWT)
drop function if exists public.credit_stardust(integer, text, text);
drop function if exists public.credit_stardust(uuid, integer, text, text);

create or replace function public.credit_stardust(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_ref_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_existing integer;
  v_expected integer;
begin
  if coalesce(auth.role(), '') is distinct from 'service_role' then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if p_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_user');
  end if;

  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_reason');
  end if;

  if p_ref_key is null or length(trim(p_ref_key)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_ref');
  end if;

  -- Fixed earn table (must match src/lib/cosmetics/config.ts).
  v_expected := case trim(p_reason)
    when 'session_completed' then 5
    when 'first_of_day' then 5
    when 'orbit_completed' then 20
    when 'weekly_goal' then 15
    when 'planet_evolution' then 10
    else null
  end;

  if v_expected is null or p_amount is distinct from v_expected then
    return jsonb_build_object('ok', false, 'error', 'invalid_earn');
  end if;

  select amount into v_existing
  from public.stardust_ledger
  where user_id = p_user_id and ref_key = p_ref_key;

  if found then
    select balance into v_balance
    from public.user_stardust_wallets
    where user_id = p_user_id;

    return jsonb_build_object(
      'ok', true,
      'already', true,
      'credited', 0,
      'balance', coalesce(v_balance, 0)
    );
  end if;

  insert into public.user_stardust_wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.user_stardust_wallets
  set
    balance = balance + p_amount,
    updated_at = now()
  where user_id = p_user_id
  returning balance into v_balance;

  begin
    insert into public.stardust_ledger (
      user_id, amount, reason, ref_key, balance_after
    ) values (
      p_user_id, p_amount, trim(p_reason), p_ref_key, v_balance
    );
  exception
    when unique_violation then
      update public.user_stardust_wallets
      set
        balance = balance - p_amount,
        updated_at = now()
      where user_id = p_user_id
      returning balance into v_balance;

      return jsonb_build_object(
        'ok', true,
        'already', true,
        'credited', 0,
        'balance', coalesce(v_balance, 0)
      );
  end;

  return jsonb_build_object(
    'ok', true,
    'already', false,
    'credited', p_amount,
    'balance', v_balance
  );
end;
$$;

revoke all on function public.credit_stardust(uuid, integer, text, text) from public;
-- Intentionally no grant to anon/authenticated. Call with service_role only.

-- purchase_cosmetic: price from catalog (client cannot choose price)
drop function if exists public.purchase_cosmetic(text, integer);
drop function if exists public.purchase_cosmetic(text);

create or replace function public.purchase_cosmetic(p_cosmetic_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance integer;
  v_owned boolean;
  v_price integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if p_cosmetic_key is null or length(trim(p_cosmetic_key)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_key');
  end if;

  select price into v_price
  from public.cosmetics_catalog
  where cosmetic_key = trim(p_cosmetic_key)
    and active = true;

  if v_price is null then
    return jsonb_build_object('ok', false, 'error', 'unknown_cosmetic');
  end if;

  select exists(
    select 1 from public.user_cosmetics
    where user_id = v_uid and cosmetic_key = trim(p_cosmetic_key)
  ) into v_owned;

  if v_owned then
    select balance into v_balance
    from public.user_stardust_wallets
    where user_id = v_uid;

    return jsonb_build_object(
      'ok', true,
      'already', true,
      'balance', coalesce(v_balance, 0)
    );
  end if;

  insert into public.user_stardust_wallets (user_id, balance)
  values (v_uid, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.user_stardust_wallets
  where user_id = v_uid
  for update;

  if coalesce(v_balance, 0) < v_price then
    return jsonb_build_object(
      'ok', false,
      'error', 'insufficient_stardust',
      'balance', coalesce(v_balance, 0)
    );
  end if;

  if v_price > 0 then
    update public.user_stardust_wallets
    set
      balance = balance - v_price,
      updated_at = now()
    where user_id = v_uid
    returning balance into v_balance;

    insert into public.stardust_ledger (
      user_id, amount, reason, ref_key, balance_after
    ) values (
      v_uid,
      -v_price,
      'purchase',
      'purchase:' || trim(p_cosmetic_key),
      v_balance
    );
  end if;

  insert into public.user_cosmetics (user_id, cosmetic_key, source)
  values (v_uid, trim(p_cosmetic_key), 'purchase');

  return jsonb_build_object(
    'ok', true,
    'already', false,
    'balance', coalesce(v_balance, 0),
    'cosmeticKey', trim(p_cosmetic_key)
  );
exception
  when unique_violation then
    select balance into v_balance
    from public.user_stardust_wallets
    where user_id = v_uid;
    return jsonb_build_object(
      'ok', true,
      'already', true,
      'balance', coalesce(v_balance, 0)
    );
end;
$$;

revoke all on function public.purchase_cosmetic(text) from public;
grant execute on function public.purchase_cosmetic(text) to authenticated;

-- ===========================================================================
-- 2) Orbit recommendation completion IDOR fix
-- ===========================================================================

create or replace function public.complete_orbit_recommendation_for_progress(
  p_progress_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  progress public.user_orbit_progress%rowtype;
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'not_authenticated';
  end if;

  select * into progress
  from public.user_orbit_progress
  where id = p_progress_id
    and user_id = caller;

  if progress.id is null then
    return;
  end if;

  if progress.source_recommendation_id is not null then
    update public.orbit_recommendations
    set
      status = 'completed',
      completed_at = coalesce(completed_at, now()),
      updated_at = now()
    where id = progress.source_recommendation_id
      and recipient_user_id = progress.user_id
      and status in ('new', 'viewed', 'started');
  end if;

  update public.orbit_recommendations
  set
    status = 'completed',
    completed_at = coalesce(completed_at, now()),
    updated_at = now()
  where recipient_user_id = progress.user_id
    and orbit_key = progress.orbit_key
    and status in ('new', 'viewed', 'started');

  delete from public.notifications n
  using public.orbit_recommendations r
  where n.reference_id = r.id
    and n.user_id = progress.user_id
    and n.type in ('orbit_recommendation', 'orbit_recommendation_reminder')
    and r.recipient_user_id = progress.user_id
    and r.orbit_key = progress.orbit_key
    and r.status = 'completed';
end;
$$;

revoke all on function public.complete_orbit_recommendation_for_progress(uuid) from public;
grant execute on function public.complete_orbit_recommendation_for_progress(uuid) to authenticated;

-- ===========================================================================
-- 3) Professional signup starts pending
-- ===========================================================================

alter table public.professional_profiles
  alter column verification_status set default 'pending';

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
  status text;
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
    'pending'
  )
  on conflict (user_id) do update
  set
    display_name = excluded.display_name,
    professional_type = excluded.professional_type,
    organization_name = excluded.organization_name,
    -- Keep existing verification_status (do not self-upgrade to verified).
    updated_at = now()
  returning verification_status into status;

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
    normalized := coalesce(
      claim_result->>'username',
      public.normalize_haelo_username(p_raw_username)
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'username', normalized,
    'verification_status', coalesce(status, 'pending')
  );
end;
$$;

revoke all on function public.complete_professional_signup(text, text, text, text) from public;
grant execute on function public.complete_professional_signup(text, text, text, text) to authenticated;

-- ===========================================================================
-- 4) Drop age-gate / parental consent
-- ===========================================================================

drop function if exists public.clear_age_gate_13_plus();
drop function if exists public.request_parental_consent(text);
drop function if exists public.approve_parental_consent(text);
drop function if exists public.get_own_pending_parental_consent();
drop function if exists public.hash_parental_consent_token(text);
drop function if exists public.is_age_gate_cleared(text);

drop table if exists public.parental_consent_requests;

alter table public.profiles
  drop constraint if exists profiles_age_gate_status_check;

alter table public.profiles
  drop column if exists age_gate_status,
  drop column if exists age_gate_cleared_at;

create or replace function public.profiles_guard_update()
returns trigger
language plpgsql
set search_path = public
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
