import type { VoicePlanet } from "@/lib/home/voicePlanets";
import type { PlanetProgression } from "@/lib/planets/content";
import { PlanetAtmosphere, PlanetSurface } from "./PlanetSurface";

type PlanetHeroVisualProps = {
  planet: VoicePlanet;
  progression: PlanetProgression;
};

/**
 * Close-up of a Universe planet.
 * Progression props (rings, moons, glow, dust) are ready for future practice-driven evolution.
 */
export function PlanetHeroVisual({ planet, progression }: PlanetHeroVisualProps) {
  const glow = progression.glow;
  const moons = Math.min(progression.moons, 3);

  return (
    <div
      className="planet-hero-visual relative mx-auto flex items-center justify-center lg:mx-0"
      style={{
        width: "clamp(12rem, 38vw, 20rem)",
        height: "clamp(12rem, 38vw, 20rem)",
      }}
      data-planet={planet.id}
      data-rings={progression.rings ? "true" : "false"}
      data-moons={moons}
      aria-hidden="true"
    >
      {/* Soft orbital dust — progression hook */}
      {progression.showOrbitalDust ? (
        <span className="planet-hero-dust pointer-events-none absolute inset-[-8%]" />
      ) : null}

      {/* Secondary ring when progression unlocks rings (Explore starts with one via atmosphere) */}
      {progression.rings ? (
        <span
          className="voice-planet-rings pointer-events-none absolute opacity-50"
          style={{
            width: "175%",
            height: "48%",
            borderColor: `color-mix(in srgb, ${planet.color} 40%, var(--gold))`,
            borderWidth: "1.5px",
          }}
        />
      ) : null}

      <PlanetAtmosphere id={planet.id} color={planet.color} variant="hero" />

      <div
        className="voice-planet-core relative size-full overflow-hidden rounded-full motion-safe:animate-[planet-float_7s_ease-in-out_infinite]"
        style={{
          boxShadow: `
            0 0 ${28 + glow * 40}px color-mix(in srgb, ${planet.color} 50%, transparent),
            0 12px 40px color-mix(in srgb, var(--violet) 20%, transparent),
            inset 0 0 0 1px color-mix(in srgb, #fff8f0 28%, transparent)
          `,
        }}
      >
        <PlanetSurface id={planet.id} gradientPrefix="hero" />
      </div>

      {moons > 0
        ? Array.from({ length: moons }).map((_, i) => (
            <span
              key={i}
              className="voice-planet-moon pointer-events-none absolute rounded-full"
              style={{
                width: "9%",
                height: "9%",
                minWidth: 10,
                minHeight: 10,
                background: `color-mix(in srgb, ${planet.color} 55%, #fff8f0)`,
                top: `${6 + i * 24}%`,
                right: `${-14 - i * 12}%`,
                boxShadow: `0 0 14px color-mix(in srgb, ${planet.color} 40%, transparent)`,
              }}
            />
          ))
        : null}
    </div>
  );
}
