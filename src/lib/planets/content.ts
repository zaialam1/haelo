import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";

export type PlanetRecentSession = {
  id: string;
  dateLabel: string;
  title: string;
  /** Route-ready: Journey session detail / side panel later */
  href: string;
};

export type PlanetPageContent = {
  id: VoicePlanetId;
  label: string;
  /** Hero short line */
  shortLine: string;
  /** Hero supporting sentence */
  description: string;
  tryThis: string;
  sessionCta: string;
  /** Wired to /session/[planet] */
  sessionHref: string;
  /** Empty until the user has practiced here */
  growth: string[];
  growthEmpty: string;
  /** Empty until the user has sessions */
  recentSessions: PlanetRecentSession[];
  recentEmpty: string;
  journeyHref: string;
  journeyLabel: string;
  /** Page atmosphere — subtle differentiation within the universe */
  atmosphere: "warm" | "deep" | "soft" | "spark";
};

/**
 * Progression hooks for planet visuals.
 * Values will eventually be derived from practice history.
 */
export type PlanetProgression = {
  rings: boolean;
  moons: number;
  glow: number;
  showOrbitalDust: boolean;
};

export const DEFAULT_PROGRESSION: PlanetProgression = {
  rings: false,
  moons: 0,
  glow: 0.55,
  showOrbitalDust: false,
};

export function getPlanetProgression(id: VoicePlanetId): PlanetProgression {
  const planet = getVoicePlanetById(id);
  if (!planet) return DEFAULT_PROGRESSION;
  return {
    rings: planet.rings,
    moons: planet.moons,
    glow: planet.glow,
    showOrbitalDust: planet.atmosphere === "sparkle",
  };
}

export const PLANET_PAGES: Record<VoicePlanetId, PlanetPageContent> = {
  express: {
    id: "express",
    label: "Express",
    shortLine: "Say what you really think and feel.",
    description:
      "Practice putting your thoughts and feelings into words without over-editing yourself.",
    tryThis:
      "What's something you've been thinking about lately but haven't really said out loud?",
    sessionCta: "Start Express Session",
    sessionHref: "/session/express",
    growth: [],
    growthEmpty:
      "After a few sessions here, gentle observations about how you express yourself will appear.",
    recentSessions: [],
    recentEmpty: "No Express sessions yet. Start one above to begin.",
    journeyHref: "/journey?planet=express",
    journeyLabel: "See all Express sessions in Journey →",
    atmosphere: "warm",
  },
  stand: {
    id: "stand",
    label: "Stand",
    shortLine: "Speak up and stand behind what you believe.",
    description:
      "Practice opinions, disagreement, boundaries, and asking for what you need.",
    tryThis:
      "Someone disagrees with an opinion you care about. Explain what you think without apologizing for having the opinion.",
    sessionCta: "Start Stand Session",
    sessionHref: "/session/stand",
    growth: [],
    growthEmpty:
      "After a few sessions here, gentle observations about how you stand up for yourself will appear.",
    recentSessions: [],
    recentEmpty: "No Stand sessions yet. Start one above to begin.",
    journeyHref: "/journey?planet=stand",
    journeyLabel: "See all Stand sessions in Journey →",
    atmosphere: "deep",
  },
  connect: {
    id: "connect",
    label: "Connect",
    shortLine: "Build confidence communicating with other people.",
    description:
      "Practice being open, clear, and understood in conversations that matter.",
    tryThis:
      "A friend did something that bothered you. What would you want to say to them?",
    sessionCta: "Start Connect Session",
    sessionHref: "/session/connect",
    growth: [],
    growthEmpty:
      "After a few sessions here, gentle observations about how you connect with others will appear.",
    recentSessions: [],
    recentEmpty: "No Connect sessions yet. Start one above to begin.",
    journeyHref: "/journey?planet=connect",
    journeyLabel: "See all Connect sessions in Journey →",
    atmosphere: "soft",
  },
  explore: {
    id: "explore",
    label: "Explore",
    shortLine: "Discover what you think and what matters to you.",
    description:
      "Use your voice to explore your ideas, values, interests, and identity.",
    tryThis: "What's something you've changed your mind about recently?",
    sessionCta: "Start Explore Session",
    sessionHref: "/session/explore",
    growth: [],
    growthEmpty:
      "After a few sessions here, gentle observations about what you're discovering will appear.",
    recentSessions: [],
    recentEmpty: "No Explore sessions yet. Start one above to begin.",
    journeyHref: "/journey?planet=explore",
    journeyLabel: "See all Explore sessions in Journey →",
    atmosphere: "spark",
  },
};

export function getPlanetPageContent(id: VoicePlanetId): PlanetPageContent {
  return PLANET_PAGES[id];
}
