import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { evolutionLayerOpacity } from "@/lib/planets/evolution";

type SurfaceProps = {
  level: PlanetEvolutionLevel;
  gradientPrefix: string;
};

/** Stand — waveforms / resonance / signal */
export function StandSurface({ level, gradientPrefix }: SurfaceProps) {
  const gid = `${gradientPrefix}-stand`;
  const o = (unlock: PlanetEvolutionLevel, peak = 1) =>
    evolutionLayerOpacity(level, unlock, { peak });

  const waveBright = level >= 3 ? 0.58 : level >= 2 ? 0.5 : 0.32;
  const goldBright = level >= 3 ? 0.58 : level >= 2 ? 0.5 : 0.26;
  const waveWidth = level >= 3 ? 5.5 : level >= 2 ? 5.2 : 5;

  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-body`} cx="36%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#B5A8D4" />
          <stop offset="40%" stopColor="#7A6BA8" />
          <stop offset="78%" stopColor="#5B4B8A" />
          <stop offset="100%" stopColor="#3D345F" />
        </radialGradient>
        <radialGradient id={`${gid}-center`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F6D365" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#A392D6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`${gid}-ridge`} x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#F6D365" stopOpacity="0" />
          <stop offset="45%" stopColor="#F6D365" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F6D365" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>

      <circle cx="60" cy="60" r="56" fill={`url(#${gid}-body)`} />

      {/* Soft inner wash starts subtly at L3 */}
      <circle
        cx="60"
        cy="60"
        r="40"
        fill={`url(#${gid}-center)`}
        opacity={level >= 3 ? 0.55 : o(4, 0.95)}
      />

      <g clipPath={`url(#${gid}-clip)`}>
        {/* Wave 1 — base (always) */}
        <path
          d="M22 58 C38 48, 52 70, 68 52 C82 38, 96 58, 102 54"
          fill="none"
          stroke="#A392D6"
          strokeWidth={waveWidth}
          strokeOpacity={waveBright}
          strokeLinecap="round"
        />
        {/* Wave 2 — gold-toned (always; brightens L2+) */}
        <path
          d="M18 74 C40 66, 55 86, 78 68 C90 58, 100 72, 106 70"
          fill="none"
          stroke="#F6D365"
          strokeWidth={level >= 2 ? 3.2 : 2.5}
          strokeOpacity={goldBright}
          strokeLinecap="round"
        />

        {/* L2 third waveform — clearly readable lavender arc */}
        <path
          d="M18 44 C36 32, 50 58, 72 36 C86 22, 98 46, 106 40"
          fill="none"
          stroke="#D4C8F0"
          strokeWidth="4.2"
          strokeOpacity={0.55 * o(2)}
          strokeLinecap="round"
        />

        {/* L3 fourth deep strand */}
        <path
          d="M22 90 C42 78, 58 98, 84 80 C96 70, 104 88, 110 84"
          fill="none"
          stroke="#9B8AC8"
          strokeWidth="4.5"
          strokeOpacity={0.55 * o(3)}
          strokeLinecap="round"
        />
        {/* L3 amplitude variation / gold accent strand */}
        <path
          d="M24 62 C40 48, 54 80, 74 54 C88 38, 100 68, 108 58"
          fill="none"
          stroke="#F6D365"
          strokeWidth="2.2"
          strokeOpacity={0.48 * o(3)}
          strokeLinecap="round"
        />

        {/* L2 peak accents — obvious luminous dots */}
        <circle cx="68" cy="52" r="3" fill="#F6D365" fillOpacity={0.85 * o(2)} />
        <circle cx="78" cy="68" r="2.4" fill="#FFF8F0" fillOpacity={0.75 * o(2)} />
        <circle
          cx="72"
          cy="36"
          r="2.6"
          fill="#FFF8F0"
          fillOpacity={0.7 * o(2)}
        />
        {/* L3 extra peak / depth accents */}
        <circle cx="84" cy="80" r="2.5" fill="#F6D365" fillOpacity={0.7 * o(3)} />
        <circle cx="54" cy="70" r="2.2" fill="#FFF8F0" fillOpacity={0.55 * o(3)} />

        <circle cx="82" cy="82" r="1.7" fill="#F6D365" fillOpacity={0.4 * o(4)} />
        <circle cx="55" cy="62" r="2.4" fill="#FFF8F0" fillOpacity={0.5 * o(5)} />
        <circle cx="86" cy="56" r="1.9" fill="#F6D365" fillOpacity={0.55 * o(5)} />
      </g>

      <circle cx="60" cy="60" r="56" fill={`url(#${gid}-ridge)`} />
      <circle cx="40" cy="36" r="12" fill="#FFF8F0" fillOpacity="0.28" />
    </svg>
  );
}
