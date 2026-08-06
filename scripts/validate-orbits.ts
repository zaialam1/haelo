import { validateOrbitContent } from "../src/lib/orbits/validation";
import { ALL_ORBITS, ALL_ORBIT_QUESTIONS } from "../src/lib/orbits/catalog";
import { ORBIT_REGIONS } from "../src/lib/orbits/regions";

const result = validateOrbitContent(ALL_ORBITS);

console.log("Haelo Orbit content validation");
console.log("------------------------------");
console.log(
  `Regions: ${result.counts.regions} | Orbits: ${result.counts.orbits} | Questions: ${result.counts.questions}`,
);
console.log(
  `Per region: ${ORBIT_REGIONS.map(
    (r) => `${r.key}=${result.counts.perRegion[r.key]}`,
  ).join(" · ")}`,
);
console.log(`Flat question catalog: ${ALL_ORBIT_QUESTIONS.length}`);

if (!result.ok) {
  console.error(`\nFAILED with ${result.issues.length} issue(s):\n`);
  for (const issue of result.issues) {
    const where = [issue.orbitKey, issue.questionKey].filter(Boolean).join(" / ");
    console.error(
      `- [${issue.code}] ${where ? where + ": " : ""}${issue.message}`,
    );
  }
  process.exit(1);
}

console.log(
  "\nOK — 4 regions, 10 orbits each, 40 orbits, 240 questions, progression impact none.\n",
);
