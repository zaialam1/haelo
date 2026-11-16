"use client";

import dynamic from "next/dynamic";
import type { GamificationReveal } from "@/lib/gamification/types";

const GamificationRevealOverlay = dynamic(
  () =>
    import("@/components/gamification/GamificationRevealOverlay").then(
      (m) => m.GamificationRevealOverlay,
    ),
  { ssr: false },
);

export function LazyGamificationReveal({
  reveals,
  explainPlanetGrowth = false,
}: {
  reveals: GamificationReveal[];
  explainPlanetGrowth?: boolean;
}) {
  return (
    <GamificationRevealOverlay
      reveals={reveals}
      explainPlanetGrowth={explainPlanetGrowth}
    />
  );
}
