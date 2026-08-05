"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";

export function StartSpeakingFAB() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <TransitionLink
        href="/speak"
        variant="fade"
        className="pointer-events-auto flex items-center gap-2.5 rounded-full px-7 py-4 text-base font-semibold shadow-[0_10px_32px_color-mix(in_srgb,var(--gold)_45%,transparent)] transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)]"
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
    </div>
  );
}
