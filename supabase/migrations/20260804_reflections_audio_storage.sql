-- Private bucket for reflection voice clips.
-- Path convention: {user_id}/{session_id}/{clip_id}.webm
-- Run in Supabase SQL editor after reflections table migrations.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reflections-audio',
  'reflections-audio',
  false,
  52428800,
  array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/wav']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop existing policies if re-running
drop policy if exists "Users can upload own reflection audio" on storage.objects;
drop policy if exists "Users can read own reflection audio" on storage.objects;
drop policy if exists "Users can update own reflection audio" on storage.objects;
drop policy if exists "Users can delete own reflection audio" on storage.objects;

create policy "Users can upload own reflection audio"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'reflections-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own reflection audio"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'reflections-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own reflection audio"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'reflections-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'reflections-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own reflection audio"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'reflections-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
