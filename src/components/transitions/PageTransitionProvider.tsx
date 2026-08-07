"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { agentLog } from "@/lib/debug/agentLog";

export type TransitionVariant = "fade" | "warp";

type TransitionRequest = {
  href: string;
  variant: TransitionVariant;
  /** Accent color for warp (planet tint) */
  accent?: string;
  /** Click origin for warp burst (viewport %) */
  originX?: number;
  originY?: number;
};

type PageTransitionContextValue = {
  navigate: (request: TransitionRequest) => void;
  /** Soft cover for form submits that redirect via server actions */
  cover: (variant?: TransitionVariant) => void;
  isTransitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

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

type Phase = "idle" | "leaving" | "entering";

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [variant, setVariant] = useState<TransitionVariant>("fade");
  const [accent, setAccent] = useState("#5B4B8A");
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const pendingHref = useRef<string | null>(null);
  const pathnameAtStart = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const navigate = useCallback(
    async (request: TransitionRequest) => {
      const currentPhase = phaseRef.current;
      // #region agent log
      agentLog({
        hypothesisId: "A",
        location: "PageTransitionProvider.tsx:navigate:entry",
        message: "navigate called",
        data: {
          phase: currentPhase,
          pathname,
          target: request.href,
          variant: request.variant,
        },
        runId: "post-fix",
      });
      // #endregion
      if (currentPhase !== "idle") {
        // #region agent log
        agentLog({
          hypothesisId: "A",
          location: "PageTransitionProvider.tsx:navigate:earlyPhase",
          message: "blocked: phase not idle",
          data: { phase: currentPhase, target: request.href },
          runId: "post-fix",
        });
        // #endregion
        return;
      }

      const target = request.href;
      if (target === pathname || target === `${pathname}/`) {
        // #region agent log
        agentLog({
          hypothesisId: "A",
          location: "PageTransitionProvider.tsx:navigate:samePath",
          message: "blocked: same pathname",
          data: { phase: currentPhase, pathname, target },
          runId: "post-fix",
        });
        // #endregion
        return;
      }

      pendingHref.current = target;
      pathnameAtStart.current = pathname;
      phaseRef.current = "leaving";
      setVariant(request.variant);
      setAccent(request.accent ?? "#5B4B8A");
      setOrigin({
        x: request.originX ?? 50,
        y: request.originY ?? 50,
      });
      setPhase("leaving");
      // #region agent log
      agentLog({
        hypothesisId: "E",
        location: "PageTransitionProvider.tsx:navigate:leaving",
        message: "phase set to leaving, waiting",
        data: {
          target,
          variant: request.variant,
          leaveMs: request.variant === "warp" ? 780 : 280,
        },
        runId: "post-fix",
      });
      // #endregion

      const leaveMs = request.variant === "warp" ? 780 : 280;
      await wait(leaveMs);

      // Instant jump — never smooth-scroll under the transition veil.
      // (html scroll-behavior:smooth otherwise animates scroll and looks broken.)
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      } catch {
        window.scrollTo(0, 0);
      }

      // #region agent log
      agentLog({
        hypothesisId: "C",
        location: "PageTransitionProvider.tsx:navigate:push",
        message: "calling router.push",
        data: { target, pendingHref: pendingHref.current },
        runId: "post-fix",
      });
      // #endregion
      router.push(target);
    },
    [pathname, router],
  );

  const cover = useCallback((nextVariant: TransitionVariant = "fade") => {
    if (phaseRef.current !== "idle") return;
    pendingHref.current = "__await_route__";
    pathnameAtStart.current = pathname;
    phaseRef.current = "leaving";
    setVariant(nextVariant);
    setAccent("#5B4B8A");
    setOrigin({ x: 50, y: 50 });
    setPhase("leaving");
  }, [pathname]);

  // Route changed while leaving → start enter reveal
  useEffect(() => {
    // #region agent log
    agentLog({
      hypothesisId: "D",
      location: "PageTransitionProvider.tsx:leaveToEnter",
      message: "pathname/phase effect",
      data: {
        phase,
        pathname,
        pathnameAtStart: pathnameAtStart.current,
        pendingHref: pendingHref.current,
      },
      runId: "post-fix",
    });
    // #endregion
    if (phase !== "leaving") return;
    if (!pendingHref.current) return;
    if (pathname === pathnameAtStart.current) return;

    pendingHref.current = null;
    phaseRef.current = "entering";
    setPhase("entering");
  }, [pathname, phase]);

  // Entering must own its own timeout so leave→enter cleanup can't cancel idle
  useEffect(() => {
    if (phase !== "entering") return;
    const enterMs = variant === "warp" ? 720 : 320;
    // #region agent log
    agentLog({
      hypothesisId: "A",
      location: "PageTransitionProvider.tsx:enterTimeout",
      message: "scheduling idle after enter",
      data: { enterMs, variant, pathname },
      runId: "post-fix",
    });
    // #endregion
    const t = window.setTimeout(() => {
      // #region agent log
      agentLog({
        hypothesisId: "A",
        location: "PageTransitionProvider.tsx:enterIdle",
        message: "enter complete → idle",
        data: { pathname },
        runId: "post-fix",
      });
      // #endregion
      phaseRef.current = "idle";
      setPhase("idle");
    }, enterMs);
    return () => window.clearTimeout(t);
  }, [phase, variant, pathname]);

  // Safety: if navigation stalls while leaving, clear overlay
  useEffect(() => {
    if (phase !== "leaving") return;
    const t = window.setTimeout(() => {
      // #region agent log
      agentLog({
        hypothesisId: "C",
        location: "PageTransitionProvider.tsx:safetyTimeout",
        message: "safety timeout cleared leaving phase",
        data: { pathname, pendingHref: pendingHref.current },
        runId: "post-fix",
      });
      // #endregion
      phaseRef.current = "idle";
      setPhase("idle");
      pendingHref.current = null;
    }, 4000);
    return () => window.clearTimeout(t);
  }, [phase, pathname]);

  const active = phase !== "idle";
  const leaving = phase === "leaving";
  const entering = phase === "entering";

  const overlayStyle =
    variant === "warp"
      ? ({
          ["--warp-accent" as string]: accent,
          ["--warp-x" as string]: `${origin.x}%`,
          ["--warp-y" as string]: `${origin.y}%`,
        } as CSSProperties)
      : undefined;

  return (
    <PageTransitionContext.Provider
      value={{ navigate, cover, isTransitioning: active }}
    >
      {children}
      <div
        className={[
          "haelo-page-transition",
          `haelo-page-transition--${variant}`,
          leaving ? "is-leaving" : "",
          entering ? "is-entering" : "",
          active ? "is-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...overlayStyle,
          // Entering is visual only — never trap clicks after the leave cover
          pointerEvents: leaving ? "auto" : "none",
        }}
        aria-hidden={!active}
      >
        {variant === "warp" && (
          <>
            <div className="haelo-warp-burst" />
            <div className="haelo-warp-veil" />
            <div className="haelo-warp-streaks" />
            <div className="haelo-warp-core" />
          </>
        )}
        {variant === "fade" && <div className="haelo-fade-veil" />}
      </div>
    </PageTransitionContext.Provider>
  );
}
