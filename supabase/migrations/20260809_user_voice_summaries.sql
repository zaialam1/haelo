-- My Voice: persisted longitudinal synthesis for the Universe center.
-- Private to the owner — professionals/connections must not read another user's row.

create table if not exists public.user_voice_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  summary_version integer not null default 1,
  generated_at timestamptz not null default now(),
  session_count_at_generation integer not null default 0
    check (session_count_at_generation >= 0),
  latest_session_at_generation timestamptz,
  completed_orbit_count_at_generation integer not null default 0
    check (completed_orbit_count_at_generation >= 0),
  -- Structured MyVoiceSummary sections (openingSynthesis, takingShape, …).
  synthesis_json jsonb not null,
  model_version text,
  prompt_version text not null default '1',
  status text not null default 'ready'
    check (status in ('ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists user_voice_summaries_user_generated_idx
  on public.user_voice_summaries (user_id, generated_at desc);

alter table public.user_voice_summaries enable row level security;

-- Owner-only access. No professional / connection policies on purpose.
create policy "Users can select own voice summary"
  on public.user_voice_summaries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own voice summary"
  on public.user_voice_summaries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own voice summary"
  on public.user_voice_summaries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own voice summary"
  on public.user_voice_summaries
  for delete
  using (auth.uid() = user_id);

comment on table public.user_voice_summaries is
  'Cached My Voice longitudinal synthesis. Private to auth.uid() owner only.';
