/**
 * Development-only Journey preview fixture.
 *
 * HOW TO ENABLE
 * -------------
 * Option A — flip the flag below to `true` while developing (keep false in commits).
 * Option B — visit `/journey?preview=1` in a development build.
 *
 * HOW TO DISABLE
 * --------------
 * Set JOURNEY_PREVIEW_ENABLED to false AND remove `?preview=1` from the URL.
 * Preview data is never written to Supabase and is ignored in production builds.
 */

import type { JourneySession } from "@/lib/journey/types";

/** Flip to true only while iterating on Journey UI with sample stars. */
export const JOURNEY_PREVIEW_ENABLED = false;

const NOW = Date.now();
const day = 24 * 60 * 60 * 1000;

function isoDaysAgo(n: number, hour = 15): string {
  const d = new Date(NOW - n * day);
  d.setHours(hour, 20, 0, 0);
  return d.toISOString();
}

/** 4 sample sessions across planets — in-memory only */
export const JOURNEY_PREVIEW_SESSIONS: JourneySession[] = [
  {
    sessionId: "preview-express-1",
    recordedAt: isoDaysAgo(12),
    planet: "express",
    planetLabel: "Express",
    prompt: "What's something you've been holding in that you wish you could say out loud?",
    promptId: "express_014",
    sessionType: "main",
    clips: [
      {
        id: "preview-clip-e1",
        promptText:
          "What's something you've been holding in that you wish you could say out loud?",
        questionId: "express_014",
        recordedAt: isoDaysAgo(12),
        audioUrl: null,
        transcript:
          "I've been wanting to tell my friend that I need more space sometimes, but I keep worrying they'll take it the wrong way.",
        durationSeconds: 48,
      },
    ],
    userReflection: null,
    haeloObservation: null,
    journeyMetrics: [
      { metric: "voice_confidence", score: 58, level: 3, status: "scored" },
      { metric: "expressiveness", score: 72, level: 4, status: "scored" },
    ],
    voiceNotes: [],
    themeLabel: null,
    changeObservation: null,
    isMilestone: false,
  },
  {
    sessionId: "preview-stand-1",
    recordedAt: isoDaysAgo(7),
    planet: "stand",
    planetLabel: "Stand",
    prompt: "What's an opinion you have that you usually keep to yourself?",
    promptId: "stand_003",
    sessionType: "main",
    clips: [
      {
        id: "preview-clip-s1a",
        promptText:
          "What's an opinion you have that you usually keep to yourself?",
        questionId: "stand_003",
        recordedAt: isoDaysAgo(7),
        audioUrl: null,
        transcript:
          "I think group projects would be better if people could choose roles instead of everyone pretending they want to do everything.",
        durationSeconds: 52,
      },
      {
        id: "preview-clip-s1b",
        promptText:
          "What's an opinion you have that you usually keep to yourself?",
        questionId: "stand_003",
        recordedAt: isoDaysAgo(7, 16),
        audioUrl: null,
        transcript:
          "Actually… I also think it's okay to say you don't want to lead. Wanting a quieter role isn't the same as not caring.",
        durationSeconds: 41,
      },
    ],
    userReflection: "I sounded more sure the second time.",
    haeloObservation:
      "You named a clear preference and then owned a quieter stance without apologizing for it.",
    journeyMetrics: [
      { metric: "voice_confidence", score: 74, level: 4, status: "scored" },
      { metric: "directness", score: 81, level: 5, status: "scored" },
    ],
    voiceNotes: ["Clearer stance on the second try"],
    themeLabel: null,
    changeObservation:
      "Your second take felt steadier — less hedging, more ownership.",
    isMilestone: false,
  },
  {
    sessionId: "preview-connect-1",
    recordedAt: isoDaysAgo(3),
    planet: "connect",
    planetLabel: "Connect",
    prompt: "How do you usually let someone know you care about them?",
    promptId: "connect_008",
    sessionType: "main",
    clips: [
      {
        id: "preview-clip-c1",
        promptText:
          "How do you usually let someone know you care about them?",
        questionId: "connect_008",
        recordedAt: isoDaysAgo(3),
        audioUrl: null,
        transcript:
          "I check in with small messages. Not big speeches — just noticing when someone's quiet and asking if they're okay.",
        durationSeconds: 39,
      },
    ],
    userReflection: null,
    haeloObservation: null,
    journeyMetrics: [
      { metric: "voice_confidence", score: 66, level: 4, status: "scored" },
      { metric: "listener_clarity", score: 63, level: 4, status: "scored" },
    ],
    voiceNotes: [],
    themeLabel: null,
    changeObservation: null,
    isMilestone: false,
  },
  {
    sessionId: "preview-explore-1",
    recordedAt: isoDaysAgo(1),
    planet: "explore",
    planetLabel: "Explore",
    prompt: "What part of yourself are you still figuring out?",
    promptId: "explore_011",
    sessionType: "daily",
    clips: [
      {
        id: "preview-clip-x1",
        promptText: "What part of yourself are you still figuring out?",
        questionId: "explore_011",
        recordedAt: isoDaysAgo(1),
        audioUrl: null,
        transcript:
          "How much I want to be around people versus how much I need alone time. It changes week to week.",
        durationSeconds: 44,
      },
    ],
    userReflection: null,
    haeloObservation: null,
    journeyMetrics: [
      { metric: "voice_confidence", score: 45, level: 3, status: "scored" },
      { metric: "thought_clarity", score: 70, level: 4, status: "scored" },
    ],
    voiceNotes: [],
    themeLabel: null,
    changeObservation: null,
    isMilestone: false,
  },
];

export function shouldUseJourneyPreview(opts: {
  forcePreviewParam: boolean;
  hasRealSessions: boolean;
}): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (JOURNEY_PREVIEW_ENABLED) return true;
  // URL ?preview=1 only — never auto-inject when the user has real history
  if (opts.forcePreviewParam) return true;
  return false;
}
