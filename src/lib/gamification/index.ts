export { gamificationConfig, WEEKLY_VOICE_GOAL, PLANET_STAGE_THRESHOLDS } from "./config";
export {
  isEligibleReflection,
  countsTowardWeeklyGoal,
  countsTowardPlanetVisualGrowth,
  isExperimentTry,
} from "./eligibility";
export {
  evolutionStageFromExperience,
  planetEvolutionTeaser,
  reflectionsUntilNextStage,
  detectStageChanges,
  stagesFromExperience,
} from "./planetGrowth";
export { weekKeyFromDate, formatLocalDateKey } from "./week";
export { processGamificationEvent } from "./process";
export {
  evaluateCelestialDiscoveries,
  unlockOrbitReward,
} from "./discoveries";
export { evaluateMilestones, detectSkillRangeShift } from "./milestones";
export {
  CELESTIAL_CATALOG,
  orbitRewardDefinition,
  orbitRewardKey,
  getCatalogReward,
} from "./catalog";
export {
  trackGamificationEvent,
  GamificationAnalyticsEvents,
} from "./analytics";
export type * from "./types";
