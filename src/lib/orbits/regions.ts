import type { OrbitRegionDefinition, OrbitRegionKey } from "./types";

export const ORBIT_REGIONS: readonly OrbitRegionDefinition[] = [
  {
    key: "friendships_people",
    title: "Friendships & People",
    description: "Belonging, closeness, conflict, and the people around you.",
    sortOrder: 1,
  },
  {
    key: "speaking_up",
    title: "Speaking Up",
    description: "Boundaries, asking, disagreement, and saying what you need.",
    sortOrder: 2,
  },
  {
    key: "figuring_things_out",
    title: "Figuring Things Out",
    description: "Decisions, identity, change, and what matters to you.",
    sortOrder: 3,
  },
  {
    key: "putting_yourself_out_there",
    title: "Putting Yourself Out There",
    description: "Ideas, opportunities, sharing, and taking a chance.",
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
