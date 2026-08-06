-- Orbits: guided situational sequences separate from normal planet progression.
-- Content definitions live in version-controlled TypeScript.
-- This migration stores user progress, summative analyses, and session tagging.

-- ---------------------------------------------------------------------------
-- Extend sessions for Orbit-sourced recordings (reuse recording pipeline).
-- ---------------------------------------------------------------------------

alter table public.sessions
  drop constraint if exists sessions_source_check;

alter table public.sessions
  add constraint sessions_source_check
  check (source in ('planet', 'daily', 'orbit'));

alter table public.sessions
  add column if not exists orbit_key text;

alter table public.sessions
  add column if not exists orbit_question_key text;

alter table public.sessions
  add column if not exists user_orbit_progress_id uuid;

alter table public.sessions
  add column if not exists orbit_version integer;

create index if not exists sessions_user_orbit_progress_idx
  on public.sessions (user_orbit_progress_id)
  where source = 'orbit';

create index if not exists sessions_user_orbit_key_idx
  on public.sessions (user_id, orbit_key)
  where source = 'orbit';

-- ---------------------------------------------------------------------------
-- User Orbit progress (resumable, versioned against content).
-- ---------------------------------------------------------------------------

create table if not exists public.user_orbit_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  orbit_key text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  current_question_index integer not null default 1
    check (current_question_index >= 1 and current_question_index <= 6),
  started_at timestamptz,
  last_activity_at timestamptz,
  completed_at timestamptz,
  summative_analysis_id uuid,
  orbit_version integer not null default 1,
  -- Snapshot of title at start so Journey history survives content edits.
  orbit_title_snapshot text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, orbit_key)
);

create index if not exists user_orbit_progress_user_status_idx
  on public.user_orbit_progress (user_id, status);

create index if not exists user_orbit_progress_user_activity_idx
  on public.user_orbit_progress (user_id, last_activity_at desc nulls last);

alter table public.user_orbit_progress enable row level security;

create policy "Users can select own orbit progress"
  on public.user_orbit_progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own orbit progress"
  on public.user_orbit_progress
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orbit progress"
  on public.user_orbit_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own orbit progress"
  on public.user_orbit_progress
  for delete
  using (auth.uid() = user_id);

-- Link sessions.user_orbit_progress_id → progress (after table exists).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sessions_user_orbit_progress_id_fkey'
  ) then
    alter table public.sessions
      add constraint sessions_user_orbit_progress_id_fkey
      foreign key (user_orbit_progress_id)
      references public.user_orbit_progress (id)
      on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Summative Orbit analysis (generated after all 6 questions complete).
-- ---------------------------------------------------------------------------

create table if not exists public.orbit_summative_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  orbit_key text not null,
  user_orbit_progress_id uuid not null
    references public.user_orbit_progress (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'ready', 'failed')),
  -- Structured sections; schema may evolve over time.
  analysis_json jsonb,
  practice_prompt text,
  model_metadata jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_orbit_progress_id)
);

create index if not exists orbit_summative_analyses_user_idx
  on public.orbit_summative_analyses (user_id, created_at desc);

alter table public.orbit_summative_analyses enable row level security;

create policy "Users can select own orbit summative analyses"
  on public.orbit_summative_analyses
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own orbit summative analyses"
  on public.orbit_summative_analyses
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orbit summative analyses"
  on public.orbit_summative_analyses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own orbit summative analyses"
  on public.orbit_summative_analyses
  for delete
  using (auth.uid() = user_id);

-- Optional FK from progress → analysis (circular; set after both exist).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_orbit_progress_summative_analysis_id_fkey'
  ) then
    alter table public.user_orbit_progress
      add constraint user_orbit_progress_summative_analysis_id_fkey
      foreign key (summative_analysis_id)
      references public.orbit_summative_analyses (id)
      on delete set null;
  end if;
end $$;
