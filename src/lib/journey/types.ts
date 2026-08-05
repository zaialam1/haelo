import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { SessionType } from "@/lib/topics/types";

/** Voice planet, or uncategorized for legacy / non-planet sessions */
export type JourneyPlanet = VoicePlanetId | "uncategorized";

export type JourneyPlanetFilter = "all" | VoicePlanetId;

/** A single audio/transcript clip within a speaking session */
export type JourneyClip = {
  id: string;
  promptText: string;
  questionId: string | null;
  recordedAt: string;
  audioUrl: string | null;
  transcript: string | null;
  durationSeconds: number | null;
};

/**
 * One completed Attune speaking session → one constellation star.
 * Derived from reflection rows (grouped by session_id when present).
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
  clips: JourneyClip[];
  /** User-authored reflection if present (future-ready) */
  userReflection: string | null;
  /** Attune analysis / observation if present */
  attuneObservation: string | null;
  voiceNotes: string[];
  themeLabel: string | null;
  /** Comparison note between attempts (future-ready) */
  changeObservation: string | null;
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
