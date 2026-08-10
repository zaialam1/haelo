"use client";

import { useEffect, useRef } from "react";
import { markOnboardingMilestoneAction } from "@/lib/preferences/actions";

/**
 * One-time Universe cue when My Voice first becomes ready.
 * Marks my_voice_introduced on mount so the pulse never repeats.
 */
export function MyVoiceIntroCue() {
  const marked = useRef(false);

  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void markOnboardingMilestoneAction("my_voice_introduced").catch(() => {});
  }, []);

  return (
    <div className="pointer-events-none mt-3 flex flex-col items-center">
      <span
        className="myvoice-intro-pulse rounded-full px-3 py-1.5 text-xs font-semibold"
        style={{
          background: "color-mix(in srgb, var(--surface) 72%, transparent)",
          border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
          color: "var(--foreground)",
        }}
      >
        Your Voice is starting to take shape.
      </span>
    </div>
  );
}
