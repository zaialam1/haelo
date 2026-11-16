import { safeNextPath } from "@/lib/auth/paths";

/** Relative path users land on after a recovery session is established. */
export const PASSWORD_UPDATE_PATH = "/auth/update-password";

/**
 * Build the redirectTo URL passed to Supabase resetPasswordForEmail.
 * Must be listed under Authentication → URL Configuration → Redirect URLs.
 */
export function buildPasswordResetRedirectTo(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/callback?next=${encodeURIComponent(PASSWORD_UPDATE_PATH)}`;
}

/**
 * Build a cross-browser recovery link. Lands on an interstitial that only
 * verifies the token after the user clicks Continue (avoids email prefetch
 * burning one-time links).
 */
export function buildPasswordResetConfirmPath(
  tokenHash: string,
  next: string = PASSWORD_UPDATE_PATH,
): string {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type: "recovery",
    next: safeNextPath(next, PASSWORD_UPDATE_PATH),
  });
  return `/auth/recover?${params.toString()}`;
}

export function isPasswordRecoveryNext(
  path: string | null | undefined,
): boolean {
  const next = safeNextPath(path, "");
  return (
    next === PASSWORD_UPDATE_PATH ||
    next.startsWith(`${PASSWORD_UPDATE_PATH}?`)
  );
}

/** Map provider errors to safe, non-enumerating user copy. */
export function mapPasswordResetRequestError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate") || lower.includes("limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (lower.includes("redirect") || lower.includes("not allowed")) {
    return "Couldn’t send a reset email from this site. Try again later.";
  }
  return "Couldn’t send a reset email. Try again.";
}

export function mapPasswordUpdateError(message: string): string {
  const lower = message.toLowerCase();
  // Supabase: "New password should be different from the old password."
  if (
    lower.includes("different from the old") ||
    lower.includes("same as the old") ||
    (lower.includes("different") && lower.includes("old password")) ||
    (lower.includes("same") && lower.includes("password"))
  ) {
    return "Pick a different password than the one you have now.";
  }
  if (
    lower.includes("session") ||
    lower.includes("jwt") ||
    lower.includes("not authenticated") ||
    lower.includes("logged in")
  ) {
    return "This reset link has expired. Request a new one.";
  }
  if (
    lower.includes("weak") ||
    (lower.includes("least") && lower.includes("character"))
  ) {
    return "Use at least 8 characters.";
  }
  return "Couldn’t update password. Try again.";
}

export function validateNewPassword(
  password: string,
  confirmPassword: string,
): { password?: string; confirmPassword?: string } {
  const errors: { password?: string; confirmPassword?: string } = {};
  if (!password) errors.password = "Enter a new password.";
  else if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (confirmPassword !== password)
    errors.confirmPassword = "Passwords don’t match.";
  return errors;
}
