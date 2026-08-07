import { createClient } from "@/lib/supabase/server";

/**
 * Process one-time 7-day Orbit recommendation reminders.
 *
 * Call from a scheduled job (Supabase cron / Edge Function) using the
 * service role client. Do not rely on browser timers.
 *
 * @see docs/orbit-recommendation-reminders.md
 */
export async function processOrbitRecommendationReminders(opts?: {
  days?: number;
  limit?: number;
}): Promise<{ ok: boolean; remindersCreated: number; message?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "process_orbit_recommendation_reminders",
    {
      p_days: opts?.days ?? 7,
      p_limit: opts?.limit ?? 100,
    },
  );

  if (error) {
    return {
      ok: false,
      remindersCreated: 0,
      message: error.message,
    };
  }

  const payload = data as {
    ok?: boolean;
    reminders_created?: number;
  } | null;

  return {
    ok: Boolean(payload?.ok),
    remindersCreated: payload?.reminders_created ?? 0,
  };
}
