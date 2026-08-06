"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { EvolvedPlanet } from "@/components/planets/EvolvedPlanet";
import type { VoicePlanet } from "@/lib/home/voicePlanets";
import { voicePlanetSizePx } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";

type VoicePlanetOrbProps = {
  planet: VoicePlanet;
  /** Evolution stage 1–5. Defaults to base. */
  level?: PlanetEvolutionLevel;
  floatDelaySec?: number;
  /** Absolute map placement (default). Gallery uses false. */
  absolute?: boolean;
  /** Replaces the tagline under the label. */
  subtitle?: string;
};

export function VoicePlanetOrb({
  planet,
  level = 1,
  floatDelaySec = 0,
  absolute = true,
  subtitle,
}: VoicePlanetOrbProps) {
  const px = voicePlanetSizePx(planet.size);
  const floatDuration = 5 + (floatDelaySec % 1.6);
  const sizeCss = absolute
    ? `clamp(5rem, 20vw, ${px}px)`
    : `clamp(4.5rem, 13vw, ${Math.min(px, 96)}px)`;
  const caption = subtitle ?? planet.tagline;

  return (
    <TransitionLink
      href={planet.href}
      variant="warp"
      accent={planet.color}
      className={
        absolute
          ? "voice-planet group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
          : "voice-planet group relative z-10 flex flex-col items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
      }
      style={absolute ? { left: `${planet.x}%`, top: `${planet.y}%` } : undefined}
      aria-label={`${planet.label}: ${caption}`}
    >
      <span
        className="flex flex-col items-center gap-1.5 motion-reduce:animate-none"
        style={{
          animation: `planet-float ${floatDuration}s ease-in-out ${floatDelaySec}s infinite`,
        }}
      >
        <EvolvedPlanet
          planetId={planet.id}
          level={level}
          variant={absolute ? "map" : "gallery"}
          gradientPrefix={`map-${planet.id}-L${level}`}
          style={{ width: sizeCss, height: sizeCss }}
          className="transition-transform duration-300 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
        />

        <span
          className="text-center text-[0.625rem] font-semibold uppercase tracking-[0.12em] sm:text-xs"
          style={{ color: "var(--foreground)" }}
        >
          {planet.label}
        </span>

        <span
          className={
            absolute
              ? "voice-planet-tagline max-w-[10rem] text-center text-[0.625rem] leading-snug sm:max-w-[12rem] sm:text-[0.6875rem]"
              : "max-w-[7rem] text-center text-[0.625rem] leading-snug"
          }
          style={{ color: "var(--foreground-muted)" }}
        >
          {caption}
        </span>
      </span>
    </TransitionLink>
  );
}
