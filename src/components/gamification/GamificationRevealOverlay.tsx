"use client";

import { useEffect, useRef, useState } from "react";
import { markGamificationRevealsViewedAction } from "@/lib/gamification/actions";
import { markOnboardingMilestoneAction } from "@/lib/preferences/actions";
import type { GamificationReveal } from "@/lib/gamification/types";

type GamificationRevealOverlayProps = {
  reveals: GamificationReveal[];
  /** First planet evolution: add a one-line explanation of planet growth. */
  explainPlanetGrowth?: boolean;
};

/**
 * Elegant one-at-a-time reveal moments.
 * No confetti, no LEVEL UP language.
 */
export function GamificationRevealOverlay({
  reveals: initial,
  explainPlanetGrowth = false,
}: GamificationRevealOverlayProps) {
  const [queue, setQueue] = useState(() =>
    initial.filter((r) => !r.viewedAt).slice(0, 3),
  );
  const current = queue[0] ?? null;
  const growthExplained = useRef(false);

  useEffect(() => {
    setQueue(initial.filter((r) => !r.viewedAt).slice(0, 3));
  }, [initial]);

  const showGrowthExplanation =
    explainPlanetGrowth && current?.revealType === "planet_evolution";

  useEffect(() => {
    if (!showGrowthExplanation || growthExplained.current) return;
    growthExplained.current = true;
    void markOnboardingMilestoneAction("planet_growth_explained").catch(
      () => {},
    );
  }, [showGrowthExplanation]);

  async function dismiss() {
    if (!current) return;
    const id = current.id;
    setQueue((q) => q.slice(1));
    try {
      await markGamificationRevealsViewedAction([id]);
    } catch {
      // non-blocking
    }
  }

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gamification-reveal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--charcoal)_35%,transparent)] motion-safe:animate-[fade-in_0.35s_ease-out]"
        aria-label="Dismiss"
        onClick={() => void dismiss()}
      />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl px-6 py-8 text-center shadow-[var(--shadow-soft)] motion-safe:animate-[reveal-rise_0.5s_ease-out]"
        style={{
          background:
            "linear-gradient(165deg, color-mix(in srgb, var(--violet) 18%, var(--surface)), var(--surface))",
          border: "1px solid color-mix(in srgb, var(--gold) 28%, transparent)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60 motion-safe:animate-[reveal-glow_2.4s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, color-mix(in srgb, var(--gold) 28%, transparent), transparent 55%)",
          }}
          aria-hidden="true"
        />

        <p
          className="relative text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "var(--violet)" }}
        >
          {eyebrowFor(current.revealType)}
        </p>
        <h2
          id="gamification-reveal-title"
          className="relative mt-3 font-[family-name:var(--font-fraunces)] text-2xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          {current.title}
        </h2>
        {current.body ? (
          <p
            className="relative mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            {current.body}
          </p>
        ) : null}

        {showGrowthExplanation ? (
          <p
            className="relative mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Your planets grow like this as you keep practicing — no scores,
            just your voice getting more room.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void dismiss()}
          className="relative mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-2.5 text-sm font-semibold text-[var(--on-violet)]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function eyebrowFor(type: GamificationReveal["revealType"]): string {
  switch (type) {
    case "planet_evolution":
      return "Planet evolution";
    case "weekly_goal_complete":
      return "Weekly constellation";
    case "celestial_discovery":
    case "orbit_reward":
      return "Celestial discovery";
    case "milestone":
      return "Something shifted";
    case "experiment_ack":
      return "Experiment";
    default:
      return "Universe";
  }
}
