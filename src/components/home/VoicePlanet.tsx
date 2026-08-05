"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import {
  PlanetAtmosphere,
  PlanetSurface,
} from "@/components/planets/PlanetSurface";
import type { VoicePlanet } from "@/lib/home/voicePlanets";
import { voicePlanetSizePx } from "@/lib/home/voicePlanets";

type VoicePlanetOrbProps = {
  planet: VoicePlanet;
  floatDelaySec?: number;
};

export function VoicePlanetOrb({
  planet,
  floatDelaySec = 0,
}: VoicePlanetOrbProps) {
  const px = voicePlanetSizePx(planet.size);
  const floatDuration = 5 + (floatDelaySec % 1.6);
  const sizeCss = `clamp(5rem, 20vw, ${px}px)`;

  return (
    <TransitionLink
      href={planet.href}
      variant="warp"
      accent={planet.color}
      className="voice-planet group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
      style={{
        left: `${planet.x}%`,
        top: `${planet.y}%`,
      }}
      aria-label={`${planet.label}: ${planet.tagline}`}
    >
      <span
        className="flex flex-col items-center gap-2.5 motion-reduce:animate-none"
        style={{
          animation: `planet-float ${floatDuration}s ease-in-out ${floatDelaySec}s infinite`,
        }}
      >
        <span
          className="relative flex items-center justify-center"
          style={{ width: sizeCss, height: sizeCss }}
        >
          <PlanetAtmosphere id={planet.id} color={planet.color} />

          <span
            className="voice-planet-core relative block size-full overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
            style={{
              boxShadow: `
                0 0 ${18 + planet.glow * 28}px color-mix(in srgb, ${planet.color} 45%, transparent),
                0 8px 28px color-mix(in srgb, var(--violet) 18%, transparent),
                inset 0 0 0 1px color-mix(in srgb, #fff8f0 22%, transparent)
              `,
            }}
          >
            <PlanetSurface id={planet.id} gradientPrefix="map" />
          </span>

          {planet.moons > 0
            ? Array.from({ length: Math.min(planet.moons, 3) }).map((_, i) => (
                <span
                  key={i}
                  className="voice-planet-moon pointer-events-none absolute rounded-full"
                  style={{
                    width: "12%",
                    height: "12%",
                    minWidth: 8,
                    minHeight: 8,
                    background: `color-mix(in srgb, ${planet.color} 55%, #fff8f0)`,
                    top: `${8 + i * 22}%`,
                    right: `${-12 - i * 10}%`,
                    boxShadow: `0 0 10px color-mix(in srgb, ${planet.color} 35%, transparent)`,
                  }}
                  aria-hidden="true"
                />
              ))
            : null}
        </span>

        <span
          className="text-center text-xs font-semibold uppercase tracking-[0.12em] sm:text-sm"
          style={{ color: "var(--foreground)" }}
        >
          {planet.label}
        </span>

        <span
          className="voice-planet-tagline max-w-[10rem] text-center text-[0.625rem] leading-snug sm:max-w-[12rem] sm:text-[0.6875rem]"
          style={{ color: "var(--foreground-muted)" }}
        >
          {planet.tagline}
        </span>
      </span>
    </TransitionLink>
  );
}
