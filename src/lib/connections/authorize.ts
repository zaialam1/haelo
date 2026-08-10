import { createClient } from "@/lib/supabase/server";

/**
 * Whether sender may send an Orbit recommendation to recipient.
 * Requires: verified professional sender, accepted mutual connection,
 * sender ≠ recipient. Does NOT grant access to private Haelo data.
 */
export async function canSendOrbitRecommendation(
  senderId: string,
  recipientId: string,
): Promise<boolean> {
  if (!senderId || !recipientId || senderId === recipientId) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("can_send_orbit_recommendation", {
    sender_id: senderId,
    recipient_id: recipientId,
  });

  if (error) {
    // Fallback to legacy RPC name during migration overlap
    const legacy = await supabase.rpc("can_professional_recommend_to", {
      professional_id: senderId,
      target_user_id: recipientId,
    });
    if (legacy.error) return false;
    return legacy.data === true;
  }
  return data === true;
}

/** @deprecated Prefer canSendOrbitRecommendation */
export async function canProfessionalRecommendTo(
  professionalUserId: string,
  userId: string,
): Promise<boolean> {
  return canSendOrbitRecommendation(professionalUserId, userId);
}

/**
 * Accepted counterpart user IDs for the current professional — for recommend UI.
 */
export async function listAcceptedConnectedUserIds(
  professionalUserId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== professionalUserId) return [];

  const { data, error } = await supabase
    .from("connections")
    .select("requester_user_id, recipient_user_id")
    .eq("status", "accepted")
    .or(
      `requester_user_id.eq.${professionalUserId},recipient_user_id.eq.${professionalUserId}`,
    );

  if (error || !data) return [];
  return data.map((row) =>
    row.requester_user_id === professionalUserId
      ? (row.recipient_user_id as string)
      : (row.requester_user_id as string),
  );
}
