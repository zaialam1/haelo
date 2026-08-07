-- Schedule daily Orbit recommendation reminders in Supabase (pg_cron).
-- Run once in the Supabase SQL editor.
--
-- Requires pg_cron (enabled by default on many Supabase plans).
-- Runs every day at 14:00 UTC. Change the cron expression if you want.

create extension if not exists pg_cron with schema pg_catalog;

-- Remove prior job with the same name if re-running this script.
select cron.unschedule(jobid)
from cron.job
where jobname = 'orbit-recommendation-reminders';

select cron.schedule(
  'orbit-recommendation-reminders',
  '0 14 * * *',
  $$select public.process_orbit_recommendation_reminders(7, 100)$$
);

-- Confirm it was scheduled:
select jobid, jobname, schedule, command
from cron.job
where jobname = 'orbit-recommendation-reminders';
