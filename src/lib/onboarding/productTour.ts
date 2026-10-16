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
    body: "Halo’s space map is private — just you and your voice. Nothing here is a social feed or a leaderboard.",
    highlight: "universe",
  },
  {
    id: "my-voice",
    route: "/home",
    title: "My Voice lives at the center",
    body: "The light in the middle is My Voice — a picture of how you sound that takes shape as you practice.",
    highlight: "my-voice",
  },
  {
    id: "express",
    route: "/home",
    title: "Express",
    body: "Say what you really think and feel — practice putting words to what’s going on inside.",
    highlight: "planet-express",
  },
  {
    id: "stand",
    route: "/home",
    title: "Stand",
    body: "Speak up and stand behind what you believe — opinions, boundaries, and asking for what you need.",
    highlight: "planet-stand",
  },
  {
    id: "connect",
    route: "/home",
    title: "Connect",
    body: "Build confidence communicating with other people — clear, open, and understood.",
    highlight: "planet-connect",
  },
  {
    id: "explore",
    route: "/home",
    title: "Explore",
    body: "Discover what you think and what matters to you — ideas, values, and identity out loud.",
    highlight: "planet-explore",
  },
  {
    id: "practice",
    route: "/home",
    title: "Practice grows your planets",
    body: "Tap a planet, answer a short prompt out loud, and it becomes a star. Come back whenever you’re ready — even one minute counts.",
    highlight: "planet-express",
  },
  {
    id: "journey",
    route: "/journey",
    title: "Journey holds your stars",
    body: "Every reflection you’ve saved lives here as a constellation you can revisit — growth, not grades.",
    highlight: "nav-journey",
  },
  {
    id: "orbits",
    route: "/orbits",
    title: "Orbits are real situations",
    body: "Orbits walk you through a situation one reflection at a time. Connections can recommend them — they never see your recordings.",
    highlight: "nav-orbits",
  },
  {
    id: "nav",
    route: "/home",
    title: "Three home bases",
    body: "Journey, Universe, and Orbits sit in the bar below. Universe is your main map; the others are always one tap away.",
    highlight: "bottom-nav",
  },
  {
    id: "settings",
    route: "/settings",
    title: "Settings is your control room",
    body: "Account, password, theme, notifications, and connections live here. You can replay this tour anytime.",
    highlight: "settings-page",
  },
  {
    id: "closer",
    route: "/home",
    title: "You’re ready",
    body: "Streaks and weekly goals are gentle nudges — never a scoreboard. When you’re ready, start with one short reflection.",
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
