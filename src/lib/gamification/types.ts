import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";

export type GamificationEventType =
  | "session_completed"
  | "orbit_completed"
  | "experiment_completed"
  | "weekly_goal_completed"
  | "planet_stage_changed";

export type GamificationEvent =
  | { type: "session_completed"; sessionId: string }
  | { type: "orbit_completed"; orbitProgressId: string }
  | { type: "experiment_completed"; sessionId: string }
  | { type: "weekly_goal_completed"; weekKey: string }
  | {
      type: "planet_stage_changed";
      planet: VoicePlanetId;
      stage: PlanetEvolutionLevel;
      previousStage: PlanetEvolutionLevel;
    };

export type RevealPriority = "immediate" | "deferred";

export type RevealType =
  | "planet_evolution"
  | "weekly_goal_complete"
  | "celestial_discovery"
  | "orbit_reward"
  | "milestone"
  | "experiment_ack";

export type CelestialRewardType =
  | "moon"
  | "ring"
  | "comet"
  | "constellation"
  | "star_cluster"
  | "nebula"
  | "satellite"
  | "aurora"
  | "orbiting_light";

export type CelestialPlacement =
  | "planet_moon"
  | "planet_ring"
  | "universe_background"
  | "outer_space"
  | "my_voice";

export type MilestoneCategory = "exploration" | "skill" | "behavior";

export type CelestialRewardDefinition = {
  rewardKey: string;
  rewardType: CelestialRewardType;
  title: string;
  description: string;
  placement: CelestialPlacement;
  planet?: VoicePlanetId;
  revealPriority: RevealPriority;
};

export type UserCelestialReward = {
  id: string;
  userId: string;
  rewardKey: string;
  rewardType: CelestialRewardType;
  sourceType: string;
  sourceId: string | null;
  title: string;
  description: string | null;
  placement: CelestialPlacement;
  planet: VoicePlanetId | null;
  revealPriority: RevealPriority;
  unlockedAt: string;
  viewedAt: string | null;
};

export type UserMilestone = {
  id: string;
  userId: string;
  milestoneKey: string;
  title: string;
  body: string;
  category: MilestoneCategory;
  sourceMetadata: Record<string, unknown>;
  unlockedAt: string;
  viewedAt: string | null;
};

export type GamificationReveal = {
  id: string;
  userId: string;
  revealKey: string;
  revealType: RevealType;
  priority: RevealPriority;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  viewedAt: string | null;
};

export type WeeklyVoiceProgress = {
  userId: string;
  weekKey: string;
  goalCount: number;
  completedCount: number;
  completedAt: string | null;
};

export type PlanetExperienceCounts = Record<VoicePlanetId, number>;

export type PlanetEvolutionTeaser = {
  planet: VoicePlanetId;
  stage: PlanetEvolutionLevel;
  experienceCount: number;
  remainingToNext: number | null;
  /** Mystery-preserving copy for planet pages */
  hint: string | null;
};

export type ProcessGamificationResult = {
  processed: boolean;
  alreadyProcessed: boolean;
  weekly: WeeklyVoiceProgress | null;
  weeklyJustCompleted: boolean;
  planetStagesChanged: Array<{
    planet: VoicePlanetId;
    stage: PlanetEvolutionLevel;
    previousStage: PlanetEvolutionLevel;
  }>;
  rewardsUnlocked: UserCelestialReward[];
  milestonesUnlocked: UserMilestone[];
  reveals: GamificationReveal[];
};

export type EligibleSessionLite = {
  id: string;
  user_id: string;
  planet: VoicePlanetId;
  status: string;
  source: string | null;
  completed_at: string | null;
  created_at: string;
  orbit_key: string | null;
  orbit_question_key: string | null;
  user_orbit_progress_id: string | null;
  experiment_tried_at: string | null;
};
