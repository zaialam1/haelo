"use client";

import { useEffect, useRef } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { trackEvent } from "@/lib/analytics/track";
import type { NextAction } from "@/lib/home/nextAction";

/**
 * One quiet cue on the Universe — the single best next action.
 * Editorial, non-modal: no glass card stack, no promotional framing.
 */
export function ContinueCue({ action }: { action: NextAction }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("next_action_shown", { kind: action.kind });
  }, [action.kind]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5.5rem] z-30 flex justify-center px-4 sm:bottom-auto sm:top-[5.5rem] sm:px-16">
      <div className="pointer-events-auto max-w-[min(22rem,calc(100vw-2rem))] text-center sm:max-w-md">
        {action.welcomeBack ? (
          <p
            className="mb-1.5 hidden text-xs sm:block"
            style={{ color: "var(--foreground-muted)" }}
          >
            Welcome back.
          </p>
        ) : null}
        <TransitionLink
          href={action.href}
          variant="fade"
          onClick={() =>
            trackEvent("next_action_followed", { kind: action.kind })
          }
          className="inline-flex max-w-full items-baseline gap-2 rounded-xl px-3.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:px-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <span className="min-w-0">
            <span
              className="block truncate text-[0.8125rem] font-medium leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              {action.title}
            </span>
            <span
              className="mt-0.5 block text-[0.75rem] font-semibold"
              style={{ color: "var(--violet)" }}
            >
              {action.cta}
            </span>
          </span>
        </TransitionLink>
      </div>
    </div>
  );
}
