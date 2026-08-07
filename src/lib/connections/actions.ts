"use server";

import { revalidatePath } from "next/cache";
import { getOwnProfile } from "@/lib/profiles/data";
import { validateUsername } from "@/lib/profiles/username";
import { createClient } from "@/lib/supabase/server";
import { getConnectionWithUser } from "./data";
import type {
  ConnectionStatus,
  ProfessionalConnection,
  UsernameSearchHit,
} from "./types";

function revalidateConnectionPaths() {
  revalidatePath("/home");
  revalidatePath("/settings");
  revalidatePath("/settings/connections");
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
        | "invalid";
      message: string;
    };

export type ConnectionActionResult =
  | { ok: true; connection: ProfessionalConnection }
  | { ok: false; message: string };

export async function searchHaeloUsernameAction(
  rawUsername: string,
): Promise<SearchUsernameResult> {
  const profile = await getOwnProfile();
  if (!profile) {
    return {
      ok: false,
      error: "unauthenticated",
      message: "You need to be signed in.",
    };
  }
  if (profile.accountRole !== "professional") {
    return {
      ok: false,
      error: "forbidden",
      message: "Only Haelo professionals can search for connections.",
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
    user?: { id: string; username: string };
  } | null;

  if (!payload?.ok || !payload.user) {
    if (payload?.error === "forbidden") {
      return {
        ok: false,
        error: "forbidden",
        message: "Only Haelo professionals can search for connections.",
      };
    }
    return {
      ok: false,
      error: "not_found",
      message: "We couldn’t find that Haelo name.",
    };
  }

  const existing = await getConnectionWithUser(profile.id, payload.user.id);
  return {
    ok: true,
    user: {
      id: payload.user.id,
      username: payload.user.username,
    },
    connectionStatus: existing?.status ?? null,
  };
}

export async function sendConnectionRequestAction(
  targetUserId: string,
): Promise<ConnectionActionResult> {
  const profile = await getOwnProfile();
  if (!profile) {
    return { ok: false, message: "You need to be signed in." };
  }
  if (profile.accountRole !== "professional") {
    return { ok: false, message: "Only professionals can send connection requests." };
  }
  if (!targetUserId || targetUserId === profile.id) {
    return { ok: false, message: "We couldn’t find that Haelo name." };
  }

  const supabase = await createClient();
  const existing = await getConnectionWithUser(profile.id, targetUserId);

  if (existing?.status === "pending") {
    return {
      ok: true,
      connection: existing,
    };
  }
  if (existing?.status === "accepted") {
    return {
      ok: true,
      connection: existing,
    };
  }

  if (existing && (existing.status === "declined" || existing.status === "removed")) {
    const { data, error } = await supabase
      .from("professional_connections")
      .update({ status: "pending" })
      .eq("id", existing.id)
      .select(
        "id, professional_user_id, user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
      )
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
    return {
      ok: true,
      connection: {
        id: data.id,
        professionalUserId: data.professional_user_id,
        userId: data.user_id,
        status: data.status,
        requestedAt: data.requested_at,
        respondedAt: data.responded_at,
        removedAt: data.removed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  }

  const { data, error } = await supabase
    .from("professional_connections")
    .insert({
      professional_user_id: profile.id,
      user_id: targetUserId,
      status: "pending",
    })
    .select(
      "id, professional_user_id, user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      const again = await getConnectionWithUser(profile.id, targetUserId);
      if (again) return { ok: true, connection: again };
    }
    return {
      ok: false,
      message: "Couldn’t send the connection request. Try again.",
    };
  }

  revalidateConnectionPaths();
  return {
    ok: true,
    connection: {
      id: data.id,
      professionalUserId: data.professional_user_id,
      userId: data.user_id,
      status: data.status,
      requestedAt: data.requested_at,
      respondedAt: data.responded_at,
      removedAt: data.removed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
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
    .from("professional_connections")
    .update({ status: decision })
    .eq("id", connectionId)
    .eq("user_id", profile.id)
    .eq("status", "pending")
    .select(
      "id, professional_user_id, user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
    )
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "Couldn’t update this connection request." };
  }

  revalidateConnectionPaths();
  return {
    ok: true,
    connection: {
      id: data.id,
      professionalUserId: data.professional_user_id,
      userId: data.user_id,
      status: data.status,
      requestedAt: data.requested_at,
      respondedAt: data.responded_at,
      removedAt: data.removed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function removeConnectionAction(
  connectionId: string,
): Promise<ConnectionActionResult> {
  const profile = await getOwnProfile();
  if (!profile) {
    return { ok: false, message: "You need to be signed in." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_connections")
    .update({ status: "removed" })
    .eq("id", connectionId)
    .eq("user_id", profile.id)
    .eq("status", "accepted")
    .select(
      "id, professional_user_id, user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
    )
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "Couldn’t remove this connection." };
  }

  revalidateConnectionPaths();
  return {
    ok: true,
    connection: {
      id: data.id,
      professionalUserId: data.professional_user_id,
      userId: data.user_id,
      status: data.status,
      requestedAt: data.requested_at,
      respondedAt: data.responded_at,
      removedAt: data.removed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export type PendingConnectionDetails =
  | {
      ok: true;
      connection: {
        id: string;
        status: ConnectionStatus;
        professionalUserId: string;
        professionalUsername: string | null;
        requestedAt: string;
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
      professional_user_id: string;
      professional_username: string | null;
      requested_at: string;
    };
  };

  if (!payload.ok || !payload.connection) {
    return { ok: false, message: "Connection request not found." };
  }

  return {
    ok: true,
    connection: {
      id: payload.connection.id,
      status: payload.connection.status,
      professionalUserId: payload.connection.professional_user_id,
      professionalUsername: payload.connection.professional_username,
      requestedAt: payload.connection.requested_at,
    },
  };
}
