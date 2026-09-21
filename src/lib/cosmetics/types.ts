import type { VoicePlanetId } from "@/lib/home/voicePlanets";

export type CosmeticsPlanetId = VoicePlanetId | "universe";

export type CosmeticsSlotKey =
  | "creature"
  | "ground"
  | "moon"
  | "ring"
  | "sky"
  | "outer_comet"
  | "nebula_haze";

export type CosmeticRarity = "common" | "uncommon" | "rare" | "legendary";

export type CosmeticVisualId =
  | "alien_soft"
  | "alien_glow"
  | "fireflies"
  | "whisper_wisp"
  | "tide_creature"
  | "lantern_ground"
  | "crystal_cluster"
  | "tide_pool"
  | "moss_bloom"
  | "silver_moon"
  | "ember_moon"
  | "pearl_moon"
  | "soft_ring"
  | "ember_ring"
  | "aurora_ring"
  | "mist_sky"
  | "aurora_veil"
  | "sparkle_sky"
  | "dust_trail"
  | "distant_comet"
  | "nebula_haze"
  | "orbit_spark"
  | "garden_stone"
  | "friend_beacon"
  | "quiet_satellite"
  | "cloud_sheep"
  | "star_lily"
  | "pulse_orb"
  | "ribbon_comet"
  | "glow_fern"
  | "mirror_moon"
  | "halo_ring";

export type CosmeticDefinition = {
  key: string;
  name: string;
  blurb: string;
  /** Slots this item can be equipped into */
  slotTypes: CosmeticsSlotKey[];
  price: number;
  rarity: CosmeticRarity;
  visual: CosmeticVisualId;
};

export type OwnedCosmetic = {
  id: string;
  userId: string;
  cosmeticKey: string;
  source: "purchase" | "grant";
  acquiredAt: string;
};

export type SlotAssignment = {
  id: string;
  userId: string;
  planet: CosmeticsPlanetId;
  slotKey: CosmeticsSlotKey;
  cosmeticKey: string | null;
  updatedAt: string;
};

export type StardustWallet = {
  userId: string;
  balance: number;
};

export type StardustLedgerEntry = {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  refKey: string;
  balanceAfter: number;
  createdAt: string;
};

export type CosmeticsState = {
  balance: number;
  owned: OwnedCosmetic[];
  assignments: SlotAssignment[];
};

export const PLANET_SLOT_KEYS: readonly CosmeticsSlotKey[] = [
  "creature",
  "ground",
  "moon",
  "ring",
  "sky",
] as const;

export const UNIVERSE_SLOT_KEYS: readonly CosmeticsSlotKey[] = [
  "outer_comet",
  "nebula_haze",
] as const;

export const ALL_COSMETICS_PLANETS: readonly CosmeticsPlanetId[] = [
  "connect",
  "stand",
  "explore",
  "express",
  "universe",
] as const;

export const SLOT_LABELS: Record<CosmeticsSlotKey, string> = {
  creature: "Companion",
  ground: "Ground",
  moon: "Moon",
  ring: "Ring",
  sky: "Sky",
  outer_comet: "Outer comet",
  nebula_haze: "Nebula haze",
};
