-- Extend reflections for question bank + session modes.
-- Run in Supabase SQL editor (or via CLI) after 20260803_create_reflections.sql.

alter table public.reflections
  add column if not exists question_id text,
  add column if not exists session_type text,
  add column if not exists session_id uuid,
  add column if not exists question_ids text[],
  add column if not exists prompt_texts text[],
  add column if not exists question_timestamps jsonb;

alter table public.reflections
  drop constraint if exists reflections_session_type_check;

alter table public.reflections
  add constraint reflections_session_type_check
  check (
    session_type is null
    or session_type in ('main', 'focus', 'daily')
  );

create index if not exists reflections_user_session_idx
  on public.reflections (user_id, session_id);

create index if not exists reflections_user_session_type_recorded_idx
  on public.reflections (user_id, session_type, recorded_at desc);
