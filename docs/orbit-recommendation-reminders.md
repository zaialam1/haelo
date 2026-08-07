# Orbit recommendation reminders

Haelo sends **one** gentle reminder if a recommended Orbit stays `new` or `viewed` for about **7 days** and was never started or dismissed. The connection must still be `accepted`.

## 1. Environment

In `.env.local` (and production host env):

- `NEXT_PUBLIC_SUPABASE_URL` — already set
- `SUPABASE_SERVICE_ROLE_KEY` — already set
- `CRON_SECRET` — random secret used as `Authorization: Bearer …`

Restart the Next.js server after changing env.

## 2. Automate in Supabase (works even when Next.js is offline)

Run in the Supabase SQL editor:

[`supabase/migrations/20260808_schedule_orbit_reminders.sql`](../supabase/migrations/20260808_schedule_orbit_reminders.sql)

This schedules:

```sql
select public.process_orbit_recommendation_reminders(7, 100);
```

daily at **14:00 UTC** via `pg_cron`.

Confirm:

```sql
select jobid, jobname, schedule, command
from cron.job
where jobname = 'orbit-recommendation-reminders';
```

## 3. Automate on Vercel (when the app is deployed)

`vercel.json` already schedules:

`GET /api/cron/orbit-reminders` daily at 14:00 UTC.

On Vercel, set the same env vars (`CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`). Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set.

You can use **either** Supabase pg_cron **or** Vercel Cron. Using both is fine but redundant (the job is idempotent via `reminder_sent_at`).

## 4. Manual smoke test

```bash
# From project root — use the CRON_SECRET from .env.local
source .env.local
curl -s -X POST "http://localhost:3000/api/cron/orbit-reminders" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected: `{"ok":true,"remindersCreated":0}` (or a small number if any rows are eligible).

Or in Supabase SQL:

```sql
select public.process_orbit_recommendation_reminders(7, 100);
```

Do **not** implement reminders in `localStorage` or client timers.
