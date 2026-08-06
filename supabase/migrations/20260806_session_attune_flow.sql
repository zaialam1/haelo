-- Haelo post-recording flow: transcripts, structured analysis, reflections.
-- Extends sessions + session_attempts; adds session_analyses.

-- ---------------------------------------------------------------------------
-- sessions: reflection choices + authenticity (comparison)
-- analysis_status already exists: null | pending | ready | failed
-- ---------------------------------------------------------------------------

alter table public.sessions
  add column if not exists feeling_reflection text
    check (
      feeling_reflection is null
      or feeling_reflection in ('held_back', 'in_between', 'said_it')
    );

alter table public.sessions
  add column if not exists sounded_like_you text
    check (
      sounded_like_you is null
      or sounded_like_you in ('not_really', 'mostly', 'yes')
    );

alter table public.sessions
  add column if not exists authenticity_choice text
    check (
      authenticity_choice is null
      or authenticity_choice in ('first', 'second', 'mix')
    );

-- ---------------------------------------------------------------------------
-- session_attempts: transcript per attempt
-- ---------------------------------------------------------------------------

alter table public.session_attempts
  add column if not exists transcript text;

alter table public.session_attempts
  add column if not exists transcript_status text
    check (
      transcript_status is null
      or transcript_status in (
        'not_started',
        'pending',
        'ready',
        'failed',
        'unavailable'
      )
    );

update public.session_attempts
set transcript_status = 'not_started'
where transcript_status is null;

alter table public.session_attempts
  alter column transcript_status set default 'not_started';

-- ---------------------------------------------------------------------------
-- session_analyses: one structured analysis row per session
-- ---------------------------------------------------------------------------

create table if not exists public.session_analyses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.sessions (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'ready', 'failed')),
  strength_title text,
  strength_description text,
  observation_title text,
  observation_description text,
  -- [{ "text": "...", "startTime"?: number, "endTime"?: number }]
  evidence jsonb,
  experiment_title text,
  experiment_instruction text,
  comparison_observation text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists session_analyses_session_idx
  on public.session_analyses (session_id);

alter table public.session_analyses enable row level security;

create policy "Users can select own session analyses"
  on public.session_analyses
  for select
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_analyses.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own session analyses"
  on public.session_analyses
  for insert
  with check (
    exists (
      select 1
      from public.sessions s
      where s.id = session_analyses.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can update own session analyses"
  on public.session_analyses
  for update
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_analyses.session_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sessions s
      where s.id = session_analyses.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own session analyses"
  on public.session_analyses
  for delete
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_analyses.session_id
        and s.user_id = auth.uid()
    )
  );
