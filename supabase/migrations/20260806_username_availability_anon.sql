-- Allow username availability checks during signup (before a session exists).
-- Still returns only a status string — never profile rows.

create or replace function public.check_username_availability(raw_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  existing_id uuid;
begin
  normalized := public.normalize_haelo_username(raw_username);

  if normalized is null
     or char_length(normalized) < 3
     or char_length(normalized) > 20
     or normalized !~ '^[a-z0-9]([a-z0-9_]{1,18}[a-z0-9])?$' then
    return 'invalid';
  end if;

  if public.is_reserved_username(normalized) then
    return 'reserved';
  end if;

  select id into existing_id
  from public.profiles
  where username_normalized = normalized
  limit 1;

  -- During signup there is no auth.uid(); after login, allow keeping your own name.
  if existing_id is not null
     and (auth.uid() is null or existing_id <> auth.uid()) then
    return 'taken';
  end if;

  return 'available';
end;
$$;

revoke all on function public.check_username_availability(text) from public;
grant execute on function public.check_username_availability(text) to anon, authenticated;
