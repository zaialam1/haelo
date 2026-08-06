import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { evolutionLayerOpacity } from "@/lib/planets/evolution";

type SurfaceProps = {
  level: PlanetEvolutionLevel;
  gradientPrefix: string;
};

/** Express — radiance / soft light / inner glow */
export function ExpressSurface({ level, gradientPrefix }: SurfaceProps) {
  const gid = `${gradientPrefix}-express`;
  const o = (unlock: PlanetEvolutionLevel, peak = 1) =>
    evolutionLayerOpacity(level, unlock, { peak });

  const primaryHighlight = level >= 3 ? 0.62 : level >= 2 ? 0.52 : 0.42;

  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-body`} cx="34%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFF4F0" />
          <stop offset="35%" stopColor="#F2C4D4" />
          <stop offset="72%" stopColor="#E8A0BF" />
          <stop offset="100%" stopColor="#C4789A" />
        </radialGradient>
        <radialGradient id={`${gid}-shade`} cx="70%" cy="75%" r="55%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#5B4B8A" stopOpacity="0.28" />
        </radialGradient>
        <radialGradient id={`${gid}-core`} cx="48%" cy="48%" r="42%">
          <stop offset="0%" stopColor="#FFF8F0" stopOpacity="0.75" />
          <stop offset="35%" stopColor="#F6D365" stopOpacity="0.22" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`${gid}-band`} x1="0%" y1="40%" x2="100%" y2="60%">
          <stop offset="0%" stopColor="#FFF8F0" stopOpacity="0" />
          <stop offset="40%" stopColor="#FFF8F0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFF8F0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-pearl`} x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#FFF8F0" stopOpacity="0" />
          <stop offset="45%" stopColor="#FFF8F0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#E8A0BF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>

      <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />

      {/* L3 luminous core — clearly brighter under the surface */}
      <circle
        cx="58"
        cy="56"
        r="32"
        fill={`url(#${gid}-core)`}
        opacity={o(3, 1)}
      />

      <g clipPath={`url(#${gid}-clip)`}>
        <ellipse
          cx="48"
          cy="44"
          rx="38"
          ry="18"
          fill={`url(#${gid}-band)`}
          transform="rotate(-18 48 44)"
        />
        <ellipse
          cx="70"
          cy="72"
          rx="32"
          ry="12"
          fill="#E8A0BF"
          fillOpacity="0.25"
          transform="rotate(12 70 72)"
        />

        {/* L2 pearlescent shimmer — wide visible band */}
        <ellipse
          cx="62"
          cy="54"
          rx="44"
          ry="26"
          fill={`url(#${gid}-pearl)`}
          transform="rotate(28 62 54)"
          opacity={o(2, 1)}
        />
        <ellipse
          cx="50"
          cy="68"
          rx="28"
          ry="12"
          fill="#FFF8F0"
          fillOpacity={0.18 * o(2)}
          transform="rotate(-12 50 68)"
        />

        {/* L3 curved light streaks — thicker / brighter */}
        <path
          d="M26 64 C42 46, 55 72, 82 48"
          fill="none"
          stroke="#FFF8F0"
          strokeWidth="2.2"
          strokeOpacity={0.55 * o(3)}
          strokeLinecap="round"
        />
        <path
          d="M30 80 C48 64, 64 88, 90 66"
          fill="none"
          stroke="#FFF8F0"
          strokeWidth="1.6"
          strokeOpacity={0.4 * o(3)}
          strokeLinecap="round"
        />
        <path
          d="M38 38 C52 30, 66 50, 90 36"
          fill="none"
          stroke="#F6D365"
          strokeWidth="1.4"
          strokeOpacity={0.42 * o(3)}
          strokeLinecap="round"
        />

        {/* L4–5 richer layered reflections */}
        <ellipse
          cx="74"
          cy="48"
          rx="16"
          ry="8"
          fill="#FFF8F0"
          fillOpacity={0.18 * o(4)}
          transform="rotate(-32 74 48)"
        />
        <ellipse
          cx="46"
          cy="70"
          rx="20"
          ry="7"
          fill="#FFF8F0"
          fillOpacity={0.12 * o(5)}
          transform="rotate(18 46 70)"
        />
      </g>

      <circle cx="60" cy="60" r="56" fill={`url(#${gid}-shade)`} />

      {/* Primary highlight — grows brighter each early stage */}
      <circle
        cx="42"
        cy="38"
        r={level >= 3 ? 16 : 14}
        fill="#FFF8F0"
        fillOpacity={primaryHighlight}
      />
      {/* L2+ second reflection — clearly separate highlight */}
      <circle
        cx="60"
        cy="28"
        r="8"
        fill="#FFF8F0"
        fillOpacity={0.55 * o(2)}
      />
      <circle
        cx="72"
        cy="42"
        r="4.5"
        fill="#FFF8F0"
        fillOpacity={0.35 * o(2)}
      />
      {/* L3 rim glow */}
      <circle
        cx="60"
        cy="60"
        r="53.5"
        fill="none"
        stroke="#FFF8F0"
        strokeWidth="2.4"
        strokeOpacity={0.42 * o(3)}
      />
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="none"
        stroke="#F6D365"
        strokeWidth="1"
        strokeOpacity={0.2 * o(3)}
      />
    </svg>
  );
}
