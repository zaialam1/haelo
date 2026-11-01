import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { GUEST_CONVERSION_FLAG_KEY } from "./config";

export function isAnonymousUser(
  user: User | null | undefined,
): user is User {
  return Boolean(user?.is_anonymous);
}

/** JWT / claims shape from Supabase getClaims for anonymous sessions. */
export function isAnonymousClaims(
  claims: { is_anonymous?: boolean } | null | undefined,
): boolean {
  return Boolean(claims?.is_anonymous);
}

/**
 * Ensure the browser has an anonymous Supabase session for guest try.
 * No-ops if already anonymous. Throws if a registered user is signed in.
 */
export async function ensureGuestSession(): Promise<{ userId: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user.is_anonymous) {
    throw new Error("registered_user");
  }

  if (user?.is_anonymous) {
    markGuestConversionFlag();
    return { userId: user.id };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    const raw = error?.message || "";
    if (/captcha/i.test(raw)) {
      throw new Error(
        "Guest practice is blocked by Supabase CAPTCHA. In the Supabase dashboard, open Authentication → Attack Protection and turn off CAPTCHA protection (or we can wire a CAPTCHA widget into Try Halo).",
      );
    }
    throw new Error(
      raw ||
        "Guest practice isn’t available right now. Try again, or create an account.",
    );
  }

  markGuestConversionFlag();
  return { userId: data.user.id };
}

/** Sign out an anonymous guest before email signup (no data conversion). */
export async function clearGuestSessionIfAnonymous(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.is_anonymous) return false;
  await supabase.auth.signOut();
  return true;
}

export function markGuestConversionFlag(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GUEST_CONVERSION_FLAG_KEY, "1");
  } catch {
    // ignore
  }
}

export function consumeGuestConversionFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const present = sessionStorage.getItem(GUEST_CONVERSION_FLAG_KEY) === "1";
    if (present) sessionStorage.removeItem(GUEST_CONVERSION_FLAG_KEY);
    return present;
  } catch {
    return false;
  }
}

export function peekGuestConversionFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(GUEST_CONVERSION_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}
