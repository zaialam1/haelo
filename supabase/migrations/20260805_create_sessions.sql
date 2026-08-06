-- Practice sessions + attempts for planet recording flow.
-- Complements reflections (legacy Speak multi-clip). Journey reads both.
-- Audio reuses private bucket reflections-audio:
--   path: {user_id}/{session_id}/{attempt_id}.{ext}

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  planet text not null
    check (planet in ('express', 'stand', 'connect', 'explore')),
  prompt_id text not null,
  prompt_text_snapshot text not null,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  source text not null default 'planet'
    check (source in ('planet', 'daily')),
  user_reflection text,
  -- Reserved for future Haelo analysis (null until analysis ships).
  analysis_status text
    check (
      analysis_status is null
      or analysis_status in ('pending', 'ready', 'failed')
    ),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists sessions_user_completed_idx
  on public.sessions (user_id, completed_at asc)
  where status = 'completed';

create index if not exists sessions_user_planet_completed_idx
  on public.sessions (user_id, planet, completed_at desc)
  where status = 'completed';

create index if not exists sessions_user_status_idx
  on public.sessions (user_id, status);

alter table public.sessions enable row level security;

create policy "Users can select own sessions"
  on public.sessions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions
  for delete
  using (auth.uid() = user_id);

-- One saved recording per attempt; attempt_number=1 for first save,
-- attempt_number=2 reserved for future Try Again.
create table if not exists public.session_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  attempt_number integer not null check (attempt_number >= 1),
  storage_path text not null,
  mime_type text not null,
  file_size_bytes integer,
  duration_seconds integer not null check (duration_seconds >= 0),
  created_at timestamptz not null default now(),
  unique (session_id, attempt_number)
);

create index if not exists session_attempts_session_idx
  on public.session_attempts (session_id, attempt_number asc);

alter table public.session_attempts enable row level security;

create policy "Users can select own session attempts"
  on public.session_attempts
  for select
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_attempts.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own session attempts"
  on public.session_attempts
  for insert
  with check (
    exists (
      select 1
      from public.sessions s
      where s.id = session_attempts.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can update own session attempts"
  on public.session_attempts
  for update
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_attempts.session_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sessions s
      where s.id = session_attempts.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own session attempts"
  on public.session_attempts
  for delete
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_attempts.session_id
        and s.user_id = auth.uid()
    )
  );
