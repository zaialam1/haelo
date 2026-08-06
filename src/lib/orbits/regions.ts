import type { OrbitRegionDefinition, OrbitRegionKey } from "./types";

export const ORBIT_REGIONS: readonly OrbitRegionDefinition[] = [
  {
    key: "friendships_people",
    title: "Friendships & People",
    description:
      "Friendship, belonging, closeness, misunderstanding, conflict, group dynamics, and social relationships.",
    sortOrder: 1,
  },
  {
    key: "speaking_up",
    title: "Speaking Up",
    description:
      "Self-advocacy, boundaries, asking, disagreement, difficult conversations, and saying what you need.",
    sortOrder: 2,
  },
  {
    key: "figuring_things_out",
    title: "Figuring Things Out",
    description:
      "Identity, decisions, uncertainty, comparison, values, change, and self-understanding.",
    sortOrder: 3,
  },
  {
    key: "putting_yourself_out_there",
    title: "Putting Yourself Out There",
    description:
      "Creativity, opportunities, new environments, sharing ideas, leadership, visibility, storytelling, and social risk.",
    sortOrder: 4,
  },
] as const;

export const ORBIT_REGION_KEYS = ORBIT_REGIONS.map((r) => r.key);

export function isOrbitRegionKey(value: string): value is OrbitRegionKey {
  return (ORBIT_REGION_KEYS as readonly string[]).includes(value);
}

export function getOrbitRegion(
  key: OrbitRegionKey,
): OrbitRegionDefinition | undefined {
  return ORBIT_REGIONS.find((r) => r.key === key);
}
