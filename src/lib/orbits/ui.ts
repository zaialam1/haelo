import type { Planet } from "@/lib/prompts";
import type {
  OrbitDefinition,
  OrbitListItem,
  OrbitRegionKey,
  OrbitStatus,
} from "./types";

export const PLANET_LABEL: Record<Planet, string> = {
  express: "Express",
  stand: "Stand",
  connect: "Connect",
  explore: "Explore",
};

export const PLANET_COLOR: Record<Planet, string> = {
  express: "#E8A0BF",
  stand: "var(--violet)",
  connect: "#6B9BC7",
  explore: "#E9A98A",
};

export const REGION_ACCENT: Record<OrbitRegionKey, string> = {
  friendships_people: "var(--rose)",
  speaking_up: "var(--violet)",
  figuring_things_out: "var(--gold)",
  putting_yourself_out_there: "#6B9BC7",
};

/** Spatial placement of region clusters on the Orbits star map (% of map). */
export const REGION_MAP_LAYOUT: Record<
  OrbitRegionKey,
  {
    x: number;
    y: number;
    /** Label sits toward the map center so it won't collide with edge Orbit nodes. */
    labelToward: "se" | "sw" | "ne" | "nw";
  }
> = {
  friendships_people: { x: 14, y: 14, labelToward: "se" },
  speaking_up: { x: 86, y: 14, labelToward: "sw" },
  figuring_things_out: { x: 14, y: 86, labelToward: "ne" },
  putting_yourself_out_there: { x: 86, y: 86, labelToward: "nw" },
};

/**
 * Organic node positions for up to 10 Orbits inside the active constellation
 * (percent of constellation field). Kept clear of the outer rim.
 */
export const ORBIT_NODE_LAYOUT: readonly { x: number; y: number }[] = [
  { x: 28, y: 28 },
  { x: 50, y: 22 },
  { x: 72, y: 30 },
  { x: 18, y: 48 },
  { x: 42, y: 46 },
  { x: 62, y: 50 },
  { x: 80, y: 48 },
  { x: 30, y: 72 },
  { x: 52, y: 76 },
  { x: 74, y: 70 },
];

/** Adjacent pairs for faint constellation links between Orbit nodes. */
export const ORBIT_NODE_EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [0, 4],
  [1, 4],
  [2, 5],
  [2, 6],
  [3, 4],
  [4, 5],
  [5, 6],
  [3, 7],
  [4, 7],
  [4, 8],
  [5, 8],
  [5, 9],
  [6, 9],
  [7, 8],
  [8, 9],
];


export type OrbitVisualSeed = {
  rings: 1 | 2 | 3;
  tiltDeg: number;
  starCount: number;
  coreScale: number;
};

/** Deterministic visual variation so Orbits feel distinct without unique art. */
export function getOrbitVisualSeed(orbitKey: string): OrbitVisualSeed {
  let hash = 0;
  for (let i = 0; i < orbitKey.length; i += 1) {
    hash = (hash * 31 + orbitKey.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(hash);
  return {
    rings: ((abs % 3) + 1) as 1 | 2 | 3,
    tiltDeg: (abs % 36) - 18,
    starCount: 2 + ((abs >> 3) % 4),
    coreScale: 0.85 + ((abs >> 5) % 4) * 0.08,
  };
}

export function formatPlanetList(planets: Planet[]): string {
  return planets.map((p) => PLANET_LABEL[p]).join(" · ");
}

export function formatPlanetSequence(planets: Planet[]): string {
  return planets.map((p) => PLANET_LABEL[p]).join(" → ");
}

export function getOrbitStatus(item: OrbitListItem): OrbitStatus {
  return item.progress?.status ?? "not_started";
}

export function orbitCtaLabel(status: OrbitStatus): string {
  if (status === "completed") return "Revisit Orbit";
  if (status === "in_progress") return "Continue Orbit";
  return "Begin Orbit";
}

export function orbitProgressLabel(item: OrbitListItem): string | null {
  const status = getOrbitStatus(item);
  if (status === "in_progress" && item.progress) {
    const q = Math.min(6, Math.max(1, item.progress.current_question_index));
    return `${q} of 6 reflections`;
  }
  if (status === "completed") return "Completed";
  return null;
}

export function formatOrbitMeta(orbit: OrbitDefinition): string {
  return `${orbit.questionCount} reflections · about ${orbit.estimatedMinutes} min`;
}

/**
 * Soft help points for Orbit preview — derived from question explanations
 * without revealing the spoken prompts.
 */
export function deriveOrbitHelpPoints(orbit: OrbitDefinition): string[] {
  const seen = new Set<string>();
  const points: string[] = [];

  for (const q of orbit.questions) {
    const softened = softenHelpPoint(q.explanation);
    const key = softened.toLowerCase();
    if (seen.has(key) || softened.length < 12) continue;
    seen.add(key);
    points.push(softened);
    if (points.length >= 4) break;
  }

  return points.slice(0, 4);
}

function softenHelpPoint(explanation: string): string {
  let text = explanation.trim().replace(/\s+/g, " ");
  if (text.endsWith(".")) text = text.slice(0, -1);

  // Prefer calm imperative / infinitive tone when the explanation starts as a statement.
  const lower = text.charAt(0).toLowerCase() + text.slice(1);

  if (/^(start|make|put|know|understand|identify|practice|say|keep|be|take|find|figure|separate|notice)/i.test(text)) {
    return lower;
  }

  return lower;
}

export function matchesOrbitSearch(
  item: OrbitListItem,
  query: string,
  regionTitle: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const orbit = item.definition;
  const haystack = [
    orbit.title,
    orbit.shortDescription,
    orbit.situation,
    orbit.openingBody,
    regionTitle,
    ...item.planetsInvolved.map((p) => PLANET_LABEL[p]),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
