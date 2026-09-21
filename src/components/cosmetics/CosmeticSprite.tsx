import type { CosmeticVisualId } from "@/lib/cosmetics/types";

type CosmeticSpriteProps = {
  visual: CosmeticVisualId;
  size?: number;
  className?: string;
};

/**
 * Stylized SVG decorations for Universe / planet slots.
 * Calm Haelo shapes — not cartoon loot.
 */
export function CosmeticSprite({
  visual,
  size = 28,
  className,
}: CosmeticSpriteProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    className,
    "aria-hidden": true as const,
  };

  switch (visual) {
    case "alien_soft":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="22" rx="9" ry="11" fill="#E8A0BF" opacity="0.92" />
          <circle cx="16" cy="18" r="1.6" fill="#5B4B8A" />
          <circle cx="24" cy="18" r="1.6" fill="#5B4B8A" />
          <path d="M16 26c2 1.5 6 1.5 8 0" stroke="#5B4B8A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M14 10c-2-4 2-6 4-3M26 10c2-4-2-6-4-3" stroke="#E8A0BF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "alien_glow":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="14" fill="#F6D365" opacity="0.18" />
          <ellipse cx="20" cy="22" rx="8" ry="10" fill="#F6D365" opacity="0.85" />
          <circle cx="17" cy="19" r="1.4" fill="#5B4B8A" />
          <circle cx="23" cy="19" r="1.4" fill="#5B4B8A" />
        </svg>
      );
    case "fireflies":
      return (
        <svg {...common}>
          <circle cx="12" cy="14" r="2" fill="#F6D365" opacity="0.9" />
          <circle cx="24" cy="10" r="1.5" fill="#F6D365" opacity="0.7" />
          <circle cx="28" cy="22" r="2.2" fill="#F6D365" opacity="0.85" />
          <circle cx="16" cy="26" r="1.4" fill="#E8A0BF" opacity="0.8" />
        </svg>
      );
    case "whisper_wisp":
      return (
        <svg {...common}>
          <path
            d="M8 24c6-10 10-4 14-10s8-2 12 4"
            stroke="#E8A0BF"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="30" cy="16" r="2" fill="#FFF8F0" opacity="0.9" />
        </svg>
      );
    case "tide_creature":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="22" rx="11" ry="7" fill="#7EB8C9" opacity="0.85" />
          <circle cx="26" cy="20" r="1.5" fill="#5B4B8A" />
          <path d="M8 22c3 3 6 3 9 0" stroke="#FFF8F0" strokeWidth="1.2" fill="none" opacity="0.6" />
        </svg>
      );
    case "cloud_sheep":
      return (
        <svg {...common}>
          <circle cx="14" cy="22" r="6" fill="#FFF8F0" opacity="0.9" />
          <circle cx="22" cy="20" r="7" fill="#FFF8F0" opacity="0.95" />
          <circle cx="28" cy="24" r="5" fill="#FFF8F0" opacity="0.85" />
          <circle cx="24" cy="18" r="1.2" fill="#5B4B8A" />
        </svg>
      );
    case "lantern_ground":
      return (
        <svg {...common}>
          <rect x="16" y="14" width="8" height="12" rx="2" fill="#F6D365" opacity="0.9" />
          <path d="M20 8v6" stroke="#5B4B8A" strokeWidth="1.5" />
          <path d="M14 10h12" stroke="#5B4B8A" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="20" cy="28" rx="6" ry="2" fill="#5B4B8A" opacity="0.25" />
        </svg>
      );
    case "crystal_cluster":
      return (
        <svg {...common}>
          <path d="M20 8l5 14h-10z" fill="#B8A9D9" opacity="0.9" />
          <path d="M12 16l4 12H8z" fill="#E8A0BF" opacity="0.75" />
          <path d="M28 16l4 12h-8z" fill="#7EB8C9" opacity="0.75" />
        </svg>
      );
    case "tide_pool":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="24" rx="12" ry="6" fill="#7EB8C9" opacity="0.55" />
          <ellipse cx="20" cy="23" rx="7" ry="3" fill="#FFF8F0" opacity="0.35" />
        </svg>
      );
    case "moss_bloom":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="26" rx="10" ry="5" fill="#7BA87B" opacity="0.7" />
          <circle cx="16" cy="22" r="3" fill="#9BC49B" />
          <circle cx="22" cy="20" r="4" fill="#7BA87B" />
          <circle cx="26" cy="24" r="2.5" fill="#9BC49B" />
        </svg>
      );
    case "garden_stone":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="24" rx="11" ry="7" fill="#A89B8C" opacity="0.8" />
          <ellipse cx="18" cy="22" rx="3" ry="1.5" fill="#FFF8F0" opacity="0.25" />
        </svg>
      );
    case "star_lily":
      return (
        <svg {...common}>
          <circle cx="20" cy="18" r="4" fill="#F6D365" />
          <path d="M20 8v6M20 22v6M10 18h6M24 18h6M13 11l4 4M23 21l4 4M27 11l-4 4M13 25l4-4" stroke="#E8A0BF" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "glow_fern":
      return (
        <svg {...common}>
          <path d="M20 32V12" stroke="#7BA87B" strokeWidth="2" />
          <path d="M20 16c-6-2-8 2-6 4M20 20c6-2 8 2 6 4M20 24c-5-1-7 2-5 3" stroke="#9BC49B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "silver_moon":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="10" fill="#E8E4F0" opacity="0.95" />
          <circle cx="16" cy="17" r="2" fill="#C8C0D8" opacity="0.5" />
          <circle cx="24" cy="23" r="1.5" fill="#C8C0D8" opacity="0.4" />
        </svg>
      );
    case "ember_moon":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="10" fill="#E8A070" opacity="0.9" />
          <circle cx="20" cy="20" r="14" fill="#F6D365" opacity="0.12" />
        </svg>
      );
    case "pearl_moon":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="10" fill="#F5F0FA" />
          <circle cx="15" cy="15" r="3" fill="#FFF" opacity="0.55" />
        </svg>
      );
    case "mirror_moon":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="10" fill="#C5D5E8" opacity="0.85" />
          <path d="M12 20h16" stroke="#FFF8F0" strokeWidth="1" opacity="0.5" />
          <circle cx="20" cy="20" r="13" fill="none" stroke="#E8A0BF" strokeWidth="1" opacity="0.4" />
        </svg>
      );
    case "quiet_satellite":
      return (
        <svg {...common}>
          <rect x="14" y="16" width="12" height="8" rx="2" fill="#B8A9D9" />
          <rect x="10" y="18" width="4" height="4" fill="#E8A0BF" opacity="0.8" />
          <rect x="26" y="18" width="4" height="4" fill="#E8A0BF" opacity="0.8" />
        </svg>
      );
    case "soft_ring":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="22" rx="16" ry="6" fill="none" stroke="#E8E4F0" strokeWidth="2.5" opacity="0.85" />
        </svg>
      );
    case "ember_ring":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="22" rx="16" ry="6" fill="none" stroke="#F6D365" strokeWidth="2.5" opacity="0.8" />
        </svg>
      );
    case "aurora_ring":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="22" rx="16" ry="6" fill="none" stroke="#E8A0BF" strokeWidth="2" opacity="0.7" />
          <ellipse cx="20" cy="22" rx="13" ry="4.5" fill="none" stroke="#7EB8C9" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );
    case "halo_ring":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="20" rx="15" ry="15" fill="none" stroke="#F6D365" strokeWidth="1.5" opacity="0.75" />
        </svg>
      );
    case "mist_sky":
      return (
        <svg {...common}>
          <ellipse cx="14" cy="18" rx="8" ry="4" fill="#FFF8F0" opacity="0.35" />
          <ellipse cx="26" cy="22" rx="10" ry="5" fill="#FFF8F0" opacity="0.3" />
        </svg>
      );
    case "aurora_veil":
      return (
        <svg {...common}>
          <path d="M6 28c4-12 8-8 12-16s8-4 16 8" stroke="#7EB8C9" strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M8 30c5-10 9-6 12-14s7-2 14 6" stroke="#E8A0BF" strokeWidth="2" fill="none" opacity="0.45" />
        </svg>
      );
    case "sparkle_sky":
      return (
        <svg {...common}>
          <path d="M12 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#F6D365" />
          <path d="M28 18l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="#E8A0BF" />
          <path d="M20 26l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z" fill="#FFF8F0" />
        </svg>
      );
    case "dust_trail":
      return (
        <svg {...common}>
          <circle cx="10" cy="22" r="1.5" fill="#F6D365" opacity="0.5" />
          <circle cx="16" cy="18" r="2" fill="#F6D365" opacity="0.65" />
          <circle cx="24" cy="16" r="2.5" fill="#E8A0BF" opacity="0.55" />
          <circle cx="32" cy="14" r="1.5" fill="#FFF8F0" opacity="0.7" />
        </svg>
      );
    case "pulse_orb":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="6" fill="#5B4B8A" opacity="0.7" />
          <circle cx="20" cy="20" r="10" fill="none" stroke="#E8A0BF" strokeWidth="1.5" opacity="0.5" />
        </svg>
      );
    case "distant_comet":
      return (
        <svg {...common}>
          <path d="M8 28l16-16" stroke="#E8E4F0" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <circle cx="26" cy="10" r="3.5" fill="#F6D365" />
        </svg>
      );
    case "ribbon_comet":
      return (
        <svg {...common}>
          <path d="M6 30c8-8 12-6 18-14" stroke="#E8A0BF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="12" r="4" fill="#F6D365" />
        </svg>
      );
    case "nebula_haze":
      return (
        <svg {...common}>
          <ellipse cx="20" cy="20" rx="16" ry="10" fill="#5B4B8A" opacity="0.25" />
          <ellipse cx="24" cy="18" rx="10" ry="6" fill="#E8A0BF" opacity="0.2" />
        </svg>
      );
    case "friend_beacon":
      return (
        <svg {...common}>
          <circle cx="20" cy="22" r="4" fill="#F6D365" />
          <path d="M20 8v10" stroke="#F6D365" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <circle cx="20" cy="20" r="12" fill="none" stroke="#F6D365" strokeWidth="1" opacity="0.3" />
        </svg>
      );
    case "orbit_spark":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="3" fill="#FFF8F0" />
          <circle cx="20" cy="20" r="8" fill="none" stroke="#F6D365" strokeWidth="1.5" opacity="0.6" />
          <circle cx="20" cy="20" r="13" fill="none" stroke="#E8A0BF" strokeWidth="1" opacity="0.35" strokeDasharray="3 3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="8" fill="#5B4B8A" opacity="0.4" />
        </svg>
      );
  }
}
