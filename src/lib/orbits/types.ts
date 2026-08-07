import type { Planet } from "@/lib/prompts";

/** Four Orbit discovery regions. */
export type OrbitRegionKey =
  | "friendships_people"
  | "speaking_up"
  | "figuring_things_out"
  | "putting_yourself_out_there";

export type OrbitStatus = "not_started" | "in_progress" | "completed";

export type OrbitQuestionStatus =
  | "not_started"
  | "in_progress"
  | "completed";

/** Orbit questions never advance normal planet prompt unlock. */
export type NormalProgressionImpact = "none";

export type OrbitContentOrigin = "orbit_original";

export type OrbitSourceType = "orbit";

export type OrbitRegionDefinition = {
  key: OrbitRegionKey;
  title: string;
  description: string;
  sortOrder: number;
};

export type OrbitQuestionDefinition = {
  questionKey: string;
  sequenceNumber: 1 | 2 | 3 | 4 | 5 | 6;
  planet: Planet;
  prompt: string;
  explanation: string;
  sourceType: OrbitSourceType;
  contentOrigin: OrbitContentOrigin;
  normalProgressionImpact: NormalProgressionImpact;
  contributesToPlanetExperience: true;
  contributesToPlanetVisualGrowth: true;
  appearsInPlanetJourney: true;
  appearsIndividuallyInMasterJourney: false;
  recordingRequired: true;
  transcriptEnabled: true;
  individualAnalysisEnabled: true;
  retryEnabled: true;
};

export type OrbitDefinition = {
  orbitKey: string;
  title: string;
  regionKey: OrbitRegionKey;
  shortDescription: string;
  situation: string;
  openingTitle: string;
  openingBody: string;
  /** Display estimate; UI shows "About {estimatedMinutes} minutes". */
  estimatedMinutes: number;
  questionCount: 6;
  completionAnalysisEnabled: true;
  isActive: boolean;
  sortOrder: number;
  version: number;
  questions: readonly OrbitQuestionDefinition[];
  /**
   * Reserved for future counselor / recommendation features.
   * Not used in the teen Orbit experience yet.
   */
  meta?: {
    recommendedFor?: string[];
    professionalTags?: string[];
    shareSlug?: string;
    visibility?: "teen" | "counselor" | "shared";
    ageBand?: string;
  };
};

export type OrbitSummativeAnalysisContent = {
  whatBecameClearer: string;
  whatKeptComingUp: string;
  howYourVoiceMoved: string;
  carryThisWithYou: string;
  practicePrompt?: string | null;
};

export type UserOrbitProgressRow = {
  id: string;
  user_id: string;
  orbit_key: string;
  status: OrbitStatus;
  current_question_index: number;
  started_at: string | null;
  last_activity_at: string | null;
  completed_at: string | null;
  summative_analysis_id: string | null;
  orbit_version: number;
  orbit_title_snapshot: string | null;
  source_recommendation_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrbitSummativeAnalysisRow = {
  id: string;
  user_id: string;
  orbit_key: string;
  user_orbit_progress_id: string;
  status: "pending" | "ready" | "failed";
  analysis_json: OrbitSummativeAnalysisContent | null;
  practice_prompt: string | null;
  model_metadata: Record<string, unknown> | null;
  version: number;
  created_at: string;
  completed_at: string | null;
};

export type OrbitListItem = {
  definition: OrbitDefinition;
  progress: UserOrbitProgressRow | null;
  planetsInvolved: Planet[];
  planetSequence: Planet[];
};
