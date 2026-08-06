import type { Planet } from "@/lib/prompts";
import type { SessionSource } from "@/lib/sessions/types";
import {
  deriveSpeechMetrics,
  type SpeechMetrics,
} from "@/lib/sessions/speechMetrics";

/**
 * Acoustic / prosody features from the recording itself.
 *
 * Currently unused: Whisper returns plain text only, and the analysis LLM
 * does not receive the audio file. Keep this shape so richer delivery analysis
 * can be added later without rewriting the prompt contract.
 */
export type AcousticMetrics =
  | {
      available: false;
      reason: string;
    }
  | {
      available: true;
      /** Reserved fields — populate only when truly computed. */
      averagePauseMs?: number;
      pauseCount?: number;
      pitchVariation?: number;
      energyVariation?: number;
      volumeConsistency?: number;
    };

export type OrbitAnalysisContext = {
  orbitTitle: string;
  orbitSituation: string;
  orbitQuestionKey?: string;
};

export type AnalysisQuestionContext = {
  sourceType: SessionSource;
  promptId?: string | null;
  orbit?: OrbitAnalysisContext | null;
};

/**
 * Canonical input for individual session analysis (Universe + Orbit).
 * Extend this object rather than changing the prompt ad hoc.
 */
export type SessionAnalysisInput = {
  sessionId: string;
  planet: Planet | string;
  questionPrompt: string;
  transcript: string | null;
  sourceType: SessionSource;
  attemptNumber: number;
  priorTranscript?: string | null;
  speechMetrics: SpeechMetrics | null;
  acousticMetrics: AcousticMetrics;
  questionContext: AnalysisQuestionContext;
  durationSeconds?: number | null;
};

export type BuildSessionAnalysisInputArgs = {
  sessionId: string;
  planet: Planet | string;
  promptText: string;
  transcript: string | null;
  sourceType: SessionSource;
  attemptNumber: number;
  priorTranscript?: string | null;
  durationSeconds?: number | null;
  promptId?: string | null;
  orbit?: OrbitAnalysisContext | null;
};

export function unavailableAcousticMetrics(
  reason = "No acoustic analysis is computed yet. The model receives transcript-derived speech metrics only, not the recording.",
): AcousticMetrics {
  return { available: false, reason };
}

/**
 * Build the analysis input object used by the LLM provider boundary.
 */
export function buildSessionAnalysisInput(
  args: BuildSessionAnalysisInputArgs,
): SessionAnalysisInput {
  const transcript = args.transcript?.trim() ? args.transcript.trim() : null;
  const speechMetrics = transcript
    ? deriveSpeechMetrics(transcript, args.durationSeconds)
    : null;

  return {
    sessionId: args.sessionId,
    planet: args.planet,
    questionPrompt: args.promptText,
    transcript,
    sourceType: args.sourceType,
    attemptNumber: args.attemptNumber,
    priorTranscript: args.priorTranscript?.trim() || undefined,
    speechMetrics,
    acousticMetrics: unavailableAcousticMetrics(),
    questionContext: {
      sourceType: args.sourceType,
      promptId: args.promptId ?? null,
      orbit: args.orbit ?? null,
    },
    durationSeconds: args.durationSeconds ?? null,
  };
}
