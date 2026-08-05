import { validatePromptBank } from "../src/lib/prompts/validation";
import { summarizeDistributions } from "../src/lib/prompts/report";
import { ALL_PROMPTS } from "../src/lib/prompts/catalog";

const result = validatePromptBank(ALL_PROMPTS);

console.log("Haelo prompt bank validation");
console.log("----------------------------");
console.log(
  `Counts: express=${result.counts.express} stand=${result.counts.stand} connect=${result.counts.connect} explore=${result.counts.explore} total=${result.counts.total}`,
);

if (!result.ok) {
  console.error(`\nFAILED with ${result.issues.length} issue(s):\n`);
  for (const issue of result.issues) {
    const where = [issue.planet, issue.promptId].filter(Boolean).join(" / ");
    console.error(`- [${issue.code}] ${where ? where + ": " : ""}${issue.message}`);
  }
  process.exit(1);
}

console.log("\nOK — 150 prompts per planet, 600 total, metadata valid.\n");
console.log(summarizeDistributions(ALL_PROMPTS));
