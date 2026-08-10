"use server";

import { revalidatePath } from "next/cache";
import { getOwnProfile } from "@/lib/profiles/data";
import type { AccountRole } from "@/lib/profiles/types";
import { validateUsername } from "@/lib/profiles/username";
import { getOwnProfessionalProfile } from "@/lib/professional/data";
import { createClient } from "@/lib/supabase/server";
import { getConnectionBetweenUsers } from "./data";
import { mapConnectionRow, type ConnectionRow } from "./types";
import type {
  ConnectionStatus,
  HaeloConnection,
  UsernameSearchHit,
} from "./types";

function revalidateConnectionPaths() {
  revalidatePath("/home");
  revalidatePath("/settings");
  revalidatePath("/settings/connections");
  revalidatePath("/professional");
  revalidatePath("/professional/connections");
  revalidatePath("/professional/recommend");
  revalidatePath("/professional/home");
}

const CONNECTION_SELECT =
  "id, requester_user_id, recipient_user_id, status, requested_at, responded_at, removed_at, created_at, updated_at";

function rowToConnection(data: ConnectionRow): HaeloConnection {
  return mapConnectionRow(data);
}

export type SearchUsernameResult =
  | {
      ok: true;
      user: UsernameSearchHit;
      connectionStatus: ConnectionStatus | null;
    }
  | {
      ok: false;
      error:
        | "forbidden"
        | "not_found"
        | "unauthenticated"
        | "invalid"
        | "pending_verification";
      message: string;
    };

export type ConnectionActionResult =
  | { ok: true; connection: HaeloConnection }
  | { ok: false; message: string };

async function requireVerifiedProfessional() {
  const profile = await getOwnProfile();
  if (!profile) {
    return {
      ok: false as const,
      error: "unauthenticated" as const,
      message: "You need to be signed in.",
    };
  }
  if (profile.accountRole !== "professional") {
    return {
      ok: false as const,
      error: "forbidden" as const,
      message: "Only Haelo professionals can search for connections.",
    };
  }
  const professional = await getOwnProfessionalProfile(profile.id);
  if (!professional || professional.verificationStatus !== "verified") {
    return {
      ok: false as const,
      error: "pending_verification" as const,
      message:
        "Professional access is pending. You can explore Professional Mode, but connecting isn’t available yet.",
    };
  }
  return { ok: true as const, profile };
}

export async function searchHaeloUsernameAction(
  rawUsername: string,
): Promise<SearchUsernameResult> {
  const gate = await requireVerifiedProfessional();
  if (!gate.ok) {
    return {
      ok: false,
      error: gate.error,
      message: gate.message,
    };
  }

  const local = validateUsername(rawUsername);
  if (!local.ok) {
    return {
      ok: false,
      error: "not_found",
      message: "We couldn’t find that Haelo name.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_haelo_username", {
    raw_username: local.normalized,
  });

  if (error) {
    return {
      ok: false,
      error: "not_found",
      message: "We couldn’t find that Haelo name.",
    };
  }

  const payload = data as {
    ok?: boolean;
    error?: string;
    user?: {
      id: string;
      username: string;
      account_role?: AccountRole;
    };
  } | null;

  if (!payload?.ok || !payload.user) {
    if (payload?.error === "forbidden") {
      return {
        ok: false,
        error: "forbidden",
        message: "Only verified Haelo professionals can search for connections.",
      };
    }
    return {
      ok: false,
      error: "not_found",
      message: "We couldn’t find that Haelo name.",
    };
  }

  const existing = await getConnectionBetweenUsers(
    gate.profile.id,
    payload.user.id,
  );
  const accountRole: AccountRole =
    payload.user.account_role === "professional" ? "professional" : "user";

  return {
    ok: true,
    user: {
      id: payload.user.id,
      username: payload.user.username,
      accountRole,
    },
    connectionStatus: existing?.status ?? null,
  };
}

export async function sendConnectionRequestAction(
  targetUserId: string,
): Promise<ConnectionActionResult> {
  const gate = await requireVerifiedProfessional();
  if (!gate.ok) {
    return { ok: false, message: gate.message };
  }
  if (!targetUserId || targetUserId === gate.profile.id) {
    return { ok: false, message: "We couldn’t find that Haelo name." };
  }

  const supabase = await createClient();
  const existing = await getConnectionBetweenUsers(
    gate.profile.id,
    targetUserId,
  );

  if (existing?.status === "pending" || existing?.status === "accepted") {
    return { ok: true, connection: existing };
  }

  if (existing && (existing.status === "declined" || existing.status === "removed")) {
    const { data, error } = await supabase
      .from("connections")
      .update({ status: "pending" })
      .eq("id", existing.id)
      .select(CONNECTION_SELECT)
      .single();

    if (error || !data) {
      const cooldown =
        error?.message?.toLowerCase().includes("cooldown") ?? false;
      return {
        ok: false,
        message: cooldown
          ? "Please wait before sending another request."
          : "Couldn’t send the connection request. Try again.",
      };
    }

    revalidateConnectionPaths();
    return { ok: true, connection: rowToConnection(data as ConnectionRow) };
  }

  const { data, error } = await supabase
    .from("connections")
    .insert({
      requester_user_id: gate.profile.id,
      recipient_user_id: targetUserId,
      status: "pending",
    })
    .select(CONNECTION_SELECT)
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      const again = await getConnectionBetweenUsers(
        gate.profile.id,
        targetUserId,
      );
      if (again) return { ok: true, connection: again };
    }
    return {
      ok: false,
      message: "Couldn’t send the connection request. Try again.",
    };
  }

  revalidateConnectionPaths();
  return { ok: true, connection: rowToConnection(data as ConnectionRow) };
}

