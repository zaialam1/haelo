-- Reflections: voice sessions tied to a topic planet.
-- Run this in the Supabase SQL editor (or via CLI) before relying on inserts.

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id text not null,
  subtopic_id text,
  prompt_text text not null,
  recorded_at timestamptz not null default now(),
  audio_url text,
  duration_seconds integer,
  confidence real check (confidence is null or (confidence >= 0 and confidence <= 1)),
  meaningfulness real check (
    meaningfulness is null or (meaningfulness >= 0 and meaningfulness <= 1)
  ),
  growth_signal boolean,
  stood_out text,
  voice_notes text[],
  theme_label text,
  created_at timestamptz not null default now()
);

create index if not exists reflections_user_topic_recorded_idx
  on public.reflections (user_id, topic_id, recorded_at asc);

alter table public.reflections enable row level security;

create policy "Users can select own reflections"
  on public.reflections
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own reflections"
  on public.reflections
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reflections"
  on public.reflections
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own reflections"
  on public.reflections
  for delete
  using (auth.uid() = user_id);
