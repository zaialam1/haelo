import { ALL_PROMPTS, PROMPTS_BY_PLANET } from "./catalog";
import type {
  DisplayLevel,
  HaeloPrompt,
  Planet,
  PromptChallenge,
  PromptDepth,
  PromptSkill,
} from "./types";
import { PLANETS, SKILLS_BY_PLANET } from "./types";

const DEPTHS: readonly PromptDepth[] = ["light", "personal", "deep"];
const CHALLENGES: readonly PromptChallenge[] = [
  "beginner",
  "developing",
  "stretch",
];
const LEVELS: readonly DisplayLevel[] = [1, 2, 3, 4, 5];

export type PromptValidationIssue = {
  code: string;
  message: string;
  promptId?: string;
  planet?: Planet;
};

export type PromptValidationResult = {
  ok: boolean;
  issues: PromptValidationIssue[];
  counts: Record<Planet, number> & { total: number };
};

function isDepth(value: string): value is PromptDepth {
  return (DEPTHS as readonly string[]).includes(value);
}

function isChallenge(value: string): value is PromptChallenge {
  return (CHALLENGES as readonly string[]).includes(value);
}

function isDisplayLevel(value: number): value is DisplayLevel {
  return (LEVELS as readonly number[]).includes(value);
}

export function validatePromptBank(
  prompts: readonly HaeloPrompt[] = ALL_PROMPTS,
): PromptValidationResult {
  const issues: PromptValidationIssue[] = [];
  const counts = {
    express: 0,
    stand: 0,
    connect: 0,
    explore: 0,
    total: prompts.length,
  } as Record<Planet, number> & { total: number };

  const seenIds = new Set<string>();

  for (const planet of PLANETS) {
    const planetPrompts = prompts.filter((p) => p.planet === planet);
    counts[planet] = planetPrompts.length;

    if (planetPrompts.length !== 150) {
      issues.push({
        code: "count",
        planet,
        message: `Expected 150 prompts for ${planet}, found ${planetPrompts.length}. Do not invent fillers.`,
      });
    }

    for (let i = 1; i <= 150; i++) {
      const expectedId = `${planet}_${String(i).padStart(3, "0")}`;
      const found = planetPrompts.find((p) => p.id === expectedId);
      if (!found) {
        issues.push({
          code: "missing_id",
          planet,
          promptId: expectedId,
          message: `Missing expected id ${expectedId}`,
        });
      }
    }
  }

  if (prompts.length !== 600) {
    issues.push({
      code: "total",
      message: `Expected 600 total prompts, found ${prompts.length}.`,
    });
  }

  for (const prompt of prompts) {
    if (seenIds.has(prompt.id)) {
      issues.push({
        code: "duplicate_id",
        promptId: prompt.id,
        planet: prompt.planet,
        message: `Duplicate id ${prompt.id}`,
      });
    }
    seenIds.add(prompt.id);

    if (!prompt.id) {
      issues.push({
        code: "missing_field",
        planet: prompt.planet,
        message: "Prompt missing id",
      });
    }
    if (!prompt.planet) {
      issues.push({
        code: "missing_field",
        promptId: prompt.id,
        message: "Prompt missing planet",
      });
    }
    if (!prompt.category) {
      issues.push({
        code: "missing_field",
        promptId: prompt.id,
        planet: prompt.planet,
        message: "Prompt missing category",
      });
    }
    if (!prompt.prompt || !prompt.prompt.trim()) {
      issues.push({
        code: "empty_prompt",
        promptId: prompt.id,
        planet: prompt.planet,
        message: "Prompt text is empty",
      });
    }
    if (!isDepth(prompt.depth)) {
      issues.push({
        code: "depth",
        promptId: prompt.id,
        planet: prompt.planet,
        message: `Invalid depth ${String(prompt.depth)}`,
      });
    }
    if (!isChallenge(prompt.challenge)) {
      issues.push({
        code: "challenge",
        promptId: prompt.id,
        planet: prompt.planet,
        message: `Invalid challenge ${String(prompt.challenge)}`,
      });
    }
    if (!isDisplayLevel(prompt.displayLevel)) {
      issues.push({
        code: "displayLevel",
        promptId: prompt.id,
        planet: prompt.planet,
        message: `Invalid displayLevel ${String(prompt.displayLevel)}`,
      });
    }

    const allowedSkills = SKILLS_BY_PLANET[prompt.planet] as readonly PromptSkill[];
    if (!allowedSkills.includes(prompt.skill as PromptSkill)) {
      issues.push({
        code: "skill",
        promptId: prompt.id,
        planet: prompt.planet,
        message: `Skill "${prompt.skill}" is not allowed for planet ${prompt.planet}`,
      });
    }

    if (prompt.planet && !PROMPTS_BY_PLANET[prompt.planet]) {
      issues.push({
        code: "planet",
        promptId: prompt.id,
        message: `Unknown planet ${String(prompt.planet)}`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    counts,
  };
}
