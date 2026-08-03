/**
 * Auth types shaped to match what we'll pass to Supabase Auth later.
 *
 * Supabase equivalent:
 *   supabase.auth.signUp({
 *     email,
 *     password,
 *     options: { data: { first_name: firstName } },
 *   })
 *
 * Do not put API keys here. When wiring Supabase, use env vars such as:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

export type SignUpInput = {
  email: string;
  password: string;
  /** Stored as user metadata `first_name` when Supabase is connected */
  firstName: string;
};

export type SignUpErrorCode =
  | "invalid_email"
  | "weak_password"
  | "email_taken"
  | "unknown";

export type SignUpResult =
  | { ok: true }
  | { ok: false; code: SignUpErrorCode; message: string };
