/**
 * Full v1 cosmetics catalog — code-defined, owned in DB.
 * Stylized Universe decorations only (no functional boosts).
 */

import type { CosmeticDefinition, CosmeticsSlotKey } from "@/lib/cosmetics/types";

export const COSMETICS_CATALOG: readonly CosmeticDefinition[] = [
  // Creatures
  {
    key: "alien_soft",
    name: "Soft Alien",
    blurb: "A quiet visitor who likes to listen.",
    slotTypes: ["creature"],
    price: 8,
    rarity: "common",
    visual: "alien_soft",
  },
  {
    key: "alien_glow",
    name: "Glow Alien",
    blurb: "Soft light for long reflections.",
    slotTypes: ["creature"],
    price: 18,
    rarity: "uncommon",
    visual: "alien_glow",
  },
  {
    key: "fireflies",
    name: "Firefly Drift",
    blurb: "Tiny sparks that hover near your voice.",
    slotTypes: ["creature", "sky"],
    price: 12,
    rarity: "common",
    visual: "fireflies",
  },
  {
    key: "whisper_wisp",
    name: "Whisper Wisp",
    blurb: "A thin ribbon of breath and light.",
    slotTypes: ["creature", "sky"],
    price: 15,
    rarity: "uncommon",
    visual: "whisper_wisp",
  },
  {
    key: "tide_creature",
    name: "Tide Companion",
    blurb: "Rises and settles with your mood.",
    slotTypes: ["creature"],
    price: 22,
    rarity: "rare",
    visual: "tide_creature",
  },
  {
    key: "cloud_sheep",
    name: "Cloud Sheep",
    blurb: "A fluffy orbiting daydream.",
    slotTypes: ["creature"],
    price: 20,
    rarity: "uncommon",
    visual: "cloud_sheep",
  },
  // Ground
  {
    key: "lantern_ground",
    name: "Path Lantern",
    blurb: "A warm light at the edge of practice.",
    slotTypes: ["ground"],
    price: 10,
    rarity: "common",
    visual: "lantern_ground",
  },
  {
    key: "crystal_cluster",
    name: "Crystal Cluster",
    blurb: "Quiet facets catching Universe light.",
    slotTypes: ["ground"],
    price: 16,
    rarity: "uncommon",
    visual: "crystal_cluster",
  },
  {
    key: "tide_pool",
    name: "Tide Pool",
    blurb: "A small mirror of sky on the ground.",
    slotTypes: ["ground"],
    price: 14,
    rarity: "common",
    visual: "tide_pool",
  },
  {
    key: "moss_bloom",
    name: "Moss Bloom",
    blurb: "Soft green that settles after speaking.",
    slotTypes: ["ground"],
    price: 9,
    rarity: "common",
    visual: "moss_bloom",
  },
  {
    key: "garden_stone",
    name: "Garden Stone",
    blurb: "A place to rest your attention.",
    slotTypes: ["ground"],
    price: 7,
    rarity: "common",
    visual: "garden_stone",
  },
  {
    key: "star_lily",
    name: "Star Lily",
    blurb: "Petals tipped with faint gold.",
    slotTypes: ["ground"],
    price: 24,
    rarity: "rare",
    visual: "star_lily",
  },
  {
    key: "glow_fern",
    name: "Glow Fern",
    blurb: "Fronds that shimmer after sessions.",
    slotTypes: ["ground"],
    price: 19,
    rarity: "uncommon",
    visual: "glow_fern",
  },
  // Moons
  {
    key: "silver_moon",
    name: "Silver Moon",
    blurb: "A calm companion in orbit.",
    slotTypes: ["moon"],
    price: 12,
    rarity: "common",
    visual: "silver_moon",
  },
  {
    key: "ember_moon",
    name: "Ember Moon",
    blurb: "Warm dusk for brave words.",
    slotTypes: ["moon"],
    price: 20,
    rarity: "uncommon",
    visual: "ember_moon",
  },
  {
    key: "pearl_moon",
    name: "Pearl Moon",
    blurb: "Soft and reflective.",
    slotTypes: ["moon"],
    price: 28,
    rarity: "rare",
    visual: "pearl_moon",
  },
  {
    key: "mirror_moon",
    name: "Mirror Moon",
    blurb: "Shows you a quieter outline of yourself.",
    slotTypes: ["moon"],
    price: 32,
    rarity: "legendary",
    visual: "mirror_moon",
  },
  {
    key: "quiet_satellite",
    name: "Quiet Satellite",
    blurb: "A tiny listener circling nearby.",
    slotTypes: ["moon"],
    price: 11,
    rarity: "common",
    visual: "quiet_satellite",
  },
  // Rings
  {
    key: "soft_ring",
    name: "Soft Ring",
    blurb: "A gentle halo around your planet.",
    slotTypes: ["ring"],
    price: 14,
    rarity: "common",
    visual: "soft_ring",
  },
  {
    key: "ember_ring",
    name: "Ember Ring",
    blurb: "Warm light for Stand moments.",
    slotTypes: ["ring"],
    price: 21,
    rarity: "uncommon",
    visual: "ember_ring",
  },
  {
    key: "aurora_ring",
    name: "Aurora Ring",
    blurb: "Color that shifts as you grow.",
    slotTypes: ["ring"],
    price: 30,
    rarity: "rare",
    visual: "aurora_ring",
  },
  {
    key: "halo_ring",
    name: "Halo Ring",
    blurb: "A thin gold circle of completion.",
    slotTypes: ["ring"],
    price: 35,
    rarity: "legendary",
    visual: "halo_ring",
  },
  // Sky
  {
    key: "mist_sky",
    name: "Soft Mist",
    blurb: "A veil of calm around the planet.",
    slotTypes: ["sky"],
    price: 8,
    rarity: "common",
    visual: "mist_sky",
  },
  {
    key: "aurora_veil",
    name: "Aurora Veil",
    blurb: "Northern light for quiet courage.",
    slotTypes: ["sky"],
    price: 26,
    rarity: "rare",
    visual: "aurora_veil",
  },
  {
    key: "sparkle_sky",
    name: "Sparkle Sky",
    blurb: "Tiny glints after a clear answer.",
    slotTypes: ["sky"],
    price: 13,
    rarity: "common",
    visual: "sparkle_sky",
  },
  {
    key: "dust_trail",
    name: "Dust Trail",
    blurb: "A shimmer left behind practice.",
    slotTypes: ["sky"],
    price: 10,
    rarity: "common",
    visual: "dust_trail",
  },
  {
    key: "pulse_orb",
    name: "Pulse Orb",
    blurb: "A soft beat near your atmosphere.",
    slotTypes: ["sky", "creature"],
    price: 17,
    rarity: "uncommon",
    visual: "pulse_orb",
  },
  // Universe-wide
  {
    key: "distant_comet",
    name: "Distant Comet",
    blurb: "A far streak across your map.",
    slotTypes: ["outer_comet"],
    price: 15,
    rarity: "uncommon",
    visual: "distant_comet",
  },
  {
    key: "ribbon_comet",
    name: "Ribbon Comet",
    blurb: "Rose-gold trail for big weeks.",
    slotTypes: ["outer_comet"],
    price: 28,
    rarity: "rare",
    visual: "ribbon_comet",
  },
  {
    key: "nebula_haze_item",
    name: "Nebula Haze",
    blurb: "Extra depth behind your planets.",
    slotTypes: ["nebula_haze"],
    price: 18,
    rarity: "uncommon",
    visual: "nebula_haze",
  },
  {
    key: "friend_beacon",
    name: "Friend Beacon",
    blurb: "A soft signal that you practiced today.",
    slotTypes: ["outer_comet", "sky"],
    price: 16,
    rarity: "uncommon",
    visual: "friend_beacon",
  },
  {
    key: "orbit_spark",
    name: "Orbit Spark",
    blurb: "A bright fleck from finishing an Orbit.",
    slotTypes: ["outer_comet", "sky"],
    price: 25,
    rarity: "rare",
    visual: "orbit_spark",
  },
] as const;

const BY_KEY = new Map(
  COSMETICS_CATALOG.map((item) => [item.key, item] as const),
);

export function getCosmeticByKey(key: string): CosmeticDefinition | null {
  return BY_KEY.get(key) ?? null;
}

export function listCosmeticsForSlot(
  slot: CosmeticsSlotKey,
): CosmeticDefinition[] {
  return COSMETICS_CATALOG.filter((item) => item.slotTypes.includes(slot));
}

export function cosmeticFitsSlot(
  key: string,
  slot: CosmeticsSlotKey,
): boolean {
  const item = getCosmeticByKey(key);
  return Boolean(item?.slotTypes.includes(slot));
}
