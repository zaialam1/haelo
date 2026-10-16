"use server";

import { claimPendingUsernameFromMetadataAction } from "@/lib/profiles/actions";
import { getOwnProfile } from "@/lib/profiles/data";
import { safeNextPath } from "@/lib/auth/paths";

/**
 * After login/signup/email confirm: claim any pending username from metadata,
 * then send users to username onboarding if needed.
 * Password-recovery destinations always win so users can finish resetting.
 */
export async function resolvePostAuthPathAction(
  requestedNext: string | null,
  fallback = "/home",
): Promise<string> {
  await claimPendingUsernameFromMetadataAction();

  const next = safeNextPath(requestedNext, fallback);
  if (next === "/auth/update-password" || next.startsWith("/auth/update-password?")) {
    return "/auth/update-password";
  }

  const profile = await getOwnProfile();

  if (!profile?.usernameNormalized) {
    return "/onboarding/username";
  }
  return next;
}
