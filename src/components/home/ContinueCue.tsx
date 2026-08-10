"use client";

import { useEffect, useRef } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { trackEvent } from "@/lib/analytics/track";
import type { NextAction } from "@/lib/home/nextAction";

/**
 * One quiet celestial cue on the Universe — the single best next action.
 * Never a card stack; long absences get a welcome, never guilt.
 */
export function ContinueCue({ action }: { action: NextAction }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("next_action_shown", { kind: action.kind });
  }, [action.kind]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[4.75rem] z-20 flex justify-center px-16 sm:top-[5.5rem]">
      <div className="pointer-events-auto max-w-sm text-center">
        {action.welcomeBack ? (
          <p
            className="mb-1.5 text-xs"
            style={{
              color: "rgba(255,255,255,0.82)",
              textShadow: "0 1px 8px rgba(0,0,0,0.35)",
            }}
          >
            Welcome back. Your Universe is right where you left it.
          </p>
        ) : null}
        <TransitionLink
          href={action.href}
          variant="fade"
          onClick={() =>
            trackEvent("next_action_followed", { kind: action.kind })
          }
          className="inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-left transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{
            background: "color-mix(in srgb, var(--surface) 62%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--gold) 26%, transparent)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <span
            aria-hidden="true"
            className="shrink-0 text-sm leading-none"
            style={{ color: "var(--gold)" }}
          >
            ✦
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-xs font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {action.title}
            </span>
            <span
              className="block text-xs font-semibold"
              style={{ color: "var(--violet)" }}
            >
              {action.cta} →
            </span>
          </span>
        </TransitionLink>
      </div>
    </div>
  );
}
