"use server";

import { claimPendingUsernameFromMetadataAction } from "@/lib/profiles/actions";
import { getOwnProfile } from "@/lib/profiles/data";
import { safeNextPath } from "@/lib/auth/paths";
import {
  PASSWORD_UPDATE_PATH,
  isPasswordRecoveryNext,
} from "@/lib/auth/passwordReset";

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
  if (isPasswordRecoveryNext(next)) {
    return PASSWORD_UPDATE_PATH;
  }

  const profile = await getOwnProfile();

  if (!profile?.usernameNormalized) {
    return "/onboarding/username";
  }
  return next;
}
