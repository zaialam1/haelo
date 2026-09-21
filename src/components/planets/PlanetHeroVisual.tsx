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
  return (
    <div className="relative mx-auto w-fit lg:mx-0">
      <EvolvedPlanet
        planetId={planet.id}
        level={level}
        variant="hero"
        gradientPrefix="hero"
        className="planet-hero-visual"
        style={{
          width: "clamp(12rem, 38vw, 20rem)",
          height: "clamp(12rem, 38vw, 20rem)",
        }}
      />
      <CosmeticsPlanetOverlay
        assignments={cosmeticAssignments}
        className="overflow-visible"
      />
    </div>
  );
}
