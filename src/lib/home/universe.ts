export type PlanetSize = "sm" | "md" | "lg";
export type PlanetDetail = "smooth" | "clouds" | "terrain" | "rings";

export type TopicPlanet = {
  id: string;
  label: string;
  /** Brand-derived fill color */
  color: string;
  /** Fixed position as % of the map (from top-left) */
  x: number;
  y: number;
  size: PlanetSize;
  brightness: number;
  detail: PlanetDetail;
  glow: number;
  moons: number;
};

export type DailyPrompt = {
  id: string;
  text: string;
};

export type ShootingStarPrompt = {
  id: string;
  label: string;
};

/** Fixed layout around the center star — always the same spots */
export const TOPICS: TopicPlanet[] = [
  {
    id: "friendships",
    label: "Friendships",
    color: "#E8A0BF",
    x: 22,
    y: 28,
    size: "sm",
    brightness: 0.85,
    detail: "smooth",
    glow: 0.2,
    moons: 0,
  },
  {
    id: "family",
    label: "Family",
    color: "#C48BB5",
    x: 50,
    y: 18,
    size: "sm",
    brightness: 0.85,
    detail: "smooth",
    glow: 0.2,
    moons: 0,
  },
  {
    id: "relationships",
    label: "Relationships",
    color: "#D48A9E",
    x: 78,
    y: 26,
    size: "sm",
    brightness: 0.85,
    detail: "smooth",
    glow: 0.2,
    moons: 0,
  },
  {
    id: "school",
    label: "School",
    color: "#7B6BA8",
    x: 14,
    y: 48,
    size: "sm",
    brightness: 0.9,
    detail: "smooth",
    glow: 0.25,
    moons: 0,
  },
  {
    id: "sports",
    label: "Sports",
    color: "#8B7BB5",
    x: 86,
    y: 48,
    size: "sm",
    brightness: 0.85,
    detail: "smooth",
    glow: 0.2,
    moons: 0,
  },
  {
    id: "hobbies",
    label: "Hobbies",
    color: "#F6D365",
    x: 18,
    y: 64,
    size: "sm",
    brightness: 0.9,
    detail: "smooth",
    glow: 0.25,
    moons: 0,
  },
  {
    id: "future",
    label: "Future",
    color: "#9A8BC4",
    x: 50,
    y: 66,
    size: "sm",
    brightness: 0.85,
    detail: "smooth",
    glow: 0.2,
    moons: 0,
  },
  {
    id: "emotions",
    label: "Emotions",
    color: "#D478A0",
    x: 82,
    y: 64,
    size: "sm",
    brightness: 0.85,
    detail: "smooth",
    glow: 0.2,
    moons: 0,
  },
  {
    id: "confidence",
    label: "Confidence",
    color: "#E8C070",
    x: 32,
    y: 52,
    size: "sm",
    brightness: 0.9,
    detail: "smooth",
    glow: 0.25,
    moons: 0,
  },
  {
    id: "creativity",
    label: "Creativity",
    color: "#D4A0C4",
    x: 68,
    y: 54,
    size: "sm",
    brightness: 0.85,
    detail: "smooth",
    glow: 0.2,
    moons: 0,
  },
];

export const DAILY_PROMPT: DailyPrompt = {
  id: "daily-smile",
  text: "Describe something that made you smile today.",
};

export const SHOOTING_STAR_PROMPTS: ShootingStarPrompt[] = [
  { id: "reflection", label: "Reflection prompt" },
  { id: "fun-fact", label: "Fun fact" },
  { id: "challenge", label: "Conversation challenge" },
  { id: "reward", label: "Tiny reward" },
];

/**
 * Prototype streak count.
 * Intended meaning: consecutive days with a completed speaking session.
 * Not wired to real sessions yet — hardcoded so the constellation UI is visible.
 */
export const INITIAL_STREAK_DAYS = 1;

export const DAILY_COMPLETED_KEY = "haelo-daily-completed";

export function getTopicById(id: string): TopicPlanet | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function planetSizePx(size: PlanetSize): number {
  if (size === "lg") return 48;
  if (size === "md") return 36;
  return 28;
}
