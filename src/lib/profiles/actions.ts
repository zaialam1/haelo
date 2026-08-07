"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "./username";

export type ClaimUsernameResult =
  | { ok: true; username: string }
  | {
      ok: false;
      error:
        | "unauthenticated"
        | "invalid"
        | "reserved"
        | "taken"
        | "already_set"
        | "unknown";
      message: string;
    };

export type CheckUsernameResult = {
  status:
    | "available"
    | "invalid"
    | "reserved"
    | "taken"
    | "unauthenticated"
    | "error";
  message?: string;
};

function mapClaimError(
  code: string,
): Extract<ClaimUsernameResult, { ok: false }> {
  switch (code) {
    case "unauthenticated":
      return {
        ok: false,
        error: "unauthenticated",
        message: "You need to be signed in.",
      };
    case "invalid":
      return {
        ok: false,
        error: "invalid",
        message:
          "Use 3–20 letters, numbers, or underscores. Don’t start or end with an underscore.",
      };
    case "reserved":
      return {
        ok: false,
        error: "reserved",
        message: "That Haelo name isn’t available.",
      };
    case "taken":
      return {
        ok: false,
        error: "taken",
        message: "That Haelo name is already taken.",
      };
    case "already_set":
      return {
        ok: false,
        error: "already_set",
        message: "You already chose a Haelo name.",
      };
    default:
      return {
        ok: false,
        error: "unknown",
        message: "Couldn’t save your Haelo name. Try again.",
      };
  }
}

export async function checkUsernameAvailabilityAction(
  rawUsername: string,
): Promise<CheckUsernameResult> {
  const local = validateUsername(rawUsername);
  if (!local.ok) {
    if (local.error === "reserved") {
      return { status: "reserved", message: local.message };
    }
    return { status: "invalid", message: local.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_username_availability", {
    raw_username: local.normalized,
  });

  if (error) {
    return { status: "error", message: "Couldn’t check availability." };
  }

  const status = typeof data === "string" ? data : "error";
  if (
    status === "available" ||
    status === "invalid" ||
    status === "reserved" ||
    status === "taken" ||
    status === "unauthenticated"
  ) {
    return { status };
  }

  return { status: "error", message: "Couldn’t check availability." };
}

/**
 * If auth metadata has haelo_username and profile has none, claim it.
 * Used after email confirmation / login for accounts created before claim ran.
 */
export async function claimPendingUsernameFromMetadataAction(): Promise<ClaimUsernameResult | { ok: true; username: string | null; skipped: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return mapClaimError("unauthenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username_normalized")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username_normalized) {
    return { ok: true, username: profile.username_normalized, skipped: true };
  }

  const pending =
    typeof user.user_metadata?.haelo_username === "string"
      ? user.user_metadata.haelo_username
      : "";

  if (!pending) {
    return { ok: true, username: null, skipped: true };
  }

  return claimUsernameAction(pending);
}

export async function claimUsernameAction(
  rawUsername: string,
): Promise<ClaimUsernameResult> {
  const local = validateUsername(rawUsername);
  if (!local.ok) {
    return mapClaimError(local.error === "empty" ? "invalid" : local.error);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return mapClaimError("unauthenticated");
  }

  const { data, error } = await supabase.rpc("claim_username", {
    raw_username: local.normalized,
  });

  if (error) {
    return mapClaimError("unknown");
  }

  const payload = data as { ok?: boolean; username?: string; error?: string } | null;
  if (payload?.ok && typeof payload.username === "string") {
    revalidatePath("/home");
    revalidatePath("/settings");
    revalidatePath("/onboarding/username");
    return { ok: true, username: payload.username };
  }

  return mapClaimError(payload?.error ?? "unknown");
}
