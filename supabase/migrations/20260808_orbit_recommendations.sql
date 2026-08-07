-- Orbit recommendations: professional → connected personal user.
-- Also: extend notifications, link progress, reminder job helper.

-- Ensure personal-user helper exists before recommendation RPCs use it.
create or replace function public.is_haelo_personal_user(uid uuid)
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
      and account_role = 'user'
  );
$$;

revoke all on function public.is_haelo_personal_user(uuid) from public;
grant execute on function public.is_haelo_personal_user(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications: allow recommendation types
-- ---------------------------------------------------------------------------

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'connection_request',
      'orbit_recommendation',
      'orbit_recommendation_reminder'
    )
  );

-- ---------------------------------------------------------------------------
-- orbit_recommendations
-- ---------------------------------------------------------------------------

create table if not exists public.orbit_recommendations (
  id uuid primary key default gen_random_uuid(),
  professional_user_id uuid not null references public.profiles (id) on delete cascade,
  recipient_user_id uuid not null references public.profiles (id) on delete cascade,
  connection_id uuid not null references public.professional_connections (id) on delete restrict,
  orbit_key text not null,
  orbit_version integer not null default 1,
  purpose text not null,
  personal_message text,
  status text not null default 'new'
    check (status in ('new', 'viewed', 'started', 'completed', 'dismissed')),
  created_at timestamptz not null default now(),
  viewed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  dismissed_at timestamptz,
  reminder_sent_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint orbit_recommendations_distinct_users check (
    professional_user_id <> recipient_user_id
  ),
  constraint orbit_recommendations_purpose_len check (
    char_length(trim(purpose)) between 1 and 160
  ),
  constraint orbit_recommendations_message_len check (
    personal_message is null
    or char_length(trim(personal_message)) between 1 and 500
  )
);

create index if not exists orbit_recommendations_recipient_status_idx
  on public.orbit_recommendations (recipient_user_id, status, created_at desc);

create index if not exists orbit_recommendations_professional_idx
  on public.orbit_recommendations (professional_user_id, created_at desc);

create index if not exists orbit_recommendations_connection_idx
  on public.orbit_recommendations (connection_id);

-- At most one active (new/viewed/started) recommendation per pro+recipient+orbit.
create unique index if not exists orbit_recommendations_active_unique
  on public.orbit_recommendations (professional_user_id, recipient_user_id, orbit_key)
  where status in ('new', 'viewed', 'started');

alter table public.orbit_recommendations enable row level security;

-- Recipients read their own recommendations.
create policy "Recipients can select own recommendations"
  on public.orbit_recommendations
  for select
  using (auth.uid() = recipient_user_id);

-- Professionals read recommendations they sent (metadata only; no private teen data joined).
create policy "Professionals can select own sent recommendations"
  on public.orbit_recommendations
  for select
  using (
    auth.uid() = professional_user_id
    and public.is_professional_account(auth.uid())
  );

-- No direct client inserts/updates for professionals — use security definer RPCs.
-- Recipients may update lifecycle fields only via guarded RPC / trigger.

create or replace function public.orbit_recommendations_immutable_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.professional_user_id is distinct from old.professional_user_id
       or new.recipient_user_id is distinct from old.recipient_user_id
       or new.connection_id is distinct from old.connection_id
       or new.orbit_key is distinct from old.orbit_key
       or new.orbit_version is distinct from old.orbit_version
       or new.purpose is distinct from old.purpose
       or new.personal_message is distinct from old.personal_message
    then
      raise exception 'recommendation sender fields are immutable';
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists orbit_recommendations_immutable_guard
  on public.orbit_recommendations;
create trigger orbit_recommendations_immutable_guard
  before update on public.orbit_recommendations
  for each row
  execute function public.orbit_recommendations_immutable_guard();

-- Recipient lifecycle updates (viewed / started / completed / dismissed).
create policy "Recipients can update own recommendation lifecycle"
  on public.orbit_recommendations
  for update
  using (auth.uid() = recipient_user_id)
  with check (auth.uid() = recipient_user_id);

-- ---------------------------------------------------------------------------
-- Link Orbit progress → recommendation (optional)
-- ---------------------------------------------------------------------------

alter table public.user_orbit_progress
  add column if not exists source_recommendation_id uuid
    references public.orbit_recommendations (id) on delete set null;

create index if not exists user_orbit_progress_source_recommendation_idx
  on public.user_orbit_progress (source_recommendation_id)
  where source_recommendation_id is not null;

-- ---------------------------------------------------------------------------
-- Create recommendation + notification (atomic)
-- ---------------------------------------------------------------------------

