import { createClient } from "@/lib/supabase/server";
import {
  mapOrbitRecommendationRow,
  type OrbitRecommendation,
  type OrbitRecommendationDetail,
  type OrbitRecommendationRow,
} from "./types";
import { connectionCounterpartId, type HaeloConnection } from "@/lib/connections/types";

/** Active recommendations for Orbits homepage (new + viewed only). */
export async function listRecipientActiveRecommendations(
  userId: string,
): Promise<OrbitRecommendation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return [];

  const { data, error } = await supabase.rpc(
    "list_my_active_orbit_recommendations",
  );
  if (error || !data) return [];

  const payload = data as {
    ok?: boolean;
    recommendations?: OrbitRecommendationRow[];
  };

  if (!payload.ok || !payload.recommendations) return [];

  return payload.recommendations.map((row) =>
    mapOrbitRecommendationRow(row),
  );
}

export async function listProfessionalSentRecommendations(
  professionalUserId: string,
): Promise<OrbitRecommendation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== professionalUserId) return [];

  const { data, error } = await supabase
    .from("orbit_recommendations")
    .select(
      "id, professional_user_id, recipient_user_id, connection_id, orbit_key, orbit_version, purpose, personal_message, status, created_at, viewed_at, started_at, completed_at, dismissed_at, reminder_sent_at, updated_at",
    )
    .eq("professional_user_id", professionalUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const rows = data as OrbitRecommendationRow[];
  const { data: connections } = await supabase.rpc("list_my_connections");
  const usernameByUserId = new Map<string, string | null>();
  for (const c of (connections ?? []) as Array<{
    requester_user_id?: string;
    recipient_user_id?: string;
    professional_user_id?: string;
    user_id?: string;
    counterpart_username?: string | null;
  }>) {
    const mapped: HaeloConnection = {
      id: "",
      requesterUserId: c.requester_user_id ?? c.professional_user_id ?? "",
      recipientUserId: c.recipient_user_id ?? c.user_id ?? "",
      status: "accepted",
      requestedAt: "",
      respondedAt: null,
      removedAt: null,
      createdAt: "",
      updatedAt: "",
    };
    const counterpartId = connectionCounterpartId(mapped, professionalUserId);
    if (counterpartId) {
      usernameByUserId.set(counterpartId, c.counterpart_username ?? null);
    }
  }

  return rows.map((row) => ({
    ...mapOrbitRecommendationRow(row),
    recipientUsername: usernameByUserId.get(row.recipient_user_id) ?? null,
  }));
}

export async function getOrbitRecommendationDetail(
  recommendationId: string,
): Promise<OrbitRecommendationDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "get_orbit_recommendation_detail",
    { p_id: recommendationId },
  );

  if (error || !data) return null;

  const payload = data as {
    ok?: boolean;
    recommendation?: OrbitRecommendationRow & {
      professional_username?: string | null;
    };
  };

  if (!payload.ok || !payload.recommendation) return null;

  const mapped = mapOrbitRecommendationRow(payload.recommendation);
  return {
    ...mapped,
    professionalUsername:
      payload.recommendation.professional_username ?? null,
  };
}

/** Mark viewed without revalidatePath — safe to call during RSC render. */
export async function markOrbitRecommendationViewed(
  recommendationId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("mark_orbit_recommendation_viewed", {
    p_id: recommendationId,
  });
  const payload = data as { ok?: boolean } | null;
  return Boolean(payload?.ok);
}

export async function listAcceptedConnectionsForRecommend(): Promise<
  Array<{ userId: string; username: string | null; connectionId: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("list_my_connections");
  if (error || !data) return [];

  const rows = data as Array<{
    id: string;
    requester_user_id?: string;
    recipient_user_id?: string;
    professional_user_id?: string;
    user_id?: string;
    status: string;
    counterpart_username?: string | null;
  }>;

  return rows
    .filter((r) => r.status === "accepted")
    .map((r) => {
      const requester = r.requester_user_id ?? r.professional_user_id ?? "";
      const recipient = r.recipient_user_id ?? r.user_id ?? "";
      const counterpartId =
        requester === user.id ? recipient : requester;
      return {
        userId: counterpartId,
        username: r.counterpart_username ?? null,
        connectionId: r.id,
      };
    })
    .filter((r) => Boolean(r.userId) && r.userId !== user.id);
}
