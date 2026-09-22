import type { CosmeticVisualId } from "@/lib/cosmetics/types";

type CosmeticSpriteProps = {
  visual: CosmeticVisualId;
  size?: number;
  className?: string;
};

/**
 * Soft, luminous Universe decorations — Halo palette, gentle gradients.
 */
export function CosmeticSprite({
  visual,
  size = 28,
  className,
}: CosmeticSpriteProps) {
  const id = `cx-${visual}`;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    className,
    "aria-hidden": true as const,
  };

  switch (visual) {
    case "alien_soft":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-b`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#F6D0E0" />
              <stop offset="55%" stopColor="#E8A0BF" />
              <stop offset="100%" stopColor="#C4789A" />
            </radialGradient>
            <filter id={`${id}-g`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse cx="32" cy="48" rx="14" ry="4" fill="#5B4B8A" opacity="0.12" />
          <g filter={`url(#${id}-g)`}>
            <ellipse cx="32" cy="34" rx="14" ry="16" fill={`url(#${id}-b)`} />
            <ellipse cx="26" cy="18" rx="2.2" ry="7" fill="#E8A0BF" opacity="0.9" transform="rotate(-18 26 18)" />
            <ellipse cx="38" cy="18" rx="2.2" ry="7" fill="#E8A0BF" opacity="0.9" transform="rotate(18 38 18)" />
            <circle cx="26" cy="14" r="2.4" fill="#F6D0E0" />
            <circle cx="38" cy="14" r="2.4" fill="#F6D0E0" />
          </g>
          <circle cx="27" cy="31" r="2.2" fill="#5B4B8A" />
          <circle cx="37" cy="31" r="2.2" fill="#5B4B8A" />
          <circle cx="27.6" cy="30.4" r="0.7" fill="#FFF8F0" />
          <circle cx="37.6" cy="30.4" r="0.7" fill="#FFF8F0" />
          <path d="M27 40c2.5 2.2 7.5 2.2 10 0" stroke="#5B4B8A" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.55" />
        </svg>
      );

    case "alien_glow":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-b`} cx="40%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FFF3C8" />
              <stop offset="45%" stopColor="#F6D365" />
              <stop offset="100%" stopColor="#D4A83A" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="22" fill="#F6D365" opacity="0.16" />
          <circle cx="32" cy="32" r="16" fill="#F6D365" opacity="0.12" />
          <ellipse cx="32" cy="34" rx="13" ry="15" fill={`url(#${id}-b)`} />
          <circle cx="27" cy="31" r="2" fill="#5B4B8A" />
          <circle cx="37" cy="31" r="2" fill="#5B4B8A" />
          <circle cx="27.5" cy="30.5" r="0.6" fill="#FFF8F0" />
          <circle cx="37.5" cy="30.5" r="0.6" fill="#FFF8F0" />
          <path d="M28 41c2 1.6 6 1.6 8 0" stroke="#5B4B8A" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.45" />
        </svg>
      );

    case "fireflies":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-1`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="40%" stopColor="#F6D365" />
              <stop offset="100%" stopColor="#F6D365" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[
            [18, 22, 5],
            [38, 16, 4],
            [44, 34, 5.5],
            [24, 40, 3.5],
            [34, 28, 3],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r + 4} fill={`url(#${id}-1)`} opacity="0.55" />
              <circle cx={x} cy={y} r={r * 0.35} fill="#FFF8F0" />
            </g>
          ))}
        </svg>
      );

    case "whisper_wisp":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-s`} x1="0%" y1="50%" x2="100%" y2="20%">
              <stop offset="0%" stopColor="#E8A0BF" stopOpacity="0" />
              <stop offset="40%" stopColor="#E8A0BF" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#F6D0E0" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M8 42c8-14 12-6 18-16s10-4 20 6"
            stroke={`url(#${id}-s)`}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M12 44c7-10 11-4 16-12"
            stroke="#FFF8F0"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="48" cy="28" r="5" fill="#F6D0E0" opacity="0.9" />
          <circle cx="48" cy="28" r="2.2" fill="#FFF8F0" />
        </svg>
      );

    case "tide_creature":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-b`} x1="20%" y1="20%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#B8DCE8" />
              <stop offset="100%" stopColor="#6B9BC7" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="48" rx="16" ry="4" fill="#5B4B8A" opacity="0.1" />
          <ellipse cx="32" cy="34" rx="18" ry="11" fill={`url(#${id}-b)`} />
          <path d="M10 34c4 6 10 8 16 4" fill="#6B9BC7" opacity="0.45" />
          <path d="M14 30c6 0 8-4 10-2" stroke="#FFF8F0" strokeWidth="1.4" fill="none" opacity="0.45" strokeLinecap="round" />
          <circle cx="42" cy="31" r="2.4" fill="#5B4B8A" />
          <circle cx="42.7" cy="30.4" r="0.7" fill="#FFF8F0" />
          <ellipse cx="48" cy="38" rx="3" ry="2" fill="#E8A0BF" opacity="0.55" />
        </svg>
      );

    case "cloud_sheep":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-c`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#EDE6F5" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="48" rx="14" ry="3.5" fill="#5B4B8A" opacity="0.1" />
          <circle cx="22" cy="34" r="9" fill={`url(#${id}-c)`} />
          <circle cx="34" cy="30" r="11" fill={`url(#${id}-c)`} />
          <circle cx="44" cy="36" r="8" fill={`url(#${id}-c)`} />
          <circle cx="28" cy="38" r="7" fill={`url(#${id}-c)`} />
          <circle cx="36" cy="28" r="1.8" fill="#5B4B8A" opacity="0.75" />
          <circle cx="36.5" cy="27.5" r="0.5" fill="#FFF" />
          <path d="M33 34c1.5 1 3.5 1 5 0" stroke="#5B4B8A" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />
        </svg>
      );

    case "lantern_ground":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-g`} cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="50%" stopColor="#F6D365" />
              <stop offset="100%" stopColor="#F6D365" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-p`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF3C8" />
              <stop offset="100%" stopColor="#E8B84A" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="34" r="16" fill={`url(#${id}-g)`} opacity="0.7" />
          <path d="M32 10v8" stroke="#5B4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M24 14h16" stroke="#5B4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <rect x="24" y="20" width="16" height="22" rx="4" fill={`url(#${id}-p)`} />
          <rect x="27" y="24" width="10" height="12" rx="2" fill="#FFF8F0" opacity="0.35" />
          <ellipse cx="32" cy="48" rx="10" ry="3" fill="#5B4B8A" opacity="0.15" />
        </svg>
      );

    case "crystal_cluster":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-1`} x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#EDE6F5" />
              <stop offset="100%" stopColor="#9B8BC4" />
            </linearGradient>
            <linearGradient id={`${id}-2`} x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#F6D0E0" />
              <stop offset="100%" stopColor="#E8A0BF" />
            </linearGradient>
            <linearGradient id={`${id}-3`} x1="40%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="#D4E8F2" />
              <stop offset="100%" stopColor="#6B9BC7" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="52" rx="16" ry="4" fill="#5B4B8A" opacity="0.1" />
          <path d="M32 8l9 36H23z" fill={`url(#${id}-1)`} />
          <path d="M18 22l7 28H11z" fill={`url(#${id}-2)`} opacity="0.92" />
          <path d="M46 20l7 30H39z" fill={`url(#${id}-3)`} opacity="0.92" />
          <path d="M32 12l3 12H29z" fill="#FFF8F0" opacity="0.35" />
        </svg>
      );

    case "tide_pool":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-w`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#E8F4FA" />
              <stop offset="55%" stopColor="#7EB8C9" />
              <stop offset="100%" stopColor="#5A8FA8" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="36" rx="22" ry="12" fill={`url(#${id}-w)`} />
          <ellipse cx="26" cy="32" rx="8" ry="3.5" fill="#FFF8F0" opacity="0.35" />
          <circle cx="40" cy="38" r="2" fill="#E8A0BF" opacity="0.45" />
          <circle cx="28" cy="40" r="1.4" fill="#F6D365" opacity="0.4" />
        </svg>
      );

    case "moss_bloom":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-m`} cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#C5E0C5" />
              <stop offset="100%" stopColor="#6E9A6E" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="48" rx="18" ry="6" fill={`url(#${id}-m)`} opacity="0.85" />
          <circle cx="24" cy="40" r="7" fill="#8FBF8F" />
          <circle cx="34" cy="36" r="9" fill={`url(#${id}-m)`} />
          <circle cx="42" cy="42" r="6" fill="#A8D0A8" />
          <circle cx="30" cy="42" r="5" fill="#7BA87B" opacity="0.8" />
          <circle cx="36" cy="34" r="2" fill="#F6D365" opacity="0.55" />
        </svg>
      );

    case "garden_stone":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-s`} x1="30%" y1="20%" x2="70%" y2="90%">
              <stop offset="0%" stopColor="#D4CBC0" />
              <stop offset="100%" stopColor="#8F8376" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="50" rx="18" ry="5" fill="#5B4B8A" opacity="0.1" />
          <ellipse cx="32" cy="36" rx="20" ry="12" fill={`url(#${id}-s)`} />
          <ellipse cx="26" cy="32" rx="6" ry="3" fill="#FFF8F0" opacity="0.22" />
          <path d="M22 40c4 2 8 1 12-1" stroke="#5B4B8A" strokeWidth="1" opacity="0.2" fill="none" />
        </svg>
      );

    case "star_lily":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-c`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="100%" stopColor="#F6D365" />
            </radialGradient>
          </defs>
          <path d="M32 52V28" stroke="#7BA87B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 40c-6-2-8 2-6 4M32 36c6-2 8 2 6 4" stroke="#9BC49B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse
              key={deg}
              cx="32"
              cy="22"
              rx="4"
              ry="10"
              fill="#E8A0BF"
              opacity="0.85"
              transform={`rotate(${deg} 32 22)`}
            />
          ))}
          <circle cx="32" cy="22" r="5" fill={`url(#${id}-c)`} />
        </svg>
      );

    case "glow_fern":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-f`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#5F8F5F" />
              <stop offset="100%" stopColor="#B5D9B5" />
            </linearGradient>
          </defs>
          <path d="M32 54V14" stroke={`url(#${id}-f)`} strokeWidth="2.5" strokeLinecap="round" />
          {[16, 24, 32, 40].map((y, i) => (
            <g key={y}>
              <path
                d={`M32 ${y}c-${8 - i}-${3 + i} -12 ${i} -8 ${4 + i}`}
                stroke="#8FBF8F"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M32 ${y}c${8 - i}-${3 + i} 12 ${i} 8 ${4 + i}`}
                stroke="#A8D0A8"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ))}
          <circle cx="32" cy="14" r="3" fill="#F6D365" opacity="0.55" />
        </svg>
      );

    case "silver_moon":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-m`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#E8E4F0" />
              <stop offset="100%" stopColor="#B8B0C8" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="20" fill="#E8E4F0" opacity="0.15" />
          <circle cx="32" cy="32" r="16" fill={`url(#${id}-m)`} />
          <circle cx="24" cy="26" r="3.5" fill="#C8C0D8" opacity="0.35" />
          <circle cx="38" cy="36" r="2.5" fill="#C8C0D8" opacity="0.28" />
          <circle cx="28" cy="38" r="1.8" fill="#C8C0D8" opacity="0.25" />
        </svg>
      );

    case "ember_moon":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-m`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFE0B8" />
              <stop offset="50%" stopColor="#E8A070" />
              <stop offset="100%" stopColor="#C87848" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="22" fill="#F6D365" opacity="0.14" />
          <circle cx="32" cy="32" r="16" fill={`url(#${id}-m)`} />
          <circle cx="26" cy="28" r="3" fill="#FFF8F0" opacity="0.2" />
        </svg>
      );

    case "pearl_moon":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-m`} cx="32%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#F5F0FA" />
              <stop offset="100%" stopColor="#D8D0E8" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="18" fill={`url(#${id}-m)`} />
          <circle cx="24" cy="24" r="5" fill="#FFF" opacity="0.45" />
          <circle cx="40" cy="38" r="2" fill="#E8A0BF" opacity="0.25" />
        </svg>
      );

    case "mirror_moon":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-m`} cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F0F6FC" />
              <stop offset="55%" stopColor="#C5D5E8" />
              <stop offset="100%" stopColor="#8FA8C4" />
            </radialGradient>
            <linearGradient id={`${id}-r`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8A0BF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F6D365" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="20" fill="none" stroke={`url(#${id}-r)`} strokeWidth="2" />
          <circle cx="32" cy="32" r="15" fill={`url(#${id}-m)`} />
          <path d="M20 32h24" stroke="#FFF8F0" strokeWidth="1.2" opacity="0.35" />
          <circle cx="26" cy="26" r="3" fill="#FFF" opacity="0.3" />
        </svg>
      );

    case "quiet_satellite":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-b`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4CCE8" />
              <stop offset="100%" stopColor="#8B7CB0" />
            </linearGradient>
          </defs>
          <rect x="14" y="28" width="8" height="8" rx="1.5" fill="#E8A0BF" opacity="0.85" />
          <rect x="42" y="28" width="8" height="8" rx="1.5" fill="#E8A0BF" opacity="0.85" />
          <rect x="22" y="24" width="20" height="16" rx="4" fill={`url(#${id}-b)`} />
          <rect x="26" y="28" width="12" height="8" rx="2" fill="#5B4B8A" opacity="0.35" />
          <circle cx="32" cy="32" r="2" fill="#F6D365" opacity="0.8" />
        </svg>
      );

    case "soft_ring":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-r`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#E8E4F0" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#F5F0FA" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E8E4F0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="34" rx="28" ry="10" fill="none" stroke={`url(#${id}-r)`} strokeWidth="4" />
          <ellipse cx="32" cy="34" rx="28" ry="10" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.35" />
        </svg>
      );

    case "ember_ring":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-r`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#F6D365" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#F6D365" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E8A070" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="34" rx="28" ry="10" fill="none" stroke={`url(#${id}-r)`} strokeWidth="4.5" />
        </svg>
      );

    case "aurora_ring":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-a`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8A0BF" />
              <stop offset="50%" stopColor="#7EB8C9" />
              <stop offset="100%" stopColor="#F6D365" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="34" rx="28" ry="11" fill="none" stroke={`url(#${id}-a)`} strokeWidth="3.5" opacity="0.85" />
          <ellipse cx="32" cy="34" rx="22" ry="7" fill="none" stroke="#E8A0BF" strokeWidth="1.5" opacity="0.4" />
        </svg>
      );

    case "halo_ring":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-h`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF3C8" />
              <stop offset="100%" stopColor="#F6D365" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="24" fill="none" stroke={`url(#${id}-h)`} strokeWidth="2.5" opacity="0.85" />
          <circle cx="32" cy="32" r="20" fill="none" stroke="#FFF8F0" strokeWidth="1" opacity="0.35" />
        </svg>
      );

    case "mist_sky":
      return (
        <svg {...common}>
          <ellipse cx="22" cy="30" rx="14" ry="7" fill="#FFF8F0" opacity="0.45" />
          <ellipse cx="40" cy="36" rx="16" ry="8" fill="#EDE6F5" opacity="0.4" />
          <ellipse cx="30" cy="26" rx="12" ry="5" fill="#FFF" opacity="0.35" />
        </svg>
      );

    case "aurora_veil":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-v`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7EB8C9" stopOpacity="0" />
              <stop offset="40%" stopColor="#7EB8C9" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#E8A0BF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F6D365" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M6 50c8-22 14-14 22-30s12-8 30 14" stroke={`url(#${id}-v)`} strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M10 52c7-16 12-10 18-22s10-4 24 10" stroke="#E8A0BF" strokeWidth="3" fill="none" opacity="0.35" strokeLinecap="round" />
        </svg>
      );

    case "sparkle_sky":
      return (
        <svg {...common}>
          {[
            [18, 20, 5],
            [40, 16, 4],
            [46, 36, 3.5],
            [28, 40, 3],
            [34, 26, 2.5],
          ].map(([x, y, s], i) => (
            <path
              key={i}
              d={`M${x} ${y - s}l${s * 0.35} ${s * 0.65} ${s * 0.65} ${s * 0.35}-${s * 0.65} ${s * 0.35}-${s * 0.35} ${s * 0.65}-${s * 0.35}-${s * 0.65}-${s * 0.65}-${s * 0.35} ${s * 0.65}-${s * 0.35}z`}
              fill={i % 2 === 0 ? "#F6D365" : "#E8A0BF"}
              opacity={0.85}
            />
          ))}
        </svg>
      );

    case "dust_trail":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-d`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F6D365" stopOpacity="0" />
              <stop offset="50%" stopColor="#F6D365" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E8A0BF" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path d="M8 48c10-8 16-6 24-16s12-6 24-4" stroke={`url(#${id}-d)`} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="2 6" />
          <circle cx="50" cy="22" r="3" fill="#F6D365" />
          <circle cx="36" cy="28" r="2" fill="#E8A0BF" opacity="0.8" />
          <circle cx="22" cy="38" r="1.5" fill="#F6D365" opacity="0.6" />
        </svg>
      );

    case "pulse_orb":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-o`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#B8A9D9" />
              <stop offset="100%" stopColor="#5B4B8A" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="20" fill="none" stroke="#E8A0BF" strokeWidth="1.5" opacity="0.35" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="#E8A0BF" strokeWidth="1" opacity="0.25" />
          <circle cx="32" cy="32" r="9" fill={`url(#${id}-o)`} />
          <circle cx="29" cy="29" r="2.5" fill="#FFF8F0" opacity="0.35" />
        </svg>
      );

    case "distant_comet":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-t`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8E4F0" stopOpacity="0" />
              <stop offset="100%" stopColor="#F6D365" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id={`${id}-h`} cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="100%" stopColor="#F6D365" />
            </radialGradient>
          </defs>
          <path d="M8 52l32-32" stroke={`url(#${id}-t)`} strokeWidth="4" strokeLinecap="round" />
          <path d="M12 50l28-28" stroke="#E8A0BF" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
          <circle cx="44" cy="16" r="7" fill={`url(#${id}-h)`} />
          <circle cx="42" cy="14" r="2" fill="#FFF" opacity="0.5" />
        </svg>
      );

    case "ribbon_comet":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${id}-t`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8A0BF" stopOpacity="0" />
              <stop offset="100%" stopColor="#E8A0BF" />
            </linearGradient>
            <radialGradient id={`${id}-h`} cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFF3C8" />
              <stop offset="100%" stopColor="#F6D365" />
            </radialGradient>
          </defs>
          <path d="M6 54c12-12 18-8 28-22s14-8 24-6" stroke={`url(#${id}-t)`} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M10 52c10-10 16-6 24-18" stroke="#F6D365" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
          <circle cx="50" cy="18" r="8" fill={`url(#${id}-h)`} />
        </svg>
      );

    case "nebula_haze":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-n`} cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#E8A0BF" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#5B4B8A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5B4B8A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="32" rx="28" ry="18" fill={`url(#${id}-n)`} />
          <ellipse cx="38" cy="28" rx="14" ry="10" fill="#7EB8C9" opacity="0.2" />
          <ellipse cx="24" cy="36" rx="12" ry="8" fill="#F6D365" opacity="0.12" />
        </svg>
      );

    case "friend_beacon":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="40%" stopColor="#F6D365" />
              <stop offset="100%" stopColor="#F6D365" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="36" r="18" fill={`url(#${id}-b)`} opacity="0.7" />
          <path d="M32 10v18" stroke="#F6D365" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
          <circle cx="32" cy="36" r="7" fill="#F6D365" />
          <circle cx="32" cy="36" r="3" fill="#FFF8F0" opacity="0.7" />
        </svg>
      );

    case "orbit_spark":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`${id}-c`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="100%" stopColor="#F6D365" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="22" fill="none" stroke="#E8A0BF" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 5" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="#F6D365" strokeWidth="1.5" opacity="0.55" />
          <circle cx="32" cy="32" r="5" fill={`url(#${id}-c)`} />
          <circle cx="48" cy="24" r="2.5" fill="#E8A0BF" opacity="0.8" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="12" fill="#5B4B8A" opacity="0.35" />
        </svg>
      );
  }
}
