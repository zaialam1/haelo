-- =============================================================================
-- Launch readiness foundations:
-- 1. user_preferences — onboarding milestones + notification preferences
-- 2. user_blocks — directional blocks, enforced server-side (no professional bypass)
-- 3. reports — safety reports for future admin review (never visible to reported)
-- 4. analysis_feedback — "Was this useful?" on individual AI analyses
-- 5. user_feedback — general product feedback from Settings/Help
-- 6. notifications — add 'my_voice_updated' type
--
-- Privacy invariants preserved: connections/blocks/reports grant NO access to
-- recordings, transcripts, Journey, My Voice, analyses, or internal scores.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. user_preferences
-- ---------------------------------------------------------------------------

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  -- Map of onboarding milestone key -> ISO timestamp when seen.
  onboarding jsonb not null default '{}'::jsonb,
  -- Map of notification category -> boolean (true = enabled). Missing = enabled.
  -- Categories: weekly_encouragement, orbit_reminders, orbit_recommendations,
  -- milestones_discoveries. Critical account/security notices are never gated.
  notification_prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can select own preferences"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. user_blocks
-- ---------------------------------------------------------------------------

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_user_id uuid not null references public.profiles (id) on delete cascade,
  blocked_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_distinct_users check (blocker_user_id <> blocked_user_id),
  constraint user_blocks_pair_unique unique (blocker_user_id, blocked_user_id)
);

create index if not exists user_blocks_blocked_idx
  on public.user_blocks (blocked_user_id);

alter table public.user_blocks enable row level security;

-- Blockers can see and lift their own blocks. Creation goes through the
-- block_user RPC (which also severs any existing connection), so there is
-- intentionally no client INSERT policy.
create policy "Users can select own blocks"
  on public.user_blocks
  for select
  using (auth.uid() = blocker_user_id);

create policy "Users can delete own blocks"
  on public.user_blocks
  for delete
  using (auth.uid() = blocker_user_id);

-- True when either user has blocked the other.
create or replace function public.is_block_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_blocks ub
    where (ub.blocker_user_id = a and ub.blocked_user_id = b)
       or (ub.blocker_user_id = b and ub.blocked_user_id = a)
  );
$$;

revoke all on function public.is_block_between(uuid, uuid) from public;
grant execute on function public.is_block_between(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Block user: create block + sever any existing connection (either direction).
-- Verified Professional status does NOT bypass blocking.
-- ---------------------------------------------------------------------------

create or replace function public.block_user(p_target uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  target_exists boolean;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  if p_target is null or p_target = uid then
    return jsonb_build_object('ok', false, 'error', 'invalid_target');
  end if;

  select exists (
    select 1 from public.profiles where id = p_target
  ) into target_exists;

  if not target_exists then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  insert into public.user_blocks (blocker_user_id, blocked_user_id)
  values (uid, p_target)
  on conflict (blocker_user_id, blocked_user_id) do nothing;

  -- Sever any live connection between the two accounts. The guard normally
  -- restricts transitions per participant; the block path bypasses it.
  perform set_config('haelo.bypass_connections_guard', 'on', true);

  update public.connections
  set status = 'removed',
      removed_at = now(),
      updated_at = now()
  where status in ('pending', 'accepted')
    and (
      (requester_user_id = uid and recipient_user_id = p_target)
      or (requester_user_id = p_target and recipient_user_id = uid)
    );

  perform set_config('haelo.bypass_connections_guard', 'off', true);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.block_user(uuid) from public;
grant execute on function public.block_user(uuid) to authenticated;

create or replace function public.unblock_user(p_target uuid)
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

  delete from public.user_blocks
  where blocker_user_id = uid
    and blocked_user_id = p_target;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.unblock_user(uuid) from public;
grant execute on function public.unblock_user(uuid) to authenticated;

-- Blocked accounts list with usernames (profiles of others are not client-readable).
create or replace function public.list_my_blocks()
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
      select jsonb_agg(
        jsonb_build_object(
          'blocked_user_id', ub.blocked_user_id,
          'username', p.username,
          'account_role', p.account_role,
          'created_at', ub.created_at
        )
        order by ub.created_at desc
      )
      from public.user_blocks ub
      join public.profiles p on p.id = ub.blocked_user_id
      where ub.blocker_user_id = uid
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.list_my_blocks() from public;
grant execute on function public.list_my_blocks() to authenticated;

-- ---------------------------------------------------------------------------
-- Enforce blocks in the connections guard (insert + re-open paths) and add
-- the bypass hook used by block_user.
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

  -- Trusted paths (block_user) may bypass transition rules.
  if current_setting('haelo.bypass_connections_guard', true) = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if not public.is_verified_professional(new.requester_user_id) then
      raise exception 'only verified professionals can create connection requests';
    end if;

    -- Blocks end the conversation; do not disclose which side blocked.
    if public.is_block_between(new.requester_user_id, new.recipient_user_id) then
      raise exception 'connection target must be a Haelo account';
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
      if new.status = 'accepted'
         and public.is_block_between(old.requester_user_id, old.recipient_user_id) then
        raise exception 'invalid connection status transition for recipient';
      end if;
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
      if public.is_block_between(old.requester_user_id, old.recipient_user_id) then
        raise exception 'connection target must be a Haelo account';
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

-- ---------------------------------------------------------------------------
-- Enforce blocks in recommend authorization (professional status is no bypass)
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
    and not public.is_block_between(sender_id, recipient_id)
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

-- ---------------------------------------------------------------------------
-- Enforce blocks in username search — blocked pairs simply see not_found
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

  -- Blocked either way: indistinguishable from a nonexistent account.
  if public.is_block_between(auth.uid(), found_id) then
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

-- ---------------------------------------------------------------------------
-- 3. reports
-- ---------------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  object_type text not null
    check (object_type in ('account', 'connection_request', 'orbit_recommendation')),
  object_id uuid,
  reason text not null
    check (
      reason in (
        'unwanted_contact',
        'inappropriate_message',
        'impersonation',
        'unsafe_behavior',
        'spam',
        'other'
      )
    ),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'resolved')),
  created_at timestamptz not null default now(),
  constraint reports_distinct_users check (reporter_user_id <> reported_user_id)
);

