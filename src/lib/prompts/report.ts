import { ALL_PROMPTS } from "./catalog";
import type {
  DisplayLevel,
  HaeloPrompt,
  PromptChallenge,
  PromptDepth,
  PromptSkill,
} from "./types";
import { PLANETS } from "./types";

function countBy<T extends string | number>(
  items: readonly HaeloPrompt[],
  key: (p: HaeloPrompt) => T,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = String(key(item));
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Development-only distribution summary for curriculum QC. */
export function summarizeDistributions(
  prompts: readonly HaeloPrompt[] = ALL_PROMPTS,
): string {
  const lines: string[] = [];
  lines.push(`Total prompts: ${prompts.length}`);
  lines.push("");

  for (const planet of PLANETS) {
    const planetPrompts = prompts.filter((p) => p.planet === planet);
    lines.push(`${planet[0]!.toUpperCase()}${planet.slice(1)}: ${planetPrompts.length}`);

    const byLevel = countBy(planetPrompts, (p) => p.displayLevel as DisplayLevel);
    for (const level of [1, 2, 3, 4, 5]) {
      lines.push(`  L${level}: ${byLevel[String(level)] ?? 0}`);
    }

    const byDepth = countBy(planetPrompts, (p) => p.depth as PromptDepth);
    lines.push("  Depth:");
    for (const depth of ["light", "personal", "deep"] as const) {
      lines.push(`    ${depth}: ${byDepth[depth] ?? 0}`);
    }

    const byChallenge = countBy(
      planetPrompts,
      (p) => p.challenge as PromptChallenge,
    );
    lines.push("  Challenge:");
    for (const challenge of ["beginner", "developing", "stretch"] as const) {
      lines.push(`    ${challenge}: ${byChallenge[challenge] ?? 0}`);
    }

    const bySkill = countBy(planetPrompts, (p) => p.skill as PromptSkill);
    lines.push("  Skills:");
    for (const [skill, count] of Object.entries(bySkill).sort()) {
      lines.push(`    ${skill}: ${count}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
