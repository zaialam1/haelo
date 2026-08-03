import { createClient } from "@/lib/supabase/client";
import type {
  AccountProfile,
  ResetPasswordResult,
  UpdatePasswordResult,
} from "./types";

export type { AccountProfile };

/**
 * Load the signed-in user's profile from Supabase Auth.
 */
export async function getAccountProfile(): Promise<AccountProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  const firstName =
    typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name
      : "";

  return {
    firstName,
    email: user.email,
  };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(
  email: string,
): Promise<ResetPasswordResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, message: "Enter your email." };
  }

  const supabase = createClient();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/auth/update-password`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo,
  });

  if (error) {
    return {
      ok: false,
      message: error.message || "Could not send reset email. Try again.",
    };
  }

  return { ok: true };
}

export async function updatePassword(
  password: string,
): Promise<UpdatePasswordResult> {
  if (password.length < 8) {
    return { ok: false, message: "Use at least 8 characters." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      ok: false,
      message: error.message || "Could not update password. Try again.",
    };
  }

  return { ok: true };
}
