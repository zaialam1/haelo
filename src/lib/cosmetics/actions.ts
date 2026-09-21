"use server";

import { revalidatePath } from "next/cache";
import {
  cosmeticFitsSlot,
  getCosmeticByKey,
} from "@/lib/cosmetics/catalog";
import type {
  CosmeticsPlanetId,
  CosmeticsSlotKey,
  CosmeticsState,
} from "@/lib/cosmetics/types";
import {
  ALL_COSMETICS_PLANETS,
  PLANET_SLOT_KEYS,
  UNIVERSE_SLOT_KEYS,
} from "@/lib/cosmetics/types";
import { getCosmeticsState } from "@/lib/cosmetics/wallet";
import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";

export type CosmeticsActionResult =
  | { ok: true; state: CosmeticsState; message?: string }
  | { ok: false; message: string };

async function requireUserClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false as const,
      message: "Sign in to continue.",
      supabase: null,
      user: null,
    };
  }
  return { ok: true as const, supabase, user, message: undefined };
}

function isValidPlanet(planet: string): planet is CosmeticsPlanetId {
  return (ALL_COSMETICS_PLANETS as readonly string[]).includes(planet);
}

function isValidSlotForPlanet(
  planet: CosmeticsPlanetId,
  slot: string,
): slot is CosmeticsSlotKey {
  if (planet === "universe") {
    return (UNIVERSE_SLOT_KEYS as readonly string[]).includes(slot);
  }
  return (PLANET_SLOT_KEYS as readonly string[]).includes(slot);
}

function revalidateCosmeticsPaths() {
  revalidatePath("/home");
  revalidatePath("/store");
  revalidatePath("/decorate");
  revalidatePath("/connect");
  revalidatePath("/stand");
  revalidatePath("/explore");
  revalidatePath("/express");
}

export async function getCosmeticsStateAction(): Promise<CosmeticsActionResult> {
  const gate = await requireUserClient();
  if (!gate.ok || !gate.supabase || !gate.user) {
    return { ok: false, message: gate.message ?? "Sign in to continue." };
  }
  const state = await getCosmeticsState(gate.supabase, gate.user.id);
  return { ok: true, state };
}

export async function purchaseCosmeticAction(
  cosmeticKey: string,
): Promise<CosmeticsActionResult> {
  const gate = await requireUserClient();
  if (!gate.ok || !gate.supabase || !gate.user) {
    return { ok: false, message: gate.message ?? "Sign in to continue." };
  }

  const item = getCosmeticByKey(cosmeticKey);
  if (!item) {
    return { ok: false, message: "That decoration isn’t in the store." };
  }

  const { data, error } = await gate.supabase.rpc("purchase_cosmetic", {
    p_cosmetic_key: item.key,
    p_price: item.price,
  });

  if (error) {
    console.error("[cosmetics] purchase failed:", error.message);
    return {
      ok: false,
      message: "Couldn’t complete that purchase. Try again.",
    };
  }

  const payload = data as {
    ok?: boolean;
    error?: string;
    already?: boolean;
  } | null;

  if (!payload?.ok) {
    if (payload?.error === "insufficient_stardust") {
      return {
        ok: false,
        message: "Not enough Stardust yet — keep practicing.",
      };
    }
    return {
      ok: false,
      message: "Couldn’t complete that purchase. Try again.",
    };
  }

  trackEvent("cosmetic_purchased", {
    cosmeticKey: item.key,
    rarity: item.rarity,
    already: Boolean(payload.already),
  });

  revalidateCosmeticsPaths();

  const state = await getCosmeticsState(gate.supabase, gate.user.id);
  return {
    ok: true,
    state,
    message: payload.already
      ? "You already own this."
      : `${item.name} is yours.`,
  };
}

/**
 * Add a decoration to a planet. Multiple placements of the same slot
 * (and even the same item) are allowed — no per-slot cap.
 */
