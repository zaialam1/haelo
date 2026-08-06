"use client";

import type { OrbitRegionDefinition, OrbitRegionKey } from "@/lib/orbits/types";
import { REGION_ACCENT, REGION_MAP_LAYOUT } from "@/lib/orbits/ui";

type OrbitRegionClusterProps = {
  region: OrbitRegionDefinition;
  active: boolean;
  dimmed: boolean;
  onSelect: () => void;
};

const COMPANION_STARS = [
  { x: -36, y: -22, r: 2 },
  { x: 28, y: -32, r: 1.6 },
  { x: 40, y: 10, r: 1.4 },
  { x: -24, y: 30, r: 1.8 },
  { x: 10, y: 38, r: 1.2 },
  { x: -40, y: 6, r: 1.1 },
] as const;

const REGION_SHORT: Record<OrbitRegionKey, string> = {
  friendships_people: "Friendships",
  speaking_up: "Speaking Up",
  figuring_things_out: "Figuring Out",
  putting_yourself_out_there: "Out There",
};

const LABEL_POS: Record<
  (typeof REGION_MAP_LAYOUT)[OrbitRegionKey]["labelToward"],
  string
> = {
  se: "left-[58%] top-[58%] text-left",
  sw: "right-[58%] top-[58%] left-auto text-right",
  ne: "left-[58%] bottom-[58%] top-auto text-left",
  nw: "right-[58%] bottom-[58%] left-auto top-auto text-right",
};

export function OrbitRegionCluster({
  region,
  active,
  dimmed,
  onSelect,
}: OrbitRegionClusterProps) {
  const layout = REGION_MAP_LAYOUT[region.key];
  const accent = REGION_ACCENT[region.key];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      id={`orbit-region-${region.key}`}
      aria-controls="orbit-constellation-panel"
      onClick={onSelect}
      className="orbits-region-cluster group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)]"
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        opacity: dimmed ? 0.55 : 1,
        transition: "opacity 400ms ease",
        zIndex: active ? 5 : 1,
      }}
    >
      <span className="relative flex size-[6.5rem] items-center justify-center sm:size-[8.5rem]">
        <span
          className="orbits-region-nebula pointer-events-none absolute inset-[-40%] rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, ${accent} ${active ? 55 : 32}%, transparent), transparent 68%)`,
            opacity: active ? 1 : 0.75,
          }}
          aria-hidden="true"
        />

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <g
            fill="none"
            stroke={accent}
            strokeWidth="1.1"
            opacity={active ? 0.85 : 0.5}
          >
            <path d="M34 40 L50 50 L66 34" />
            <path d="M50 50 L60 68" />
            <path d="M50 50 L32 64" />
            <path d="M66 34 L72 42" />
          </g>
          <g fill={accent} opacity={active ? 0.9 : 0.55}>
            <circle cx="34" cy="40" r="1.8" />
            <circle cx="66" cy="34" r="2" />
            <circle cx="60" cy="68" r="1.6" />
            <circle cx="32" cy="64" r="1.5" />
          </g>
        </svg>

        {COMPANION_STARS.map((star, i) => (
          <span
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: star.r * 2.4,
              height: star.r * 2.4,
              left: `calc(50% + ${star.x * 1.15}px)`,
              top: `calc(50% + ${star.y * 1.15}px)`,
              background: "color-mix(in srgb, var(--foreground) 85%, transparent)",
              opacity: active ? 0.95 : 0.55,
              boxShadow: `0 0 8px color-mix(in srgb, ${accent} 50%, transparent)`,
              transform: "translate(-50%, -50%)",
            }}
            aria-hidden="true"
          />
        ))}

        <span
          className="orbits-region-hub relative z-10 rounded-full transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110"
          style={{
            width: active ? 28 : 24,
            height: active ? 28 : 24,
            background: accent,
            boxShadow: active
              ? `0 0 0 7px color-mix(in srgb, ${accent} 28%, transparent), 0 0 32px color-mix(in srgb, ${accent} 70%, transparent)`
              : `0 0 0 5px color-mix(in srgb, ${accent} 18%, transparent), 0 0 20px color-mix(in srgb, ${accent} 50%, transparent)`,
          }}
          aria-hidden="true"
        />
      </span>

      {!active ? (
        <span
          className={`pointer-events-none absolute w-[9.5rem] sm:w-[13.5rem] ${LABEL_POS[layout.labelToward]}`}
        >
          <span
            className="block font-[family-name:var(--font-display)] text-[1.0625rem] font-semibold tracking-tight sm:text-xl"
            style={{
              color: "var(--foreground)",
              textShadow:
                "0 1px 12px color-mix(in srgb, var(--background) 80%, transparent)",
            }}
          >
            <span className="sm:hidden">{REGION_SHORT[region.key]}</span>
            <span className="hidden sm:inline">{region.title}</span>
          </span>
          <span
            className="mt-1 hidden text-[0.8125rem] leading-snug sm:block"
            style={{
              color: "var(--foreground)",
              opacity: 0.75,
            }}
          >
            {region.description}
          </span>
        </span>
      ) : null}
    </button>
  );
}

type RegionMapNetworkProps = {
  regions: readonly OrbitRegionDefinition[];
  activeRegion: OrbitRegionKey | null;
};

export function RegionMapNetwork({
  regions,
  activeRegion,
}: RegionMapNetworkProps) {
  const points = regions.map((r) => ({
    key: r.key,
    ...REGION_MAP_LAYOUT[r.key],
  }));

  // Perimeter square first (emphasized), then soft diagonals
  const perimeter: [number, number][] = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
  ];
  const diagonals: [number, number][] = [
    [0, 3],
    [1, 2],
  ];

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="orbits-line-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {diagonals.map(([a, b]) => {
        const pa = points[a];
        const pb = points[b];
        return (
          <line
            key={`diag-${pa.key}-${pb.key}`}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke="color-mix(in srgb, var(--violet) 55%, transparent)"
            strokeWidth="0.22"
            strokeDasharray="0.6 1.6"
            opacity={activeRegion ? 0.35 : 0.45}
          />
        );
      })}

      {perimeter.map(([a, b]) => {
        const pa = points[a];
        const pb = points[b];
        const involvesActive =
          activeRegion != null &&
          (pa.key === activeRegion || pb.key === activeRegion);
        return (
          <line
            key={`edge-${pa.key}-${pb.key}`}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke="color-mix(in srgb, var(--violet) 85%, white)"
            strokeWidth={involvesActive ? 0.55 : 0.42}
            strokeDasharray="1.2 1.1"
            strokeLinecap="round"
            opacity={involvesActive ? 0.95 : 0.75}
            filter="url(#orbits-line-glow)"
          />
        );
      })}

      {/* Hub dots at corners so the network reads clearly */}
      {points.map((p) => (
        <circle
          key={`hub-${p.key}`}
          cx={p.x}
          cy={p.y}
          r={activeRegion === p.key ? 1.1 : 0.85}
          fill="color-mix(in srgb, var(--violet) 70%, white)"
          opacity={0.9}
        />
      ))}
    </svg>
  );
}
