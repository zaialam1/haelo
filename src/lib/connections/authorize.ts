import { createClient } from "@/lib/supabase/server";

/**
 * Whether professional X may send future Orbit recommendations to user Y.
 * Does not grant access to recordings, Journey, transcripts, or analyses.
 */
export async function canProfessionalRecommendTo(
  professionalUserId: string,
  userId: string,
): Promise<boolean> {
  if (!professionalUserId || !userId || professionalUserId === userId) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("can_professional_recommend_to", {
    professional_id: professionalUserId,
    target_user_id: userId,
  });

  if (error) return false;
  return data === true;
}

/**
 * Accepted user IDs connected to a professional — for future recommend UI.
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
    .from("professional_connections")
    .select("user_id")
    .eq("professional_user_id", professionalUserId)
    .eq("status", "accepted");

  if (error || !data) return [];
  return data.map((row) => row.user_id as string);
}
