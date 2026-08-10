-- =============================================================================
-- Generalize Connections: mutual relationship between any two Haelo accounts
--
-- Migration strategy:
-- 1. Rename professional_connections → connections
-- 2. Rename professional_user_id → requester_user_id
-- 3. Rename user_id → recipient_user_id
-- 4. Preserve all existing pending/accepted/declined/removed rows (identity unchanged)
-- 5. Allow professional → personal AND professional → professional requests
-- 6. Role-based recommend authorization (sender must be verified professional)
-- 7. Unordered pair uniqueness (A↔B cannot exist twice in either direction)
-- 8. Either participant may remove an accepted connection
-- 9. Username search may return personal OR professional accounts (role included)
-- 10. Restore is_verified_professional to check verification_status
-- 11. Update orbit recommendation RPCs to use generalized connections
--
-- Privacy: accepted connection still grants NO access to Journey, recordings,
-- transcripts, analyses, My Voice, or Orbit responses.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Restore real verification helper (capability gate for search / connect / recommend)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Rename table + columns (preserves row data + FK from orbit_recommendations)
-- ---------------------------------------------------------------------------

alter table if exists public.professional_connections
  rename to connections;

alter table public.connections
  rename column professional_user_id to requester_user_id;

alter table public.connections
  rename column user_id to recipient_user_id;

-- Drop directed unique; add unordered pair uniqueness
alter table public.connections
  drop constraint if exists professional_connections_pair_unique;

alter table public.connections
  drop constraint if exists professional_connections_distinct_users;

alter table public.connections
  add constraint connections_distinct_users check (
    requester_user_id <> recipient_user_id
  );

create unique index if not exists connections_pair_unique_idx
  on public.connections (
    least(requester_user_id, recipient_user_id),
    greatest(requester_user_id, recipient_user_id)
  );

alter index if exists professional_connections_professional_status_idx
  rename to connections_requester_status_idx;

alter index if exists professional_connections_user_status_idx
  rename to connections_recipient_status_idx;

-- ---------------------------------------------------------------------------
-- RLS policies (drop old names, recreate on connections)
-- ---------------------------------------------------------------------------

drop policy if exists "Participants can select own connections" on public.connections;
drop policy if exists "Professionals can insert connection requests" on public.connections;
drop policy if exists "Users can update own connection responses" on public.connections;
drop policy if exists "Professionals can update own connection requests" on public.connections;

create policy "Participants can select own connections"
  on public.connections
  for select
  using (
    auth.uid() = requester_user_id
    or auth.uid() = recipient_user_id
  );

create policy "Professionals can insert connection requests"
  on public.connections
  for insert
  with check (
    auth.uid() = requester_user_id
    and public.is_verified_professional(auth.uid())
    and status = 'pending'
  );

-- Either participant may update (guard enforces allowed transitions)
create policy "Participants can update own connections"
  on public.connections
  for update
  using (
    auth.uid() = requester_user_id
    or auth.uid() = recipient_user_id
  )
  with check (
    auth.uid() = requester_user_id
    or auth.uid() = recipient_user_id
  );

-- ---------------------------------------------------------------------------
-- Connection guard — mutual model, pro→personal and pro→pro
-- ---------------------------------------------------------------------------

create or replace function public.connections_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cooldown interval := interval '7 days';
  recipient_role text;
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    if not public.is_verified_professional(new.requester_user_id) then
      raise exception 'only verified professionals can create connection requests';
    end if;

    select account_role into recipient_role
    from public.profiles
    where id = new.recipient_user_id;

    if recipient_role is null then
      raise exception 'connection target must be a Haelo account';
    end if;

    -- Personal↔Personal requests are not allowed via this professional tool.
    -- Recipients may be personal ('user') or professional.
    if recipient_role not in ('user', 'professional') then
      raise exception 'connection target must be a Haelo account';
    end if;

    new.status := 'pending';
    new.requested_at := coalesce(new.requested_at, now());
    new.responded_at := null;
    new.removed_at := null;
    return new;
  end if;

  -- Recipient: accept / decline pending, or remove accepted
  if auth.uid() = old.recipient_user_id then
    if old.status = 'pending' and new.status in ('accepted', 'declined') then
      new.responded_at := now();
      new.removed_at := null;
      return new;
    end if;
    if old.status = 'accepted' and new.status = 'removed' then
      new.removed_at := now();
      return new;
    end if;
    raise exception 'invalid connection status transition for recipient';
  end if;

  -- Requester: re-open after cooldown, cancel pending, or remove accepted
  if auth.uid() = old.requester_user_id then
    if old.status in ('declined', 'removed') and new.status = 'pending' then
      if not public.is_verified_professional(auth.uid()) then
        raise exception 'only verified professionals can create connection requests';
      end if;
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
    if old.status = 'accepted' and new.status = 'removed' then
      new.removed_at := now();
      return new;
    end if;
    raise exception 'invalid connection status transition for requester';
  end if;

  raise exception 'not allowed to update this connection';
end;
$$;

drop trigger if exists professional_connections_guard on public.connections;
drop trigger if exists connections_guard on public.connections;
create trigger connections_guard
  before insert or update on public.connections
  for each row
  execute function public.connections_guard();

-- ---------------------------------------------------------------------------
-- Notifications (recipient_user_id)
-- ---------------------------------------------------------------------------

