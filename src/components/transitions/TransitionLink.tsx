"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import {
  useOptionalPageTransition,
  type TransitionVariant,
} from "@/components/transitions/PageTransitionProvider";
import { agentLog } from "@/lib/debug/agentLog";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  variant?: TransitionVariant;
  /** Used for warp — usually the planet color */
  accent?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export function TransitionLink({
  href,
  variant = "fade",
  accent,
  onClick,
  replace,
  scroll,
  prefetch,
  className,
  ...rest
}: TransitionLinkProps) {
  const transition = useOptionalPageTransition();
  const mergedClassName = ["haelo-btn", className].filter(Boolean).join(" ");

  return (
    <Link
      href={href}
      replace={replace}
      prefetch={prefetch}
      className={mergedClassName}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // #region agent log
        agentLog({
          hypothesisId: "B",
          location: "TransitionLink.tsx:onClick",
          message: "planet/link click",
          data: {
            href: String(href),
            variant,
            hasTransition: Boolean(transition),
            metaKey: e.metaKey,
            button: e.button,
          },
        });
        // #endregion
        if (!transition) return;
        // Allow modified clicks (new tab, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }

        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const originX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
        const originY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

        // #region agent log
        agentLog({
          hypothesisId: "A",
          location: "TransitionLink.tsx:beforeNavigate",
          message: "calling navigate after preventDefault",
          data: { href: String(href), variant, originX, originY },
        });
        // #endregion

        transition.navigate({
          href: typeof href === "string" ? href : href.pathname ?? "/",
          variant,
          accent,
          originX,
          originY,
        });
      }}
      // When the transition provider owns navigation, it scrolls under the veil.
      // Keep Next's default scroll when falling back to plain <Link>.
      scroll={scroll ?? (transition ? false : undefined)}
    />
  );
}
