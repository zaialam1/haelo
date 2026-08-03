import { createClient } from "@/lib/supabase/client";
import type { SignInInput, SignInResult } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign in to an existing Haelo account with Supabase Auth.
 */
export async function signIn(input: SignInInput): Promise<SignInResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!EMAIL_RE.test(email)) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Enter a valid email.",
    };
  }

  if (!password) {
    return {
      ok: false,
      code: "invalid_credentials",
      message: "Enter your password.",
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("confirm")) {
      return {
        ok: false,
        code: "email_not_confirmed",
        message: "Confirm your email before logging in. Check your inbox.",
      };
    }
    if (
      lower.includes("invalid") ||
      lower.includes("credentials") ||
      error.status === 400
    ) {
      return {
        ok: false,
        code: "invalid_credentials",
        message: "We couldn't log you in with that email and password.",
      };
    }
    return {
      ok: false,
      code: "unknown",
      message: error.message || "Something went wrong. Try again.",
    };
  }

  return { ok: true };
}
