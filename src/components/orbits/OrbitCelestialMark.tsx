import type { CSSProperties } from "react";
import { getOrbitVisualSeed } from "@/lib/orbits/ui";
import type { OrbitRegionKey } from "@/lib/orbits/types";
import { REGION_ACCENT } from "@/lib/orbits/ui";

type OrbitCelestialMarkProps = {
  orbitKey: string;
  regionKey: OrbitRegionKey;
  status?: "not_started" | "in_progress" | "completed";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function OrbitCelestialMark({
  orbitKey,
  regionKey,
  status = "not_started",
  size = "md",
  className = "",
}: OrbitCelestialMarkProps) {
  const seed = getOrbitVisualSeed(orbitKey);
  const accent = REGION_ACCENT[regionKey];
  const dim = size === "sm" ? "2.5rem" : size === "lg" ? "3.75rem" : "3.25rem";
  const core = size === "sm" ? 10 : size === "lg" ? 15 : 13;

  return (
    <span
      className={`orbits-celestial-mark ${
        status === "in_progress"
          ? "orbits-celestial-mark--progress"
          : status === "completed"
            ? "orbits-celestial-mark--completed"
            : ""
      } ${className}`}
      style={
        {
          width: dim,
          height: dim,
          ["--orbit-accent" as string]: accent,
          ["--orbit-tilt" as string]: `${seed.tiltDeg}deg`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {Array.from({ length: seed.rings }, (_, i) => {
        const sizePct = 100 - i * (size === "sm" ? 22 : 20);
        return (
          <span
            key={i}
            className="orbits-celestial-mark__ring"
            style={{
              width: `${sizePct}%`,
              height: `${sizePct}%`,
              animationDuration: `${24 + i * 8}s`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
              // String literals avoid SSR/client style serialization mismatches
              opacity: `${(0.85 - i * 0.18).toFixed(2)}`,
            }}
          />
        );
      })}
      <span
        className="orbits-celestial-mark__core"
        style={{
          width: `${(core * seed.coreScale).toFixed(2)}px`,
          height: `${(core * seed.coreScale).toFixed(2)}px`,
        }}
      />
      {Array.from({ length: seed.starCount }, (_, i) => {
        const angle = (i / seed.starCount) * Math.PI * 2 + seed.tiltDeg * 0.02;
        const r = size === "sm" ? 38 : 42;
        // Fixed precision so SSR HTML matches client hydration
        const x = (50 + Math.cos(angle) * r).toFixed(2);
        const y = (50 + Math.sin(angle) * r).toFixed(2);
        const starPx = i % 2 === 0 ? "2px" : "1.5px";
        return (
          <span
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              width: starPx,
              height: starPx,
              left: `${x}%`,
              top: `${y}%`,
              background:
                "color-mix(in srgb, var(--foreground) 55%, transparent)",
              opacity: "0.55",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </span>
  );
}
