import type { CSSProperties } from "react";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import {
  getPlanetEvolutionProfile,
  getPlanetEvolutionStage,
  type PlanetEvolutionLevel,
} from "@/lib/planets/evolution";
import { ConnectSurface } from "./surfaces/ConnectSurface";
import { ExploreSurface } from "./surfaces/ExploreSurface";
import { ExpressSurface } from "./surfaces/ExpressSurface";
import { StandSurface } from "./surfaces/StandSurface";

export type EvolvedPlanetProps = {
  planetId: VoicePlanetId;
  level: PlanetEvolutionLevel;
  /** Unique prefix so multiple instances can share a page */
  gradientPrefix?: string;
  /** map = universe orbs, hero = planet page, gallery = level preview */
  variant?: "map" | "hero" | "gallery";
  className?: string;
  style?: CSSProperties;
};

function Surface({
  planetId,
  level,
  gradientPrefix,
}: {
  planetId: VoicePlanetId;
  level: PlanetEvolutionLevel;
  gradientPrefix: string;
}) {
  if (planetId === "express") {
    return <ExpressSurface level={level} gradientPrefix={gradientPrefix} />;
  }
  if (planetId === "stand") {
    return <StandSurface level={level} gradientPrefix={gradientPrefix} />;
  }
  if (planetId === "connect") {
    return <ConnectSurface level={level} gradientPrefix={gradientPrefix} />;
  }
  return <ExploreSurface level={level} gradientPrefix={gradientPrefix} />;
}

