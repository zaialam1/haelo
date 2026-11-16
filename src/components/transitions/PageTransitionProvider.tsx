"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export type TransitionVariant = "fade" | "warp";

type TransitionRequest = {
  href: string;
  variant: TransitionVariant;
  /** Accent color for warp (planet tint) — retained for API compatibility */
  accent?: string;
  /** Click origin — retained for API compatibility */
  originX?: number;
  originY?: number;
};

type PageTransitionContextValue = {
  /** Returns false when navigation was skipped (same path). */
  navigate: (
    request: TransitionRequest,
  ) => boolean | void | Promise<boolean | void>;
  /** No-op cover kept for form submits that previously used a veil */
  cover: (variant?: TransitionVariant) => void;
  isTransitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition must be used within PageTransitionProvider");
  }
  return ctx;
}

/** Safe hook when provider might be absent — falls back to plain navigation */
export function useOptionalPageTransition() {
  return useContext(PageTransitionContext);
}

/**
 * Instant navigation. Decorative leave/enter overlays were removed because
 * they delayed every route change (280–780ms before push, plus enter time)
 * and felt unpolished compared to a clean immediate transition.
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (request: TransitionRequest) => {
      const target = request.href;
      if (target === pathname || target === `${pathname}/`) {
        return false;
      }
      router.push(target);
      return true;
    },
    [pathname, router],
  );

  const cover = useCallback((..._args: unknown[]) => {
    void _args;
    // Intentionally empty — navigation should feel immediate.
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{ navigate, cover, isTransitioning: false }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}
