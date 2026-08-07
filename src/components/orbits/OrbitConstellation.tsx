"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { OrbitCelestialMark } from "@/components/orbits/OrbitCelestialMark";
import {
  ORBIT_NODE_EDGES,
  ORBIT_NODE_LAYOUT,
  REGION_ACCENT,
  formatOrbitMeta,
  getOrbitStatus,
  orbitProgressLabel,
} from "@/lib/orbits/ui";
import type { OrbitListItem, OrbitRegionKey } from "@/lib/orbits/types";

type OrbitConstellationProps = {
  regionKey: OrbitRegionKey;
  items: OrbitListItem[];
};

/**
 * Star-grid of Orbits for the active region.
 * Title lives outside this panel (in OrbitsExperience) to avoid overlapping nodes.
 */
export function OrbitConstellation({
  regionKey,
  items,
}: OrbitConstellationProps) {
  const accent = REGION_ACCENT[regionKey];
  const empty = items.length === 0;

  return (
    <div
      id="orbit-constellation-panel"
      role="tabpanel"
      aria-labelledby={`orbit-region-${regionKey}`}
      className="orbits-constellation absolute inset-[14%] sm:inset-[16%]"
    >
      <div
        className="pointer-events-none absolute inset-[-6%] rounded-[42%] opacity-80 blur-3xl"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, color-mix(in srgb, ${accent} 28%, transparent), transparent 68%)`,
        }}
        aria-hidden="true"
      />

      {empty ? (
        <p
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[0.8125rem]"
          style={{ color: "var(--foreground)", opacity: 0.7 }}
        >
          No Orbits here yet.
        </p>
      ) : (
        <>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {ORBIT_NODE_EDGES.map(([a, b]) => {
              if (a >= items.length || b >= items.length) return null;
              const pa = ORBIT_NODE_LAYOUT[a];
              const pb = ORBIT_NODE_LAYOUT[b];
              return (
                <line
                  key={`${a}-${b}`}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={`color-mix(in srgb, ${accent} 70%, white)`}
                  strokeWidth="0.35"
                  opacity="0.75"
                />
              );
            })}
          </svg>

          <ul className="absolute inset-0 z-[1]" role="list">
            {items.map((item, index) => {
              const pos = ORBIT_NODE_LAYOUT[index] ?? ORBIT_NODE_LAYOUT[0];
              const orbit = item.definition;
              const status = getOrbitStatus(item);
              const progress = orbitProgressLabel(item);

              return (
                <li
                  key={orbit.orbitKey}
                  className="absolute"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <TransitionLink
                    href={`/orbits/${orbit.orbitKey}`}
                    variant="fade"
                    className="orbits-star-node group relative flex flex-col items-center gap-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)]"
                    style={{
                      animationDelay: `${(index % 6) * 0.4}s`,
                    }}
                    aria-label={`${orbit.title}. ${orbit.shortDescription}. ${formatOrbitMeta(orbit)}${
                      status === "completed"
                        ? " Completed."
                        : progress
                          ? ` ${progress}.`
                          : ""
                    }`}
                  >
                    <OrbitCelestialMark
                      orbitKey={orbit.orbitKey}
                      regionKey={orbit.regionKey}
                      status={status}
                      size="lg"
                      className="orbits-star-node__mark transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110"
                    />
                    <span
                      className="max-w-[7.5rem] text-center text-[0.75rem] font-semibold leading-snug tracking-wide sm:max-w-[9rem] sm:text-[0.875rem]"
                      style={{
                        color: "var(--foreground)",
                        textShadow:
                          "0 1px 10px color-mix(in srgb, var(--background) 75%, transparent)",
                      }}
                    >
                      {orbit.title}
                    </span>
                    <span
                      className="orbits-star-node__hint pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] z-30 hidden w-[12rem] -translate-x-1/2 rounded-xl px-2.5 py-2 text-left opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
                      style={{
                        background:
                          "color-mix(in srgb, var(--background) 92%, transparent)",
                        border:
                          "1px solid color-mix(in srgb, var(--violet) 28%, transparent)",
                        color: "var(--foreground-muted)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <span className="block text-[0.75rem] leading-snug">
                        {orbit.shortDescription}
                      </span>
                      <span className="mt-1 block text-[0.6875rem] opacity-85">
                        {formatOrbitMeta(orbit)}
                      </span>
                    </span>
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
