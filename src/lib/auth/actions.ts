"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Permanently delete the signed-in auth user.
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
