import type { VoicePlanet } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { EvolvedPlanet } from "./EvolvedPlanet";

type PlanetHeroVisualProps = {
  planet: VoicePlanet;
  level: PlanetEvolutionLevel;
};

/**
 * Close-up of a Universe planet on the planet page.
 * Visual stage comes from the shared evolution system.
 */
export function PlanetHeroVisual({ planet, level }: PlanetHeroVisualProps) {
  return (
    <EvolvedPlanet
      planetId={planet.id}
      level={level}
      variant="hero"
      gradientPrefix="hero"
      className="planet-hero-visual mx-auto lg:mx-0"
      style={{
        width: "clamp(12rem, 38vw, 20rem)",
        height: "clamp(12rem, 38vw, 20rem)",
      }}
    />
  );
}
