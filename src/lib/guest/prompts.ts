import {
  PLANETS,
  selectPrompt,
  type HaloPrompt,
  type Planet,
} from "@/lib/prompts";
import { GUEST_RECENT_PROMPTS_KEY } from "./config";

function readRecentPromptIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(GUEST_RECENT_PROMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function rememberGuestPromptId(promptId: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = readRecentPromptIds().filter((id) => id !== promptId);
    recent.unshift(promptId);
    sessionStorage.setItem(
      GUEST_RECENT_PROMPTS_KEY,
      JSON.stringify(recent.slice(0, 24)),
    );
  } catch {
    // ignore
  }
}

/**
 * Pick one Level-1, beginner/light curriculum prompt for guests.
 * Rotates planets; excludes recently shown ids from this browser visit.
 */
export function pickGuestPrompt(options?: {
  preferPlanet?: Planet;
  recentPromptIds?: string[];
  random?: () => number;
}): HaloPrompt {
  const random = options?.random ?? Math.random;
  const recent = options?.recentPromptIds ?? readRecentPromptIds();

  const planetOrder: Planet[] = options?.preferPlanet
    ? [
        options.preferPlanet,
        ...PLANETS.filter((p) => p !== options.preferPlanet),
      ]
    : [...PLANETS].sort(() => random() - 0.5);

  for (const planet of planetOrder) {
    const prompt = selectPrompt({
      planet,
      planetLevel: 1,
      firstSession: true,
      preferredDepth: "lighter",
      recentPromptIds: recent,
      random,
    });
    if (prompt) return prompt;
  }

  // Absolute fallback — bank always has Express L1 prompts.
  const fallback = selectPrompt({
    planet: "express",
    planetLevel: 1,
    firstSession: true,
    random,
  });
  if (!fallback) {
    throw new Error("No guest prompts available.");
  }
  return fallback;
}
