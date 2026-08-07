# Haelo / VoiceMirror

Next.js app for Haelo — voice growth for teens.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Professional accounts & Orbit recommendations (dev)

Apply these migrations in Supabase (in order) before testing:

- `supabase/migrations/20260806_profiles_connections.sql`
- `supabase/migrations/20260806_username_availability_anon.sql`
- `supabase/migrations/20260807_professional_profiles.sql`
- `supabase/migrations/20260807_remove_professional_verification_gate.sql`
- `supabase/migrations/20260808_fix_connection_guard_rls.sql`
- `supabase/migrations/20260808_orbit_recommendations.sql`

Create professionals via **Professional access** on the landing page:

[`docs/professional-dev-setup.md`](docs/professional-dev-setup.md)

Reminder cron setup:

[`docs/orbit-recommendation-reminders.md`](docs/orbit-recommendation-reminders.md)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Haelo design system](DESIGN.md)
