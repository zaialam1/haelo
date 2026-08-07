-- Fix connection request inserts blocked by profiles RLS.
-- professional_connections_guard was not SECURITY DEFINER, so the exists()
-- check on the target profile could not see other users' rows and raised
-- "connection target must be a Haelo user" even for valid personal accounts.

create or replace function public.is_haelo_personal_user(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = uid
      and account_role = 'user'
  );
$$;

revoke all on function public.is_haelo_personal_user(uuid) from public;
grant execute on function public.is_haelo_personal_user(uuid) to authenticated;

create or replace function public.professional_connections_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cooldown interval := interval '7 days';
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    if not public.is_professional_account(new.professional_user_id) then
      raise exception 'only professionals can create connection requests';
    end if;
    if not public.is_haelo_personal_user(new.user_id) then
      raise exception 'connection target must be a Haelo user';
    end if;
    new.status := 'pending';
    new.requested_at := coalesce(new.requested_at, now());
    new.responded_at := null;
    new.removed_at := null;
    return new;
  end if;

  if auth.uid() = old.user_id then
    if old.status = 'pending' and new.status in ('accepted', 'declined') then
      new.responded_at := now();
      new.removed_at := null;
      return new;
    end if;
    if old.status = 'accepted' and new.status = 'removed' then
      new.removed_at := now();
      return new;
    end if;
    raise exception 'invalid connection status transition for user';
  end if;

  if auth.uid() = old.professional_user_id then
    if not public.is_professional_account(auth.uid()) then
      raise exception 'only professionals can update connection requests';
    end if;
    if old.status in ('declined', 'removed') and new.status = 'pending' then
      if old.status = 'declined'
         and old.responded_at is not null
         and old.responded_at > now() - cooldown then
        raise exception 'connection request cooldown active';
      end if;
      if old.status = 'removed'
         and old.removed_at is not null
         and old.removed_at > now() - cooldown then
        raise exception 'connection request cooldown active';
      end if;
      new.requested_at := now();
      new.responded_at := null;
      new.removed_at := null;
      return new;
    end if;
    if old.status = 'pending' and new.status = 'removed' then
      new.removed_at := now();
      return new;
    end if;
    raise exception 'invalid connection status transition for professional';
  end if;

  raise exception 'not allowed to update this connection';
end;
$$;
