import type { SignUpInput, SignUpResult } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create an Attune account.
 *
 * PROTOTYPE: does not talk to a server. Validates locally, waits briefly,
 * then succeeds so the UI can continue to age verification.
 *
 * To connect Supabase later, replace the body of this function with:
 *
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data, error } = await supabase.auth.signUp({
 *     email: input.email,
 *     password: input.password,
 *     options: { data: { first_name: input.firstName.trim() } },
 *   });
 *   // map `error` → SignUpResult { ok: false, code, message }
 *
 * Keep this function's input/output the same so the signup form does not need
 * a rewrite.
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

  // Simulate network latency so loading UI is testable.
  await new Promise((resolve) => setTimeout(resolve, 700));

  return { ok: true };
}
