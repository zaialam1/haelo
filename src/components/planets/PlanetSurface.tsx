import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { ConnectSurface } from "./surfaces/ConnectSurface";
import { ExploreSurface } from "./surfaces/ExploreSurface";
import { ExpressSurface } from "./surfaces/ExpressSurface";
import { StandSurface } from "./surfaces/StandSurface";

/**
 * Level-aware planet surface. Prefer `<EvolvedPlanet />` for full stage visuals
 * (halo, particles, exterior motifs). This exports the clipped sphere only.
 */
export function PlanetSurface({
  id,
  level = 1,
  gradientPrefix = "vp",
}: {
  id: VoicePlanetId;
  level?: PlanetEvolutionLevel;
  gradientPrefix?: string;
}) {
  if (id === "express") {
    return <ExpressSurface level={level} gradientPrefix={gradientPrefix} />;
  }
  if (id === "stand") {
    return <StandSurface level={level} gradientPrefix={gradientPrefix} />;
  }
  if (id === "connect") {
    return <ConnectSurface level={level} gradientPrefix={gradientPrefix} />;
  }
  return <ExploreSurface level={level} gradientPrefix={gradientPrefix} />;
}

/** @deprecated Prefer EvolvedPlanet — kept for any leftover call sites. */
export function PlanetAtmosphere({
  id,
  color,
  variant = "map",
}: {
  id: VoicePlanetId;
  color: string;
  variant?: "map" | "hero";
}) {
  const heroScale = variant === "hero";

  if (id === "stand") {
    return (
      <span
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: heroScale ? "-18%" : "-12%",
          background: `radial-gradient(circle, color-mix(in srgb, ${color} 22%, transparent), transparent 68%)`,
        }}
        aria-hidden="true"
      />
    );
  }

  if (id === "explore") {
    return (
      <>
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: heroScale ? "-22%" : "-18%",
            background: `radial-gradient(circle, color-mix(in srgb, ${color} 28%, transparent), transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <span
          className="voice-planet-rings pointer-events-none absolute opacity-40"
          style={{
            width: heroScale ? "160%" : "150%",
            height: heroScale ? "44%" : "42%",
            borderColor: `color-mix(in srgb, ${color} 55%, var(--gold))`,
          }}
          aria-hidden="true"
        />
      </>
    );
  }

  if (id === "connect") {
    return (
      <span
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: heroScale ? "-28%" : "-22%",
          background: `radial-gradient(circle, color-mix(in srgb, ${color} 32%, transparent), transparent 72%)`,
          filter: "blur(8px)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="pointer-events-none absolute rounded-full"
      style={{
        inset: heroScale ? "-20%" : "-16%",
        background: `radial-gradient(circle, color-mix(in srgb, ${color} 38%, transparent), color-mix(in srgb, var(--rose) 12%, transparent) 45%, transparent 72%)`,
        filter: "blur(4px)",
      }}
      aria-hidden="true"
    />
  );
}
