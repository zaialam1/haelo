# Professional accounts (development)

Professional accounts are created through the app:

1. Landing → **Professional access** → `/professional`
2. **Create professional account** → `/signup/professional`
3. Account is created with `profiles.account_role = 'professional'`
4. Professional tools (Connections, etc.) are available immediately

There is **no verification pending step** in the product right now.

## Promote an existing personal account (dev only — not product)

Prefer creating via `/signup/professional`. If you must convert a test personal account:

```sql
select set_config('haelo.bypass_profile_guard', 'on', true);

update public.profiles
set account_role = 'professional'
where id = 'USER_UUID_HERE';

insert into public.professional_profiles (
  user_id, display_name, professional_type, verification_status
) values (
  'USER_UUID_HERE', 'Test Counselor', 'school_counselor', 'verified'
)
on conflict (user_id) do update
set verification_status = 'verified';
```

## Demote / reset (dev)

```sql
select set_config('haelo.bypass_profile_guard', 'on', true);

update public.profiles
set account_role = 'user'
where id = 'USER_UUID_HERE';

delete from public.professional_profiles where user_id = 'USER_UUID_HERE';
```

## Product limitations (intentional)

- No **Switch to Professional** in Settings
- Professional role never grants access to another user’s recordings, Journey, transcripts, or analyses
- Orbit recommendations require an **accepted** connection (`can_professional_recommend_to`)
- Professionals see send history (Orbit + date), not teen completion/details

Apply `20260808_orbit_recommendations.sql` for the recommend feature. Reminder cron: [`orbit-recommendation-reminders.md`](./orbit-recommendation-reminders.md).

Never expose a frontend control that changes `account_role`.
