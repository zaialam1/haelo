"use client";

import Image from "next/image";
import { TransitionLink } from "@/components/transitions/TransitionLink";

const SIZE_MAP = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 56,
} as const;

export type HaloLogoSize = keyof typeof SIZE_MAP | number;

type HaloLogoProps = {
  /** Pixel size, or a named preset. */
  size?: HaloLogoSize;
  /**
   * When set, wraps the mark in a home link.
   * Pass `null` to render a non-interactive mark.
   */
  href?: string | null;
  /** Accessible name for the link (or image when unlinked). */
  label?: string;
  /**
   * `mark` — transparent symbol (best on light surfaces).
   * `disc` — symbol on a soft lilac circle (best in dark headers / small sizes).
   */
  variant?: "mark" | "disc";
  className?: string;
  priority?: boolean;
};

function resolveSize(size: HaloLogoSize): number {
  return typeof size === "number" ? size : SIZE_MAP[size];
}

/**
 * Official Halo brand mark: planetary orbit + sound waves.
 * Use this everywhere a visual wordmark belongs; keep the product name in copy.
 */
export function HaloLogo({
  size = "md",
  href = "/",
  label = "Halo home",
  variant = "disc",
  className = "",
  priority = false,
}: HaloLogoProps) {
  const px = resolveSize(size);
  const src =
    variant === "disc"
      ? px > 96
        ? "/branding/halo-mark-disc-256.png"
        : "/branding/halo-mark-disc-128.png"
      : "/branding/halo-mark.png";

  const mark = (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: px, height: px }}
    >
      <Image
        src={src}
        alt={href ? "" : label}
        width={px}
        height={px}
        priority={priority}
        className="size-full object-contain"
        sizes={`${px}px`}
      />
    </span>
  );

  if (!href) {
    return mark;
  }

  return (
    <TransitionLink
      href={href}
      variant="fade"
      aria-label={label}
      className="inline-flex shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)]"
    >
      {mark}
    </TransitionLink>
  );
}