export async function respondToConnectionRequestAction(
  connectionId: string,
  decision: "accepted" | "declined",
): Promise<ConnectionActionResult> {
  const profile = await getOwnProfile();
  if (!profile) {
    return { ok: false, message: "You need to be signed in." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connections")
    .update({ status: decision })
    .eq("id", connectionId)
    .eq("recipient_user_id", profile.id)
    .eq("status", "pending")
    .select(CONNECTION_SELECT)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "Couldn’t update this connection request." };
  }

  revalidateConnectionPaths();
  return { ok: true, connection: rowToConnection(data as ConnectionRow) };
}

export async function removeConnectionAction(
  connectionId: string,
): Promise<ConnectionActionResult> {
  const profile = await getOwnProfile();
  if (!profile) {
    return { ok: false, message: "You need to be signed in." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("connections")
    .select(CONNECTION_SELECT)
    .eq("id", connectionId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!existing) {
    return { ok: false, message: "Couldn’t remove this connection." };
  }

  const row = existing as ConnectionRow;
  const isParticipant =
    row.requester_user_id === profile.id ||
    row.recipient_user_id === profile.id;
  if (!isParticipant) {
    return { ok: false, message: "Couldn’t remove this connection." };
  }

  const { data, error } = await supabase
    .from("connections")
    .update({ status: "removed" })
    .eq("id", connectionId)
    .eq("status", "accepted")
    .select(CONNECTION_SELECT)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "Couldn’t remove this connection." };
  }

  revalidateConnectionPaths();
  return { ok: true, connection: rowToConnection(data as ConnectionRow) };
}

export type PendingConnectionDetails =
  | {
      ok: true;
      connection: {
        id: string;
        status: ConnectionStatus;
        requesterUserId: string;
        requesterUsername: string | null;
        requesterAccountRole: AccountRole;
        requestedAt: string;
        /** @deprecated */
        professionalUserId: string;
        /** @deprecated */
        professionalUsername: string | null;
      };
    }
  | { ok: false; message: string };

export async function getPendingConnectionRequestAction(
  connectionId: string,
): Promise<PendingConnectionDetails> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_pending_connection_request", {
    connection_id: connectionId,
  });

  if (error || !data) {
    return { ok: false, message: "Connection request not found." };
  }

  const payload = data as {
    ok?: boolean;
    connection?: {
      id: string;
      status: ConnectionStatus;
      requester_user_id?: string;
      requester_username?: string | null;
      requester_account_role?: AccountRole;
      professional_user_id?: string;
      professional_username?: string | null;
      requested_at: string;
    };
  };

  if (!payload.ok || !payload.connection) {
    return { ok: false, message: "Connection request not found." };
  }

  const c = payload.connection;
  const requesterUserId =
    c.requester_user_id ?? c.professional_user_id ?? "";
  const requesterUsername =
    c.requester_username ?? c.professional_username ?? null;
  const requesterAccountRole: AccountRole =
    c.requester_account_role === "professional" ? "professional" : "user";

  return {
    ok: true,
    connection: {
      id: c.id,
      status: c.status,
      requesterUserId,
      requesterUsername,
      requesterAccountRole,
      requestedAt: c.requested_at,
      professionalUserId: requesterUserId,
      professionalUsername: requesterUsername,
    },
  };
}
