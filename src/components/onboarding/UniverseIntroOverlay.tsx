"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { markOnboardingMilestoneAction } from "@/lib/preferences/actions";
import { trackEvent } from "@/lib/analytics/track";

/**
 * One-time first-visit moment on the Universe. Server-persisted via the
 * universe_seen milestone — never repeats across refresh or devices.
 */
export function UniverseIntroOverlay() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const marked = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent("onboarding_started");
    dialogRef.current?.focus();
  }, []);

  function markSeen() {
    if (marked.current) return;
    marked.current = true;
    void markOnboardingMilestoneAction("universe_seen").catch(() => {});
  }

  function dismiss() {
    markSeen();
    setVisible(false);
  }

  function startFirstReflection() {
    markSeen();
    trackEvent("onboarding_milestone_reached", { milestone: "universe_seen" });
    router.push("/practice?from=onboarding");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="universe-intro-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--charcoal)_35%,transparent)] motion-safe:animate-[fade-in_0.35s_ease-out]"
        aria-label="Dismiss introduction"
        onClick={dismiss}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-3xl px-6 py-8 text-center shadow-[var(--shadow-soft)] outline-none motion-safe:animate-[reveal-rise_0.5s_ease-out]"
        style={{
          background:
            "linear-gradient(165deg, color-mix(in srgb, var(--violet) 18%, var(--surface)), var(--surface))",
          border: "1px solid color-mix(in srgb, var(--gold) 28%, transparent)",
        }}
      >
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "var(--violet)" }}
        >
          Welcome
        </p>
        <h2
          id="universe-intro-title"
          className="mt-3 font-[family-name:var(--font-fraunces)] text-2xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          This is your Universe.
        </h2>
        <p
          className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Each planet is a different side of your voice, and it grows as you
          practice. The light at the center is My Voice — a picture of how you
          sound that takes shape over time.
        </p>
        <p
          className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          It all starts with one short reflection — just you, talking.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={startFirstReflection}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Start your first reflection
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--foreground-muted)" }}
          >
            Explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
