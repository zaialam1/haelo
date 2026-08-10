"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markOnboardingMilestoneAction } from "@/lib/preferences/actions";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Shown once, right after the user's first completed session.
 * "You added your first star." + a path to Journey.
 */
export function FirstStarMoment({
  continueHref,
}: {
  /** Where "Continue" goes (the normal after-complete destination). */
  continueHref: string;
}) {
  const router = useRouter();
  const marked = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    if (marked.current) return;
    marked.current = true;
    void markOnboardingMilestoneAction("first_session_completed").catch(
      () => {},
    );
    trackEvent("onboarding_milestone_reached", {
      milestone: "first_session_completed",
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-star-title"
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--charcoal)_35%,transparent)] motion-safe:animate-[fade-in_0.35s_ease-out]"
        aria-hidden="true"
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
        <span
          aria-hidden="true"
          className="text-2xl leading-none"
          style={{ color: "var(--gold)" }}
        >
          ✦
        </span>
        <h2
          id="first-star-title"
          className="mt-3 font-[family-name:var(--font-fraunces)] text-2xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          You added your first star.
        </h2>
        <p
          className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Every reflection becomes a star in your Journey — a quiet record of
          your voice over time.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/journey")}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            See it in Journey
          </button>
          <button
            type="button"
            onClick={() => router.push(continueHref)}
            className="text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--foreground-muted)" }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
