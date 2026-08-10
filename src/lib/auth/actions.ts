"use server";

import { SESSION_AUDIO_BUCKET } from "@/config/recording";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Remove every Storage object under `{userId}/` in the session audio bucket.
 * Best-effort — auth deletion still proceeds if listing fails.
 */
async function removeUserAudioFolder(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<void> {
  try {
    const { data: entries } = await admin.storage
      .from(SESSION_AUDIO_BUCKET)
      .list(userId, { limit: 1000 });

    if (!entries || entries.length === 0) return;

    // Session folders: {userId}/{sessionId}/{attempt}.ext
    const paths: string[] = [];
    for (const entry of entries) {
      if (entry.id === null) {
        // Folder — list children
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
  } catch {
    // Storage cleanup is best-effort; account delete must still proceed.
  }
}

/**
 * Permanently delete the signed-in auth user (and cascade app data).
 * Also removes session audio from Storage before the auth delete.
 * Requires SUPABASE_SERVICE_ROLE_KEY on the server.
 */
export async function deleteAccountAction(): Promise<DeleteAccountResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      message:
        "Account deletion isn’t configured yet. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "You need to be signed in to delete your account." };
  }

  try {
    const admin = createAdminClient();
    await removeUserAudioFolder(admin, user.id);

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return {
        ok: false,
        message: error.message || "Could not delete account. Try again.",
      };
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not delete account. Try again.",
    };
  }

  await supabase.auth.signOut();
  return { ok: true };
}
