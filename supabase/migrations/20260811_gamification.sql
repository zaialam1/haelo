-- Gamification foundation: weekly voice goals, celestial rewards, milestones,
-- idempotent event log, and experiment intent on sessions.
-- Soft progression only — no XP, coins, or leaderboards.

-- ---------------------------------------------------------------------------
-- Sessions: intentional "Try the Experiment" (attempt 2 with coaching intent)
-- ---------------------------------------------------------------------------

alter table public.sessions
  add column if not exists experiment_tried_at timestamptz;

comment on column public.sessions.experiment_tried_at is
  'Set when the user saves a second attempt via Try the Experiment (not a generic retry).';

-- ---------------------------------------------------------------------------
-- Idempotent event processing log
-- ---------------------------------------------------------------------------

create table if not exists public.gamification_event_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_key text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint gamification_event_log_user_event_key_unique unique (user_id, event_key)
);

create index if not exists gamification_event_log_user_created_idx
  on public.gamification_event_log (user_id, created_at desc);

alter table public.gamification_event_log enable row level security;

create policy "Users can select own gamification events"
  on public.gamification_event_log
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own gamification events"
  on public.gamification_event_log
  for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Weekly voice goal
-- ---------------------------------------------------------------------------

create table if not exists public.weekly_voice_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_key text not null,
  goal_count integer not null default 3
    check (goal_count > 0),
  completed_count integer not null default 0
    check (completed_count >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_key)
);

create index if not exists weekly_voice_progress_user_idx
  on public.weekly_voice_progress (user_id, week_key desc);

alter table public.weekly_voice_progress enable row level security;

create policy "Users can select own weekly voice progress"
  on public.weekly_voice_progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly voice progress"
  on public.weekly_voice_progress
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly voice progress"
  on public.weekly_voice_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- One contribution per completed eligible session (idempotent weekly counting)
create table if not exists public.weekly_voice_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_key text not null,
  session_id uuid not null references public.sessions (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint weekly_voice_contributions_session_unique unique (session_id)
);

create index if not exists weekly_voice_contributions_user_week_idx
  on public.weekly_voice_contributions (user_id, week_key);

alter table public.weekly_voice_contributions enable row level security;

create policy "Users can select own weekly contributions"
  on public.weekly_voice_contributions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly contributions"
  on public.weekly_voice_contributions
  for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Celestial rewards (Universe decorations + future archive)
-- ---------------------------------------------------------------------------

create table if not exists public.user_celestial_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reward_key text not null,
  reward_type text not null,
  source_type text not null,
  source_id text,
  title text not null,
  description text,
  placement text not null default 'universe_background',
  planet text,
  reveal_priority text not null default 'deferred'
    check (reveal_priority in ('immediate', 'deferred')),
  unlocked_at timestamptz not null default now(),
  viewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint user_celestial_rewards_user_reward_unique unique (user_id, reward_key)
);

create index if not exists user_celestial_rewards_user_unlocked_idx
  on public.user_celestial_rewards (user_id, unlocked_at desc);

create index if not exists user_celestial_rewards_user_unviewed_idx
  on public.user_celestial_rewards (user_id)
  where viewed_at is null;

create index if not exists user_celestial_rewards_source_idx
  on public.user_celestial_rewards (user_id, source_type, source_id);

alter table public.user_celestial_rewards enable row level security;

create policy "Users can select own celestial rewards"
  on public.user_celestial_rewards
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own celestial rewards"
  on public.user_celestial_rewards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own celestial rewards"
  on public.user_celestial_rewards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Milestones (qualitative recognition)
-- ---------------------------------------------------------------------------

create table if not exists public.user_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  milestone_key text not null,
  title text not null,
  body text not null,
  category text not null
    check (category in ('exploration', 'skill', 'behavior')),
  source_metadata jsonb not null default '{}'::jsonb,
  unlocked_at timestamptz not null default now(),
  viewed_at timestamptz,
  constraint user_milestones_user_key_unique unique (user_id, milestone_key)
);

create index if not exists user_milestones_user_unlocked_idx
  on public.user_milestones (user_id, unlocked_at desc);

create index if not exists user_milestones_user_unviewed_idx
  on public.user_milestones (user_id)
  where viewed_at is null;

alter table public.user_milestones enable row level security;

create policy "Users can select own milestones"
  on public.user_milestones
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own milestones"
  on public.user_milestones
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own milestones"
  on public.user_milestones
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Pending reveals queue (evolution moments, discoveries, milestones)
-- ---------------------------------------------------------------------------

create table if not exists public.user_gamification_reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reveal_key text not null,
  reveal_type text not null
    check (
      reveal_type in (
        'planet_evolution',
        'weekly_goal_complete',
        'celestial_discovery',
        'orbit_reward',
        'milestone',
        'experiment_ack'
      )
    ),
  priority text not null default 'deferred'
    check (priority in ('immediate', 'deferred')),
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  viewed_at timestamptz,
  constraint user_gamification_reveals_user_key_unique unique (user_id, reveal_key)
);

create index if not exists user_gamification_reveals_user_pending_idx
  on public.user_gamification_reveals (user_id, priority, created_at)
  where viewed_at is null;

alter table public.user_gamification_reveals enable row level security;

create policy "Users can select own gamification reveals"
  on public.user_gamification_reveals
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own gamification reveals"
  on public.user_gamification_reveals
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own gamification reveals"
  on public.user_gamification_reveals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Notifications: gamification types (reuse existing system)
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
      'milestone_moment'
    )
  );

-- Allow users to insert their own soft gamification notifications
-- (connection / recommendation inserts remain security-definer only).
drop policy if exists "Users can insert own gamification notifications"
  on public.notifications;

create policy "Users can insert own gamification notifications"
  on public.notifications
  for insert
  with check (
    auth.uid() = user_id
    and type in ('celestial_discovery', 'milestone_moment')
  );
