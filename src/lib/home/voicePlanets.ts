export type VoicePlanetId = "express" | "stand" | "connect" | "explore";

export type VoicePlanetSize = "sm" | "md" | "lg";

/** Surface / atmosphere traits — ready for future progression visuals */
export type VoicePlanetDetail = "smooth" | "clouds" | "terrain" | "rings";

export type VoicePlanetAtmosphere = "none" | "haze" | "warm" | "sparkle";

export type VoicePlanet = {
  id: VoicePlanetId;
  label: string;
  tagline: string;
  href: `/${VoicePlanetId}`;
  /** Brand-derived fill color */
  color: string;
  /** Fixed position as % of the map (from top-left) */
  x: number;
  y: number;
  size: VoicePlanetSize;
  brightness: number;
  detail: VoicePlanetDetail;
  glow: number;
  moons: number;
  /** Whether to render orbital rings (progression hook) */
  rings: boolean;
  atmosphere: VoicePlanetAtmosphere;
};

export const VOICE_PLANETS: VoicePlanet[] = [
  {
    id: "express",
    label: "Express",
    tagline: "Say what you really think and feel.",
    href: "/express",
    color: "#E8A0BF",
    x: 17,
    y: 28,
    size: "lg",
    brightness: 0.94,
    detail: "smooth",
    glow: 0.55,
    moons: 0,
    rings: false,
    atmosphere: "warm",
  },
  {
    id: "stand",
    label: "Stand",
    tagline: "Speak up and stand behind what you believe.",
    href: "/stand",
    color: "#5B4B8A",
    x: 82,
    y: 25,
    size: "lg",
    brightness: 0.96,
    detail: "clouds",
    glow: 0.45,
    moons: 0,
    rings: false,
    atmosphere: "none",
  },
  {
    id: "connect",
    label: "Connect",
    tagline: "Build confidence communicating with other people.",
    href: "/connect",
    color: "#C48BB5",
    x: 20,
    y: 72,
    size: "lg",
    brightness: 0.92,
    detail: "smooth",
    glow: 0.5,
    moons: 0,
    rings: false,
    atmosphere: "haze",
  },
  {
    id: "explore",
    label: "Explore",
    tagline: "Discover what you think and what matters to you.",
    href: "/explore",
    color: "#9A8BC4",
    x: 81,
    y: 73,
    size: "lg",
    brightness: 0.94,
    detail: "terrain",
    glow: 0.52,
    moons: 0,
    rings: true,
    atmosphere: "sparkle",
  },
];

export const TODAYS_QUESTION = {
  id: "todays-opinion",
  text: "What's something you wish people asked your opinion about?",
} as const;

export function getVoicePlanetById(id: string): VoicePlanet | undefined {
  return VOICE_PLANETS.find((p) => p.id === id);
}

/** Desktop max sizes — mobile uses clamp() in the planet component */
export function voicePlanetSizePx(size: VoicePlanetSize): number {
  if (size === "lg") return 118;
  if (size === "md") return 88;
  return 64;
}
