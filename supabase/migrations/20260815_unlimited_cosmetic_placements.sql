-- Allow unlimited decorations per planet (no one-item-per-slot cap).

alter table public.universe_slot_assignments
  drop constraint if exists universe_slot_assignments_user_planet_slot_unique;

-- Remove empty placeholder rows from the old single-slot model
delete from public.universe_slot_assignments
where cosmetic_key is null;

alter table public.universe_slot_assignments
  alter column cosmetic_key set not null;

create index if not exists universe_slot_assignments_user_planet_idx
  on public.universe_slot_assignments (user_id, planet);
