import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { evolutionLayerOpacity } from "@/lib/planets/evolution";

type SurfaceProps = {
  level: PlanetEvolutionLevel;
  gradientPrefix: string;
};

/** Explore — constellation / discovery (rings & moons live in the shell) */
export function ExploreSurface({ level, gradientPrefix }: SurfaceProps) {
  const gid = `${gradientPrefix}-explore`;
  const o = (unlock: PlanetEvolutionLevel, peak = 1) =>
    evolutionLayerOpacity(level, unlock, { peak });

  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-body`} cx="34%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFF1E8" />
          <stop offset="32%" stopColor="#F0C4A8" />
          <stop offset="70%" stopColor="#E9A98A" />
          <stop offset="100%" stopColor="#C47E5E" />
        </radialGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>

      <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />

      <g clipPath={`url(#${gid}-clip)`}>
        {/* Base constellation nodes */}
        <circle cx="38" cy="42" r="2.2" fill="#F6D365" fillOpacity="0.85" />
        <circle cx="58" cy="34" r="1.6" fill="#FFF8F0" fillOpacity="0.75" />
        <circle cx="72" cy="48" r="2" fill="#F6D365" fillOpacity="0.7" />
        <circle cx="48" cy="68" r="1.8" fill="#FFF8F0" fillOpacity="0.65" />
        <circle cx="78" cy="72" r="1.5" fill="#F6D365" fillOpacity="0.6" />

        {/* Base constellation lines */}
        <path
          d="M38 42 L58 34 L72 48 M58 34 L48 68 M72 48 L78 72"
          fill="none"
          stroke="#F6D365"
          strokeWidth="0.8"
          strokeOpacity={level >= 3 ? 0.45 : 0.35}
        />

        {/* L2 new stars */}
        <circle cx="30" cy="58" r="1.3" fill="#FFF8F0" fillOpacity={0.7 * o(2)} />
        <circle cx="66" cy="62" r="1.4" fill="#F6D365" fillOpacity={0.75 * o(2)} />
        <circle cx="52" cy="50" r="1.2" fill="#FFF8F0" fillOpacity={0.6 * o(2)} />

        {/* L3 more connected structure */}
        <path
          d="M30 58 L38 42 L52 50 L66 62 L78 72"
          fill="none"
          stroke="#F6D365"
          strokeWidth="0.65"
          strokeOpacity={0.3 * o(3)}
        />
        <circle cx="44" cy="28" r="1.5" fill="#F6D365" fillOpacity={0.7 * o(3)} />
        <circle cx="84" cy="56" r="1.3" fill="#FFF8F0" fillOpacity={0.65 * o(3)} />
        <path
          d="M58 34 L44 28 L72 48 L84 56"
          fill="none"
          stroke="#FFF8F0"
          strokeWidth="0.55"
          strokeOpacity={0.28 * o(3)}
        />

        {/* L4 constellation expands toward edges */}
        <circle cx="22" cy="48" r="1.4" fill="#F6D365" fillOpacity={0.65 * o(4)} />
        <circle cx="92" cy="64" r="1.5" fill="#FFF8F0" fillOpacity={0.6 * o(4)} />
        <circle cx="56" cy="92" r="1.3" fill="#F6D365" fillOpacity={0.55 * o(4)} />
        <path
          d="M22 48 L30 58 L48 68 L56 92 M72 48 L92 64"
          fill="none"
          stroke="#F6D365"
          strokeWidth="0.5"
          strokeOpacity={0.25 * o(4)}
        />

        {/* L5 richer constellation + brighter nodes */}
        <circle cx="34" cy="80" r="1.6" fill="#FFF8F0" fillOpacity={0.7 * o(5)} />
        <circle cx="88" cy="38" r="1.7" fill="#F6D365" fillOpacity={0.75 * o(5)} />
        <circle cx="60" cy="56" r="2.2" fill="#F6D365" fillOpacity={0.55 * o(5)} />
        <path
          d="M34 80 L48 68 L60 56 L72 48 L88 38 M60 56 L66 62"
          fill="none"
          stroke="#FFF8F0"
          strokeWidth="0.55"
          strokeOpacity={0.32 * o(5)}
        />
      </g>

      <circle cx="42" cy="36" r="12" fill="#FFF8F0" fillOpacity="0.35" />
    </svg>
  );
}
