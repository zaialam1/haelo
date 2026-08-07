import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Cron endpoint for one-time Orbit recommendation reminders.
 * Secure with: Authorization: Bearer <CRON_SECRET>
 *
 * Vercel Cron sends GET and adds the Bearer header when CRON_SECRET is set.
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 */
async function runReminders(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "cron_not_configured" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "supabase_service_not_configured" },
      { status: 503 },
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc(
    "process_orbit_recommendation_reminders",
    { p_days: 7, p_limit: 100 },
  );

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  const payload = data as { ok?: boolean; reminders_created?: number } | null;
  return NextResponse.json({
    ok: Boolean(payload?.ok),
    remindersCreated: payload?.reminders_created ?? 0,
  });
}

export async function GET(request: Request) {
  return runReminders(request);
}

export async function POST(request: Request) {
  return runReminders(request);
}
