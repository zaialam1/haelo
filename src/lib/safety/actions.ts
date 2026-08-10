"use server";

import { revalidatePath } from "next/cache";
import { trackEvent } from "@/lib/analytics/track";
import { createClient } from "@/lib/supabase/server";
import type {
  BlockedAccount,
  ReportObjectType,
  ReportReason,
} from "./types";
import { REPORT_REASONS } from "./types";

function isReportReason(value: string): value is ReportReason {
  return REPORT_REASONS.some((r) => r.value === value);
}

function isReportObjectType(value: string): value is ReportObjectType {
  return (
    value === "account" ||
    value === "connection_request" ||
    value === "orbit_recommendation"
  );
}

export async function blockUserAction(
  targetUserId: string,
): Promise<{ ok: boolean; message?: string }> {
  const target = targetUserId.trim();
  if (!target) return { ok: false, message: "Missing account." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to continue." };

  const { data, error } = await supabase.rpc("block_user", {
    p_target: target,
  });

  if (error) {
    return { ok: false, message: "Couldn’t block this account. Try again." };
  }

  const payload = data as { ok?: boolean; error?: string } | null;
  if (!payload?.ok) {
    const code = payload?.error;
    if (code === "invalid_target" || code === "target_not_found") {
      return { ok: false, message: "That account isn’t available." };
    }
    return { ok: false, message: "Couldn’t block this account. Try again." };
  }

  trackEvent("user_blocked", { userId: user.id });
  revalidatePath("/settings/connections");
  revalidatePath("/professional/connections");
  revalidatePath("/home");
  return { ok: true };
}

export async function unblockUserAction(
  targetUserId: string,
): Promise<{ ok: boolean; message?: string }> {
  const target = targetUserId.trim();
  if (!target) return { ok: false, message: "Missing account." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to continue." };

  const { data, error } = await supabase.rpc("unblock_user", {
    p_target: target,
  });

  if (error) {
    return { ok: false, message: "Couldn’t unblock this account. Try again." };
  }

  const payload = data as { ok?: boolean } | null;
  if (!payload?.ok) {
    return { ok: false, message: "Couldn’t unblock this account. Try again." };
  }

  revalidatePath("/settings/connections");
  revalidatePath("/professional/connections");
  return { ok: true };
}

export async function listBlockedAccountsAction(): Promise<BlockedAccount[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("list_my_blocks");
  if (error || !data) return [];

  const rows = Array.isArray(data) ? data : [];
  return rows
    .map((row) => {
      const r = row as {
        blocked_user_id?: string;
        username?: string | null;
        created_at?: string;
      };
      if (!r.blocked_user_id) return null;
      return {
        userId: r.blocked_user_id,
        username: r.username ?? null,
        blockedAt: r.created_at ?? new Date().toISOString(),
      } satisfies BlockedAccount;
    })
    .filter((b): b is BlockedAccount => Boolean(b));
}

export async function submitReportAction(input: {
  reportedUserId: string;
  objectType: ReportObjectType;
  objectId?: string | null;
  reason: ReportReason;
  details?: string;
}): Promise<{ ok: boolean; message?: string }> {
  if (!isReportObjectType(input.objectType) || !isReportReason(input.reason)) {
    return { ok: false, message: "Invalid report." };
  }

  const reportedUserId = input.reportedUserId.trim();
  if (!reportedUserId) {
    return { ok: false, message: "Missing account." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to continue." };
  if (user.id === reportedUserId) {
    return { ok: false, message: "You can’t report yourself." };
  }

  const details = input.details?.trim().slice(0, 500) || null;

  const { error } = await supabase.from("reports").insert({
    reporter_user_id: user.id,
    reported_user_id: reportedUserId,
    object_type: input.objectType,
    object_id: input.objectId?.trim() || null,
    reason: input.reason,
    details,
    status: "open",
  });

  if (error) {
    return { ok: false, message: "Couldn’t submit this report. Try again." };
  }

  trackEvent("report_submitted", {
    userId: user.id,
    objectType: input.objectType,
    reason: input.reason,
  });

  return { ok: true };
}
