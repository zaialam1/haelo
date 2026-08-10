import {
  DAILY_PROMPT_DEFAULTS,
  DEPTH_PREFERENCE_FILTERS,
  LEVEL_WEIGHTS,
  MIN_POOL_AFTER_COOLDOWN,
  type DepthPreference,
} from "./config";
import { ALL_PROMPTS, getPromptsForPlanet } from "./catalog";
import type {
  DisplayLevel,
  HaeloPrompt,
  Planet,
  PromptDepth,
  PromptSkill,
} from "./types";
import { PLANETS } from "./types";

export type SelectPromptOptions = {
  planet: Planet;
  planetLevel: DisplayLevel;
  recentPromptIds?: Iterable<string>;
  recentSkills?: Iterable<PromptSkill | string>;
  preferredDepth?: DepthPreference;
  /** First-ever reflection: prefer a low-pressure beginner + light prompt. */
  firstSession?: boolean;
  /** Optional RNG in [0, 1). Defaults to Math.random. */
  random?: () => number;
};

function clampPlanetLevel(level: number): DisplayLevel {
  if (level <= 1) return 1;
  if (level >= 5) return 5;
  return level as DisplayLevel;
}

/** Prompts whose displayLevel is at or below the user's planet level. */
export function eligiblePrompts(options: {
  planet: Planet;
  planetLevel: DisplayLevel;
  pool?: readonly HaeloPrompt[];
}): HaeloPrompt[] {
  const level = clampPlanetLevel(options.planetLevel);
  const source = options.pool ?? getPromptsForPlanet(options.planet);
  return source.filter((p) => p.displayLevel <= level);
}

export function filterByDepthPreference(
  pool: readonly HaeloPrompt[],
  preferredDepth: DepthPreference = "normal",
): HaeloPrompt[] {
  const allowed = new Set<PromptDepth>(DEPTH_PREFERENCE_FILTERS[preferredDepth]);
  const filtered = pool.filter((p) => allowed.has(p.depth));
  return filtered.length > 0 ? filtered : [...pool];
}

/**
 * Exclude recently shown/completed IDs.
 * If the remaining pool is too small, relax exclusion (keep currentId out if provided).
 */
export function excludeRecent(
  pool: readonly HaeloPrompt[],
  recentPromptIds: Iterable<string> = [],
  options: { minPool?: number; alwaysExcludeId?: string } = {},
): HaeloPrompt[] {
  const minPool = options.minPool ?? MIN_POOL_AFTER_COOLDOWN;
  const recent = new Set(recentPromptIds);
  if (options.alwaysExcludeId) recent.add(options.alwaysExcludeId);

  const fresh = pool.filter((p) => !recent.has(p.id));
  if (fresh.length >= minPool) return fresh;
  if (fresh.length > 0) return fresh;

  if (options.alwaysExcludeId) {
    const withoutCurrent = pool.filter((p) => p.id !== options.alwaysExcludeId);
    if (withoutCurrent.length > 0) return withoutCurrent;
  }
  return [...pool];
}

/**
 * Soft preference against recently practiced skills.
 * Does not hard-exclude; if everything was recent, returns the original pool.
 */
export function preferUnpracticedSkills(
  pool: readonly HaeloPrompt[],
  recentSkills: Iterable<PromptSkill | string> = [],
): HaeloPrompt[] {
  const recent = new Set(recentSkills);
  if (recent.size === 0) return [...pool];
  const preferred = pool.filter((p) => !recent.has(p.skill));
  return preferred.length > 0 ? preferred : [...pool];
}

function pickWeightedLevel(
  planetLevel: DisplayLevel,
  availableLevels: DisplayLevel[],
  random: () => number,
): DisplayLevel {
  const weights = LEVEL_WEIGHTS[clampPlanetLevel(planetLevel)];
  const entries = availableLevels
    .map((level) => ({ level, weight: weights[level] ?? 0 }))
    .filter((e) => e.weight > 0);

  if (entries.length === 0) {
    return availableLevels[availableLevels.length - 1] ?? 1;
  }

  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  let cursor = random() * total;
  for (const entry of entries) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.level;
  }
  return entries[entries.length - 1]!.level;
}

export function weightedPickByDisplayLevel(
  pool: readonly HaeloPrompt[],
  planetLevel: DisplayLevel,
  random: () => number = Math.random,
): HaeloPrompt | null {
  if (pool.length === 0) return null;

  const byLevel = new Map<DisplayLevel, HaeloPrompt[]>();
  for (const prompt of pool) {
    const list = byLevel.get(prompt.displayLevel) ?? [];
    list.push(prompt);
    byLevel.set(prompt.displayLevel, list);
  }

  const availableLevels = [...byLevel.keys()].sort((a, b) => a - b);
  const chosenLevel = pickWeightedLevel(
    planetLevel,
    availableLevels,
    random,
  );
  let candidates = byLevel.get(chosenLevel);

  // Fallback if weight pointed at an empty bucket (shouldn't happen).
  if (!candidates || candidates.length === 0) {
    candidates = [...pool];
  }

  return candidates[Math.floor(random() * candidates.length)]!;
}

