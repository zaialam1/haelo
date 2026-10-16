"use client";

import { useSyncExternalStore } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { EvolvedPlanet } from "@/components/planets/EvolvedPlanet";
import { CosmeticsOrbDecorations } from "@/components/cosmetics/CosmeticsOrbDecorations";
import type { SlotAssignment } from "@/lib/cosmetics/types";
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
  /** Equipped cosmetics for this planet */
  cosmeticAssignments?: SlotAssignment[];
};

function subscribeMobile(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia("(max-width: 639px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function readMobile() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(max-width: 639px)").matches;
}

export function VoicePlanetOrb({
  planet,
  level = 1,
  floatDelaySec = 0,
  absolute = true,
  subtitle,
  cosmeticAssignments = [],
}: VoicePlanetOrbProps) {
  const isMobile = useSyncExternalStore(subscribeMobile, readMobile, () => false);
  const px = voicePlanetSizePx(planet.size);
  const floatDuration = 5 + (floatDelaySec % 1.6);
  const sizeCss = absolute
    ? isMobile
      ? `clamp(3.75rem, 16vw, 5.25rem)`
      : `clamp(5rem, 20vw, ${px}px)`
    : `clamp(4.5rem, 13vw, ${Math.min(px, 96)}px)`;
  const caption = subtitle ?? planet.tagline;
  const left = isMobile ? planet.mobileX : planet.x;
  const top = isMobile ? planet.mobileY : planet.y;

  return (
    <TransitionLink
      href={planet.href}
      variant="warp"
      accent={planet.color}
      data-tour={`planet-${planet.id}`}
      className={
        absolute
          ? "voice-planet group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)] sm:gap-2.5"
          : "voice-planet group relative z-10 flex flex-col items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
      }
      style={absolute ? { left: `${left}%`, top: `${top}%` } : undefined}
      aria-label={`${planet.label}: ${caption}`}
    >
      <span
        className="flex flex-col items-center gap-1 motion-reduce:animate-none sm:gap-1.5"
        style={{
          animation: `planet-float ${floatDuration}s ease-in-out ${floatDelaySec}s infinite`,
        }}
      >
        <span className="relative overflow-visible" style={{ width: sizeCss, height: sizeCss }}>
          <CosmeticsOrbDecorations assignments={cosmeticAssignments} />
          <EvolvedPlanet
            planetId={planet.id}
            level={level}
            variant={absolute ? "map" : "gallery"}
            gradientPrefix={`map-${planet.id}-L${level}`}
            style={{ width: "100%", height: "100%" }}
            className="relative z-[1] transition-transform duration-300 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
          />
        </span>

        <span
          className="text-center text-[0.625rem] font-semibold uppercase tracking-[0.12em] sm:text-xs"
          style={{ color: "var(--foreground)" }}
        >
          {planet.label}
        </span>

        {/* Taglines only on larger screens — they crowd the phone map */}
        {!isMobile || !absolute ? (
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
        ) : null}
      </span>
    </TransitionLink>
  );
}
