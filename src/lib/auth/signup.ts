import { createClient } from "@/lib/supabase/client";
import type { SignUpInput, SignUpResult } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapSignUpError(message: string): SignUpResult {
  const lower = message.toLowerCase();

  if (lower.includes("already") || lower.includes("registered")) {
    return {
      ok: false,
      code: "email_taken",
      message: "An account with this email already exists.",
    };
  }

  if (lower.includes("signups are disabled") || lower.includes("signup is disabled")) {
    return {
      ok: false,
      code: "unknown",
      message:
        "Email signups are disabled in Supabase. Enable them under Authentication → Providers → Email.",
    };
  }

  if (lower.includes("password")) {
    return {
      ok: false,
      code: "weak_password",
      message: "Use a stronger password (at least 8 characters).",
    };
  }

  if (
    lower.includes("invalid email") ||
    lower.includes("email address") && lower.includes("invalid")
  ) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Enter a valid email.",
    };
  }

  return {
    ok: false,
    code: "unknown",
    message: message || "Something went wrong. Try again.",
  };
}

/**
 * Create a Haelo account with Supabase Auth (email + password).
 */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const password = input.password;

  if (!firstName) {
    return {
      ok: false,
      code: "unknown",
      message: "Enter your first name.",
    };
  }

  if (!EMAIL_RE.test(email)) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Enter a valid email.",
    };
  }

  if (password.length < 8) {
    return {
      ok: false,
      code: "weak_password",
      message: "Use at least 8 characters.",
    };
  }

  const supabase = createClient();
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/age-verification`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName },
      emailRedirectTo,
    },
  });

  // #region agent log
  fetch("http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "15d12f",
    },
    body: JSON.stringify({
      sessionId: "15d12f",
      runId: "smtp-check",
      hypothesisId: "F",
      location: "signup.ts:afterSignUp",
      message: "signUp result",
      data: {
        ok: !error,
        errorMessage: error?.message ?? null,
        errorStatus: error?.status ?? null,
        hasSession: Boolean(data?.session),
        hasUser: Boolean(data?.user),
        needsEmailConfirmation: !error && !data.session,
        identitiesCount: data?.user?.identities?.length ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (error) {
    return mapSignUpError(error.message);
  }

  return {
    ok: true,
    needsEmailConfirmation: !data.session,
  };
}