export function selectPrompt(
  options: SelectPromptOptions,
): HaeloPrompt | null {
  const random = options.random ?? Math.random;
  let pool = eligiblePrompts({
    planet: options.planet,
    planetLevel: options.planetLevel,
  });

  if (options.firstSession) {
    // First-ever recording: keep it low-pressure. Soft preference with
    // graceful fallbacks so a sparse bank never blocks a session.
    const beginnerLight = pool.filter(
      (p) => p.challenge === "beginner" && p.depth === "light",
    );
    const beginner = pool.filter((p) => p.challenge === "beginner");
    if (beginnerLight.length > 0) pool = beginnerLight;
    else if (beginner.length > 0) pool = beginner;
  }

  pool = filterByDepthPreference(pool, options.preferredDepth ?? "normal");
  pool = excludeRecent(pool, options.recentPromptIds);
  pool = preferUnpracticedSkills(pool, options.recentSkills);

  return weightedPickByDisplayLevel(pool, options.planetLevel, random);
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function todayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function isDailyFriendly(prompt: HaeloPrompt): boolean {
  const { allowedDepths, allowedChallenges, excludeDeepStretch } =
    DAILY_PROMPT_DEFAULTS;
  if (!(allowedDepths as readonly PromptDepth[]).includes(prompt.depth)) {
    return false;
  }
  if (!(allowedChallenges as readonly string[]).includes(prompt.challenge)) {
    return false;
  }
  if (
    excludeDeepStretch &&
    prompt.depth === "deep" &&
    prompt.challenge === "stretch"
  ) {
    return false;
  }
  return true;
}

export type SelectDailyPromptOptions = {
  date?: Date;
  recentPromptIds?: Iterable<string>;
  /** Default planet level for eligibility across the bank. */
  planetLevel?: DisplayLevel;
  preferredDepth?: DepthPreference;
};

/**
 * Deterministic daily pick for a calendar day.
 * Favors Light/Personal + Beginner/Developing; avoids Deep+Stretch by default.
 */
export function selectDailyPrompt(
  options: SelectDailyPromptOptions = {},
): HaeloPrompt {
  const date = options.date ?? new Date();
  const planetLevel = clampPlanetLevel(options.planetLevel ?? 1);
  const random = mulberry32(hashString(`daily:${todayKey(date)}`));

  let pool = ALL_PROMPTS.filter((p) => p.displayLevel <= planetLevel);
  pool = pool.filter(isDailyFriendly);
  pool = filterByDepthPreference(pool, options.preferredDepth ?? "normal");
  pool = excludeRecent(pool, options.recentPromptIds);

  if (pool.length === 0) {
    // Graceful fallback: any eligible non-deep-stretch prompt
    pool = ALL_PROMPTS.filter(
      (p) =>
        p.displayLevel <= planetLevel &&
        !(p.depth === "deep" && p.challenge === "stretch"),
    );
  }
  if (pool.length === 0) {
    pool = [...ALL_PROMPTS];
  }

  return pool[Math.floor(random() * pool.length)]!;
}

/**
 * One prompt per planet for a varied main session (default 4).
 * Uses the same selection primitives; defaults to planetLevel 1.
 */
export function selectMainSessionPrompts(options: {
  planetLevels?: Partial<Record<Planet, DisplayLevel>>;
  count?: number;
  recentPromptIds?: Iterable<string>;
  recentSkills?: Iterable<PromptSkill | string>;
  preferredDepth?: DepthPreference;
  seed?: string;
} = {}): HaeloPrompt[] {
  const count = Math.min(options.count ?? 4, PLANETS.length);
  const seed = options.seed ?? `${Date.now()}-${Math.random()}`;
  const random = mulberry32(hashString(`main:${seed}`));

  const order = [...PLANETS];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }

  const recentIds = new Set(options.recentPromptIds ?? []);
  const recentSkills = [...(options.recentSkills ?? [])];
  const picked: HaeloPrompt[] = [];

  for (const planet of order.slice(0, count)) {
    const level = clampPlanetLevel(options.planetLevels?.[planet] ?? 1);
    const prompt = selectPrompt({
      planet,
      planetLevel: level,
      recentPromptIds: recentIds,
      recentSkills,
      preferredDepth: options.preferredDepth,
      random,
    });
    if (prompt) {
      picked.push(prompt);
      recentIds.add(prompt.id);
      recentSkills.push(prompt.skill);
    }
  }

  return picked;
}

/**
 * Replacement within the same planet; skip is neutral (never lowers level).
 */
export function selectReplacementPrompt(options: {
  planet: Planet;
  planetLevel: DisplayLevel;
  currentId: string;
  recentPromptIds?: Iterable<string>;
  preferredDepth?: DepthPreference;
  random?: () => number;
}): HaeloPrompt | null {
  const random = options.random ?? Math.random;
  let pool = eligiblePrompts({
    planet: options.planet,
    planetLevel: options.planetLevel,
  });
  pool = filterByDepthPreference(pool, options.preferredDepth ?? "normal");
  pool = excludeRecent(pool, options.recentPromptIds, {
    alwaysExcludeId: options.currentId,
    minPool: 1,
  });
  return weightedPickByDisplayLevel(pool, options.planetLevel, random);
}

/** Focus shortlist for a planet (future planet pages). */
export function selectFocusShortlist(
  planet: Planet,
  count = 10,
  options: {
    planetLevel?: DisplayLevel;
    seed?: string;
    preferredDepth?: DepthPreference;
  } = {},
): HaeloPrompt[] {
  const planetLevel = clampPlanetLevel(options.planetLevel ?? 1);
  const seed = options.seed ?? `${Date.now()}-${Math.random()}`;
  const random = mulberry32(hashString(`focus:${planet}:${seed}`));

  let pool = eligiblePrompts({ planet, planetLevel });
  pool = filterByDepthPreference(pool, options.preferredDepth ?? "normal");
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(count, copy.length));
}
