"use client";

import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { toggleTheme } from "@/lib/theme";

function ThemeIconButton() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  function onToggle() {
    const next = toggleTheme();
    setDark(next === "dark");
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex size-10 items-center justify-center rounded-full text-[var(--foreground-muted)] transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--violet-soft)] hover:text-[var(--violet)] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      style={{ visibility: ready ? "visible" : "hidden" }}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z" />
        </svg>
      )}
    </button>
  );
}

type HomeNavProps = {
  /** Pin to the viewport (for scrollable pages like planet detail) */
  pinned?: boolean;
  /** Show Professional workspace link for professional accounts */
  showProfessional?: boolean;
};

export function HomeNav({
  pinned = false,
  showProfessional = false,
}: HomeNavProps) {
  return (
    <header
      className={`pointer-events-none inset-x-0 top-0 z-40 ${pinned ? "fixed" : "absolute"}`}
    >
      <div
        className="pointer-events-auto relative mx-auto flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--background) 88%, transparent), transparent)",
        }}
      >
        <p
          className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight text-[var(--violet)] sm:text-2xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Haelo
        </p>

        <div className="flex items-center gap-0.5">
          {showProfessional ? (
            <TransitionLink
              href="/professional/home"
              variant="fade"
              className="mr-1 rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              Professional
            </TransitionLink>
          ) : null}
          <ThemeIconButton />
          <TransitionLink
            href="/settings"
            variant="fade"
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
