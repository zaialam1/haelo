"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/paths";
import { PASSWORD_UPDATE_PATH } from "@/lib/auth/passwordReset";
import { createClient } from "@/lib/supabase/server";

/**
 * Verify a recovery token after an explicit user click, then open the
 * set-password page. Used by `/auth/recover` so GET prefetch cannot burn the OTP.
 */
export async function confirmRecoveryAction(formData: FormData): Promise<void> {
  const token_hash = String(formData.get("token_hash") || "").trim();
  const next = safeNextPath(
    String(formData.get("next") || ""),
    PASSWORD_UPDATE_PATH,
  );

  if (!token_hash) {
    redirect("/auth/error?reason=recovery");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash,
  });

  if (error) {
    redirect("/auth/error?reason=recovery");
  }

  redirect(next);
}
