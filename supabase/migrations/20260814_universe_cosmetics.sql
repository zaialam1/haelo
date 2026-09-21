-- Universe cosmetics economy: Stardust wallet, ledger, inventory, slot placements.
-- Earn-only currency for private Universe decorations (no IAP).

-- ---------------------------------------------------------------------------
-- Wallet
-- ---------------------------------------------------------------------------

create table if not exists public.user_stardust_wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  balance integer not null default 0
    check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_stardust_wallets enable row level security;

create policy "Users can select own stardust wallet"
  on public.user_stardust_wallets
  for select
  using (auth.uid() = user_id);

-- Writes go through security-definer RPCs only.
create policy "Users cannot insert stardust wallets directly"
  on public.user_stardust_wallets
  for insert
  with check (false);

create policy "Users cannot update stardust wallets directly"
  on public.user_stardust_wallets
  for update
  using (false);

-- ---------------------------------------------------------------------------
-- Append-only ledger (idempotent via user_id + ref_key)
-- ---------------------------------------------------------------------------

create table if not exists public.stardust_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null
    check (amount <> 0),
  reason text not null,
  ref_key text not null,
  balance_after integer not null
    check (balance_after >= 0),
  created_at timestamptz not null default now(),
  constraint stardust_ledger_user_ref_unique unique (user_id, ref_key)
);

create index if not exists stardust_ledger_user_created_idx
  on public.stardust_ledger (user_id, created_at desc);

alter table public.stardust_ledger enable row level security;

create policy "Users can select own stardust ledger"
  on public.stardust_ledger
  for select
  using (auth.uid() = user_id);

create policy "Users cannot insert stardust ledger directly"
  on public.stardust_ledger
  for insert
  with check (false);

-- ---------------------------------------------------------------------------
-- Owned cosmetics (catalog lives in app code)
-- ---------------------------------------------------------------------------

create table if not exists public.user_cosmetics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cosmetic_key text not null,
  source text not null
    check (source in ('purchase', 'grant')),
  acquired_at timestamptz not null default now(),
  constraint user_cosmetics_user_key_unique unique (user_id, cosmetic_key)
);

create index if not exists user_cosmetics_user_acquired_idx
  on public.user_cosmetics (user_id, acquired_at desc);

alter table public.user_cosmetics enable row level security;

create policy "Users can select own cosmetics"
  on public.user_cosmetics
  for select
  using (auth.uid() = user_id);

create policy "Users cannot insert cosmetics directly"
  on public.user_cosmetics
  for insert
  with check (false);

create policy "Users cannot update cosmetics directly"
  on public.user_cosmetics
  for update
  using (false);

create policy "Users cannot delete cosmetics directly"
  on public.user_cosmetics
  for delete
  using (false);

-- ---------------------------------------------------------------------------
-- Slot assignments (planet = 'universe' for home-map-only slots)
-- ---------------------------------------------------------------------------

create table if not exists public.universe_slot_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  planet text not null
    check (
      planet in ('connect', 'stand', 'explore', 'express', 'universe')
    ),
  slot_key text not null
    check (
      slot_key in (
        'creature',
        'ground',
        'moon',
        'ring',
        'sky',
        'outer_comet',
        'nebula_haze'
      )
    ),
  cosmetic_key text,
  updated_at timestamptz not null default now(),
  constraint universe_slot_assignments_user_planet_slot_unique
    unique (user_id, planet, slot_key)
);

create index if not exists universe_slot_assignments_user_idx
  on public.universe_slot_assignments (user_id);

alter table public.universe_slot_assignments enable row level security;

create policy "Users can select own slot assignments"
  on public.universe_slot_assignments
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own slot assignments"
  on public.universe_slot_assignments
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own slot assignments"
  on public.universe_slot_assignments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own slot assignments"
  on public.universe_slot_assignments
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- credit_stardust: idempotent earn (or no-op if ref_key already exists)
-- ---------------------------------------------------------------------------

