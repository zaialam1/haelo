"use client";

import { useEffect, useRef, useState } from "react";
import { markOnboardingMilestoneAction } from "@/lib/preferences/actions";
import type { OnboardingMilestone } from "@/lib/preferences/types";

/**
 * Small one-time contextual intro line (Journey / Orbits first visit).
 * Marks its milestone on mount so it never repeats.
 */
export function IntroMoment({
  milestone,
  title,
  body,
}: {
  milestone: OnboardingMilestone;
  title: string;
  body: string;
}) {
  const [visible, setVisible] = useState(true);
  const marked = useRef(false);

  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void markOnboardingMilestoneAction(milestone).catch(() => {});
  }, [milestone]);

  if (!visible) return null;

  return (
    <div
      className="mb-6 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3.5"
      style={{
        borderColor: "color-mix(in srgb, var(--gold) 30%, var(--hairline))",
        background:
          "linear-gradient(150deg, color-mix(in srgb, var(--violet) 10%, var(--surface)), var(--surface))",
      }}
    >
      <div>
        <p
          className="font-[family-name:var(--font-fraunces)] text-base leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            color: "var(--foreground)",
          }}
        >
          {title}
        </p>
        <p
          className="mt-1 text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          {body}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="rounded-full px-2 py-0.5 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        style={{ color: "var(--foreground-muted)" }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
