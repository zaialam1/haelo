import type {
  CosmeticsPlanetId,
  CosmeticsSlotKey,
  CosmeticsState,
  OwnedCosmetic,
  SlotAssignment,
  StardustLedgerEntry,
} from "@/lib/cosmetics/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function isMissingRelationError(message: string | null | undefined): boolean {
  if (!message) return false;
  return (
    /Could not find the table/i.test(message) ||
    /schema cache/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}

export function mapOwnedCosmetic(row: {
  id: string;
  user_id: string;
  cosmetic_key: string;
  source: string;
  acquired_at: string;
}): OwnedCosmetic {
  return {
    id: row.id,
    userId: row.user_id,
    cosmeticKey: row.cosmetic_key,
    source: row.source as OwnedCosmetic["source"],
    acquiredAt: row.acquired_at,
  };
}

export function mapSlotAssignment(row: {
  id: string;
  user_id: string;
  planet: string;
  slot_key: string;
  cosmetic_key: string | null;
  updated_at: string;
}): SlotAssignment {
  return {
    id: row.id,
    userId: row.user_id,
    planet: row.planet as CosmeticsPlanetId,
    slotKey: row.slot_key as CosmeticsSlotKey,
    cosmeticKey: row.cosmetic_key,
    updatedAt: row.updated_at,
  };
}

export function mapLedgerEntry(row: {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  ref_key: string;
  balance_after: number;
  created_at: string;
}): StardustLedgerEntry {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    reason: row.reason,
    refKey: row.ref_key,
    balanceAfter: row.balance_after,
    createdAt: row.created_at,
  };
}

export type CreditStardustResult =
  | { ok: true; credited: number; balance: number; already: boolean }
  | { ok: false; error: string };

/**
 * Idempotent Stardust credit via security-definer RPC.
 */
export async function creditStardust(
  supabase: SupabaseClient,
  amount: number,
  reason: string,
  refKey: string,
): Promise<CreditStardustResult> {
  const { data, error } = await supabase.rpc("credit_stardust", {
    p_amount: amount,
    p_reason: reason,
    p_ref_key: refKey,
  });

  if (error) {
    if (isMissingRelationError(error.message)) {
      return { ok: false, error: "not_migrated" };
    }
    console.error("[stardust] credit failed:", error.message);
    return { ok: false, error: error.message };
  }

  const payload = data as {
    ok?: boolean;
    credited?: number;
    balance?: number;
    already?: boolean;
    error?: string;
  } | null;

  if (!payload?.ok) {
    return { ok: false, error: payload?.error ?? "credit_failed" };
  }

  return {
    ok: true,
    credited: payload.credited ?? 0,
    balance: payload.balance ?? 0,
    already: Boolean(payload.already),
  };
}

export async function getStardustBalance(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("user_stardust_wallets")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("[stardust] balance read failed:", error.message);
    }
    return 0;
  }
  return data?.balance ?? 0;
}

export async function getOwnedCosmetics(
  supabase: SupabaseClient,
  userId: string,
): Promise<OwnedCosmetic[]> {
  const { data, error } = await supabase
    .from("user_cosmetics")
    .select("id, user_id, cosmetic_key, source, acquired_at")
    .eq("user_id", userId)
    .order("acquired_at", { ascending: false });

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("[cosmetics] owned read failed:", error.message);
    }
    return [];
  }
  return (data ?? []).map(mapOwnedCosmetic);
}

export async function getSlotAssignments(
  supabase: SupabaseClient,
  userId: string,
  planet?: CosmeticsPlanetId,
): Promise<SlotAssignment[]> {
  let query = supabase
    .from("universe_slot_assignments")
    .select("id, user_id, planet, slot_key, cosmetic_key, updated_at")
    .eq("user_id", userId);

  if (planet) {
    query = query.eq("planet", planet);
  }

  const { data, error } = await query;
  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("[cosmetics] slots read failed:", error.message);
    }
    return [];
  }
  return (data ?? []).map(mapSlotAssignment);
}

export async function getCosmeticsState(
  supabase: SupabaseClient,
  userId: string,
): Promise<CosmeticsState> {
  const [balance, owned, assignments] = await Promise.all([
    getStardustBalance(supabase, userId),
    getOwnedCosmetics(supabase, userId),
    getSlotAssignments(supabase, userId),
  ]);
  return { balance, owned, assignments };
}

export async function sumStardustForRefPrefix(
  supabase: SupabaseClient,
  userId: string,
  refPrefix: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("stardust_ledger")
    .select("amount, ref_key")
    .eq("user_id", userId)
    .like("ref_key", `${refPrefix}%`);

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("[stardust] ledger prefix read failed:", error.message);
    }
    return 0;
  }

  return (data ?? []).reduce((sum, row) => {
    const amount = row.amount as number;
    return amount > 0 ? sum + amount : sum;
  }, 0);
}

/** Local calendar day key YYYY-MM-DD for first-of-day bonus. */
export function localDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
