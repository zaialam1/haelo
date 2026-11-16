import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";

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
 * @deprecated Prefer PlanetEvolutionLevel + EvolvedPlanet.
 * Kept as a thin adapter for any leftover call sites.
 */
export type PlanetProgression = {
  level: PlanetEvolutionLevel;
  rings: boolean;
  moons: number;
  glow: number;
  showOrbitalDust: boolean;
};

export const PLANET_PAGES: Record<VoicePlanetId, PlanetPageContent> = {
  express: {
    id: "express",
    label: "Express",
    shortLine: "Put what's in your head into words.",
    tryThis:
      "What's something you've been thinking about lately but haven't really said out loud?",
    sessionCta: "Start Express session",
    sessionHref: "/session/express",
    growth: [],
    growthEmpty:
      "Feedback from your Express sessions will collect here.",
    recentSessions: [],
    recentEmpty: "No Express sessions yet.",
    journeyHref: "/journey?planet=express",
    journeyLabel: "See all Express sessions in Journey →",
    atmosphere: "warm",
  },
  stand: {
    id: "stand",
    label: "Stand",
    shortLine: "Say what you think without backing down.",
    tryThis:
      "Someone disagrees with an opinion you care about. Explain what you think without apologizing for having the opinion.",
    sessionCta: "Start Stand session",
    sessionHref: "/session/stand",
    growth: [],
    growthEmpty:
      "Feedback from your Stand sessions will collect here.",
    recentSessions: [],
    recentEmpty: "No Stand sessions yet.",
    journeyHref: "/journey?planet=stand",
    journeyLabel: "See all Stand sessions in Journey →",
    atmosphere: "deep",
  },
  connect: {
    id: "connect",
    label: "Connect",
    shortLine: "Say it so the other person gets it.",
    tryThis:
      "A friend did something that bothered you. What would you want to say to them?",
    sessionCta: "Start Connect session",
    sessionHref: "/session/connect",
    growth: [],
    growthEmpty:
      "Feedback from your Connect sessions will collect here.",
    recentSessions: [],
    recentEmpty: "No Connect sessions yet.",
    journeyHref: "/journey?planet=connect",
    journeyLabel: "See all Connect sessions in Journey →",
    atmosphere: "soft",
  },
  explore: {
    id: "explore",
    label: "Explore",
    shortLine: "Think out loud and see where you land.",
    tryThis: "What's something you've changed your mind about recently?",
    sessionCta: "Start Explore session",
    sessionHref: "/session/explore",
    growth: [],
    growthEmpty:
      "Feedback from your Explore sessions will collect here.",
    recentSessions: [],
    recentEmpty: "No Explore sessions yet.",
    journeyHref: "/journey?planet=explore",
    journeyLabel: "See all Explore sessions in Journey →",
    atmosphere: "spark",
  },
};

export function getPlanetPageContent(id: VoicePlanetId): PlanetPageContent {
  return PLANET_PAGES[id];
}
