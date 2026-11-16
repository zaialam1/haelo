"use client";

import { HaloLogo } from "@/components/branding/HaloLogo";
import { ThemeIconToggle } from "@/components/theme/ThemeIconToggle";
import { TransitionLink } from "@/components/transitions/TransitionLink";

type GuestDoneClientProps = {
  skipped?: boolean;
};

export function GuestDoneClient({ skipped = false }: GuestDoneClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-5 py-14 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <HaloLogo href="/" size="md" />
        <ThemeIconToggle />
      </div>

      <div
        className="mt-10 flex flex-col items-center rounded-3xl border px-6 py-10 text-center"
        style={{
          background: "var(--surface)",
          borderColor: "color-mix(in srgb, var(--violet) 18%, transparent)",
        }}
      >
        <span
          className="inline-flex size-16 items-center justify-center rounded-full text-2xl"
          style={{
            background: "var(--violet-soft)",
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
          {skipped ? "Skipped." : "Session complete."}
        </h1>
        <p
          className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Create an account to keep your practice in your Journey.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <TransitionLink
          href="/signup"
          variant="fade"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Create account
        </TransitionLink>
        <TransitionLink
          href="/try"
          variant="fade"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Try another question
        </TransitionLink>
        <TransitionLink
          href="/"
          variant="fade"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium underline-offset-2 transition-opacity hover:opacity-80 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
        >
          Leave
        </TransitionLink>
      </div>
    </div>
  );
}
