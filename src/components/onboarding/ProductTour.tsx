"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { completeProductTourAction } from "@/lib/preferences/actions";
import { trackEvent } from "@/lib/analytics/track";
import {
  clearTourSession,
  PRODUCT_TOUR_STEPS,
  readTourStepIndex,
  startTourSession,
  writeTourStepIndex,
} from "@/lib/onboarding/productTour";

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ProductTourProps = {
  /** Server says this user should auto-start (new account, never finished tour). */
  autoStart?: boolean;
};

export function ProductTour({ autoStart = false }: ProductTourProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const finishing = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = readTourStepIndex();
    if (existing != null) {
      setStepIndex(existing);
      return;
    }
    if (autoStart) {
      startTourSession(0);
      setStepIndex(0);
      trackEvent("onboarding_started");
    }
  }, [autoStart]);

  const step = stepIndex != null ? PRODUCT_TOUR_STEPS[stepIndex] : null;

  const updateSpotlight = useCallback(() => {
    if (!step?.highlight) {
      setSpotlight(null);
      return;
    }
    const el = document.querySelector(
      `[data-tour="${step.highlight}"]`,
    ) as HTMLElement | null;
    if (!el) {
      setSpotlight(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const pad = 10;
    setSpotlight({
      top: Math.max(8, rect.top - pad),
      left: Math.max(8, rect.left - pad),
      width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
      height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
    });
    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [step]);

  useLayoutEffect(() => {
    if (stepIndex == null || !step) return;
    // Ensure we're on the right route for this step
    const path = window.location.pathname;
    if (path !== step.route && !path.startsWith(`${step.route}/`)) {
      router.push(step.route);
      return;
    }
    updateSpotlight();
    cardRef.current?.focus();
    const onResize = () => updateSpotlight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [stepIndex, step, router, updateSpotlight]);

  async function finishTour() {
    if (finishing.current) return;
    finishing.current = true;
    clearTourSession();
    setStepIndex(null);
    setSpotlight(null);
    await completeProductTourAction().catch(() => {});
    trackEvent("onboarding_milestone_reached");
    router.refresh();
  }

  function goToStep(nextIndex: number) {
    const next = PRODUCT_TOUR_STEPS[nextIndex];
    if (!next) {
      void finishTour();
      return;
    }
    writeTourStepIndex(nextIndex);
    setStepIndex(nextIndex);
    const path = window.location.pathname;
    if (path !== next.route && !path.startsWith(`${next.route}/`)) {
      router.push(next.route);
    }
  }

  function onSkip() {
    void finishTour();
  }

  function onNext() {
    if (stepIndex == null) return;
    if (stepIndex >= PRODUCT_TOUR_STEPS.length - 1) {
      void finishTour();
      return;
    }
    goToStep(stepIndex + 1);
  }

  function onBack() {
    if (stepIndex == null || stepIndex <= 0) return;
    goToStep(stepIndex - 1);
  }

  if (stepIndex == null || !step) return null;

  const isLast = stepIndex >= PRODUCT_TOUR_STEPS.length - 1;
  const progress = `${stepIndex + 1} / ${PRODUCT_TOUR_STEPS.length}`;

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-tour-title"
    >
      {/* Dim layer with optional spotlight hole via box-shadow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {spotlight ? (
          <div
            className="absolute rounded-3xl transition-[top,left,width,height] duration-300 ease-out"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: "0 0 0 9999px color-mix(in srgb, var(--charcoal) 45%, transparent)",
              outline: "2px solid color-mix(in srgb, var(--gold) 70%, transparent)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "color-mix(in srgb, var(--charcoal) 40%, transparent)",
            }}
          />
        )}
      </div>

      {/* Block clicks on the page while tour is open */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Tour overlay"
        tabIndex={-1}
      />

      <div
        ref={cardRef}
        tabIndex={-1}
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-lg px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:bottom-6 sm:px-5"
      >
        <div
          className="overflow-hidden rounded-3xl px-5 py-5 shadow-[var(--shadow-soft)] motion-safe:animate-[reveal-rise_0.4s_ease-out] sm:px-6 sm:py-6"
          style={{
            background:
              "linear-gradient(165deg, color-mix(in srgb, var(--violet) 16%, var(--surface)), var(--surface))",
            border: "1px solid color-mix(in srgb, var(--gold) 28%, transparent)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "var(--violet)" }}
            >
              Tour · {progress}
            </p>
            <button
              type="button"
              onClick={onSkip}
              className="min-h-10 rounded-full px-3 text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{ color: "var(--foreground-muted)" }}
            >
              Skip
            </button>
          </div>

          <h2
            id="product-tour-title"
            className="mt-3 font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            {step.title}
          </h2>
          <p
            className="mt-2 text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            {step.body}
          </p>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={stepIndex === 0}
              className="min-h-11 rounded-full px-4 text-sm font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{ color: "var(--violet)" }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex min-h-11 min-w-[7.5rem] items-center justify-center rounded-full bg-[var(--violet)] px-6 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
