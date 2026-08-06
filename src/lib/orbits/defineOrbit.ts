import type { Planet } from "@/lib/prompts";
import type {
  OrbitDefinition,
  OrbitQuestionDefinition,
  OrbitRegionKey,
} from "./types";

const DEFAULT_ESTIMATED_MINUTES = 15;
const CURRENT_CONTENT_VERSION = 1;

type QuestionInput = {
  planet: Planet;
  prompt: string;
  explanation: string;
};

type OrbitInput = {
  orbitKey: string;
  title: string;
  regionKey: OrbitRegionKey;
  shortDescription: string;
  situation: string;
  openingTitle: string;
  openingBody: string;
  sortOrder: number;
  questions: readonly [
    QuestionInput,
    QuestionInput,
    QuestionInput,
    QuestionInput,
    QuestionInput,
    QuestionInput,
  ];
  estimatedMinutes?: number;
  version?: number;
  isActive?: boolean;
};

function buildQuestions(
  orbitKey: string,
  inputs: OrbitInput["questions"],
): OrbitQuestionDefinition[] {
  return inputs.map((q, index) => {
    const sequenceNumber = (index + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    const questionKey = `${orbitKey}_q${String(sequenceNumber).padStart(2, "0")}`;
    return {
      questionKey,
      sequenceNumber,
      planet: q.planet,
      prompt: q.prompt,
      explanation: q.explanation,
      sourceType: "orbit",
      contentOrigin: "orbit_original",
      normalProgressionImpact: "none",
      contributesToPlanetExperience: true,
      contributesToPlanetVisualGrowth: true,
      appearsInPlanetJourney: true,
      appearsIndividuallyInMasterJourney: false,
      recordingRequired: true,
      transcriptEnabled: true,
      individualAnalysisEnabled: true,
      retryEnabled: true,
    };
  });
}

/** Build a validated Orbit definition with stable question keys. */
export function defineOrbit(input: OrbitInput): OrbitDefinition {
  if (input.questions.length !== 6) {
    throw new Error(`Orbit ${input.orbitKey} must have exactly 6 questions.`);
  }

  return {
    orbitKey: input.orbitKey,
    title: input.title,
    regionKey: input.regionKey,
    shortDescription: input.shortDescription,
    situation: input.situation,
    openingTitle: input.openingTitle,
    openingBody: input.openingBody,
    estimatedMinutes: input.estimatedMinutes ?? DEFAULT_ESTIMATED_MINUTES,
    questionCount: 6,
    completionAnalysisEnabled: true,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder,
    version: input.version ?? CURRENT_CONTENT_VERSION,
    questions: buildQuestions(input.orbitKey, input.questions),
  };
}

export { DEFAULT_ESTIMATED_MINUTES, CURRENT_CONTENT_VERSION };
