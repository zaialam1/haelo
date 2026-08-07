import { createClient } from "@/lib/supabase/client";
import { validateUsername } from "@/lib/profiles/username";
import type { ProfessionalType } from "@/lib/professional/types";

export type FinishProfessionalSignupInput = {
  displayName: string;
  professionalType: ProfessionalType;
  organizationName?: string;
  username?: string;
};

export type FinishProfessionalSignupResult =
  | { ok: true; verificationStatus: string; username: string | null }
  | { ok: false; message: string; code?: string };

/**
 * Finish professional provisioning using the browser Supabase session.
 * Prefer this right after signUp/signIn so we don't hit a server-action cookie race.
 */
export async function finishProfessionalSignupClient(
  input: FinishProfessionalSignupInput,
): Promise<FinishProfessionalSignupResult> {
  const displayName = input.displayName.trim();
  if (!displayName) {
    return { ok: false, message: "Enter your name.", code: "display_name_required" };
  }

  let username: string | null = null;
  if (input.username?.trim()) {
    const parsed = validateUsername(input.username);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message, code: "username_invalid" };
    }
    username = parsed.normalized;
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      message: "You’re signed up, but we couldn’t confirm your session. Try Professional login.",
      code: "unauthenticated",
    };
  }

  const { data, error } = await supabase.rpc("complete_professional_signup", {
    p_display_name: displayName,
    p_professional_type: input.professionalType,
    p_organization_name: input.organizationName?.trim() || null,
    p_raw_username: username,
  });

  if (error) {
    const msg = error.message || "Couldn’t finish professional signup.";
    // Common when migration isn’t applied yet
    if (
      msg.toLowerCase().includes("could not find the function") ||
      msg.toLowerCase().includes("complete_professional_signup")
    ) {
      return {
        ok: false,
        message:
          "Professional setup isn’t available in the database yet. Apply the professional_profiles migration in Supabase, then use Professional login.",
        code: "missing_rpc",
      };
    }
    return { ok: false, message: msg, code: "rpc_error" };
  }

  const payload = data as {
    ok?: boolean;
    error?: string;
    username?: string | null;
    verification_status?: string;
  } | null;

  if (!payload?.ok) {
    const code = payload?.error ?? "unknown";
    const message =
      code === "username_taken" || code === "taken"
        ? "That Haelo name is already taken."
        : code === "reserved"
          ? "That Haelo name isn’t available."
          : code === "invalid" || code === "username_invalid"
            ? "Choose a valid Haelo name."
            : code === "unauthenticated"
              ? "You’re signed up, but we couldn’t confirm your session. Try Professional login."
              : "Couldn’t finish professional signup. Try Professional login to complete setup.";
    return { ok: false, message, code };
  }

  return {
    ok: true,
    verificationStatus: payload.verification_status ?? "verified",
    username: payload.username ?? username,
  };
}
