"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";

type StartSpeakingCenterProps = {
  /** When nested under the star, skip absolute positioning */
  nested?: boolean;
};

export function StartSpeakingCenter({ nested = false }: StartSpeakingCenterProps) {
  const link = (
    <>
      <TransitionLink
        href="/speak"
        variant="fade"
        className="pointer-events-auto relative z-40 flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold shadow-[0_12px_36px_color-mix(in_srgb,var(--gold)_50%,transparent)] transition-transform hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)] sm:px-9 sm:py-[1.125rem] sm:text-lg"
        style={{
          background: "var(--gold)",
          color: "var(--on-warm)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <path d="M12 18v4" />
          <path d="M8 22h8" />
        </svg>
        Start Speaking
      </TransitionLink>
      <p
        className="pointer-events-none relative z-40 mt-3 max-w-[14rem] text-center text-[0.6875rem] leading-snug sm:text-xs"
        style={{ color: "var(--foreground-muted)" }}
      >
        Five short reflections across your map
      </p>
    </>
  );

  if (nested) {
    return <div className="flex flex-col items-center">{link}</div>;
  }

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center">
      {link}
    </div>
  );
}
