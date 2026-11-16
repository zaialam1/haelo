"use client";

import { HaloLogo } from "@/components/branding/HaloLogo";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { ProfessionalModeSwitch } from "@/components/professional/ProfessionalModeSwitch";
import { ThemeIconToggle } from "@/components/theme/ThemeIconToggle";

type HomeNavProps = {
  /**
   * Keep the header visible while the page scrolls.
   * Defaults to true so long browse pages keep Settings / theme reachable.
   * Immersive session shells do not mount HomeNav.
   */
  pinned?: boolean;
  /** @deprecated Prefer showModeSwitch */
  showProfessional?: boolean;
  /** Show Personal | Professional mode switch */
  showModeSwitch?: boolean;
  professionalUsername?: string | null;
  professionalVerified?: boolean;
  professionalPending?: boolean;
};

export function HomeNav({
  pinned = true,
  showProfessional = false,
  showModeSwitch = false,
  professionalUsername = null,
  professionalVerified = false,
  professionalPending = false,
}: HomeNavProps) {
  const showSwitch = showModeSwitch || showProfessional;

  return (
    <header
      className={`pointer-events-none inset-x-0 top-0 z-40 ${pinned ? "fixed" : "absolute"}`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className="pointer-events-auto relative mx-auto flex h-14 w-full items-center justify-between gap-2 border-b px-3 sm:h-16 sm:px-6"
        style={{
          background: "color-mix(in srgb, var(--background) 96%, transparent)",
          borderColor: "color-mix(in srgb, var(--hairline) 80%, transparent)",
        }}
      >
        <HaloLogo href="/home" size={36} label="Halo home" />

        {showSwitch ? (
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
            <ProfessionalModeSwitch />
          </div>
        ) : null}

        <div className="flex min-w-0 items-center gap-0.5">
          {showSwitch ? (
            <div className="mr-1 sm:hidden">
              <ProfessionalModeSwitch compact />
            </div>
          ) : null}
          {showSwitch && professionalUsername ? (
            <span
              className="mr-1 hidden max-w-[7.5rem] truncate text-[0.6875rem] font-semibold text-[var(--foreground-muted)] lg:inline"
              title={
                professionalPending
                  ? "Professional · Pending"
                  : professionalVerified
                    ? "Verified Professional"
                    : "Professional"
              }
            >
              {professionalUsername}
              <span className="ml-1 text-[var(--violet)]" aria-hidden="true">
                ✦
              </span>
            </span>
          ) : null}
          <ThemeIconToggle />
          <TransitionLink
            href="/settings"
            variant="fade"
            data-tour="nav-settings"
            className="flex size-10 items-center justify-center rounded-full text-[var(--foreground-muted)] transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--violet-soft)] hover:text-[var(--violet)] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            aria-label="Settings"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7.2 7.2 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.77 8.87a.5.5 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z" />
            </svg>
          </TransitionLink>
        </div>
      </div>
    </header>
  );
}
