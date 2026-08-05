"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";

type PracticeMyVoiceProps = {
  nested?: boolean;
};

export function PracticeMyVoice({ nested = false }: PracticeMyVoiceProps) {
  const content = (
    <TransitionLink
      href="/practice"
      variant="fade"
      className="pointer-events-auto relative z-40 flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-semibold shadow-[0_10px_32px_color-mix(in_srgb,var(--gold)_45%,transparent)] transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)] sm:px-8 sm:py-4 sm:text-lg"
      style={{
        background: "var(--gold)",
        color: "var(--on-warm)",
      }}
    >
      <svg
        width="20"
        height="20"
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
      Practice My Voice
    </TransitionLink>
  );

  if (nested) {
    return <div className="flex flex-col items-center">{content}</div>;
  }

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center">
      {content}
    </div>
  );
}