create or replace function public.create_orbit_recommendation(
  p_recipient_user_id uuid,
  p_orbit_key text,
  p_orbit_version integer,
  p_purpose text,
  p_personal_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conn public.professional_connections%rowtype;
  purpose_clean text;
  message_clean text;
  rec public.orbit_recommendations%rowtype;
  existing_id uuid;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  if not public.is_professional_account(uid) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_recipient_user_id is null or p_recipient_user_id = uid then
    return jsonb_build_object('ok', false, 'error', 'invalid_recipient');
  end if;

  if p_orbit_key is null or length(trim(p_orbit_key)) < 1 then
    return jsonb_build_object('ok', false, 'error', 'invalid_orbit');
  end if;

  if p_orbit_version is null or p_orbit_version < 1 then
    return jsonb_build_object('ok', false, 'error', 'invalid_orbit_version');
  end if;

  purpose_clean := trim(coalesce(p_purpose, ''));
  if char_length(purpose_clean) < 1 or char_length(purpose_clean) > 160 then
    return jsonb_build_object('ok', false, 'error', 'invalid_purpose');
  end if;

  message_clean := nullif(trim(coalesce(p_personal_message, '')), '');
  if message_clean is not null and char_length(message_clean) > 500 then
    return jsonb_build_object('ok', false, 'error', 'invalid_message');
  end if;

  if not public.is_haelo_personal_user(p_recipient_user_id) then
    return jsonb_build_object('ok', false, 'error', 'invalid_recipient');
  end if;

  select * into conn
  from public.professional_connections
  where professional_user_id = uid
    and user_id = p_recipient_user_id
    and status = 'accepted'
  limit 1;

  if conn.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_connected');
  end if;

  if not public.can_professional_recommend_to(uid, p_recipient_user_id) then
    return jsonb_build_object('ok', false, 'error', 'not_connected');
  end if;

  select id into existing_id
  from public.orbit_recommendations
  where professional_user_id = uid
    and recipient_user_id = p_recipient_user_id
    and orbit_key = trim(p_orbit_key)
    and status in ('new', 'viewed', 'started')
  limit 1;

  if existing_id is not null then
    return jsonb_build_object(
      'ok', false,
      'error', 'duplicate_active',
      'recommendation_id', existing_id
    );
  end if;

  insert into public.orbit_recommendations (
    professional_user_id,
    recipient_user_id,
    connection_id,
    orbit_key,
    orbit_version,
    purpose,
    personal_message,
    status
  )
  values (
    uid,
    p_recipient_user_id,
    conn.id,
    trim(p_orbit_key),
    p_orbit_version,
    purpose_clean,
    message_clean,
    'new'
  )
  returning * into rec;

  insert into public.notifications (user_id, type, reference_id)
  values (p_recipient_user_id, 'orbit_recommendation', rec.id);

  return jsonb_build_object(
    'ok', true,
    'recommendation', jsonb_build_object(
      'id', rec.id,
      'orbit_key', rec.orbit_key,
      'status', rec.status,
      'created_at', rec.created_at
    )
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'duplicate_active');
end;
$$;

revoke all on function public.create_orbit_recommendation(uuid, text, integer, text, text) from public;
grant execute on function public.create_orbit_recommendation(uuid, text, integer, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Recipient lifecycle helpers
-- ---------------------------------------------------------------------------

create or replace function public.mark_orbit_recommendation_viewed(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.orbit_recommendations%rowtype;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select * into rec
  from public.orbit_recommendations
  where id = p_id and recipient_user_id = uid
  for update;

  if rec.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if rec.status = 'new' then
    update public.orbit_recommendations
    set status = 'viewed', viewed_at = coalesce(viewed_at, now()), updated_at = now()
    where id = rec.id
    returning * into rec;
  end if;

  update public.notifications
  set read_at = coalesce(read_at, now())
  where user_id = uid
    and type in ('orbit_recommendation', 'orbit_recommendation_reminder')
    and reference_id = rec.id
    and read_at is null;

  return jsonb_build_object('ok', true, 'status', rec.status);
end;
$$;

revoke all on function public.mark_orbit_recommendation_viewed(uuid) from public;
grant execute on function public.mark_orbit_recommendation_viewed(uuid) to authenticated;

create or replace function public.mark_orbit_recommendation_started(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.orbit_recommendations%rowtype;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select * into rec
  from public.orbit_recommendations
  where id = p_id and recipient_user_id = uid
  for update;

  if rec.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if rec.status in ('dismissed', 'completed') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status', 'status', rec.status);
  end if;

  if rec.status is distinct from 'started' then
    update public.orbit_recommendations
    set
      status = 'started',
      viewed_at = coalesce(viewed_at, now()),
      started_at = coalesce(started_at, now()),
      updated_at = now()
    where id = rec.id
    returning * into rec;
  end if;

  return jsonb_build_object('ok', true, 'status', rec.status);
end;
$$;

revoke all on function public.mark_orbit_recommendation_started(uuid) from public;
grant execute on function public.mark_orbit_recommendation_started(uuid) to authenticated;

create or replace function public.dismiss_orbit_recommendation(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.orbit_recommendations%rowtype;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select * into rec
  from public.orbit_recommendations
  where id = p_id and recipient_user_id = uid
  for update;

  if rec.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if rec.status in ('completed', 'dismissed') then
    return jsonb_build_object('ok', true, 'status', rec.status);
  end if;

  update public.orbit_recommendations
  set
    status = 'dismissed',
    dismissed_at = now(),
    updated_at = now()
  where id = rec.id
  returning * into rec;

  delete from public.notifications
  where user_id = uid
    and type in ('orbit_recommendation', 'orbit_recommendation_reminder')
    and reference_id = rec.id;

  return jsonb_build_object('ok', true, 'status', rec.status);
end;
$$;

revoke all on function public.dismiss_orbit_recommendation(uuid) from public;
grant execute on function public.dismiss_orbit_recommendation(uuid) to authenticated;

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
begin
  select * into progress
  from public.user_orbit_progress
  where id = p_progress_id;

  if progress.id is null then
    return;
  end if;

  -- Complete linked recommendation if present.
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

  -- Also complete any active recommendation for this orbit+user (same orbit, any pro).
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
-- Called from app server with user session; also grant authenticated for RPC use.
grant execute on function public.complete_orbit_recommendation_for_progress(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Detail fetch for recipient (includes professional username safely)
-- ---------------------------------------------------------------------------

create or replace function public.get_orbit_recommendation_detail(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.orbit_recommendations%rowtype;
  pro_username text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select * into rec
  from public.orbit_recommendations
  where id = p_id
    and (
      recipient_user_id = uid
      or (
        professional_user_id = uid
        and public.is_professional_account(uid)
      )
    );

  if rec.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select username into pro_username
  from public.profiles
  where id = rec.professional_user_id;

  return jsonb_build_object(
    'ok', true,
    'recommendation', jsonb_build_object(
      'id', rec.id,
      'professional_user_id', rec.professional_user_id,
      'recipient_user_id', rec.recipient_user_id,
      'connection_id', rec.connection_id,
      'orbit_key', rec.orbit_key,
      'orbit_version', rec.orbit_version,
      'purpose', rec.purpose,
      'personal_message', rec.personal_message,
      'status', rec.status,
      'created_at', rec.created_at,
      'viewed_at', rec.viewed_at,
      'started_at', rec.started_at,
      'completed_at', rec.completed_at,
      'dismissed_at', rec.dismissed_at,
      'reminder_sent_at', rec.reminder_sent_at,
      'updated_at', rec.updated_at,
      'professional_username', pro_username
    )
  );
end;
$$;

revoke all on function public.get_orbit_recommendation_detail(uuid) from public;
grant execute on function public.get_orbit_recommendation_detail(uuid) to authenticated;

-- Active recommendations for the signed-in recipient (with professional username).
create or replace function public.list_my_active_orbit_recommendations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  return jsonb_build_object(
    'ok', true,
    'recommendations', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', rec.id,
            'professional_user_id', rec.professional_user_id,
            'recipient_user_id', rec.recipient_user_id,
            'connection_id', rec.connection_id,
            'orbit_key', rec.orbit_key,
            'orbit_version', rec.orbit_version,
            'purpose', rec.purpose,
            'personal_message', rec.personal_message,
            'status', rec.status,
            'created_at', rec.created_at,
            'viewed_at', rec.viewed_at,
            'started_at', rec.started_at,
            'completed_at', rec.completed_at,
            'dismissed_at', rec.dismissed_at,
            'reminder_sent_at', rec.reminder_sent_at,
            'updated_at', rec.updated_at,
            'professional_username', p.username
          )
          order by rec.created_at desc
        )
        from public.orbit_recommendations rec
        left join public.profiles p on p.id = rec.professional_user_id
        where rec.recipient_user_id = uid
          and rec.status in ('new', 'viewed')
      ),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.list_my_active_orbit_recommendations() from public;
grant execute on function public.list_my_active_orbit_recommendations() to authenticated;

-- ---------------------------------------------------------------------------
-- One-time 7-day reminder (call from cron / Edge Function with service role)
-- ---------------------------------------------------------------------------

create or replace function public.process_orbit_recommendation_reminders(
  p_days integer default 7,
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  created_count integer := 0;
begin
  for r in
    select rec.id as rec_id, rec.recipient_user_id
    from public.orbit_recommendations rec
    where rec.status in ('new', 'viewed')
      and rec.reminder_sent_at is null
      and rec.started_at is null
      and rec.dismissed_at is null
      and rec.created_at <= now() - make_interval(days => greatest(p_days, 1))
      and exists (
        select 1
        from public.professional_connections c
        where c.id = rec.connection_id
          and c.status = 'accepted'
      )
    order by rec.created_at asc
    limit greatest(p_limit, 1)
  loop
    update public.orbit_recommendations
    set reminder_sent_at = now(), updated_at = now()
    where id = r.rec_id
      and reminder_sent_at is null;

    if found then
      insert into public.notifications (user_id, type, reference_id)
      values (r.recipient_user_id, 'orbit_recommendation_reminder', r.rec_id);
      created_count := created_count + 1;
    end if;
  end loop;

  return jsonb_build_object('ok', true, 'reminders_created', created_count);
end;
$$;

revoke all on function public.process_orbit_recommendation_reminders(integer, integer) from public;
-- Invoke with service_role from cron / Edge Function (bypasses revoke for that role).

-- Keep is_haelo_personal_user grant (created at top of this migration).
