import type { VoicePlanet } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticsPlanetOverlay } from "@/components/cosmetics/CosmeticsPlanetOverlay";
import { EvolvedPlanet } from "./EvolvedPlanet";

type PlanetHeroVisualProps = {
  planet: VoicePlanet;
  level: PlanetEvolutionLevel;
  cosmeticAssignments?: SlotAssignment[];
};

/**
 * Close-up of a Universe planet on the planet page.
 * Visual stage comes from the shared evolution system.
 */
export function PlanetHeroVisual({
  planet,
  level,
  cosmeticAssignments = [],
}: PlanetHeroVisualProps) {
  const sizeCss = "clamp(12rem, 38vw, 20rem)";

  return (
    <div
      className="planet-hero-visual relative mx-auto overflow-visible lg:mx-0"
      style={{ width: sizeCss, height: sizeCss }}
    >
      <CosmeticsPlanetOverlay assignments={cosmeticAssignments} />
      <EvolvedPlanet
        planetId={planet.id}
        level={level}
        variant="hero"
        gradientPrefix="hero"
        className="relative z-[1]"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
