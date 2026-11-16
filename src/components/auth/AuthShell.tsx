"use client";

import { HaloLogo } from "@/components/branding/HaloLogo";
import { ThemeIconToggle } from "@/components/theme/ThemeIconToggle";

type AuthShellProps = {
  children: React.ReactNode;
  /** Brand panel content (desktop) */
  brand: React.ReactNode;
};

/**
 * Auth layout. The Halo logo is the only home control — no redundant
 * "Back to Home" link that competed with the mark on small screens.
 */
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
        <ThemeIconToggle />
      </div>

      {/* Desktop brand panel */}
      <aside
        className="relative hidden flex-col overflow-hidden border-r px-12 py-14 lg:flex lg:w-[44%] lg:justify-between xl:px-16"
        style={{
          borderColor: "color-mix(in srgb, var(--violet) 18%, transparent)",
          background: "var(--auth-panel)",
        }}
      >
        <HaloLogo href="/" size="lg" priority />

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
