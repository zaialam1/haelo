import type { VoicePlanetId } from "@/lib/home/voicePlanets";

/** Haelo voice planet — Express / Stand / Connect / Explore */
export type Planet = VoicePlanetId;

export type PromptDepth = "light" | "personal" | "deep";

export type PromptChallenge = "beginner" | "developing" | "stretch";

export type DisplayLevel = 1 | 2 | 3 | 4 | 5;

export type ExpressSkill =
  | "free_expression"
  | "specificity"
  | "emotional_expression"
  | "self_disclosure"
  | "unsaid_expression"
  | "authentic_expression";

export type StandSkill =
  | "opinion"
  | "disagreement"
  | "asking_for_needs"
  | "boundaries"
  | "self_advocacy"
  | "conviction";

export type ConnectSkill =
  | "conversation"
  | "clarity"
  | "empathy"
  | "repair"
  | "appreciation"
  | "relational_authenticity";

export type ExploreSkill =
  | "self_curiosity"
  | "values"
  | "identity"
  | "perspective"
  | "future_self"
  | "meaning";

export type PromptSkill =
  | ExpressSkill
  | StandSkill
  | ConnectSkill
  | ExploreSkill;

export type ExpressCategory =
  | "getting_comfortable"
  | "specific_expression"
  | "emotional_expression"
  | "self_disclosure"
  | "unsaid_expression"
  | "owning_expression";

export type StandCategory =
  | "opinions"
  | "disagreement"
  | "asking_for_needs"
  | "boundaries"
  | "self_advocacy"
  | "conviction";

export type ConnectCategory =
  | "conversation"
  | "being_understood"
  | "empathy"
  | "repair"
  | "appreciation"
  | "relational_authenticity";

export type ExploreCategory =
  | "self_curiosity"
  | "values"
  | "identity"
  | "perspective"
  | "future_self"
  | "meaning";

export type PromptCategory =
  | ExpressCategory
  | StandCategory
  | ConnectCategory
  | ExploreCategory;

export type HaeloPrompt = {
  id: string;
  planet: Planet;
  category: PromptCategory;
  prompt: string;
  depth: PromptDepth;
  skill: PromptSkill;
  challenge: PromptChallenge;
  displayLevel: DisplayLevel;
};

export const EXPRESS_SKILLS: readonly ExpressSkill[] = [
  "free_expression",
  "specificity",
  "emotional_expression",
  "self_disclosure",
  "unsaid_expression",
  "authentic_expression",
] as const;

export const STAND_SKILLS: readonly StandSkill[] = [
  "opinion",
  "disagreement",
  "asking_for_needs",
  "boundaries",
  "self_advocacy",
  "conviction",
] as const;

export const CONNECT_SKILLS: readonly ConnectSkill[] = [
  "conversation",
  "clarity",
  "empathy",
  "repair",
  "appreciation",
  "relational_authenticity",
] as const;

export const EXPLORE_SKILLS: readonly ExploreSkill[] = [
  "self_curiosity",
  "values",
  "identity",
  "perspective",
  "future_self",
  "meaning",
] as const;

export const SKILLS_BY_PLANET: Record<Planet, readonly PromptSkill[]> = {
  express: EXPRESS_SKILLS,
  stand: STAND_SKILLS,
  connect: CONNECT_SKILLS,
  explore: EXPLORE_SKILLS,
};

export const PLANETS: readonly Planet[] = [
  "express",
  "stand",
  "connect",
  "explore",
] as const;
