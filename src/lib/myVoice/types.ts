import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { JourneyMetricKey } from "@/lib/journey/metrics";

/** Structured AI output for My Voice — never includes numeric scores. */
export type MyVoiceSummaryContent = {
  openingSynthesis: string;
  takingShape: string;
  stillExploring: string;
  acrossYourVoice: string;
  carryForward?: string | null;
};

export type MyVoiceSummaryStatus = "ready" | "failed";

export type UserVoiceSummaryRow = {
  id: string;
  user_id: string;
  summary_version: number;
  generated_at: string;
  session_count_at_generation: number;
  latest_session_at_generation: string | null;
  completed_orbit_count_at_generation: number;
  synthesis_json: MyVoiceSummaryContent;
  model_version: string | null;
  prompt_version: string;
  status: MyVoiceSummaryStatus;
  created_at: string;
  updated_at: string;
};

export type MyVoicePlanetCoverage = Record<VoicePlanetId, number>;

export type MyVoiceTrendDirection =
  | "rising"
  | "stable"
  | "falling"
  | "variable"
  | "insufficient";

/** Internal trend signal for the LLM — never shown as numbers in UI. */
export type MyVoiceMetricTrend = {
  metric: JourneyMetricKey;
  direction: MyVoiceTrendDirection;
  sampleSize: number;
  /** Qualitative only for the model (e.g. "earlier lower, recent higher"). */
  note: string;
};

export type MyVoiceAnalysisSnippet = {
  recordedAt: string;
  planet: VoicePlanetId | "uncategorized";
  source: "planet" | "daily" | "orbit";
  period: "earlier" | "middle" | "recent";
  strength: string | null;
  observation: string | null;
};

export type MyVoiceOrbitSummativeSnippet = {
  orbitKey: string;
  orbitTitle: string;
  completedAt: string;
  whatBecameClearer: string;
  howYourVoiceMoved: string;
  whatKeptComingUp?: string | null;
};

/**
 * Deterministic evidence package sent to the model.
 * Prefer aggregates + analysis snippets over raw lifetime transcripts.
 */
export type MyVoiceSynthesisInput = {
  totalSessions: number;
  planetCoverage: MyVoicePlanetCoverage;
  timeRange: {
    firstSessionAt: string;
    latestSessionAt: string;
  };
  metricTrends: MyVoiceMetricTrend[];
  representativeAnalyses: MyVoiceAnalysisSnippet[];
  orbitSummaries: MyVoiceOrbitSummativeSnippet[];
};

export type MyVoicePhase =
  | "empty"
  | "beginning"
  | "ready"
  | "generating"
  | "error";

export type MyVoiceViewModel =
  | {
      phase: "empty";
      sessionCount: number;
    }
  | {
      phase: "beginning";
      sessionCount: number;
      planetCoverage: MyVoicePlanetCoverage;
    }
  | {
      phase: "ready";
      sessionCount: number;
      content: MyVoiceSummaryContent;
      generatedAt: string;
      sessionCountAtGeneration: number;
      updatedLabel: string;
      /** True when a fresher summary is being built in the background. */
      refreshing?: boolean;
    }
  | {
      phase: "generating";
      sessionCount: number;
    }
  | {
      phase: "error";
      sessionCount: number;
      message: string;
      /** Stale ready summary if generation failed but cache exists. */
      content?: MyVoiceSummaryContent;
      generatedAt?: string;
      updatedLabel?: string;
    };

export type OpenMyVoiceResult =
  | { ok: true; view: MyVoiceViewModel }
  | { ok: false; error: "unauthenticated" | "forbidden"; message: string };
