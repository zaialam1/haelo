import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { evolutionLayerOpacity } from "@/lib/planets/evolution";

type SurfaceProps = {
  level: PlanetEvolutionLevel;
  gradientPrefix: string;
};

/** Connect — soft overlapping circles / relationships */
export function ConnectSurface({ level, gradientPrefix }: SurfaceProps) {
  const gid = `${gradientPrefix}-connect`;
  const o = (unlock: PlanetEvolutionLevel, peak = 1) =>
    evolutionLayerOpacity(level, unlock, { peak });

  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-body`} cx="32%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#EAF4FA" />
          <stop offset="40%" stopColor="#A9C9E0" />
          <stop offset="75%" stopColor="#6B9BC7" />
          <stop offset="100%" stopColor="#3F6F96" />
        </radialGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>

      <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />

      {/* L2+ deeper edge ring — clearly darker rim */}
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="none"
        stroke="#2A4F70"
        strokeWidth="10"
        strokeOpacity={0.28 * o(2)}
      />

      <g clipPath={`url(#${gid}-clip)`}>
        {/* Base 3 circles — L1 only reads these */}
        <circle cx="44" cy="52" r="22" fill="#8EB4D4" fillOpacity="0.42" />
        <circle cx="74" cy="58" r="20" fill="#5B4B8A" fillOpacity="0.14" />
        <circle cx="58" cy="78" r="16" fill="#F6D365" fillOpacity="0.12" />

        {/* L2 — two new, clearly different-sized circles */}
        <circle
          cx="70"
          cy="36"
          r="17"
          fill="#B8D4E8"
          fillOpacity={0.5 * o(2)}
        />
        <circle
          cx="32"
          cy="74"
          r="13"
          fill="#5B8BB5"
          fillOpacity={0.45 * o(2)}
        />
        {/* L2 bright overlap node */}
        <circle
          cx="56"
          cy="54"
          r="3.6"
          fill="#FFF8F0"
          fillOpacity={0.85 * o(2)}
        />
        <circle
          cx="56"
          cy="54"
          r="1.6"
          fill="#F6D365"
          fillOpacity={0.7 * o(2)}
        />

        {/* L3 — reach 6 circles + soft fill layers */}
        <circle
          cx="52"
          cy="44"
          r="20"
          fill="#FFF8F0"
          fillOpacity={0.16 * o(3)}
        />
        <circle
          cx="86"
          cy="72"
          r="14"
          fill="#8EB4D4"
          fillOpacity={0.48 * o(3)}
        />

        {/* L5 richer interior layering */}
        <circle
          cx="48"
          cy="64"
          r="10"
          fill="#5B4B8A"
          fillOpacity={0.1 * o(5)}
        />
        <circle
          cx="70"
          cy="68"
          r="13"
          fill="#EAF4FA"
          fillOpacity={0.14 * o(5)}
        />

        {/* L3 constellation paths — readable silver-blue lines */}
        <path
          d="M44 52 L70 36 L74 58"
          fill="none"
          stroke="#FFF8F0"
          strokeWidth="1.15"
          strokeOpacity={0.55 * o(3)}
          strokeLinecap="round"
        />
        <path
          d="M58 78 L74 58 L52 44"
          fill="none"
          stroke="#D0E4F2"
          strokeWidth="1"
          strokeOpacity={0.48 * o(3)}
          strokeLinecap="round"
        />
        <path
          d="M32 74 L56 54 L86 72"
          fill="none"
          stroke="#F6D365"
          strokeWidth="0.9"
          strokeOpacity={0.4 * o(3)}
          strokeLinecap="round"
        />
        <path
          d="M36 72 L54 48 L82 74"
          fill="none"
          stroke="#F6D365"
          strokeWidth="0.55"
          strokeOpacity={0.18 * o(4)}
          strokeLinecap="round"
        />
        <path
          d="M48 64 L70 68 L68 40"
          fill="none"
          stroke="#FFF8F0"
          strokeWidth="0.5"
          strokeOpacity={0.2 * o(5)}
          strokeLinecap="round"
        />

        {/* L3 intersection sparks */}
        <circle cx="64" cy="48" r="2.4" fill="#FFF8F0" fillOpacity={0.75 * o(3)} />
        <circle cx="66" cy="68" r="2.2" fill="#F6D365" fillOpacity={0.7 * o(3)} />
        <circle cx="48" cy="62" r="2" fill="#C5D9EA" fillOpacity={0.65 * o(3)} />

        <circle cx="72" cy="50" r="1.7" fill="#C5D9EA" fillOpacity={0.5 * o(4)} />
        <circle cx="60" cy="58" r="3.2" fill="#FFF8F0" fillOpacity={0.45 * o(5)} />
        <circle cx="60" cy="58" r="1.4" fill="#F6D365" fillOpacity={0.55 * o(5)} />
      </g>

      <circle cx="40" cy="38" r="11" fill="#FFF8F0" fillOpacity="0.4" />
    </svg>
  );
}
