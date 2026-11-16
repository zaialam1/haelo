/**
 * Guided first-run product tour. Auto-starts for new users; skippable;
 * replayable from Settings.
 */

export const PRODUCT_TOUR_STORAGE_KEY = "halo_product_tour_step";
export const PRODUCT_TOUR_ACTIVE_KEY = "halo_product_tour_active";

export type ProductTourStep = {
  id: string;
  /** Path where this step should be shown */
  route: string;
  title: string;
  body: string;
  /** Optional `data-tour` attribute value to spotlight */
  highlight?: string;
};

export const PRODUCT_TOUR_STEPS: readonly ProductTourStep[] = [
  {
    id: "universe",
    route: "/home",
    title: "This is your Universe",
    body: "Four planets, one for each kind of practice. It’s private. There’s no feed and no leaderboard.",
    highlight: "universe",
  },
  {
    id: "my-voice",
    route: "/home",
    title: "My Voice",
    body: "The light in the middle. After a few sessions, it sums up the patterns in how you talk.",
    highlight: "my-voice",
  },
  {
    id: "express",
    route: "/home",
    title: "Express",
    body: "Put what’s in your head into words: a story, a feeling, an idea.",
    highlight: "planet-express",
  },
  {
    id: "stand",
    route: "/home",
    title: "Stand",
    body: "Give an opinion, set a boundary, or ask for what you need, without backing down.",
    highlight: "planet-stand",
  },
  {
    id: "connect",
    route: "/home",
    title: "Connect",
    body: "Explain yourself so another person can follow, the way you would to a friend or a parent.",
    highlight: "planet-connect",
  },
  {
    id: "explore",
    route: "/home",
    title: "Explore",
    body: "Think out loud about a question you haven’t settled yet.",
    highlight: "planet-explore",
  },
  {
    id: "practice",
    route: "/home",
    title: "How a session works",
    body: "Tap a planet and answer a question out loud. You get feedback, the session becomes a star on your Journey, and the planet changes as you go.",
    highlight: "planet-express",
  },
  {
    id: "journey",
    route: "/journey",
    title: "Journey",
    body: "Every session you finish shows up here as a star. Tap one to hear it again.",
    highlight: "nav-journey",
  },
  {
    id: "orbits",
    route: "/orbits",
    title: "Orbits",
    body: "An Orbit takes one real situation, like a fight with a friend, and walks you through it in six questions. Your connections can recommend one. They never see your recordings.",
    highlight: "nav-orbits",
  },
  {
    id: "nav",
    route: "/home",
    title: "Getting around",
    body: "Journey, Universe, and Orbits are in the bar below.",
    highlight: "bottom-nav",
  },
  {
    id: "settings",
    route: "/settings",
    title: "Settings",
    body: "Your account, notifications, and connections are here. You can replay this tour from here too.",
    highlight: "settings-page",
  },
  {
    id: "closer",
    route: "/home",
    title: "That’s the tour",
    body: "Pick a planet and try one question. It takes a couple of minutes.",
    highlight: "universe",
  },
] as const;

export function readTourStepIndex(): number | null {
  if (typeof window === "undefined") return null;
  if (sessionStorage.getItem(PRODUCT_TOUR_ACTIVE_KEY) !== "1") return null;
  const raw = sessionStorage.getItem(PRODUCT_TOUR_STORAGE_KEY);
  if (raw == null) return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n >= PRODUCT_TOUR_STEPS.length) return 0;
  return n;
}

export function writeTourStepIndex(index: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PRODUCT_TOUR_ACTIVE_KEY, "1");
  sessionStorage.setItem(PRODUCT_TOUR_STORAGE_KEY, String(index));
}

export function clearTourSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PRODUCT_TOUR_ACTIVE_KEY);
  sessionStorage.removeItem(PRODUCT_TOUR_STORAGE_KEY);
}

export function startTourSession(index = 0): void {
  writeTourStepIndex(index);
}
