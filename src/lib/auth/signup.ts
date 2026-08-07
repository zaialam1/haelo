import { createClient } from "@/lib/supabase/client";
import { validateUsername } from "@/lib/profiles/username";
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
    (lower.includes("email address") && lower.includes("invalid"))
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
 * Create a Haelo account with Supabase Auth (email + password + username).
 * Username is stored in auth metadata and claimed on profiles when a session exists.
 */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const password = input.password;
  const usernameResult = validateUsername(input.username);

  if (!firstName) {
    return {
      ok: false,
      code: "unknown",
      message: "Enter your first name.",
    };
  }

  if (!usernameResult.ok) {
    const code =
      usernameResult.error === "reserved"
        ? "username_reserved"
        : usernameResult.error === "empty" ||
            usernameResult.error === "too_short" ||
            usernameResult.error === "too_long" ||
            usernameResult.error === "invalid_chars"
          ? "username_invalid"
          : "username_invalid";
    return {
      ok: false,
      code,
      message: usernameResult.message,
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

  // Re-check availability before creating the auth user.
  const { data: availability } = await supabase.rpc(
    "check_username_availability",
    { raw_username: usernameResult.normalized },
  );
  if (availability === "taken") {
    return {
      ok: false,
      code: "username_taken",
      message: "That Haelo name is already taken.",
    };
  }
  if (availability === "reserved") {
    return {
      ok: false,
      code: "username_reserved",
      message: "That Haelo name isn’t available.",
    };
  }
  if (availability === "invalid") {
    return {
      ok: false,
      code: "username_invalid",
      message:
        "Use 3–20 letters, numbers, or underscores. Don’t start or end with an underscore.",
    };
  }

  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/age-verification`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        haelo_username: usernameResult.normalized,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    return mapSignUpError(error.message);
  }

  let usernameClaimed = false;
  if (data.session) {
    const { data: claimData } = await supabase.rpc("claim_username", {
      raw_username: usernameResult.normalized,
    });
    const payload = claimData as
      | { ok?: boolean; username?: string; error?: string }
      | null;
    if (payload?.ok) {
      usernameClaimed = true;
    } else if (payload?.error === "taken") {
      return {
        ok: false,
        code: "username_taken",
        message: "That Haelo name is already taken.",
      };
    }
  }

  return {
    ok: true,
    needsEmailConfirmation: !data.session,
    usernameClaimed,
  };
}