create or replace function public.credit_stardust(
  p_amount integer,
  p_reason text,
  p_ref_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance integer;
  v_existing integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_reason');
  end if;
  if p_ref_key is null or length(trim(p_ref_key)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_ref');
  end if;

  select amount into v_existing
  from public.stardust_ledger
  where user_id = v_uid and ref_key = p_ref_key;

  if found then
    select balance into v_balance
    from public.user_stardust_wallets
    where user_id = v_uid;

    return jsonb_build_object(
      'ok', true,
      'already', true,
      'credited', 0,
      'balance', coalesce(v_balance, 0)
    );
  end if;

  insert into public.user_stardust_wallets (user_id, balance)
  values (v_uid, 0)
  on conflict (user_id) do nothing;

  update public.user_stardust_wallets
  set
    balance = balance + p_amount,
    updated_at = now()
  where user_id = v_uid
  returning balance into v_balance;

  begin
    insert into public.stardust_ledger (
      user_id, amount, reason, ref_key, balance_after
    ) values (
      v_uid, p_amount, p_reason, p_ref_key, v_balance
    );
  exception
    when unique_violation then
      -- Race: another credit won; roll wallet back and return existing
      update public.user_stardust_wallets
      set
        balance = balance - p_amount,
        updated_at = now()
      where user_id = v_uid
      returning balance into v_balance;

      return jsonb_build_object(
        'ok', true,
        'already', true,
        'credited', 0,
        'balance', coalesce(v_balance, 0)
      );
  end;

  return jsonb_build_object(
    'ok', true,
    'already', false,
    'credited', p_amount,
    'balance', v_balance
  );
end;
$$;

revoke all on function public.credit_stardust(integer, text, text) from public;
grant execute on function public.credit_stardust(integer, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- purchase_cosmetic: debit + own item atomically
-- ---------------------------------------------------------------------------

create or replace function public.purchase_cosmetic(
  p_cosmetic_key text,
  p_price integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance integer;
  v_owned boolean;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  if p_cosmetic_key is null or length(trim(p_cosmetic_key)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_key');
  end if;
  if p_price is null or p_price < 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_price');
  end if;

  select exists(
    select 1 from public.user_cosmetics
    where user_id = v_uid and cosmetic_key = p_cosmetic_key
  ) into v_owned;

  if v_owned then
    select balance into v_balance
    from public.user_stardust_wallets
    where user_id = v_uid;

    return jsonb_build_object(
      'ok', true,
      'already', true,
      'balance', coalesce(v_balance, 0)
    );
  end if;

  insert into public.user_stardust_wallets (user_id, balance)
  values (v_uid, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.user_stardust_wallets
  where user_id = v_uid
  for update;

  if coalesce(v_balance, 0) < p_price then
    return jsonb_build_object(
      'ok', false,
      'error', 'insufficient_stardust',
      'balance', coalesce(v_balance, 0)
    );
  end if;

  if p_price > 0 then
    update public.user_stardust_wallets
    set
      balance = balance - p_price,
      updated_at = now()
    where user_id = v_uid
    returning balance into v_balance;

    insert into public.stardust_ledger (
      user_id, amount, reason, ref_key, balance_after
    ) values (
      v_uid,
      -p_price,
      'purchase',
      'purchase:' || p_cosmetic_key,
      v_balance
    );
  end if;

  insert into public.user_cosmetics (user_id, cosmetic_key, source)
  values (v_uid, p_cosmetic_key, 'purchase');

  return jsonb_build_object(
    'ok', true,
    'already', false,
    'balance', coalesce(v_balance, 0),
    'cosmeticKey', p_cosmetic_key
  );
exception
  when unique_violation then
    select balance into v_balance
    from public.user_stardust_wallets
    where user_id = v_uid;
    return jsonb_build_object(
      'ok', true,
      'already', true,
      'balance', coalesce(v_balance, 0)
    );
end;
$$;

revoke all on function public.purchase_cosmetic(text, integer) from public;
grant execute on function public.purchase_cosmetic(text, integer) to authenticated;
