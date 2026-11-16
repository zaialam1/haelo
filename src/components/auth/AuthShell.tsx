"use client";

import { HaloLogo } from "@/components/branding/HaloLogo";
import { ThemeIconToggle } from "@/components/theme/ThemeIconToggle";
import { TransitionLink } from "@/components/transitions/TransitionLink";

type AuthShellProps = {
  children: React.ReactNode;
  /** Brand panel content (desktop) */
  brand: React.ReactNode;
};

export function AuthShell({ children, brand }: AuthShellProps) {
  return (
    <div
      className="relative flex min-h-dvh flex-col lg:flex-row"
      style={{ background: "var(--background)" }}
    >
      {/* Mobile: compact brand bar only — form comes first below */}
      <div
        className="flex items-center justify-between border-b px-5 py-4 lg:hidden"
        style={{
          borderColor: "color-mix(in srgb, var(--violet) 18%, transparent)",
          background: "var(--auth-panel)",
        }}
      >
        <HaloLogo href="/" size="md" priority />
        <div className="flex items-center gap-0.5">
          <ThemeIconToggle />
          <TransitionLink
            href="/"
            variant="fade"
            className="rounded-full px-2 py-1.5 text-sm font-medium text-[var(--violet)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Home
          </TransitionLink>
        </div>
      </div>

      {/* Desktop brand panel */}
      <aside
        className="relative hidden flex-col overflow-hidden border-r px-12 py-14 lg:flex lg:w-[44%] lg:justify-between xl:px-16"
        style={{
          borderColor: "color-mix(in srgb, var(--violet) 18%, transparent)",
          background: "var(--auth-panel)",
        }}
      >
        <div>
          <HaloLogo href="/" size="lg" priority />
          <TransitionLink
            href="/"
            variant="fade"
            className="mt-4 inline-flex text-sm font-medium text-[var(--violet)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            ← Back to home
          </TransitionLink>
        </div>

        <div className="mt-0 flex max-w-lg flex-1 flex-col justify-center pb-8">
          {brand}
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:px-16 lg:py-16 xl:px-24">
        <div className="absolute right-6 top-4 hidden lg:block">
          <ThemeIconToggle />
        </div>
        <div className="mx-auto w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
