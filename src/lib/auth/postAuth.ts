"use server";

import { claimPendingUsernameFromMetadataAction } from "@/lib/profiles/actions";
import { getOwnProfile } from "@/lib/profiles/data";
import { safeNextPath } from "@/lib/auth/paths";
import { isAgeGateCleared } from "@/lib/age-gate/types";

/**
 * After login/signup/email confirm: claim any pending username from metadata,
 * then send personal users through age gate, then username onboarding.
 */
export async function resolvePostAuthPathAction(
  requestedNext: string | null,
  fallback = "/home",
): Promise<string> {
  await claimPendingUsernameFromMetadataAction();
  const profile = await getOwnProfile();

  if (profile?.accountRole === "user") {
    const status = profile.ageGateStatus;
    if (!isAgeGateCleared(status)) {
      return status === "awaiting_parent"
        ? "/age-verification/pending"
        : "/age-verification";
    }
  }

  if (!profile?.usernameNormalized) {
    return "/onboarding/username";
  }
  return safeNextPath(requestedNext, fallback);
}
