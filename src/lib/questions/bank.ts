/**
 * Question bank accessors for Speak / Daily / Focus.
 *
 * Daily + main Speak sessions use the Haelo planet curriculum
 * (`src/lib/prompts`). Focus on legacy topic pages still uses the
 * deprecated topic banks below until planet pages replace them.
 */
import {
  getPromptById,
  isPlanet,
  selectDailyPrompt,
  selectFocusShortlist,
  selectMainSessionPrompts,
  selectReplacementPrompt,
  todayKey as promptTodayKey,
  type HaeloPrompt,
  type Planet,
} from "@/lib/prompts";
import { CONFIDENCE_QUESTIONS } from "@/lib/questions/topics/confidence";
import { CREATIVITY_QUESTIONS } from "@/lib/questions/topics/creativity";
import { EMOTIONS_QUESTIONS } from "@/lib/questions/topics/emotions";
import { FAMILY_QUESTIONS } from "@/lib/questions/topics/family";
import { FRIENDSHIPS_QUESTIONS } from "@/lib/questions/topics/friendships";
import { FUTURE_QUESTIONS } from "@/lib/questions/topics/future";
import { HOBBIES_QUESTIONS } from "@/lib/questions/topics/hobbies";
import { RELATIONSHIPS_QUESTIONS } from "@/lib/questions/topics/relationships";
import { SCHOOL_QUESTIONS } from "@/lib/questions/topics/school";
import { SPORTS_QUESTIONS } from "@/lib/questions/topics/sports";
import type { BankQuestion } from "@/lib/questions/types";

/** @deprecated Topic curriculum — Focus on `/topics/*` only. Prefer `@/lib/prompts`. */
const BY_TOPIC: Record<string, BankQuestion[]> = {
  friendships: FRIENDSHIPS_QUESTIONS,
  family: FAMILY_QUESTIONS,
  relationships: RELATIONSHIPS_QUESTIONS,
  school: SCHOOL_QUESTIONS,
  sports: SPORTS_QUESTIONS,
  hobbies: HOBBIES_QUESTIONS,
  future: FUTURE_QUESTIONS,
  emotions: EMOTIONS_QUESTIONS,
  confidence: CONFIDENCE_QUESTIONS,
  creativity: CREATIVITY_QUESTIONS,
};

/** @deprecated Flat legacy topic bank for Focus lookups. */
export const ALL_QUESTIONS: BankQuestion[] = Object.values(BY_TOPIC).flat();

const LEGACY_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

/** Adapt Haelo curriculum prompts to the existing Speak/Daily shape. */
export function toBankQuestion(prompt: HaeloPrompt): BankQuestion {
  return {
    id: prompt.id,
    topicId: prompt.planet,
    text: prompt.prompt,
  };
}

export function getQuestionById(id: string): BankQuestion | undefined {
  const fromCurriculum = getPromptById(id);
  if (fromCurriculum) return toBankQuestion(fromCurriculum);
  return LEGACY_BY_ID.get(id);
}

/** @deprecated Use getPromptsForPlanet from `@/lib/prompts` for curriculum. */
export function getQuestionsForTopic(topicId: string): BankQuestion[] {
  if (isPlanet(topicId)) {
    // Not used for planet shortlists yet — Focus still passes topic ids.
    return [];
  }
  return BY_TOPIC[topicId] ?? [];
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

function shuffleInPlace<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function pickN<T>(items: T[], n: number, rand: () => number): T[] {
  if (items.length <= n) return shuffleInPlace([...items], rand);
  const copy = shuffleInPlace([...items], rand);
  return copy.slice(0, n);
}

/** A few prompts from one voice planet (Express / Stand / Connect / Explore). */
export function pickPlanetSessionQuestions(
  planet: Planet,
  count = 3,
  seed: string = `${Date.now()}-${Math.random()}`,
): BankQuestion[] {
  return selectFocusShortlist(planet, count, {
    planetLevel: 1,
    seed,
  }).map(toBankQuestion);
}

/** One prompt from each voice planet (Express / Stand / Connect / Explore). */
export function pickMainSessionQuestions(
  seed: string = `${Date.now()}-${Math.random()}`,
): BankQuestion[] {
  return selectMainSessionPrompts({ seed, count: 4 }).map(toBankQuestion);
}

/**
 * Random shortlist for focus mode (default 10).
 * Still backed by the legacy topic bank until planet Focus ships.
 */
export function pickFocusShortlist(
  topicId: string,
  count = 10,
  seed: string = `${Date.now()}-${Math.random()}`,
): BankQuestion[] {
  const pool = getQuestionsForTopic(topicId);
  const rand = mulberry32(hashString(`focus:${topicId}:${seed}`));
  return pickN(pool, Math.min(count, pool.length), rand);
}

/** Pick three random questions from a topic (or from a shortlist). */
export function pickRandomThree(
  questions: BankQuestion[],
  seed: string = `${Date.now()}-${Math.random()}`,
): BankQuestion[] {
  const rand = mulberry32(hashString(`random3:${seed}`));
  return pickN(questions, Math.min(3, questions.length), rand);
}

/**
 * Swap a skipped prompt for another.
 * Planet curriculum: same planet, eligible pool, cooldown-aware.
 * Legacy topic Focus: same topic bank (deprecated path).
 * Skipping is neutral — never treated as failure.
 */
export function pickReplacementQuestion(
  topicId: string,
  currentId: string,
  excludeIds: Iterable<string> = [],
): BankQuestion | null {
  if (isPlanet(topicId)) {
    const replacement = selectReplacementPrompt({
      planet: topicId as Planet,
      planetLevel: 1,
      currentId,
      recentPromptIds: excludeIds,
    });
    return replacement ? toBankQuestion(replacement) : null;
  }

  const pool = getQuestionsForTopic(topicId);
  if (pool.length === 0) return null;

  const excluded = new Set(excludeIds);
  excluded.add(currentId);

  const fresh = pool.filter((q) => !excluded.has(q.id));
  const candidates =
    fresh.length > 0 ? fresh : pool.filter((q) => q.id !== currentId);

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

export function todayKey(date: Date = new Date()): string {
  return promptTodayKey(date);
}

/**
 * Same daily question for all users on a given calendar day.
 * Uses the Haelo planet curriculum with daily-friendly filters.
 */
export function getDailyQuestionForDate(
  date: Date = new Date(),
): BankQuestion {
  return toBankQuestion(selectDailyPrompt({ date, planetLevel: 1 }));
}

export function formatDisplayDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
