"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/profiles/username";
import type { ProfessionalType } from "./types";

export type CompleteProfessionalSignupInput = {
  displayName: string;
  professionalType: ProfessionalType;
  organizationName?: string;
  username?: string;
};

export type CompleteProfessionalSignupResult =
  | { ok: true; verificationStatus: string; username: string | null }
  | { ok: false; message: string; code?: string };

export async function completeProfessionalSignupAction(
  input: CompleteProfessionalSignupInput,
): Promise<CompleteProfessionalSignupResult> {
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "You need to be signed in.", code: "unauthenticated" };
  }

  const { data, error } = await supabase.rpc("complete_professional_signup", {
    p_display_name: displayName,
    p_professional_type: input.professionalType,
    p_organization_name: input.organizationName?.trim() || null,
    p_raw_username: username,
  });

  if (error) {
    return {
      ok: false,
      message: error.message || "Couldn’t finish professional signup.",
      code: "unknown",
    };
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
            : "Couldn’t finish professional signup.";
    return { ok: false, message, code };
  }

  revalidatePath("/home");
  revalidatePath("/settings");
  revalidatePath("/professional/home");
  revalidatePath("/settings/connections");

  return {
    ok: true,
    verificationStatus: payload.verification_status ?? "verified",
    username: payload.username ?? username,
  };
}
