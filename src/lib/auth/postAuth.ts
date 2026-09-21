"use server";

import { claimPendingUsernameFromMetadataAction } from "@/lib/profiles/actions";
import { getOwnProfile } from "@/lib/profiles/data";
import { safeNextPath } from "@/lib/auth/paths";

/**
 * After login/signup/email confirm: claim any pending username from metadata,
 * then send users to username onboarding if needed.
 */
export async function resolvePostAuthPathAction(
  requestedNext: string | null,
  fallback = "/home",
): Promise<string> {
  await claimPendingUsernameFromMetadataAction();
  const profile = await getOwnProfile();

  if (!profile?.usernameNormalized) {
    return "/onboarding/username";
  }
  return safeNextPath(requestedNext, fallback);
}
