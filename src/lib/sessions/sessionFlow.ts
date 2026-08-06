import type { Planet } from "@/lib/prompts";
import type { SessionSource } from "@/lib/sessions/types";

/**
 * Navigation + copy for the shared record → review → retry → complete pipeline.
 * Planet and Orbit journeys share the same session engine with different wrappers.
 */
export type SessionFlowConfig = {
  source: SessionSource;
  /** Where "Exit" / back links go. */
  exitHref: string;
  exitLabel: string;
  /** Built after attempt 1 is saved. */
  reviewHref: (sessionId: string) => string;
  retryHref: (sessionId: string) => string;
  compareHref: (sessionId: string) => string;
  /**
   * Where to go after the user finishes / looks later.
   * For Orbits this usually resumes the Orbit (next question or synthesis).
   */
  afterCompleteHref: (sessionId: string) => string;
  finishLabel: string;
  lookLaterLabel: string;
  reviewTitle?: string;
  completeTitle?: string;
  completeBody?: string;
  journeyHref?: string;
  /** Optional Orbit metadata for saveSessionAttempt. */
  orbit?: {
    orbitKey: string;
    orbitQuestionKey: string;
    userOrbitProgressId: string;
    orbitVersion: number;
  };
};

export function planetSessionFlow(planet: Planet): SessionFlowConfig {
  return {
    source: "planet",
    exitHref: `/${planet}`,
    exitLabel: "Exit",
    reviewHref: (sessionId) => `/session/${planet}/${sessionId}/review`,
    retryHref: (sessionId) => `/session/${planet}/${sessionId}/retry`,
    compareHref: (sessionId) => `/session/${planet}/${sessionId}/compare`,
    afterCompleteHref: (sessionId) =>
      `/session/${planet}/${sessionId}/complete`,
    finishLabel: "Finish Session",
    lookLaterLabel: "Look at Analysis Later",
    reviewTitle: "Session Review",
    completeTitle: "Session complete",
    journeyHref: `/journey?planet=${planet}`,
  };
}

export function orbitSessionFlow(opts: {
  orbitKey: string;
  planet: Planet;
  orbitQuestionKey: string;
  userOrbitProgressId: string;
  orbitVersion: number;
}): SessionFlowConfig {
  const { orbitKey } = opts;
  return {
    source: "orbit",
    exitHref: `/orbits/${orbitKey}`,
    exitLabel: "Leave Orbit",
    reviewHref: (sessionId) =>
      `/orbits/${orbitKey}/session/${sessionId}/review`,
    retryHref: (sessionId) =>
      `/orbits/${orbitKey}/session/${sessionId}/retry`,
    compareHref: (sessionId) =>
      `/orbits/${orbitKey}/session/${sessionId}/compare`,
    // Resume engine decides next question vs synthesis.
    afterCompleteHref: () => `/orbits/${orbitKey}/reflect`,
    finishLabel: "Continue Orbit",
    lookLaterLabel: "Look at Analysis Later",
    reviewTitle: "Reflection Review",
    completeTitle: "Reflection saved",
    journeyHref: "/journey",
    orbit: {
      orbitKey: opts.orbitKey,
      orbitQuestionKey: opts.orbitQuestionKey,
      userOrbitProgressId: opts.userOrbitProgressId,
      orbitVersion: opts.orbitVersion,
    },
  };
}

/** Used when reviewing an existing orbit session without re-deriving from progress. */
export function orbitSessionFlowFromSession(opts: {
  orbitKey: string;
  planet: Planet;
  orbitQuestionKey: string | null;
  userOrbitProgressId: string | null;
  orbitVersion: number | null;
}): SessionFlowConfig {
  return orbitSessionFlow({
    orbitKey: opts.orbitKey,
    planet: opts.planet,
    orbitQuestionKey: opts.orbitQuestionKey ?? "",
    userOrbitProgressId: opts.userOrbitProgressId ?? "",
    orbitVersion: opts.orbitVersion ?? 1,
  });
}
