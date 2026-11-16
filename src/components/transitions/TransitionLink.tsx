"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import {
  useOptionalPageTransition,
  type TransitionVariant,
} from "@/components/transitions/PageTransitionProvider";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  variant?: TransitionVariant;
  /** Used for warp — usually the planet color */
  accent?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * App link that still supports the transition API, but navigates immediately.
 * Prefetch stays enabled so RSC payloads warm on hover/viewport.
 */
export function TransitionLink({
  href,
  variant = "fade",
  accent,
  onClick,
  replace,
  scroll,
  prefetch = true,
  className,
  ...rest
}: TransitionLinkProps) {
  void accent;
  const transition = useOptionalPageTransition();
  const mergedClassName = ["halo-btn", className].filter(Boolean).join(" ");

  return (
    <Link
      href={href}
      replace={replace}
      prefetch={prefetch}
      className={mergedClassName}
      scroll={scroll}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (!transition) return;
        // Allow modified clicks (new tab, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }

        // Instant push via context so callers that depend on navigate() still work;
        // Link's default navigation is prevented only to keep a single code path.
        e.preventDefault();
        transition.navigate({
          href: typeof href === "string" ? href : href.pathname ?? "/",
          variant,
        });
      }}
    />
  );
}
