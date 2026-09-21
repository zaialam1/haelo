import { createClient } from "@/lib/supabase/server";
import type {
  CosmeticsPlanetId,
  CosmeticsState,
  SlotAssignment,
} from "@/lib/cosmetics/types";
import {
  getCosmeticsState,
  getSlotAssignments,
  getStardustBalance,
  sumStardustForRefPrefix,
} from "@/lib/cosmetics/wallet";

export async function loadCosmeticsStateForUser(
  userId: string | null,
): Promise<CosmeticsState | null> {
  if (!userId) return null;
  const supabase = await createClient();
  return getCosmeticsState(supabase, userId);
}

export async function loadStardustBalance(
  userId: string | null,
): Promise<number> {
  if (!userId) return 0;
  const supabase = await createClient();
  return getStardustBalance(supabase, userId);
}

export async function loadPlanetSlotAssignments(
  userId: string | null,
  planet: CosmeticsPlanetId,
): Promise<SlotAssignment[]> {
  if (!userId) return [];
  const supabase = await createClient();
  return getSlotAssignments(supabase, userId, planet);
}

export async function loadUniverseDecorationAssignments(
  userId: string | null,
): Promise<SlotAssignment[]> {
  if (!userId) return [];
  const supabase = await createClient();
  return getSlotAssignments(supabase, userId);
}

/** Stardust earned for a completed session (base + first-of-day if this session claimed it). */
export async function loadStardustEarnedForSession(
  userId: string | null,
  sessionId: string,
): Promise<number> {
  if (!userId) return 0;
  const supabase = await createClient();
  const base = await sumStardustForRefPrefix(
    supabase,
    userId,
    `session:${sessionId}`,
  );

  const { data: sessionRow } = await supabase
    .from("sessions")
    .select("completed_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!sessionRow?.completed_at) return base;

  const completedAt = new Date(sessionRow.completed_at as string);
  const dayKey = `${completedAt.getFullYear()}-${String(completedAt.getMonth() + 1).padStart(2, "0")}-${String(completedAt.getDate()).padStart(2, "0")}`;

  const { data: dayRow } = await supabase
    .from("stardust_ledger")
    .select("amount, created_at")
    .eq("user_id", userId)
    .eq("ref_key", `day_bonus:${dayKey}`)
    .maybeSingle();

  if (!dayRow || (dayRow.amount as number) <= 0) return base;

  const dayCreated = new Date(dayRow.created_at as string).getTime();
  const sessionCompleted = completedAt.getTime();
  // Attribute first-of-day bonus when it landed near this session completion.
  if (Math.abs(dayCreated - sessionCompleted) <= 5 * 60 * 1000) {
    return base + (dayRow.amount as number);
  }
  return base;
}