/** Soft particle field — count and reach driven by stage config. */
function ParticleField({
  color,
  count,
  reach,
}: {
  color: string;
  count: number;
  reach: number;
}) {
  if (count <= 0) return null;
  const slots = [
    { t: 8, r: 12 },
    { t: 22, r: -8 },
    { t: 68, r: -14 },
    { t: 82, r: 10 },
    { t: 12, r: 78 },
    { t: 48, r: -18 },
    { t: 90, r: 42 },
    { t: 36, r: 88 },
    { t: 4, r: 48 },
  ];

  return (
    <>
      {slots.slice(0, count).map((slot, i) => {
        const size = 2 + (i % 3);
        const inset = 6 + reach * 10;
        return (
          <span
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: size,
              height: size,
              top: `${slot.t}%`,
              right: `${slot.r}%`,
              background:
                i % 2 === 0
                  ? `color-mix(in srgb, ${color} 55%, #fff8f0)`
                  : "color-mix(in srgb, var(--gold) 50%, #fff8f0)",
              opacity: 0.35 + (i % 3) * 0.08,
              boxShadow: `0 0 ${4 + inset / 4}px color-mix(in srgb, ${color} 35%, transparent)`,
              transform: `translate(${(i % 2 === 0 ? 1 : -1) * reach * 6}px, ${reach * 4}px)`,
            }}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
}

function ExpressExterior({
  level,
  color,
  bloom,
  exteriorReach,
}: {
  level: PlanetEvolutionLevel;
  color: string;
  bloom: number;
  exteriorReach: number;
}) {
  return (
    <>
      {/* L2 thin pink-white halo ring — readable awakening cue */}
      {level >= 2 ? (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: level >= 3 ? "-10%" : "-7%",
            border: `1.5px solid color-mix(in srgb, ${color} ${level >= 3 ? 55 : 42}%, #fff8f0)`,
            boxShadow: `0 0 ${level >= 3 ? 18 : 12}px color-mix(in srgb, ${color} ${level >= 3 ? 35 : 22}%, transparent)`,
            opacity: level >= 3 ? 0.7 : 0.55,
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L4 soft light ribbons */}
      {level >= 4 ? (
        <>
          <span
            className="pointer-events-none absolute opacity-50"
            style={{
              width: "120%",
              height: "28%",
              top: "36%",
              left: "-10%",
              borderRadius: "50%",
              background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 35%, transparent), color-mix(in srgb, #fff8f0 40%, transparent), transparent)`,
              transform: "rotate(-18deg)",
              filter: "blur(2px)",
            }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute opacity-40"
            style={{
              width: "110%",
              height: "22%",
              top: "52%",
              left: "-5%",
              borderRadius: "50%",
              background: `linear-gradient(90deg, transparent, color-mix(in srgb, #fff8f0 30%, transparent), transparent)`,
              transform: "rotate(12deg)",
              filter: "blur(2px)",
            }}
            aria-hidden="true"
          />
        </>
      ) : null}

      {/* L5 soft rays from behind */}
      {level >= 5 ? (
        <span
          className="pointer-events-none absolute inset-[-20%] opacity-40"
          style={{
            background: `
              conic-gradient(from 200deg at 50% 50%,
                transparent 0deg,
                color-mix(in srgb, ${color} 22%, transparent) 18deg,
                transparent 36deg,
                color-mix(in srgb, #fff8f0 18%, transparent) 55deg,
                transparent 78deg,
                color-mix(in srgb, ${color} 16%, transparent) 110deg,
                transparent 140deg
              )
            `,
            filter: "blur(8px)",
            opacity: 0.35 + bloom * 0.2,
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L5 orbiting motes */}
      {level >= 5
        ? [0, 1, 2].map((i) => (
            <span
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 4 + i,
                height: 4 + i,
                top: `${18 + i * 28}%`,
                right: `${-10 - i * 8 - exteriorReach * 4}%`,
                background: "color-mix(in srgb, #fff8f0 70%, var(--gold))",
                opacity: 0.55,
                boxShadow: `0 0 10px color-mix(in srgb, ${color} 45%, transparent)`,
              }}
              aria-hidden="true"
            />
          ))
        : null}
    </>
  );
}

function StandExterior({
  level,
  color,
}: {
  level: PlanetEvolutionLevel;
  color: string;
}) {
  return (
    <>
      {/* L3 soft purple halo ring — stronger resonance cue */}
      {level >= 3 ? (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: "-9%",
            border: `1.5px solid color-mix(in srgb, ${color} 45%, #fff8f0)`,
            boxShadow: `0 0 16px color-mix(in srgb, ${color} 30%, transparent)`,
            opacity: 0.55,
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L4 resonance ripple escaping the edge */}
      {level >= 4 ? (
        <span
          className="pointer-events-none absolute rounded-full opacity-40"
          style={{
            inset: "-10%",
            border: `1.5px solid color-mix(in srgb, ${color} 35%, var(--gold))`,
            transform: "scale(1.05)",
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L5 circular resonance ring + exterior frequency arcs */}
      {level >= 5 ? (
        <>
          <span
            className="pointer-events-none absolute rounded-full opacity-45"
            style={{
              inset: "-16%",
              border: `1px solid color-mix(in srgb, var(--gold) 40%, ${color})`,
            }}
            aria-hidden="true"
          />
          <span
            className="voice-planet-rings pointer-events-none absolute opacity-35"
            style={{
              width: "155%",
              height: "42%",
              borderColor: `color-mix(in srgb, ${color} 45%, #fff8f0)`,
              borderWidth: "1.25px",
            }}
            aria-hidden="true"
          />
        </>
      ) : null}
    </>
  );
}

function ConnectExterior({
  level,
  color,
  exteriorReach,
}: {
  level: PlanetEvolutionLevel;
  color: string;
  exteriorReach: number;
}) {
  return (
    <>
      {/* L2–3 soft blue halo rim so early stages diverge from L1 */}
      {level >= 2 && level < 4 ? (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: level >= 3 ? "-10%" : "-6%",
            border: `1.25px solid color-mix(in srgb, ${color} ${level >= 3 ? 50 : 35}%, #fff8f0)`,
            boxShadow: `0 0 ${level >= 3 ? 14 : 8}px color-mix(in srgb, ${color} 28%, transparent)`,
            opacity: level >= 3 ? 0.6 : 0.45,
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L4 circles extending partly outside */}
      {level >= 4 ? (
        <>
          <span
            className="pointer-events-none absolute rounded-full"
            style={{
              width: "42%",
              height: "42%",
              top: "-6%",
              right: "-8%",
              background: `color-mix(in srgb, ${color} 22%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 28%, #fff8f0)`,
              opacity: 0.55,
            }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute rounded-full"
            style={{
              width: "34%",
              height: "34%",
              bottom: "-4%",
              left: "-6%",
              background: `color-mix(in srgb, ${color} 18%, transparent)`,
              border: `1px solid color-mix(in srgb, #fff8f0 30%, ${color})`,
              opacity: 0.45,
            }}
            aria-hidden="true"
          />
        </>
      ) : null}

      {/* L5 floating nodes */}
      {level >= 5
        ? [
            { t: -4, r: 22, s: 10 },
            { t: 70, r: -10, s: 8 },
            { t: 18, r: -12, s: 7 },
          ].map((n, i) => (
            <span
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: n.s + exteriorReach * 2,
                height: n.s + exteriorReach * 2,
                top: `${n.t}%`,
                right: `${n.r}%`,
                background: `color-mix(in srgb, ${color} 40%, #fff8f0)`,
                opacity: 0.55,
                boxShadow: `0 0 12px color-mix(in srgb, ${color} 35%, transparent)`,
                border: "1px solid color-mix(in srgb, #fff8f0 40%, transparent)",
              }}
              aria-hidden="true"
            />
          ))
        : null}
    </>
  );
}

function ExploreExterior({
  level,
  color,
}: {
  level: PlanetEvolutionLevel;
  color: string;
}) {
  const ringColor = `color-mix(in srgb, ${color} 55%, var(--gold))`;

  return (
    <>
      {/* Primary ring — always present for Explore */}
      <span
        className="voice-planet-rings pointer-events-none absolute opacity-45"
        style={{
          width: level >= 5 ? "168%" : "155%",
          height: level >= 5 ? "48%" : "42%",
          borderColor: ringColor,
          borderWidth: level >= 5 ? "2px" : "1.5px",
        }}
        aria-hidden="true"
      />

      {/* L2 faint extra orbital line */}
      {level >= 2 ? (
        <span
          className="voice-planet-rings pointer-events-none absolute opacity-25"
          style={{
            width: "142%",
            height: "36%",
            borderColor: `color-mix(in srgb, ${color} 40%, #fff8f0)`,
            borderWidth: "1px",
            transform: "rotate(12deg)",
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L3 multiple paths at angles */}
      {level >= 3 ? (
        <span
          className="voice-planet-rings pointer-events-none absolute opacity-22"
          style={{
            width: "160%",
            height: "40%",
            borderColor: `color-mix(in srgb, var(--gold) 35%, ${color})`,
            borderWidth: "1px",
            transform: "rotate(-32deg)",
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L2–3 tiny bodies on orbits */}
      {level >= 2 ? (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            top: "18%",
            right: "-6%",
            background: "color-mix(in srgb, var(--gold) 55%, #fff8f0)",
            opacity: 0.7,
            boxShadow: `0 0 8px color-mix(in srgb, ${color} 40%, transparent)`,
          }}
          aria-hidden="true"
        />
      ) : null}
      {level >= 3 ? (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 5,
            height: 5,
            bottom: "22%",
            left: "-4%",
            background: `color-mix(in srgb, ${color} 50%, #fff8f0)`,
            opacity: 0.65,
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* L4+ moons */}
      {level >= 4 ? (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            width: "14%",
            height: "14%",
            minWidth: 10,
            minHeight: 10,
            top: "4%",
            right: "-16%",
            background: `color-mix(in srgb, ${color} 45%, #fff8f0)`,
            boxShadow: `0 0 12px color-mix(in srgb, ${color} 35%, transparent)`,
            opacity: 0.85,
          }}
          aria-hidden="true"
        />
      ) : null}
      {level >= 5 ? (
        <>
          <span
            className="pointer-events-none absolute rounded-full"
            style={{
              width: "10%",
              height: "10%",
              minWidth: 8,
              minHeight: 8,
              bottom: "8%",
              left: "-14%",
              background: `color-mix(in srgb, var(--gold) 40%, #fff8f0)`,
              opacity: 0.8,
              boxShadow: `0 0 10px color-mix(in srgb, var(--gold) 30%, transparent)`,
            }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute rounded-full"
            style={{
              width: "8%",
              height: "8%",
              minWidth: 7,
              minHeight: 7,
              top: "48%",
              right: "-20%",
              background: `color-mix(in srgb, ${color} 55%, #fff8f0)`,
              opacity: 0.7,
            }}
            aria-hidden="true"
          />
          {/* Faint extended orbital path */}
          <span
            className="voice-planet-rings pointer-events-none absolute opacity-18"
            style={{
              width: "195%",
              height: "58%",
              borderColor: `color-mix(in srgb, ${color} 35%, var(--gold))`,
              borderWidth: "1px",
              transform: "rotate(8deg)",
            }}
            aria-hidden="true"
          />
          {/* Soft shooting-star streak */}
          <span
            className="pointer-events-none absolute opacity-40"
            style={{
              width: "38%",
              height: 2,
              top: "12%",
              left: "72%",
              borderRadius: 999,
              background: `linear-gradient(90deg, color-mix(in srgb, var(--gold) 55%, transparent), transparent)`,
              transform: "rotate(-28deg)",
              filter: "blur(0.5px)",
            }}
            aria-hidden="true"
          />
        </>
      ) : null}
    </>
  );
}

/**
 * Reusable evolved planet orb.
 * Pass `level` (1–5) to render the correct visual stage for any planet.
 * Surfaces keep base identity; exterior layers grow with progression.
 */
export function EvolvedPlanet({
  planetId,
  level,
  gradientPrefix = "evo",
  variant = "map",
  className = "",
  style,
}: EvolvedPlanetProps) {
  const profile = getPlanetEvolutionProfile(planetId);
  const stage = getPlanetEvolutionStage(planetId, level);
  const color = profile.color;
  const prefix = `${gradientPrefix}-${planetId}-L${level}`;

  const haloInset =
    variant === "hero"
      ? -18 - stage.halo * 14
      : -12 - stage.halo * 10;
  const bloomInset =
    variant === "hero"
      ? -28 - stage.bloom * 18
      : -20 - stage.bloom * 12;

  return (
    <div
      className={`evolved-planet relative flex items-center justify-center ${className}`}
      style={style}
      data-planet={planetId}
      data-level={level}
      data-motif={profile.motif}
      aria-hidden="true"
    >
      {/* Soft bloom behind (L2+ grows; meaningful at L4+) */}
      {stage.bloom > 0.05 ? (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: `${bloomInset}%`,
            background: `radial-gradient(circle, color-mix(in srgb, ${color} ${18 + stage.bloom * 28}%, transparent), transparent 70%)`,
            filter: "blur(10px)",
            opacity: 0.55 + stage.bloom * 0.35,
          }}
        />
      ) : null}

      {/* Thin soft halo */}
      <span
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: `${haloInset}%`,
          background: `radial-gradient(circle, color-mix(in srgb, ${color} ${12 + stage.halo * 22}%, transparent), transparent 68%)`,
          filter: planetId === "connect" ? "blur(8px)" : "blur(4px)",
          opacity: 0.35 + stage.halo * 0.5,
        }}
      />

      <ParticleField
        color={color}
        count={stage.particles}
        reach={stage.exteriorReach}
      />

      {planetId === "express" ? (
        <ExpressExterior
          level={level}
          color={color}
          bloom={stage.bloom}
          exteriorReach={stage.exteriorReach}
        />
      ) : null}
      {planetId === "stand" ? (
        <StandExterior level={level} color={color} />
      ) : null}
      {planetId === "connect" ? (
        <ConnectExterior
          level={level}
          color={color}
          exteriorReach={stage.exteriorReach}
        />
      ) : null}
      {planetId === "explore" ? (
        <ExploreExterior level={level} color={color} />
      ) : null}

      {/* Core sphere */}
      <div
        className="voice-planet-core relative z-[1] size-full overflow-hidden rounded-full"
        style={{
          boxShadow: `
            0 0 ${16 + stage.glow * 36}px color-mix(in srgb, ${color} ${40 + stage.glow * 20}%, transparent),
            0 8px 28px color-mix(in srgb, var(--violet) 16%, transparent),
            inset 0 0 0 1px color-mix(in srgb, #fff8f0 ${18 + stage.glow * 12}%, transparent)
          `,
        }}
      >
        <Surface
          planetId={planetId}
          level={level}
          gradientPrefix={prefix}
        />
      </div>
    </div>
  );
}