export async function placeCosmeticAction(input: {
  planet: string;
  cosmeticKey: string;
  slotKey?: string;
}): Promise<CosmeticsActionResult> {
  const gate = await requireUserClient();
  if (!gate.ok || !gate.supabase || !gate.user) {
    return { ok: false, message: gate.message ?? "Sign in to continue." };
  }

  if (!isValidPlanet(input.planet)) {
    return { ok: false, message: "Invalid planet." };
  }

  const item = getCosmeticByKey(input.cosmeticKey);
  if (!item) {
    return { ok: false, message: "Unknown decoration." };
  }

  const slotKey = (input.slotKey ?? item.slotTypes[0]) as string;
  if (!isValidSlotForPlanet(input.planet, slotKey)) {
    // Fall back to first slot type that works for this planet
    const fallback =
      item.slotTypes.find((s) => isValidSlotForPlanet(input.planet as CosmeticsPlanetId, s)) ??
      null;
    if (!fallback) {
      return { ok: false, message: "That decoration can’t go here." };
    }
    return placeCosmeticAction({
      planet: input.planet,
      cosmeticKey: input.cosmeticKey,
      slotKey: fallback,
    });
  }

  if (!cosmeticFitsSlot(input.cosmeticKey, slotKey as CosmeticsSlotKey)) {
    return {
      ok: false,
      message: "That decoration doesn’t fit this spot type.",
    };
  }

  const { data: owned } = await gate.supabase
    .from("user_cosmetics")
    .select("id")
    .eq("user_id", gate.user.id)
    .eq("cosmetic_key", input.cosmeticKey)
    .maybeSingle();

  if (!owned) {
    return {
      ok: false,
      message: "You don’t own that decoration yet.",
    };
  }

  const { error } = await gate.supabase.from("universe_slot_assignments").insert({
    user_id: gate.user.id,
    planet: input.planet,
    slot_key: slotKey,
    cosmetic_key: input.cosmeticKey,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[cosmetics] place failed:", error.message);
    return { ok: false, message: "Couldn’t place that decoration. Try again." };
  }

  trackEvent("cosmetic_equipped", {
    planet: input.planet,
    slotKey,
    cleared: false,
  });

  revalidateCosmeticsPaths();

  const state = await getCosmeticsState(gate.supabase, gate.user.id);
  return {
    ok: true,
    state,
    message: `${item.name} added.`,
  };
}

/** Remove one placement by id (unlimited model). */
export async function removeCosmeticPlacementAction(
  assignmentId: string,
): Promise<CosmeticsActionResult> {
  const gate = await requireUserClient();
  if (!gate.ok || !gate.supabase || !gate.user) {
    return { ok: false, message: gate.message ?? "Sign in to continue." };
  }

  const { error } = await gate.supabase
    .from("universe_slot_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("user_id", gate.user.id);

  if (error) {
    console.error("[cosmetics] remove failed:", error.message);
    return { ok: false, message: "Couldn’t remove that decoration." };
  }

  trackEvent("cosmetic_equipped", {
    cleared: true,
  });

  revalidateCosmeticsPaths();

  const state = await getCosmeticsState(gate.supabase, gate.user.id);
  return { ok: true, state, message: "Removed." };
}

/**
 * @deprecated Prefer placeCosmeticAction / removeCosmeticPlacementAction.
 * Kept so older clients still compile; maps clear → remove-all for that slot.
 */
export async function assignCosmeticSlotAction(input: {
  planet: string;
  slotKey: string;
  cosmeticKey: string | null;
}): Promise<CosmeticsActionResult> {
  if (input.cosmeticKey) {
    return placeCosmeticAction({
      planet: input.planet,
      cosmeticKey: input.cosmeticKey,
      slotKey: input.slotKey,
    });
  }

  const gate = await requireUserClient();
  if (!gate.ok || !gate.supabase || !gate.user) {
    return { ok: false, message: gate.message ?? "Sign in to continue." };
  }
  if (!isValidPlanet(input.planet) || !isValidSlotForPlanet(input.planet, input.slotKey)) {
    return { ok: false, message: "Invalid placement." };
  }

  const { error } = await gate.supabase
    .from("universe_slot_assignments")
    .delete()
    .eq("user_id", gate.user.id)
    .eq("planet", input.planet)
    .eq("slot_key", input.slotKey);

  if (error) {
    return { ok: false, message: "Couldn’t clear that spot." };
  }

  revalidateCosmeticsPaths();
  const state = await getCosmeticsState(gate.supabase, gate.user.id);
  return { ok: true, state, message: "Cleared." };
}

export async function clearCosmeticSlotAction(input: {
  planet: string;
  slotKey: string;
}): Promise<CosmeticsActionResult> {
  return assignCosmeticSlotAction({
    planet: input.planet,
    slotKey: input.slotKey,
    cosmeticKey: null,
  });
}
