import { CONNECT_PROMPTS } from "./connect";
import { EXPLORE_PROMPTS } from "./explore";
import { EXPRESS_PROMPTS } from "./express";
import { STAND_PROMPTS } from "./stand";
import type { HaeloPrompt, Planet } from "./types";
import { PLANETS } from "./types";

export const PROMPTS_BY_PLANET: Record<Planet, readonly HaeloPrompt[]> = {
  express: EXPRESS_PROMPTS,
  stand: STAND_PROMPTS,
  connect: CONNECT_PROMPTS,
  explore: EXPLORE_PROMPTS,
};

/** Flat curriculum across all four planets — 600 prompts. */
export const ALL_PROMPTS: readonly HaeloPrompt[] = PLANETS.flatMap(
  (planet) => PROMPTS_BY_PLANET[planet],
);

const BY_ID = new Map(ALL_PROMPTS.map((p) => [p.id, p]));

export function getPromptById(id: string): HaeloPrompt | undefined {
  return BY_ID.get(id);
}

export function getPromptsForPlanet(planet: Planet): readonly HaeloPrompt[] {
  return PROMPTS_BY_PLANET[planet];
}

export function isPlanet(value: string): value is Planet {
  return (PLANETS as readonly string[]).includes(value);
}
