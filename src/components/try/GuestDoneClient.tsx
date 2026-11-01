"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";

type GuestDoneClientProps = {
  skipped?: boolean;
};

export function GuestDoneClient({ skipped = false }: GuestDoneClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-5 py-14 sm:px-8">
      <TransitionLink
        href="/"
        variant="fade"
        className="self-start text-sm font-medium text-[var(--violet)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        ← Home
      </TransitionLink>

      <div
        className="mt-10 flex flex-col items-center rounded-3xl px-6 py-10 text-center"
        style={{
          background:
            "linear-gradient(165deg, color-mix(in srgb, var(--violet) 16%, var(--surface)), var(--surface))",
          border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
        }}
      >
        <span
          className="inline-flex size-16 items-center justify-center rounded-full text-2xl"
          style={{
            background:
              "radial-gradient(circle, var(--gold), color-mix(in srgb, var(--rose) 50%, transparent))",
            color: "var(--violet)",
          }}
          aria-hidden="true"
        >
          ✦
        </span>
        <h1
          className="mt-5 font-[family-name:var(--font-fraunces)] text-[1.75rem] leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          {skipped ? "No pressure — try another when you’re ready." : "Nice work."}
        </h1>
        <p
          className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Guest practice is temporary and isn’t saved to an account. Create a
          free account anytime to keep a private Universe — optional, never
          required.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <TransitionLink
          href="/try"
          variant="fade"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Try another question
        </TransitionLink>
        <TransitionLink
          href="/signup"
          variant="fade"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Create a free account
        </TransitionLink>
        <TransitionLink
          href="/"
          variant="fade"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
          style={{ color: "var(--foreground-muted)" }}
        >
          Leave
        </TransitionLink>
      </div>
    </div>
  );
}
