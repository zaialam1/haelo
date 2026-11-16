/**
 * Guided first-run product tour. Auto-starts for new users; skippable;
 * replayable from Settings.
 *
 * Kept to five steps: what Halo is, the four planets, how to start,
 * Journey, and Orbits.
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
    body: "Halo is a private place to practice speaking out loud. No feed. No leaderboard.",
    highlight: "universe",
  },
  {
    id: "planets",
    route: "/home",
    title: "Four planets",
    body: "Express, Stand, Connect, and Explore. Each one is a different kind of practice.",
    highlight: "universe",
  },
  {
    id: "practice",
    route: "/home",
    title: "Start a session",
    body: "Tap a planet, get a question, and answer out loud. You get feedback when you're done.",
    highlight: "planet-express",
  },
  {
    id: "journey",
    route: "/journey",
    title: "Journey",
    body: "Finished sessions show up here as stars. Tap one to hear it again.",
    highlight: "nav-journey",
  },
  {
    id: "orbits",
    route: "/orbits",
    title: "Orbits",
    body: "An Orbit walks you through one real situation in six short questions. Connections can recommend one, but they never hear your recordings.",
    highlight: "nav-orbits",
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
