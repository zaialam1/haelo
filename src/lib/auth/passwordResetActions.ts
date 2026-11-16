"use server";

import type { ResetPasswordResult } from "@/lib/auth/types";
import {
  resolvePasswordResetOrigin,
  sendPasswordResetEmail,
} from "@/lib/auth/passwordResetEmail";
import { buildPasswordResetRedirectTo } from "@/lib/auth/passwordReset";
import { createClient } from "@supabase/supabase-js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Request a password-reset email.
 * Prefer Resend (reliable delivery). Falls back to Supabase Auth mailer
 * only when RESEND_API_KEY is not configured.
 */
export async function requestPasswordResetAction(
  email: string,
  clientOrigin?: string | null,
): Promise<ResetPasswordResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !EMAIL_RE.test(normalized)) {
    return { ok: false, message: "Enter a valid email." };
  }

  const origin = resolvePasswordResetOrigin(clientOrigin ?? null);

  if (process.env.RESEND_API_KEY?.trim()) {
    const result = await sendPasswordResetEmail({
      email: normalized,
      origin,
    });
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    // Always show the same success copy whether or not an account exists.
    return { ok: true };
  }

  // Fallback: Supabase built-in mailer (often rate-limited / unreliable).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { ok: false, message: "Couldn’t send a reset email. Try again." };
  }
  const supabase = createClient(url, anon);
  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: buildPasswordResetRedirectTo(origin),
  });
  if (error) {
    return { ok: false, message: "Couldn’t send a reset email. Try again." };
  }
  return { ok: true };
}
