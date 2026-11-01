import { NextResponse } from "next/server";
import { SESSION_AUDIO_BUCKET } from "@/config/recording";
import { GUEST_RETENTION_HOURS } from "@/lib/guest/config";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Purge anonymous guest accounts older than GUEST_RETENTION_HOURS.
 * Cascades sessions via FK; best-effort removes audio folders.
 *
 * Secure with: Authorization: Bearer <CRON_SECRET>
 */
async function runCleanup(request: Request) {
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

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "supabase_service_not_configured" },
      { status: 503 },
    );
  }

  const cutoff = Date.now() - GUEST_RETENTION_HOURS * 60 * 60 * 1000;
  let deleted = 0;
  let scanned = 0;
  let page = 1;
  const perPage = 100;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, deleted, scanned },
        { status: 500 },
      );
    }

    const users = data.users ?? [];
    if (users.length === 0) break;
    scanned += users.length;

    for (const user of users) {
      if (!user.is_anonymous) continue;
      const created = user.created_at ? Date.parse(user.created_at) : NaN;
      if (!Number.isFinite(created) || created > cutoff) continue;

      await removeUserAudioFolder(admin, user.id);
      const { error: delError } = await admin.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error("[guest-cleanup] delete failed:", user.id, delError.message);
        continue;
      }
      deleted += 1;
    }

    if (users.length < perPage) break;
    page += 1;
    // Safety: don't scan unbounded in one invocation.
    if (page > 20) break;
  }

  return NextResponse.json({
    ok: true,
    deleted,
    scanned,
    retentionHours: GUEST_RETENTION_HOURS,
  });
}

async function removeUserAudioFolder(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<void> {
  try {
    const { data: entries } = await admin.storage
      .from(SESSION_AUDIO_BUCKET)
      .list(userId, { limit: 1000 });

    if (!entries || entries.length === 0) return;

    const paths: string[] = [];
    for (const entry of entries) {
      if (entry.id === null) {
        const { data: children } = await admin.storage
          .from(SESSION_AUDIO_BUCKET)
          .list(`${userId}/${entry.name}`, { limit: 1000 });
        for (const child of children ?? []) {
          if (child.name) {
            paths.push(`${userId}/${entry.name}/${child.name}`);
          }
        }
      } else if (entry.name) {
        paths.push(`${userId}/${entry.name}`);
      }
    }

    if (paths.length > 0) {
      await admin.storage.from(SESSION_AUDIO_BUCKET).remove(paths);
    }
  } catch (e) {
    console.error("[guest-cleanup] audio cleanup failed:", userId, e);
  }
}

export async function GET(request: Request) {
  return runCleanup(request);
}

export async function POST(request: Request) {
  return runCleanup(request);
}