create or replace function public.create_connection_request_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    insert into public.notifications (user_id, type, reference_id)
    values (new.recipient_user_id, 'connection_request', new.id);
  elsif tg_op = 'UPDATE'
       and new.status = 'pending'
       and old.status is distinct from 'pending' then
    insert into public.notifications (user_id, type, reference_id)
    values (new.recipient_user_id, 'connection_request', new.id);
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

drop trigger if exists connection_request_notification on public.connections;
create trigger connection_request_notification
  after insert or update on public.connections
  for each row
  execute function public.create_connection_request_notification();

-- ---------------------------------------------------------------------------
-- Username search — personal OR professional; includes account_role
-- ---------------------------------------------------------------------------

create or replace function public.search_haelo_username(raw_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  found_id uuid;
  found_username text;
  found_role text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  if not public.is_verified_professional(auth.uid()) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  normalized := public.normalize_haelo_username(raw_username);
  if normalized is null or not public.is_valid_haelo_username(normalized) then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select id, username, account_role into found_id, found_username, found_role
  from public.profiles
  where username_normalized = normalized
    and account_role in ('user', 'professional')
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
      'username', found_username,
      'account_role', found_role
    )
  );
end;
$$;

revoke all on function public.search_haelo_username(text) from public;
grant execute on function public.search_haelo_username(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Recommend authorization — verified pro + accepted mutual connection
-- ---------------------------------------------------------------------------

create or replace function public.can_send_orbit_recommendation(
  sender_id uuid,
  recipient_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    sender_id is not null
    and recipient_id is not null
    and sender_id <> recipient_id
    and public.is_verified_professional(sender_id)
    and exists (
      select 1
      from public.connections c
      where c.status = 'accepted'
        and (
          (c.requester_user_id = sender_id and c.recipient_user_id = recipient_id)
          or (c.requester_user_id = recipient_id and c.recipient_user_id = sender_id)
        )
    );
$$;

revoke all on function public.can_send_orbit_recommendation(uuid, uuid) from public;
grant execute on function public.can_send_orbit_recommendation(uuid, uuid) to authenticated;

-- Backwards-compatible alias used by existing app / RPC callers
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
  select public.can_send_orbit_recommendation(professional_id, target_user_id);
$$;

revoke all on function public.can_professional_recommend_to(uuid, uuid) from public;
grant execute on function public.can_professional_recommend_to(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- list_my_connections — generalized columns + counterpart role
-- ---------------------------------------------------------------------------

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
            'requester_user_id', c.requester_user_id,
            'recipient_user_id', c.recipient_user_id,
            'status', c.status,
            'requested_at', c.requested_at,
            'responded_at', c.responded_at,
            'removed_at', c.removed_at,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'counterpart_username', p.username,
            'counterpart_account_role', p.account_role,
            -- Legacy keys for older clients during deploy overlap
            'professional_user_id', c.requester_user_id,
            'user_id', c.recipient_user_id
          ) as row_data,
          c.updated_at as sort_ts
        from public.connections c
        join public.profiles p
          on p.id = case
            when c.requester_user_id = uid then c.recipient_user_id
            else c.requester_user_id
          end
        where (c.requester_user_id = uid or c.recipient_user_id = uid)
          and c.status in ('pending', 'accepted')
      ) ranked
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.list_my_connections() from public;
grant execute on function public.list_my_connections() to authenticated;

-- ---------------------------------------------------------------------------
-- Pending request details for recipient
-- ---------------------------------------------------------------------------

create or replace function public.get_pending_connection_request(connection_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  c public.connections%rowtype;
  requester_username text;
  requester_role text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select * into c
  from public.connections
  where id = connection_id;

  if not found or c.recipient_user_id <> uid or c.status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select username, account_role into requester_username, requester_role
  from public.profiles
  where id = c.requester_user_id;

  return jsonb_build_object(
    'ok', true,
    'connection', jsonb_build_object(
      'id', c.id,
      'status', c.status,
      'requester_user_id', c.requester_user_id,
      'requester_username', requester_username,
      'requester_account_role', requester_role,
      'recipient_user_id', c.recipient_user_id,
      'requested_at', c.requested_at,
      -- Legacy keys
      'professional_user_id', c.requester_user_id,
      'professional_username', requester_username
    )
  );
end;
$$;

revoke all on function public.get_pending_connection_request(uuid) from public;
grant execute on function public.get_pending_connection_request(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- create_orbit_recommendation — allow pro recipients; mutual connection lookup
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
  conn public.connections%rowtype;
  purpose_clean text;
  message_clean text;
  rec public.orbit_recommendations%rowtype;
  existing_id uuid;
  recipient_exists boolean;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  if not public.is_verified_professional(uid) then
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

  select exists (
    select 1 from public.profiles where id = p_recipient_user_id
  ) into recipient_exists;

  if not recipient_exists then
    return jsonb_build_object('ok', false, 'error', 'invalid_recipient');
  end if;

  if not public.can_send_orbit_recommendation(uid, p_recipient_user_id) then
    return jsonb_build_object('ok', false, 'error', 'not_connected');
  end if;

  select * into conn
  from public.connections
  where status = 'accepted'
    and (
      (requester_user_id = uid and recipient_user_id = p_recipient_user_id)
      or (requester_user_id = p_recipient_user_id and recipient_user_id = uid)
    )
  limit 1;

  if conn.id is null then
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
end;
$$;

revoke all on function public.create_orbit_recommendation(uuid, text, integer, text, text) from public;
grant execute on function public.create_orbit_recommendation(uuid, text, integer, text, text) to authenticated;

-- Reminder job: look at connections table
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
        from public.connections c
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
