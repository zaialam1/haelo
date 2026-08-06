import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { SessionType } from "@/lib/topics/types";
import type { SessionSource } from "@/lib/sessions/types";

/** Voice planet, or uncategorized for legacy / non-planet sessions */
export type JourneyPlanet = VoicePlanetId | "uncategorized";

export type JourneyPlanetFilter = "all" | VoicePlanetId;

/** How this star entered Journey history. */
export type JourneySourceType = "planet" | "daily" | "orbit" | "reflection";

/** A single audio/transcript clip within a speaking session */
export type JourneyClip = {
  id: string;
  promptText: string;
  questionId: string | null;
  recordedAt: string;
  audioUrl: string | null;
  transcript: string | null;
  transcriptStatus?: string | null;
  durationSeconds: number | null;
  attemptNumber?: number;
};

/**
 * One completed Haelo speaking session → one constellation star.
 * Derived from practice sessions or reflection rows (grouped by session_id).
 *
 * Orbit note:
 * - Planet-filtered Journey may show individual Orbit responses (with orbit metadata).
 * - Master Journey should cluster completed Orbits (presentation rule; UI later).
 */
export type JourneySession = {
  sessionId: string;
  recordedAt: string;
  planet: JourneyPlanet;
  planetLabel: string;
  /** Primary prompt shown on the node / panel */
  prompt: string;
  promptId: string | null;
  sessionType: SessionType | null;
  /** Recording origin — planet practice, daily, orbit, or legacy reflection */
  sourceType?: JourneySourceType;
  /** Present when sourceType === "orbit" */
  orbitKey?: string | null;
  orbitQuestionKey?: string | null;
  orbitTitle?: string | null;
  userOrbitProgressId?: string | null;
  /** True when this node is a completed Orbit cluster in master Journey (future UI). */
  isOrbitCluster?: boolean;
  clips: JourneyClip[];
  /** User-authored written reflection if present */
  userReflection: string | null;
  feelingReflection?: string | null;
  soundedLikeYou?: string | null;
  authenticityChoice?: string | null;
  /** Analysis pipeline status */
  analysisStatus?: string | null;
  /** Haelo analysis / observation if present */
  haeloObservation: string | null;
  analysisStrength?: { title: string; description: string } | null;
  analysisObservation?: { title: string; description: string } | null;
  analysisEvidence?: Array<{
    text: string;
    startTime?: number;
    endTime?: number;
  }> | null;
  analysisExperiment?: { title: string; instruction: string } | null;
  voiceNotes: string[];
  themeLabel: string | null;
  /** Comparison note between attempts */
  changeObservation: string | null;
  /** Deep-link into session review when available */
  reviewHref?: string | null;
  /** Future milestone support — unused for now */
  isMilestone?: boolean;
};

/** Layout-ready node for the constellation canvas (normalized 0–1 coords) */
export type JourneyNode = JourneySession & {
  x: number;
  y: number;
  /** Visual size scale ~0.7–1.3 */
  size: number;
};

export type JourneyMonthAnchor = {
  key: string;
  label: string;
  /** Full label e.g. "August 2026" when span covers multiple years */
  longLabel: string;
  /** 0–1 along the time axis */
  x: number;
};

export type JourneyViewModel = {
  sessions: JourneySession[];
  nodes: JourneyNode[];
  monthAnchors: JourneyMonthAnchor[];
  isEmpty: boolean;
  /** True when showing the isolated development fixture */
  isPreview: boolean;
  beganAt: string | null;
};

/** Map session.source to Journey sourceType. */
export function journeySourceFromSessionSource(
  source: SessionSource | string | null | undefined,
): JourneySourceType {
  if (source === "orbit") return "orbit";
  if (source === "daily") return "daily";
  return "planet";
}
