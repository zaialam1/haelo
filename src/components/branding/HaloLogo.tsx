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
  className?: string;
  priority?: boolean;
};

function resolveSize(size: HaloLogoSize): number {
  return typeof size === "number" ? size : SIZE_MAP[size];
}

/**
 * Official Halo brand mark: planetary orbit + sound waves.
 * Transparent purple symbol only — no lavender disc or square backdrop.
 * Light/dark assets are both rendered; css.html.dark toggles visibility
 * so SSR HTML matches the client (no hydration mismatch).
 */
export function HaloLogo({
  size = "md",
  href = "/",
  label = "Halo home",
  className = "",
  priority = false,
}: HaloLogoProps) {
  const px = resolveSize(size);

  const mark = (
    <span
      className={`halo-logo relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      {...(href ? {} : { role: "img", "aria-label": label })}
    >
      <Image
        src="/branding/halo-mark.png"
        alt={href ? "" : label}
        width={px}
        height={px}
        priority={priority}
        className="halo-logo-light size-full object-contain"
        sizes={`${px}px`}
      />
      <Image
        src="/branding/halo-mark-on-dark.png"
        alt=""
        width={px}
        height={px}
        priority={priority}
        className="halo-logo-dark absolute inset-0 size-full object-contain"
        sizes={`${px}px`}
        aria-hidden
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
