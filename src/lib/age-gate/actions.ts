"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendParentConsentEmail } from "@/lib/age-gate/email";
import {
  isAgeGateCleared,
  type AgeGateStatus,
} from "@/lib/age-gate/types";

export type ClearAgeGateResult =
  | { ok: true; status: AgeGateStatus; alreadyCleared?: boolean }
  | {
      ok: false;
      error: "unauthenticated" | "invalid_status" | "unknown";
      message: string;
    };

export type RequestParentalConsentResult =
  | { ok: true; parentEmail: string }
  | {
      ok: false;
      error:
        | "unauthenticated"
        | "invalid_email"
        | "already_cleared"
        | "not_personal_account"
        | "email_failed"
        | "unknown";
      message: string;
    };

export type ApproveParentalConsentResult =
  | {
      ok: true;
      status: "parent_approved";
      alreadyApproved?: boolean;
      isChildSession: boolean;
      nextPath: string | null;
    }
  | {
      ok: false;
      error: "invalid_token" | "expired" | "unknown";
      message: string;
    };

export type AgeGateSnapshot =
  | {
      ok: true;
      status: AgeGateStatus;
      cleared: boolean;
      pendingParentEmail: string | null;
    }
  | { ok: false; error: "unauthenticated" | "unknown"; message: string };

async function getAppOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

function mapClearError(code: string): Extract<ClearAgeGateResult, { ok: false }> {
  switch (code) {
    case "unauthenticated":
      return {
        ok: false,
        error: "unauthenticated",
        message: "You need to be signed in.",
      };
    case "invalid_status":
      return {
        ok: false,
        error: "invalid_status",
        message: "Age verification can’t be completed from this state.",
      };
    default:
      return {
        ok: false,
        error: "unknown",
        message: "Couldn’t save age verification. Try again.",
      };
  }
}

function mapRequestError(
  code: string,
): Extract<RequestParentalConsentResult, { ok: false }> {
  switch (code) {
    case "unauthenticated":
      return {
        ok: false,
        error: "unauthenticated",
        message: "You need to be signed in.",
      };
    case "invalid_email":
      return {
        ok: false,
        error: "invalid_email",
        message: "Enter a valid parent or guardian email.",
      };
    case "already_cleared":
      return {
        ok: false,
        error: "already_cleared",
        message: "Age verification is already complete.",
      };
    case "not_personal_account":
      return {
        ok: false,
        error: "not_personal_account",
        message: "Parental consent is only for personal accounts.",
      };
    default:
      return {
        ok: false,
        error: "unknown",
        message: "Couldn’t send the permission request. Try again.",
      };
  }
}

export async function clearAgeGate13PlusAction(): Promise<ClearAgeGateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return mapClearError("unauthenticated");

  const { data, error } = await supabase.rpc("clear_age_gate_13_plus");
  if (error) return mapClearError("unknown");

  const payload = data as {
    ok?: boolean;
    status?: AgeGateStatus;
    already_cleared?: boolean;
    error?: string;
  } | null;

  if (payload?.ok && payload.status) {
    revalidatePath("/age-verification");
    revalidatePath("/home");
    return {
      ok: true,
      status: payload.status,
      alreadyCleared: Boolean(payload.already_cleared),
    };
  }

  return mapClearError(payload?.error ?? "unknown");
}

export async function requestParentalConsentAction(
  parentEmail: string,
): Promise<RequestParentalConsentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return mapRequestError("unauthenticated");

  const { data, error } = await supabase.rpc("request_parental_consent", {
    parent_email: parentEmail,
  });

  if (error) return mapRequestError("unknown");

  const payload = data as {
    ok?: boolean;
    token?: string;
    parent_email?: string;
    error?: string;
  } | null;

  if (!payload?.ok || typeof payload.token !== "string") {
    return mapRequestError(payload?.error ?? "unknown");
  }

  const origin = await getAppOrigin();
  const approveUrl = `${origin}/age-verification/approve?token=${encodeURIComponent(payload.token)}`;
  const emailResult = await sendParentConsentEmail({
    parentEmail: payload.parent_email ?? parentEmail.trim().toLowerCase(),
    approveUrl,
  });

  if (!emailResult.ok) {
    return {
      ok: false,
      error: "email_failed",
      message: emailResult.message.includes("RESEND_API_KEY")
        ? "Email isn’t configured yet. Add RESEND_API_KEY to .env.local."
        : emailResult.message,
    };
  }

  revalidatePath("/age-verification");
  revalidatePath("/age-verification/pending");

  return {
    ok: true,
    parentEmail: payload.parent_email ?? parentEmail.trim().toLowerCase(),
  };
}

export async function approveParentalConsentAction(
  token: string,
): Promise<ApproveParentalConsentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("approve_parental_consent", {
    token,
  });

  if (error) {
    return {
      ok: false,
      error: "unknown",
      message: "Couldn’t confirm approval. Try again.",
    };
  }

  const payload = data as {
    ok?: boolean;
    status?: string;
    already_approved?: boolean;
    user_id?: string;
    error?: string;
  } | null;

  if (!payload?.ok) {
    const code = payload?.error ?? "unknown";
    if (code === "expired") {
      return {
        ok: false,
        error: "expired",
        message: "This approval link has expired. Ask for a new one.",
      };
    }
    if (code === "invalid_token") {
      return {
        ok: false,
        error: "invalid_token",
        message: "This approval link isn’t valid.",
      };
    }
    return {
      ok: false,
      error: "unknown",
      message: "Couldn’t confirm approval. Try again.",
    };
  }

  const isChildSession = Boolean(
    user && payload.user_id && user.id === payload.user_id,
  );

  let nextPath: string | null = null;
  if (isChildSession) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username_normalized")
      .eq("id", user!.id)
      .maybeSingle();
    nextPath = profile?.username_normalized
      ? "/home"
      : "/onboarding/username";
  }

  revalidatePath("/age-verification");
  revalidatePath("/home");
  revalidatePath("/onboarding/username");

  return {
    ok: true,
    status: "parent_approved",
    alreadyApproved: Boolean(payload.already_approved),
    isChildSession,
    nextPath,
  };
}

export async function getAgeGateSnapshotAction(): Promise<AgeGateSnapshot> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: "unauthenticated",
      message: "You need to be signed in.",
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("age_gate_status")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: "unknown",
      message: "Couldn’t load age verification status.",
    };
  }

  const status = (profile?.age_gate_status as AgeGateStatus | undefined) ?? "unverified";

  let pendingParentEmail: string | null = null;
  if (status === "awaiting_parent") {
    const { data: pendingData } = await supabase.rpc(
      "get_own_pending_parental_consent",
    );
    const pendingPayload = pendingData as {
      ok?: boolean;
      pending?: { parent_email?: string } | null;
    } | null;
    pendingParentEmail =
      pendingPayload?.pending?.parent_email?.trim().toLowerCase() ?? null;
  }

  return {
    ok: true,
    status,
    cleared: isAgeGateCleared(status),
    pendingParentEmail,
  };
}
