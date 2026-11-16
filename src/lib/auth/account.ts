import { createClient } from "@/lib/supabase/client";
import {
  buildPasswordResetRedirectTo,
  mapPasswordResetRequestError,
  mapPasswordUpdateError,
} from "@/lib/auth/passwordReset";
import type {
  AccountProfile,
  ResetPasswordResult,
  UpdatePasswordResult,
} from "./types";

export type { AccountProfile };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/**
 * True when a non-anonymous user has an active session suitable for
 * updating their password (recovery link or already signed in).
 */
export async function hasPasswordUpdateSession(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return false;
  if (user.is_anonymous) return false;
  return true;
}

/**
 * @deprecated Prefer `requestPasswordResetAction` (Resend delivery).
 * Kept for compatibility; client-only Supabase mailer path.
 */
export async function requestPasswordReset(
  email: string,
): Promise<ResetPasswordResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !EMAIL_RE.test(normalized)) {
    return { ok: false, message: "Enter a valid email." };
  }

  if (typeof window === "undefined") {
    return { ok: false, message: "Couldn’t send a reset email. Try again." };
  }

  const supabase = createClient();
  const redirectTo = buildPasswordResetRedirectTo(window.location.origin);

  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo,
  });

  if (error) {
    return {
      ok: false,
      message: mapPasswordResetRequestError(error.message || ""),
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return {
      ok: false,
      message: "This reset link has expired. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      ok: false,
      message: mapPasswordUpdateError(error.message || ""),
    };
  }

  return { ok: true };
}
