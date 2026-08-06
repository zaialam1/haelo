import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { OrbitSummativeAnalysisContent } from "@/lib/orbits/types";
import type { SessionType } from "@/lib/topics/types";
import type { SessionSource } from "@/lib/sessions/types";

/** Voice planet, or uncategorized for legacy / non-planet sessions */
export type JourneyPlanet = VoicePlanetId | "uncategorized";

export type JourneyPlanetFilter = "all" | VoicePlanetId;

/** How this star entered Journey history. */
export type JourneySourceType = "planet" | "daily" | "orbit" | "reflection";

/**
 * Visual treatment for a constellation node.
 * Centralized so rendering does not scatter source checks.
 */
export type JourneyNodeVariant =
  | "normal"
  | "daily"
  | "orbit"
  | "orbit_cluster";

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
 * One completed Haelo speaking session → one constellation star,
 * OR one completed Orbit → one master-Journey cluster node.
 *
 * Derived from practice sessions / reflections (no duplicate Journey table).
 *
 * Display rules:
 * - Planet-filtered Journey: individual Orbit responses (orbit variant).
 * - Master Journey: completed Orbits as clusters; orbit individuals hidden.
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
  /** Sequence within an Orbit (1–6) when known from definition. */
  orbitSequenceNumber?: number | null;
  /** True when this node is a completed Orbit cluster in master Journey. */
  isOrbitCluster?: boolean;
  /** Cluster-only: when the Orbit was started */
  orbitStartedAt?: string | null;
  /** Cluster-only: when the Orbit was completed */
  orbitCompletedAt?: string | null;
  orbitRegionKey?: string | null;
  orbitRegionTitle?: string | null;
  orbitSituation?: string | null;
  orbitShortDescription?: string | null;
  /** Distinct planets involved in the Orbit (cluster) */
  orbitPlanets?: VoicePlanetId[];
  /**
   * Cluster-only: canonical individual Orbit reflections in sequence order.
   * References the same JourneySession records used in planet Journey.
   */
  orbitResponses?: JourneySession[];
  /** Cluster-only: persisted summative analysis (never regenerated on Journey load) */
  summativeAnalysis?: OrbitSummativeAnalysisContent | null;
  summativeStatus?: "pending" | "ready" | "failed" | "missing";
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

/** Resolve visual node variant from a Journey session / cluster. */
export function getJourneyNodeVariant(
  session: Pick<
    JourneySession,
    "isOrbitCluster" | "sourceType" | "sessionType"
  >,
): JourneyNodeVariant {
  if (session.isOrbitCluster) return "orbit_cluster";
  if (session.sourceType === "orbit") return "orbit";
  if (session.sourceType === "daily" || session.sessionType === "daily") {
    return "daily";
  }
  return "normal";
}

export function isOrbitIndividualSession(
  session: Pick<JourneySession, "isOrbitCluster" | "sourceType">,
): boolean {
  return session.sourceType === "orbit" && !session.isOrbitCluster;
}