create index if not exists reports_reported_user_idx
  on public.reports (reported_user_id, created_at desc);

create index if not exists reports_status_idx
  on public.reports (status, created_at desc);

alter table public.reports enable row level security;

-- Reporters can file and see their own reports. The reported account has no
-- access. Status changes are admin/service-role only (no client update).
create policy "Users can insert own reports"
  on public.reports
  for insert
  with check (
    auth.uid() = reporter_user_id
    and reporter_user_id <> reported_user_id
    and status = 'open'
  );

create policy "Users can select own reports"
  on public.reports
  for select
  using (auth.uid() = reporter_user_id);

-- ---------------------------------------------------------------------------
-- 4. analysis_feedback — one rating per user per session
-- ---------------------------------------------------------------------------

create table if not exists public.analysis_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  rating text not null check (rating in ('up', 'down')),
  reason text
    check (
      reason is null
      or reason in (
        'didnt_match',
        'quote_unrelated',
        'advice_not_useful',
        'voice_analysis_wrong',
        'other'
      )
    ),
  details text check (details is null or char_length(details) <= 1000),
  model text,
  prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analysis_feedback_user_session_unique unique (user_id, session_id)
);

alter table public.analysis_feedback enable row level security;

create policy "Users can select own analysis feedback"
  on public.analysis_feedback
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own analysis feedback"
  on public.analysis_feedback
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own analysis feedback"
  on public.analysis_feedback
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. user_feedback — general product feedback (Settings → Help)
-- ---------------------------------------------------------------------------

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(message) between 1 and 2000),
  context text check (context is null or char_length(context) <= 200),
  created_at timestamptz not null default now()
);

alter table public.user_feedback enable row level security;

create policy "Users can insert own feedback"
  on public.user_feedback
  for insert
  with check (auth.uid() = user_id);

create policy "Users can select own feedback"
  on public.user_feedback
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Notification preference helper: missing key = enabled. Critical notices
-- (connection requests) are never preference-gated.
-- ---------------------------------------------------------------------------

create or replace function public.notification_category_enabled(
  p_user_id uuid,
  p_category text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select (up.notification_prefs ->> p_category)::boolean
      from public.user_preferences up
      where up.user_id = p_user_id
    ),
    true
  );
$$;

revoke all on function public.notification_category_enabled(uuid, text) from public;
grant execute on function public.notification_category_enabled(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- create_orbit_recommendation — respect the recipient's notification prefs
-- (the recommendation itself is always created and stays discoverable in-app)
-- + refuse when a block exists.
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

  -- Muted recommendation notifications still leave the recommendation
  -- discoverable on the Orbits page.
  if public.notification_category_enabled(p_recipient_user_id, 'orbit_recommendations') then
    insert into public.notifications (user_id, type, reference_id)
    values (p_recipient_user_id, 'orbit_recommendation', rec.id);
  end if;

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

-- ---------------------------------------------------------------------------
-- process_orbit_recommendation_reminders — skip users who muted reminders
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
        from public.connections c
        where c.id = rec.connection_id
          and c.status = 'accepted'
      )
      and public.notification_category_enabled(rec.recipient_user_id, 'orbit_reminders')
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

-- ---------------------------------------------------------------------------
-- 6. notifications — my_voice_updated type
-- ---------------------------------------------------------------------------

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'connection_request',
      'orbit_recommendation',
      'orbit_recommendation_reminder',
      'celestial_discovery',
      'milestone_moment',
      'my_voice_updated'
    )
  );

-- Users may insert their own soft notifications (gamification + My Voice).
-- Connection / recommendation inserts remain security-definer only.
drop policy if exists "Users can insert own gamification notifications"
  on public.notifications;

create policy "Users can insert own gamification notifications"
  on public.notifications
  for insert
  with check (
    auth.uid() = user_id
    and type in ('celestial_discovery', 'milestone_moment', 'my_voice_updated')
  );
