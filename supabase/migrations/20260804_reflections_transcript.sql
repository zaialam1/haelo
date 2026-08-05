-- Optional speech transcript for reflection playback panel.
-- Run in Supabase SQL editor after reflections table migrations.

alter table public.reflections
  add column if not exists transcript text;
