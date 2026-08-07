import type { JourneyMetricResult } from "@/lib/journey/metrics";
import type { Planet } from "@/lib/prompts";

export type SessionStatus = "in_progress" | "completed";

export type SessionSource = "planet" | "daily" | "orbit";

/** null = not started; pending = processing; ready = complete; failed = failed */
export type AnalysisStatus = "pending" | "ready" | "failed";

export type TranscriptStatus =
  | "not_started"
  | "pending"
  | "ready"
  | "failed"
  | "unavailable";

export type FeelingReflection = "held_back" | "in_between" | "said_it";

export type SoundedLikeYou = "not_really" | "mostly" | "yes";

export type AuthenticityChoice = "first" | "second" | "mix";

export type SessionRow = {
  id: string;
  user_id: string;
  planet: Planet;
  prompt_id: string;
  prompt_text_snapshot: string;
  status: SessionStatus;
  source: SessionSource;
  /** Present when source === "orbit" */
  orbit_key: string | null;
  orbit_question_key: string | null;
  user_orbit_progress_id: string | null;
  orbit_version: number | null;
  user_reflection: string | null;
  feeling_reflection: FeelingReflection | null;
  sounded_like_you: SoundedLikeYou | null;
  authenticity_choice: AuthenticityChoice | null;
  analysis_status: AnalysisStatus | null;
  created_at: string;
  completed_at: string | null;
};

export type SessionAttemptRow = {
  id: string;
  session_id: string;
  attempt_number: number;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number | null;
  duration_seconds: number;
  transcript: string | null;
  transcript_status: TranscriptStatus | null;
  created_at: string;
};

export type AnalysisEvidence = {
  text: string;
  startTime?: number;
  endTime?: number;
};

export type SessionAnalysisRow = {
  id: string;
  session_id: string;
  status: AnalysisStatus;
  strength_title: string | null;
  strength_description: string | null;
  observation_title: string | null;
  observation_description: string | null;
  evidence: AnalysisEvidence[] | null;
  experiment_title: string | null;
  experiment_instruction: string | null;
  comparison_observation: string | null;
  /** Internal Journey scores — never shown in SessionAnalysisPanel */
  journey_metrics?: JourneyMetricResult[] | null;
  journey_metrics_version?: string | null;
  journey_metrics_prompt_version?: string | null;
  journey_metrics_model?: string | null;
  journey_metrics_scored_at?: string | null;
  created_at: string;
  completed_at: string | null;
};

/** Typed view of analysis for UI (null fields when not ready). */
export type SessionAnalysis = {
  sessionId: string;
  status: AnalysisStatus;
  strength?: {
    title: string;
    description: string;
  };
  observation?: {
    title: string;
    description: string;
  };
  evidence?: AnalysisEvidence[];
  experiment?: {
    title: string;
    instruction: string;
  };
  comparisonObservation?: string;
  /**
   * Journey visualization metrics. Persisted with analysis but omitted from
   * SessionAnalysisPanel / post-recording review UI.
   */
  journeyMetrics?: JourneyMetricResult[];
  journeyMetricsVersion?: string | null;
  journeyMetricsModel?: string | null;
  journeyMetricsScoredAt?: string | null;
  createdAt?: string;
  completedAt?: string;
};

export type SessionWithAttempts = SessionRow & {
  session_attempts: SessionAttemptRow[];
  session_analyses?: SessionAnalysisRow[] | SessionAnalysisRow | null;
};

export type SaveSessionInput = {
  planet: Planet;
  promptId: string;
  promptTextSnapshot: string;
  blob: Blob;
  durationSeconds: number;
  mimeType: string;
  source?: SessionSource;
  /** Orbit metadata — required when source === "orbit" */
  orbitKey?: string;
  orbitQuestionKey?: string;
  userOrbitProgressId?: string;
  orbitVersion?: number;
  /** When set, adds an attempt to an existing session (e.g. Try Again). */
  sessionId?: string;
  attemptNumber?: number;
  /** Live browser transcript when available (real speech, not invented). */
  transcript?: string | null;
};

export type SaveSessionResult = {
  sessionId: string;
  attemptId: string;
  storagePath: string;
};

export type SessionReflectionUpdate = {
  feelingReflection?: FeelingReflection | null;
  soundedLikeYou?: SoundedLikeYou | null;
  userReflection?: string | null;
};

export const FEELING_OPTIONS: {
  id: FeelingReflection;
  label: string;
}[] = [
  { id: "held_back", label: "Held back" },
  { id: "in_between", label: "Somewhere in between" },
  { id: "said_it", label: "Said what I meant" },
];

export const SOUNDED_LIKE_YOU_OPTIONS: {
  id: SoundedLikeYou;
  label: string;
}[] = [
  { id: "not_really", label: "Not really" },
  { id: "mostly", label: "Mostly" },
  { id: "yes", label: "Yes" },
];

export const AUTHENTICITY_OPTIONS: {
  id: AuthenticityChoice;
  label: string;
}[] = [
  { id: "first", label: "First" },
  { id: "second", label: "Second" },
  { id: "mix", label: "A mix of both" },
];
